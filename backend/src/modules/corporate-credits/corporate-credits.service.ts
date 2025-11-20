import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AllocateCreditDto } from './dto/allocate-credit.dto';
import { PurchaseCourseDto } from './dto/purchase-course.dto';

@Injectable()
export class CorporateCreditsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 验证用户是否是企业管理员
   */
  async validateCorpAdmin(userId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { adminId: userId },
    });

    if (!organization) {
      throw new ForbiddenException('您不是企业管理员');
    }

    return organization;
  }

  /**
   * 验证用户是否属于该企业
   */
  async validateEmployeeBelongsToOrg(organizationId: string, employeeId: string) {
    const employee = await this.prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId: organizationId,
      },
    });

    if (!employee) {
      throw new BadRequestException('该用户不属于您的企业');
    }

    return employee;
  }

  /**
   * 分配学分给员工
   */
  async allocateCredit(adminId: string, dto: AllocateCreditDto) {
    const { toUserId, amount } = dto;

    // 验证是企业管理员
    const organization = await this.validateCorpAdmin(adminId);

    // 验证员工属于该企业
    await this.validateEmployeeBelongsToOrg(organization.id, toUserId);

    // 获取管理员学分信息
    const adminCredit = await this.prisma.credit.findUnique({
      where: { userId: adminId },
    });

    // 检查管理员的个人学分（只能分配个人学分）
    if (!adminCredit || adminCredit.personalBalance < amount) {
      throw new BadRequestException(`您的个人学分不足，当前: ${adminCredit?.personalBalance || 0}，需要: ${amount}`);
    }

    // 使用事务处理
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 扣除管理员的个人学分
      const updatedAdminCredit = await tx.credit.update({
        where: { userId: adminId },
        data: {
          balance: { decrement: amount },
          used: { increment: amount },
          personalBalance: { decrement: amount },
        },
      });

      // 2. 增加员工的锁定学分（不可转赠）
      let employeeCredit = await tx.credit.findUnique({
        where: { userId: toUserId },
      });

      if (!employeeCredit) {
        // 如果员工没有学分账户，创建一个
        employeeCredit = await tx.credit.create({
          data: {
            userId: toUserId,
            balance: amount,
            total: amount,
            used: 0,
            personalBalance: 0,
            lockedBalance: amount,  // 作为锁定学分
          },
        });
      } else {
        employeeCredit = await tx.credit.update({
          where: { userId: toUserId },
          data: {
            balance: { increment: amount },
            total: { increment: amount },
            lockedBalance: { increment: amount },  // 增加锁定学分
          },
        });
      }

      // 3. 记录管理员的学分扣除
      await tx.creditRecord.create({
        data: {
          creditId: adminCredit.id,
          type: 'CORPORATE_ALLOCATE',
          amount: -amount,
          balance: updatedAdminCredit.balance,
          source: 'PERSONAL',
          fromUserId: adminId,
          toUserId: toUserId,
          remark: `分配${amount}学分给员工（企业管理员）`,
        },
      });

      // 4. 记录员工的锁定学分获得
      await tx.creditRecord.create({
        data: {
          creditId: employeeCredit.id,
          type: 'CORPORATE_ALLOCATE',
          amount: amount,
          balance: employeeCredit.balance,
          source: 'CORPORATE',
          fromUserId: adminId,
          toUserId: toUserId,
          remark: `收到企业管理员分配的${amount}学分（锁定，只能购课不可赠课）`,
        },
      });

      // 5. 发送通知给员工
      await tx.notification.create({
        data: {
          userId: toUserId,
          type: 'SYSTEM',
          title: '收到企业学分',
          content: `企业管理员为您分配了 ${amount} 个学分（锁定学分，只能购课不可赠课）`,
          data: {
            type: 'CREDIT_ALLOCATE',
            amount: amount,
            fromUserId: adminId,
          },
        },
      });

      return {
        adminBalance: updatedAdminCredit.balance,
        employeeBalance: employeeCredit.balance,
        employeeLocked: employeeCredit.lockedBalance,
      };
    });

    // 获取用户信息
    const [admin, employee] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: adminId } }),
      this.prisma.user.findUnique({ where: { id: toUserId } }),
    ]);

    return {
      message: '分配成功',
      allocation: {
        fromUser: {
          id: admin.id,
          nickname: admin.nickname,
          realName: admin.realName,
        },
        toUser: {
          id: employee.id,
          nickname: employee.nickname,
          realName: employee.realName,
        },
        amount,
        adminBalance: result.adminBalance,
        employeeBalance: result.employeeBalance,
        employeeLockedBalance: result.employeeLocked,
      },
    };
  }

  /**
   * 为员工购买课程
   */
  async purchaseCourse(adminId: string, dto: PurchaseCourseDto) {
    const { toUserId, courseId } = dto;

    // 验证是企业管理员
    const organization = await this.validateCorpAdmin(adminId);

    // 验证员工属于该企业
    await this.validateEmployeeBelongsToOrg(organization.id, toUserId);

    // 获取课程信息
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    if (course.status !== 'PUBLISHED') {
      throw new BadRequestException('该课程未发布');
    }

    // 检查是否已报名
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: toUserId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('该员工已报名此课程');
    }

    // 检查管理员学分是否足够
    const adminCredit = await this.prisma.credit.findUnique({
      where: { userId: adminId },
    });

    if (!adminCredit || adminCredit.balance < course.credit) {
      throw new BadRequestException('您的个人学分不足');
    }

    // 使用事务处理
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 扣除管理员的个人学分
      const updatedAdminCredit = await tx.credit.update({
        where: { userId: adminId },
        data: {
          balance: { decrement: course.credit },
          used: { increment: course.credit },
          personalBalance: { decrement: course.credit },
        },
      });

      // 2. 创建报名记录
      const enrollment = await tx.enrollment.create({
        data: {
          userId: toUserId,
          courseId: courseId,
          status: 'ENROLLED',
        },
      });

      // 3. 记录管理员的学分扣除
      await tx.creditRecord.create({
        data: {
          creditId: adminCredit.id,
          type: 'CONSUME',
          amount: -course.credit,
          balance: updatedAdminCredit.balance,
          courseId: course.id,
          courseName: course.title,
          source: 'PERSONAL',
          fromUserId: adminId,
          toUserId: toUserId,
          remark: `为员工购买课程《${course.title}》`,
        },
      });

      // 4. 发送通知给员工
      await tx.notification.create({
        data: {
          userId: toUserId,
          type: 'ENROLLMENT_AUDIT',
          title: '课程报名成功',
          content: `企业管理员为您报名了课程《${course.title}》`,
          data: {
            type: 'COURSE_PURCHASE',
            courseId: course.id,
            courseName: course.title,
            fromUserId: adminId,
          },
        },
      });

      return { enrollment, adminBalance: updatedAdminCredit.balance };
    });

    // 获取用户信息
    const [admin, employee] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: adminId } }),
      this.prisma.user.findUnique({ where: { id: toUserId } }),
    ]);

    return {
      message: '购买成功',
      enrollment: {
        enrollmentId: result.enrollment.id,
        course: {
          id: course.id,
          title: course.title,
          credit: course.credit,
        },
        employee: {
          id: employee.id,
          nickname: employee.nickname,
          realName: employee.realName,
        },
        creditUsed: course.credit,
        adminBalance: result.adminBalance,
      },
    };
  }

  /**
   * 获取企业员工列表
   */
  async getEmployees(adminId: string) {
    // 验证是企业管理员
    const organization = await this.validateCorpAdmin(adminId);

    // 获取企业员工列表
    const employees = await this.prisma.user.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        credit: true,
      },
    });

    return employees.map((emp) => ({
      id: emp.id,
      nickname: emp.nickname,
      realName: emp.realName,
      phone: emp.phone,
      company: emp.company,
      position: emp.position,
      totalBalance: emp.credit?.balance || 0,
      personalBalance: emp.credit?.personalBalance || 0,
      lockedBalance: emp.credit?.lockedBalance || 0,
    }));
  }

  /**
   * 获取学分分配记录
   */
  async getAllocationRecords(adminId: string, page: number = 1, pageSize: number = 10) {
    // 验证是企业管理员
    await this.validateCorpAdmin(adminId);

    const skip = (page - 1) * pageSize;

    // 获取分配记录（管理员作为发起人的企业学分分配）
    const [records, total] = await Promise.all([
      this.prisma.creditRecord.findMany({
        where: {
          fromUserId: adminId,
          type: 'CORPORATE_ALLOCATE',
          source: 'PERSONAL',
        },
        include: {
          credit: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  realName: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.creditRecord.count({
        where: {
          fromUserId: adminId,
          type: 'CORPORATE_ALLOCATE',
          source: 'PERSONAL',
        },
      }),
    ]);

    // 获取toUserId对应的用户信息
    const toUserIds = records.map((r) => r.toUserId).filter((id) => id);
    const toUsers = await this.prisma.user.findMany({
      where: {
        id: { in: toUserIds },
      },
      select: {
        id: true,
        nickname: true,
        realName: true,
        phone: true,
      },
    });

    const toUserMap = new Map(toUsers.map((u) => [u.id, u]));

    return {
      list: records.map((record) => ({
        id: record.id,
        toUser: toUserMap.get(record.toUserId),
        amount: Math.abs(record.amount),
        createdAt: record.createdAt,
        remark: record.remark,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取课程购买记录
   */
  async getPurchaseRecords(adminId: string, page: number = 1, pageSize: number = 10) {
    // 验证是企业管理员
    await this.validateCorpAdmin(adminId);

    const skip = (page - 1) * pageSize;

    // 获取购买记录（管理员为员工购买课程的记录）
    const [records, total] = await Promise.all([
      this.prisma.creditRecord.findMany({
        where: {
          fromUserId: adminId,
          type: 'CONSUME',
          toUserId: { not: null },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.creditRecord.count({
        where: {
          fromUserId: adminId,
          type: 'CONSUME',
          toUserId: { not: null },
        },
      }),
    ]);

    // 获取toUserId对应的用户信息
    const toUserIds = records.map((r) => r.toUserId).filter((id) => id);
    const toUsers = await this.prisma.user.findMany({
      where: {
        id: { in: toUserIds },
      },
      select: {
        id: true,
        nickname: true,
        realName: true,
        phone: true,
      },
    });

    const toUserMap = new Map(toUsers.map((u) => [u.id, u]));

    return {
      list: records.map((record) => ({
        id: record.id,
        toUser: toUserMap.get(record.toUserId),
        courseId: record.courseId,
        courseName: record.courseName,
        creditUsed: Math.abs(record.amount),
        createdAt: record.createdAt,
        remark: record.remark,
      })),
      total,
      page,
      pageSize,
    };
  }
}
