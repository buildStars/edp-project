import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
    } = query;

    const where: any = {};

    // 关键词搜索
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { contactPerson: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          admin: {
            select: {
              id: true,
              realName: true,
              nickname: true,
              phone: true,
              email: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        } as any, // Type assertion for include with admin relation
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    // 提取 adminId 单独处理
    const { adminId, ...createData } = data;
    
    // 如果有 adminId，使用 connect 语法
    if (adminId) {
      createData.admin = {
        connect: { id: adminId }
      };
    }
    
    return this.prisma.organization.create({
      data: createData,
    });
  }

  async update(id: string, data: any) {
    // 提取 adminId 单独处理
    const { adminId, admin, _count, ...updateData } = data;
    
    // 如果有 adminId，使用 connect 语法
    if (adminId) {
      updateData.admin = {
        connect: { id: adminId }
      };
    }
    
    return this.prisma.organization.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async allocateCredits(organizationId: string, data: any) {
    const { amount = 10, validDays = 365 } = data;

    // 获取企业所有用户
    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
        status: 'ACTIVE' as any,
      },
    });

    // 计算过期时间
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + validDays);

    // 批量分配学分
    const credits = await Promise.all(
      users.map((user) =>
        this.prisma.credit.create({
          data: {
            userId: user.id,
            balance: amount,
            total: amount,
            used: 0,
          },
        }),
      ),
    );

    return {
      success: true,
      allocatedCount: credits.length,
      message: `成功为${credits.length}位用户分配学分`,
    };
  }

  async getUsers(organizationId: string, query: any) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
    } = query;

    const where: any = { organizationId };

    if (keyword) {
      where.OR = [
        { realName: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          credit: {
            select: {
              balance: true,
              personalBalance: true,
              lockedBalance: true,
              total: true,
              used: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 添加企业员工
   */
  async addUser(organizationId: string, userId: string) {
    // 检查用户是否已属于其他企业
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.organizationId && user.organizationId !== organizationId) {
      throw new Error('该用户已属于其他企业');
    }

    // 更新用户的企业ID
    return this.prisma.user.update({
      where: { id: userId },
      data: { organizationId },
    });
  }

  /**
   * 移除企业员工
   */
  async removeUser(organizationId: string, userId: string) {
    // 验证用户属于该企业
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new Error('该用户不属于此企业');
    }

    // 移除用户的企业关联
    return this.prisma.user.update({
      where: { id: userId },
      data: { organizationId: null },
    });
  }

  /**
   * 获取企业统计信息
   */
  async getStatistics(organizationId: string) {
    const [
      totalUsers,
      totalCredits,
      usedCredits,
      totalEnrollments,
    ] = await Promise.all([
      // 员工总数
      this.prisma.user.count({
        where: { organizationId },
      }),
      // 总学分（所有员工的锁定学分）
      this.prisma.credit.aggregate({
        where: {
          user: { organizationId },
        },
        _sum: {
          lockedBalance: true,
          balance: true,
        },
      }),
      // 已使用学分（统计报名消耗的锁定学分）
      this.prisma.creditRecord.aggregate({
        where: {
          type: 'CONSUME',
          source: 'CORPORATE',
          credit: {
            user: { organizationId },
          },
        },
        _sum: {
          amount: true,
        },
      }),
      // 课程报名数
      this.prisma.enrollment.count({
        where: {
          user: { organizationId },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCredits: totalCredits._sum.balance || 0,  // 企业员工的总学分
      remainingCredits: totalCredits._sum.lockedBalance || 0,  // 剩余锁定学分
      usedCredits: Math.abs(usedCredits._sum.amount || 0),  // 已使用的学分（绝对值）
      totalEnrollments,
    };
  }
}

