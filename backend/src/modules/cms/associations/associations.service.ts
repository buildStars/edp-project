import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { QueryAssociationDto } from './dto/query-association.dto';
import { ApplyJoinAssociationDto } from './dto/apply-join.dto';
import { ReviewJoinRequestDto } from './dto/review-join.dto';
import { QueryJoinRequestDto } from './dto/query-join-request.dto';
import { LoggerService } from '../../../infrastructure/logger/logger.service';

@Injectable()
export class AssociationsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async findAll(query: QueryAssociationDto) {
    const { page = 1, pageSize = 10, type, keyword } = query;
    
    const where: any = {};
    
    // 类型筛选
    if (type) {
      where.type = type;
    }
    
    // 关键词搜索
    if (keyword) {
      where.name = { contains: keyword };
    }

    try {
      const [list, total] = await Promise.all([
        this.prisma.association.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: Number(pageSize),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        }),
        this.prisma.association.count({ where }),
      ]);

      // 添加成员数量到返回数据
      const listWithMemberCount = list.map(assoc => ({
        ...assoc,
        memberCount: assoc._count.members,
      }));

      this.logger.debug(`查询协会列表 - 返回 ${list.length} 条记录，共 ${total} 条`, 'AssociationsService');
      return new PaginatedResult(listWithMemberCount, total, Number(page), Number(pageSize));
    } catch (error) {
      this.logger.error('查询协会列表失败', error.stack, 'AssociationsService');
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      // 先查询协会是否存在
      const association = await this.prisma.association.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      if (!association) {
        this.logger.warn(`协会不存在 - id: ${id}`, 'AssociationsService');
        return null;
      }

      // 如果存在，增加浏览量（异步执行，不等待结果）
      this.prisma.association.update({
        where: { id },
        data: { views: { increment: 1 } },
      }).catch(error => {
        this.logger.warn(`更新协会浏览量失败 - id: ${id}`, 'AssociationsService');
      });

      // 返回数据，包含成员数量
      return {
        ...association,
        memberCount: association._count.members,
      };
    } catch (error) {
      this.logger.error(`查询协会详情失败 - id: ${id}`, error.stack, 'AssociationsService');
      throw error;
    }
  }

  // ========== 管理端方法 ==========

  async create(createAssociationDto: CreateAssociationDto) {
    try {
      const association = await this.prisma.association.create({
        data: {
          ...createAssociationDto,
          views: 0,
        },
      });
      
      this.logger.log(`创建协会成功 - name: ${association.name}, id: ${association.id}`, 'AssociationsService');
      return association;
    } catch (error) {
      this.logger.error('创建协会失败', error.stack, 'AssociationsService');
      throw error;
    }
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    try {
      const association = await this.prisma.association.update({
        where: { id },
        data: updateAssociationDto,
      });
      
      this.logger.log(`更新协会成功 - id: ${id}`, 'AssociationsService');
      return association;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`协会不存在，无法更新 - id: ${id}`, 'AssociationsService');
        throw new NotFoundException('协会不存在');
      }
      this.logger.error(`更新协会失败 - id: ${id}`, error.stack, 'AssociationsService');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.association.delete({
        where: { id },
      });
      
      this.logger.log(`删除协会成功 - id: ${id}`, 'AssociationsService');
      return { message: '删除成功' };
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`协会不存在，无法删除 - id: ${id}`, 'AssociationsService');
        throw new NotFoundException('协会不存在');
      }
      this.logger.error(`删除协会失败 - id: ${id}`, error.stack, 'AssociationsService');
      throw error;
    }
  }

  // ========== 用户端方法 ==========

  /**
   * 获取用户的协会加入状态
   */
  async getJoinStatus(associationId: string, userId: string) {
    try {
      const request = await this.prisma.associationJoinRequest.findUnique({
        where: {
          userId_associationId: {
            userId,
            associationId,
          },
        },
      });

      if (!request) {
        return {
          status: 'NOT_APPLIED',
          message: '未申请',
        };
      }

      return {
        status: request.status,
        rejectionReason: request.reviewNote,
        appliedAt: request.createdAt,
        reviewedAt: request.reviewedAt,
      };
    } catch (error) {
      this.logger.error(
        `查询协会加入状态失败 - associationId: ${associationId}, userId: ${userId}`,
        error.stack,
        'AssociationsService',
      );
      throw error;
    }
  }

  /**
   * 申请加入协会
   */
  async applyToJoin(associationId: string, userId: string, dto: ApplyJoinAssociationDto) {
    try {
      // 验证协会是否存在
      const association = await this.prisma.association.findUnique({
        where: { id: associationId },
      });

      if (!association) {
        throw new NotFoundException('协会不存在');
      }

      // 检查是否已有申请
      const existingRequest = await this.prisma.associationJoinRequest.findUnique({
        where: {
          userId_associationId: {
            userId,
            associationId,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'APPROVED') {
          throw new BadRequestException('您已是该协会成员');
        } else if (existingRequest.status === 'PENDING') {
          throw new BadRequestException('您已提交过申请，请等待审核');
        } else if (existingRequest.status === 'REJECTED') {
          // 如果之前被拒绝，可以重新申请
          const updatedRequest = await this.prisma.associationJoinRequest.update({
            where: {
              userId_associationId: {
                userId,
                associationId,
              },
            },
            data: {
              status: 'PENDING',
              reason: dto.reason,
              reviewedBy: null,
              reviewedAt: null,
              reviewNote: null,
              updatedAt: new Date(),
            },
          });

          this.logger.log(
            `用户重新申请加入协会 - userId: ${userId}, associationId: ${associationId}, name: ${association.name}`,
            'AssociationsService',
          );

          return {
            message: '申请已重新提交，请等待审核',
            request: updatedRequest,
          };
        }
      }

      // 创建新申请
      const request = await this.prisma.associationJoinRequest.create({
        data: {
          userId,
          associationId,
          reason: dto.reason,
          status: 'PENDING',
        },
      });

      this.logger.log(
        `用户申请加入协会 - userId: ${userId}, associationId: ${associationId}, name: ${association.name}`,
        'AssociationsService',
      );

      return {
        message: '申请已提交，请等待审核',
        request,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `申请加入协会失败 - associationId: ${associationId}, userId: ${userId}`,
        error.stack,
        'AssociationsService',
      );
      throw error;
    }
  }

  /**
   * 获取加入申请列表（管理端）
   */
  async getJoinRequests(query: QueryJoinRequestDto) {
    const { page = 1, pageSize = 20, associationId, userId, status } = query;

    const where: any = {};

    if (associationId) {
      where.associationId = associationId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    try {
      const [list, total] = await Promise.all([
        this.prisma.associationJoinRequest.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: Number(pageSize),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                realName: true,
                avatar: true,
                phone: true,
                company: true,
                position: true,
              },
            },
            association: {
              select: {
                id: true,
                name: true,
                type: true,
                logo: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                nickname: true,
                realName: true,
              },
            },
          },
        }),
        this.prisma.associationJoinRequest.count({ where }),
      ]);

      this.logger.debug(
        `查询协会加入申请列表 - 返回 ${list.length} 条记录，共 ${total} 条`,
        'AssociationsService',
      );

      return new PaginatedResult(list, total, Number(page), Number(pageSize));
    } catch (error) {
      this.logger.error('查询协会加入申请列表失败', error.stack, 'AssociationsService');
      throw error;
    }
  }

  /**
   * 审批加入申请（管理端）
   */
  async reviewJoinRequest(requestId: string, reviewerId: string, dto: ReviewJoinRequestDto) {
    try {
      const request = await this.prisma.associationJoinRequest.findUnique({
        where: { id: requestId },
        include: {
          user: true,
          association: true,
        },
      });

      if (!request) {
        throw new NotFoundException('申请不存在');
      }

      if (request.status !== 'PENDING') {
        throw new BadRequestException('该申请已处理');
      }

      // 如果是拒绝，必须填写原因
      if (dto.status === 'REJECTED' && !dto.reviewNote) {
        throw new BadRequestException('拒绝申请时必须填写原因');
      }

      // 更新申请状态
      const updatedRequest = await this.prisma.associationJoinRequest.update({
        where: { id: requestId },
        data: {
          status: dto.status,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNote: dto.reviewNote,
        },
      });

      // 如果审批通过，创建协会成员关系
      if (dto.status === 'APPROVED') {
        // 检查是否已经是成员
        const existingMember = await this.prisma.associationMember.findUnique({
          where: {
            associationId_userId: {
              associationId: request.associationId,
              userId: request.userId,
            },
          },
        });

        // 如果还不是成员，则添加为成员
        if (!existingMember) {
          await this.prisma.associationMember.create({
            data: {
              associationId: request.associationId,
              userId: request.userId,
              role: 'MEMBER', // 默认为普通成员
              joinedAt: new Date(),
            },
          });

          this.logger.log(
            `添加协会成员 - userId: ${request.userId}, associationId: ${request.associationId}`,
            'AssociationsService',
          );
        }
      }

      this.logger.log(
        `审批协会加入申请 - requestId: ${requestId}, status: ${dto.status}, userId: ${request.userId}, associationId: ${request.associationId}`,
        'AssociationsService',
      );

      return {
        message: dto.status === 'APPROVED' ? '申请已通过' : '申请已拒绝',
        request: updatedRequest,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `审批协会加入申请失败 - requestId: ${requestId}`,
        error.stack,
        'AssociationsService',
      );
      throw error;
    }
  }
}

