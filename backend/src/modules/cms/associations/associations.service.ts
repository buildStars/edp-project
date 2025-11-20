import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { QueryAssociationDto } from './dto/query-association.dto';
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
        }),
        this.prisma.association.count({ where }),
      ]);

      this.logger.debug(`查询协会列表 - 返回 ${list.length} 条记录，共 ${total} 条`, 'AssociationsService');
      return new PaginatedResult(list, total, Number(page), Number(pageSize));
    } catch (error) {
      this.logger.error('查询协会列表失败', error.stack, 'AssociationsService');
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      // 增加浏览量
      await this.prisma.association.update({
        where: { id },
        data: { views: { increment: 1 } },
      });

      const association = await this.prisma.association.findUnique({
        where: { id },
      });

      if (!association) {
        this.logger.warn(`协会不存在 - id: ${id}`, 'AssociationsService');
        return null;
      }

      return association;
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
}

