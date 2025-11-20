import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';
import { QueryCreditRequestDto, CreditRequestStatus } from './dto/query-credit-request.dto';
import { ReviewCreditRequestDto, ReviewAction } from './dto/review-credit-request.dto';

/**
 * 学分申请服务
 * 处理教师为学员申请学分的业务逻辑
 */
@Injectable()
export class CreditRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 创建学分申请（教师提交）
   */
  async create(teacherId: string, dto: CreateCreditRequestDto) {
    this.logger.debug(`教师 ${teacherId} 为用户 ${dto.userId} 申请 ${dto.amount} 学分`);

    // 验证用户存在
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('目标用户不存在');
    }

    // 创建申请记录
    const request = await this.prisma.creditRequest.create({
      data: {
        teacherId,
        userId: dto.userId,
        amount: dto.amount,
        reason: dto.reason,
        status: 'PENDING',
      },
      include: {
        teacher: {
          select: {
            id: true,
            nickname: true,
            realName: true,
            avatar: true,
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
            realName: true,
            avatar: true,
            company: true,
          },
        },
      },
    });

    this.logger.log(`学分申请创建成功 - ID: ${request.id}`);

    return request;
  }

  /**
   * 查询学分申请列表（支持多角色视图）
   */
  async findAll(userId: string, userRole: string, query: QueryCreditRequestDto) {
    const { page = 1, pageSize = 10, status, teacherId, userId: targetUserId, keyword } = query;

    const where: any = {};

    // 根据角色设置查询条件
    if (userRole === 'TEACHER') {
      // 教师只能看到自己提交的申请
      where.teacherId = userId;
    } else if (userRole === 'ADMIN' || userRole === 'STAFF') {
      // 管理员和教务人员可以看到所有申请
      if (teacherId) {
        where.teacherId = teacherId;
      }
      if (targetUserId) {
        where.userId = targetUserId;
      }
    } else {
      // 其他角色不允许查询
      throw new BadRequestException('权限不足');
    }

    // 状态过滤
    if (status) {
      where.status = status;
    }

    // 关键词搜索
    if (keyword) {
      where.reason = {
        contains: keyword,
      };
    }

    // 分页查询
    const [items, total] = await Promise.all([
      this.prisma.creditRequest.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              avatar: true,
            },
          },
          user: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              avatar: true,
              company: true,
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.creditRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取单个学分申请详情
   */
  async findOne(id: string, userId: string, userRole: string) {
    const request = await this.prisma.creditRequest.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            nickname: true,
            realName: true,
            avatar: true,
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
            realName: true,
            avatar: true,
            company: true,
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
    });

    if (!request) {
      throw new NotFoundException('学分申请不存在');
    }

    // 权限检查：教师只能查看自己提交的，管理员/教务可以查看所有
    if (userRole === 'TEACHER' && request.teacherId !== userId) {
      throw new BadRequestException('权限不足');
    }

    return request;
  }

  /**
   * 审批学分申请（管理员/教务人员）
   */
  async review(id: string, reviewerId: string, dto: ReviewCreditRequestDto) {
    this.logger.debug(`审批学分申请 ${id} - 动作: ${dto.action}`);

    // 查询申请记录
    const request = await this.prisma.creditRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!request) {
      throw new NotFoundException('学分申请不存在');
    }

    // 检查申请状态
    if (request.status !== 'PENDING') {
      throw new BadRequestException('该申请已被处理');
    }

    const newStatus = dto.action === ReviewAction.APPROVE ? 'APPROVED' : 'REJECTED';

    // 开启事务处理
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新申请状态
      const updatedRequest = await tx.creditRequest.update({
        where: { id },
        data: {
          status: newStatus,
          reviewerId,
          reviewRemark: dto.remark,
          reviewTime: new Date(),
        },
        include: {
          teacher: {
            select: {
              id: true,
              nickname: true,
              realName: true,
            },
          },
          user: {
            select: {
              id: true,
              nickname: true,
              realName: true,
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
      });

      // 如果审批通过，则增加用户学分
      if (dto.action === ReviewAction.APPROVE) {
        // 确保用户有学分账户
        let credit = await tx.credit.findUnique({
          where: { userId: request.userId },
        });

        if (!credit) {
          // 如果没有学分账户，创建一个
          credit = await tx.credit.create({
            data: {
              userId: request.userId,
              balance: 0,
              total: 0,
              used: 0,
              personalBalance: 0,
              lockedBalance: 0,
            },
          });
        }

        // 更新学分余额（学分申请通过属于个人学分）
        const newBalance = credit.balance + request.amount;
        const newTotal = credit.total + request.amount;
        const newPersonalBalance = credit.personalBalance + request.amount;

        await tx.credit.update({
          where: { userId: request.userId },
          data: {
            balance: newBalance,
            total: newTotal,
            personalBalance: newPersonalBalance,
          },
        });

        // 记录学分变动
        await tx.creditRecord.create({
          data: {
            creditId: credit.id,
            type: 'ADMIN_ADD',
            amount: request.amount,
            balance: newBalance,
            remark: `学分申请审批通过 - ${request.reason}`,
            source: 'PERSONAL',
          },
        });

        this.logger.log(`学分申请通过 - 用户 ${request.userId} 获得 ${request.amount} 学分`);
      } else {
        this.logger.log(`学分申请拒绝 - ID: ${id}`);
      }

      return updatedRequest;
    });

    return result;
  }

  /**
   * 取消学分申请（教师）
   */
  async cancel(id: string, teacherId: string) {
    const request = await this.prisma.creditRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('学分申请不存在');
    }

    // 权限检查
    if (request.teacherId !== teacherId) {
      throw new BadRequestException('只能取消自己提交的申请');
    }

    // 状态检查
    if (request.status !== 'PENDING') {
      throw new BadRequestException('只能取消待审批的申请');
    }

    const updated = await this.prisma.creditRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`学分申请已取消 - ID: ${id}`);

    return updated;
  }

  /**
   * 获取统计数据
   */
  async getStatistics(userId: string, userRole: string) {
    const where: any = {};

    if (userRole === 'TEACHER') {
      where.teacherId = userId;
    }

    const [pending, approved, rejected, total] = await Promise.all([
      this.prisma.creditRequest.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.creditRequest.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.creditRequest.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.creditRequest.count({ where }),
    ]);

    return {
      pending,
      approved,
      rejected,
      total,
    };
  }
}

