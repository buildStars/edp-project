import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户学分信息
   */
  async getMyCredits(userId: string) {
    // 查找或创建学分账户
    let credit = await this.prisma.credit.findUnique({
      where: { userId },
      include: {
        records: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!credit) {
      // 如果不存在，创建初始学分账户
      credit = await this.prisma.credit.create({
        data: {
          userId,
          balance: 0,
          total: 0,
          used: 0,
        },
        include: {
          records: true,
        },
      });
    }

    return credit;
  }

  /**
   * 消耗学分（报名课程时）
   * 优先使用锁定学分（企业分配的），不足时使用可转赠学分
   */
  async consumeCredit(
    userId: string,
    courseId: string,
    courseName: string,
    amount: number,
  ) {
    // 获取用户学分账户
    const credit = await this.prisma.credit.findUnique({
      where: { userId },
    });

    if (!credit) {
      throw new BadRequestException('学分账户不存在，请联系管理员');
    }

    // 检查总余额是否足够
    if (credit.balance < amount) {
      throw new BadRequestException(
        `学分不足，当前余额: ${credit.balance}，需要: ${amount}`,
      );
    }

    // 计算扣除方案：优先使用锁定学分（企业学分）
    const lockedUsed = Math.min(credit.lockedBalance, amount);
    const transferableUsed = amount - lockedUsed;

    // 使用事务扣除学分
    await this.prisma.$transaction(async (tx) => {
      // 1. 更新学分账户
      await tx.credit.update({
        where: { id: credit.id },
        data: {
          balance: credit.balance - amount,
          used: credit.used + amount,
          lockedBalance: credit.lockedBalance - lockedUsed,
          personalBalance: credit.personalBalance - transferableUsed,
        },
      });

      // 2. 创建学分消耗记录
      await tx.creditRecord.create({
        data: {
          creditId: credit.id,
          type: 'CONSUME',
          amount: -amount,
          balance: credit.balance - amount,
          source: lockedUsed > 0 ? 'CORPORATE' : 'PERSONAL',
          courseId,
          courseName,
          remark: `报名课程《${courseName}》${lockedUsed > 0 ? `（企业学分${lockedUsed}${transferableUsed > 0 ? `+个人学分${transferableUsed}` : ''}）` : ''}`,
        },
      });
    });

    this.logger.log(
      `[学分消耗] 用户: ${userId}, 课程: ${courseName}, 总消耗: ${amount}, 锁定学分: ${lockedUsed}, 个人学分: ${transferableUsed}, 剩余: ${credit.balance - amount}`,
    );

    return credit;
  }

  /**
   * 增加学分（管理员充值或课程完成奖励）
   * @param isLocked 是否为锁定学分（true=企业分配，不可转赠；false=个人学分，可转赠）
   */
  async addCredit(
    userId: string,
    amount: number,
    remark: string,
    isLocked: boolean = false,
    courseId?: string,
    courseName?: string,
  ) {
    // 获取或创建学分账户
    let credit = await this.prisma.credit.findUnique({
      where: { userId },
    });

    if (!credit) {
      credit = await this.prisma.credit.create({
        data: {
          userId,
          balance: 0,
          total: 0,
          used: 0,
          personalBalance: 0,
          lockedBalance: 0,
        },
      });
    }

    // 增加学分
    const newBalance = credit.balance + amount;
    const newTotal = credit.total + amount;
    const newPersonal = isLocked ? credit.personalBalance : credit.personalBalance + amount;
    const newLocked = isLocked ? credit.lockedBalance + amount : credit.lockedBalance;

    await this.prisma.credit.update({
      where: { id: credit.id },
      data: {
        balance: newBalance,
        total: newTotal,
        personalBalance: newPersonal,
        lockedBalance: newLocked,
      },
    });

    // 创建获得记录
    await this.prisma.creditRecord.create({
      data: {
        creditId: credit.id,
        type: isLocked ? 'CORPORATE_ALLOCATE' : (courseId ? 'EARN' : 'ADMIN_ADD'),
        amount: amount, // 正数表示获得
        balance: newBalance,
        source: isLocked ? 'CORPORATE' : 'PERSONAL',
        courseId,
        courseName,
        remark,
      },
    });

    this.logger.log(
      `[学分增加] 用户: ${userId}, 增加: ${amount}, 类型: ${isLocked ? '锁定' : '个人'}, 余额: ${newBalance}, 备注: ${remark}`,
    );

    return credit;
  }

  /**
   * 退回学分（取消报名时）
   * 退回到可转赠学分（简化处理，不追溯原始消费来源）
   */
  async refundCredit(
    userId: string,
    amount: number,
    courseId: string,
    courseName: string,
  ) {
    const credit = await this.prisma.credit.findUnique({
      where: { userId },
    });

    if (!credit) {
      throw new BadRequestException('学分账户不存在');
    }

    // 退回学分到个人学分余额
    const newBalance = credit.balance + amount;
    const newUsed = credit.used - amount;
    const newPersonal = credit.personalBalance + amount;

    await this.prisma.credit.update({
      where: { id: credit.id },
      data: {
        balance: newBalance,
        used: newUsed,
        personalBalance: newPersonal,
      },
    });

    // 创建退回记录
    await this.prisma.creditRecord.create({
      data: {
        creditId: credit.id,
        type: 'REFUND',
        amount: amount, // 正数表示退回
        balance: newBalance,
        source: 'PERSONAL',
        courseId,
        courseName,
        remark: `取消报名《${courseName}》，退回学分（个人学分）`,
      },
    });

    this.logger.log(
      `[学分退回] 用户: ${userId}, 课程: ${courseName}, 退回: ${amount}, 余额: ${newBalance}`,
    );

    return credit;
  }

  // ========== 管理端方法 ==========

  /**
   * 查询所有学分账户
   */
  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 20,
      userId,
      organizationId,
      keyword,
    } = query;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (organizationId) {
      where.user = { organizationId };
    }

    if (keyword) {
      where.user = {
        OR: [
          { realName: { contains: keyword } },
          { phone: { contains: keyword } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.credit.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          user: {
            select: {
              id: true,
              realName: true,
              phone: true,
              avatar: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.credit.count({ where }),
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
   * 管理员充值学分
   */
  async allocate(data: any) {
    const { userId, amount, remark = '管理员充值' } = data;

    return this.addCredit(userId, amount, remark);
  }

  /**
   * 管理员扣除学分（优先扣除可转赠学分）
   */
  async deduct(userId: string, amount: number, remark: string = '管理员扣除') {
    const credit = await this.prisma.credit.findUnique({
      where: { userId },
    });

    if (!credit) {
      throw new BadRequestException('学分账户不存在');
    }

    if (credit.balance < amount) {
      throw new BadRequestException('学分余额不足，无法扣除');
    }

    // 优先扣除个人学分，不足时扣除锁定学分
    const personalDeduct = Math.min(credit.personalBalance, amount);
    const lockedDeduct = amount - personalDeduct;

    // 扣除学分
    const newBalance = credit.balance - amount;
    const newPersonal = credit.personalBalance - personalDeduct;
    const newLocked = credit.lockedBalance - lockedDeduct;

    await this.prisma.credit.update({
      where: { id: credit.id },
      data: {
        balance: newBalance,
        personalBalance: newPersonal,
        lockedBalance: newLocked,
      },
    });

    // 创建扣除记录
    await this.prisma.creditRecord.create({
      data: {
        creditId: credit.id,
        type: 'ADMIN_DEDUCT',
        amount: -amount,
        balance: newBalance,
        source: personalDeduct > 0 ? 'PERSONAL' : 'CORPORATE',
        remark,
      },
    });

    this.logger.log(
      `[学分扣除] 用户: ${userId}, 扣除: ${amount}, 个人: ${personalDeduct}, 锁定: ${lockedDeduct}, 余额: ${newBalance}, 备注: ${remark}`,
    );

    return credit;
  }

  /**
   * 查询学分记录
   */
  async getRecords(query: any) {
    const {
      page = 1,
      pageSize = 20,
      userId,
      type,
      courseId,
    } = query;

    const where: any = {};

    if (userId) {
      where.credit = { userId };
    }

    if (type) {
      where.type = type;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const [items, total] = await Promise.all([
      this.prisma.creditRecord.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          credit: {
            include: {
              user: {
                select: {
                  id: true,
                  realName: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creditRecord.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

