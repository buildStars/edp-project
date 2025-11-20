import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { BindStudentDto } from './dto/bind-student.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { QueryTeacherStudentDto } from './dto/query-teacher-student.dto';
import * as bcrypt from 'bcrypt';

/**
 * 教师学员管理服务
 * 处理教师注册学员和管理师生关系的业务逻辑
 */
@Injectable()
export class TeacherStudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 教师注册新学员
   */
  async registerStudent(teacherId: string, dto: RegisterStudentDto) {
    this.logger.debug(`教师 ${teacherId} 注册新学员 - 手机号: ${dto.phone}`);

    // 检查手机号是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      throw new ConflictException('该手机号已被注册');
    }

    // 生成默认密码（手机号后6位）
    const defaultPassword = dto.phone.slice(-6);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 创建学员账户和绑定关系
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 创建学员账户
      const student = await tx.user.create({
        data: {
          phone: dto.phone,
          password: hashedPassword,
          realName: dto.realName,
          company: dto.company,
          position: dto.position,
          email: dto.email,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      });

      // 2. 创建学分账户
      await tx.credit.create({
        data: {
          userId: student.id,
          balance: 0,
          total: 0,
          used: 0,
        },
      });

      // 3. 创建师生关系
      const relation = await tx.teacherStudent.create({
        data: {
          teacherId,
          studentId: student.id,
          registeredBy: 'TEACHER_REGISTER',
          remark: dto.remark,
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
          student: {
            select: {
              id: true,
              phone: true,
              realName: true,
              company: true,
              position: true,
              email: true,
            },
          },
        },
      });

      return {
        relation,
        defaultPassword,
      };
    });

    this.logger.log(`学员注册成功 - ID: ${result.relation.student.id}, 手机号: ${dto.phone}`);

    return {
      ...result.relation,
      defaultPassword: result.defaultPassword,
      message: `学员创建成功，默认密码为: ${result.defaultPassword}`,
    };
  }

  /**
   * 绑定已有学员
   */
  async bindStudent(teacherId: string, dto: BindStudentDto) {
    this.logger.debug(`教师 ${teacherId} 绑定学员 ${dto.studentId}`);

    // 验证学员存在
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('学员不存在');
    }

    if (student.role !== 'STUDENT') {
      throw new BadRequestException('该用户不是学员角色');
    }

    // 检查是否已绑定
    const existing = await this.prisma.teacherStudent.findUnique({
      where: {
        teacherId_studentId: {
          teacherId,
          studentId: dto.studentId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('已绑定该学员');
    }

    // 创建绑定关系
    const relation = await this.prisma.teacherStudent.create({
      data: {
        teacherId,
        studentId: dto.studentId,
        registeredBy: dto.registeredBy || 'SELF_REGISTER',
        remark: dto.remark,
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
        student: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            realName: true,
            company: true,
            position: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`学员绑定成功 - 教师: ${teacherId}, 学员: ${dto.studentId}`);

    return relation;
  }

  /**
   * 查询师生关系列表
   */
  async findAll(userId: string, userRole: string, query: QueryTeacherStudentDto) {
    const { page = 1, pageSize = 10, teacherId, studentId, keyword } = query;

    const where: any = {};

    // 根据角色设置查询条件
    if (userRole === 'TEACHER') {
      // 教师只能看到自己的学员
      where.teacherId = userId;
    } else if (userRole === 'ADMIN' || userRole === 'STAFF') {
      // 管理员和教务可以查看所有
      if (teacherId) {
        where.teacherId = teacherId;
      }
      if (studentId) {
        where.studentId = studentId;
      }
    } else {
      throw new BadRequestException('权限不足');
    }

    // 关键词搜索
    if (keyword) {
      where.student = {
        OR: [
          { realName: { contains: keyword } },
          { nickname: { contains: keyword } },
          { company: { contains: keyword } },
          { phone: { contains: keyword } },
        ],
      };
    }

    // 分页查询
    const [items, total] = await Promise.all([
      this.prisma.teacherStudent.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              avatar: true,
              phone: true,
            },
          },
          student: {
            select: {
              id: true,
              phone: true,
              nickname: true,
              realName: true,
              company: true,
              position: true,
              avatar: true,
              email: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.teacherStudent.count({ where }),
    ]);

    // 附加学员学分信息
    const itemsWithCredit = await Promise.all(
      items.map(async (item) => {
        const credit = await this.prisma.credit.findUnique({
          where: { userId: item.studentId },
          select: {
            balance: true,
            total: true,
            used: true,
          },
        });

        return {
          ...item,
          studentCredit: credit,
        };
      }),
    );

    return {
      items: itemsWithCredit,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取单个师生关系详情
   */
  async findOne(id: string, userId: string, userRole: string) {
    const relation = await this.prisma.teacherStudent.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            nickname: true,
            realName: true,
            avatar: true,
            phone: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            realName: true,
            company: true,
            position: true,
            avatar: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!relation) {
      throw new NotFoundException('师生关系不存在');
    }

    // 权限检查
    if (userRole === 'TEACHER' && relation.teacherId !== userId) {
      throw new BadRequestException('权限不足');
    }

    // 附加学员学分和学习数据
    const [credit, enrollmentCount, completedCount] = await Promise.all([
      this.prisma.credit.findUnique({
        where: { userId: relation.studentId },
      }),
      this.prisma.enrollment.count({
        where: { userId: relation.studentId },
      }),
      this.prisma.enrollment.count({
        where: {
          userId: relation.studentId,
          status: 'COMPLETED',
        },
      }),
    ]);

    return {
      ...relation,
      studentCredit: credit,
      studentStats: {
        totalEnrollments: enrollmentCount,
        completedCourses: completedCount,
      },
    };
  }

  /**
   * 解绑学员
   */
  async unbind(id: string, teacherId: string, userRole: string) {
    const relation = await this.prisma.teacherStudent.findUnique({
      where: { id },
    });

    if (!relation) {
      throw new NotFoundException('师生关系不存在');
    }

    // 权限检查：教师只能解绑自己的学员
    if (userRole === 'TEACHER' && relation.teacherId !== teacherId) {
      throw new BadRequestException('只能解绑自己的学员');
    }

    await this.prisma.teacherStudent.delete({
      where: { id },
    });

    this.logger.log(`师生关系已解绑 - ID: ${id}`);

    return { message: '解绑成功' };
  }

  /**
   * 获取教师的学员统计
   */
  async getStatistics(teacherId: string) {
    const [total, activeCount, inactiveCount] = await Promise.all([
      this.prisma.teacherStudent.count({
        where: { teacherId },
      }),
      this.prisma.teacherStudent.count({
        where: {
          teacherId,
          student: {
            status: 'ACTIVE',
          },
        },
      }),
      this.prisma.teacherStudent.count({
        where: {
          teacherId,
          student: {
            status: 'INACTIVE',
          },
        },
      }),
    ]);

    return {
      total,
      active: activeCount,
      inactive: inactiveCount,
    };
  }

  /**
   * 查找教师的所有学员ID列表
   */
  async getTeacherStudentIds(teacherId: string): Promise<string[]> {
    const relations = await this.prisma.teacherStudent.findMany({
      where: { teacherId },
      select: { studentId: true },
    });

    return relations.map((r) => r.studentId);
  }
}
