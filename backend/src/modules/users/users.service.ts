import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OssService } from '../../infrastructure/oss/oss.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { getFullUrl } from '../../common/utils/url.util';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private ossService: OssService,
  ) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        advisor: {
          select: {
            id: true,
            nickname: true,
            phone: true,
          },
        },
        // 包含企业信息（普通企业用户）
        organization: {
          select: {
            id: true,
            name: true,
            maxStudents: true,
            totalCredits: true,
            usedCredits: true,
          },
        },
        // 包含管理的企业信息（企业管理员）
        adminOrganizations: {
          select: {
            id: true,
            name: true,
            maxStudents: true,
            totalCredits: true,
            usedCredits: true,
          },
        },
        // 包含报名记录（学员）
        enrollments: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
                category: true,
                credit: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取学分信息
    const credit = await this.prisma.credit.findUnique({
      where: { userId: id },
      include: {
        records: {
          orderBy: { createdAt: 'desc' },
          take: 20, // 最近20条记录
        },
      },
    });

    // 如果是教师或教务，获取所教课程
    let teachingCourses = [];
    if (user.role === 'TEACHER' || user.role === 'STAFF') {
      teachingCourses = await this.prisma.course.findMany({
        where: {
          teacherId: id,
        },
        select: {
          id: true,
          title: true,
          category: true,
          credit: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return {
      ...user,
      avatar: getFullUrl(user.avatar),
      credit, // 学分信息
      teachingCourses,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser?: any) {
    // 如果是教师编辑用户
    if (currentUser?.role === 'TEACHER') {
      // 验证被编辑的用户
      const targetUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!targetUser) {
        throw new BadRequestException('用户不存在');
      }

      // 只能编辑学员
      if (targetUser.role !== 'STUDENT') {
        throw new BadRequestException('教师只能编辑学员信息');
      }

      // 教师不能修改角色
      // 使用类型断言，因为前端可能传入 role 字段
      const data = updateUserDto as any;
      if (data.role) {
        delete data.role;
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const url = await this.ossService.uploadFile(file, 'avatars');

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
    });

    return { url };
  }

  async getAdvisor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        advisor: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            realName: true,
          },
        },
      },
    });

    return user?.advisor || null;
  }

  // ========== 管理端方法 ==========

  async create(createUserDto: CreateUserDto, currentUser?: any) {
    // 如果是教师创建用户，只能创建学员
    if (currentUser?.role === 'TEACHER') {
      if (createUserDto.role && createUserDto.role !== 'STUDENT') {
        throw new BadRequestException('教师只能创建学员账号');
      }
      // 强制设置为学员角色
      createUserDto.role = 'STUDENT';
    }

    // 检查手机号是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: createUserDto.phone },
          createUserDto.email ? { email: createUserDto.email } : {},
        ],
      },
    });

    if (existingUser) {
      if (existingUser.phone === createUserDto.phone) {
        throw new BadRequestException('手机号已被注册');
      }
      if (existingUser.email === createUserDto.email) {
        throw new BadRequestException('邮箱已被注册');
      }
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        status: (createUserDto.status || 'ACTIVE') as any,
      } as any,
      select: {
        id: true,
        phone: true,
        email: true,
        nickname: true,
        realName: true,
        avatar: true,
        gender: true,
        role: true,
        status: true,
        company: true,
        position: true,
        organizationId: true,
        advisorId: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
      role,
      status,
    } = query;

    const where: any = {};

    // 关键词搜索（姓名、手机号、邮箱）
    if (keyword) {
      where.OR = [
        { realName: { contains: keyword } },
        { nickname: { contains: keyword } },
        { phone: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }

    // 角色筛选
    if (role) {
      where.role = role;
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          email: true,
          nickname: true,
          realName: true,
          avatar: true,
          gender: true,
          role: true,
          status: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          advisorId: true,
          advisor: {
            select: {
              id: true,
              nickname: true,
              realName: true,
            },
          },
          createdAt: true,
        },
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
   * 获取教师的学员列表
   * 教师可以查看所有学员，用于管理和分配课程
   */
  async findTeacherStudents(teacherId: string, query: any) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
      status,
      role,
    } = query;

    // 构建where条件
    const where: any = {
      // 只查询学员（教师不能看到其他角色的用户）
      role: role || 'STUDENT',
    };

    // 关键词搜索
    if (keyword) {
      where.OR = [
        { realName: { contains: keyword } },
        { nickname: { contains: keyword } },
        { phone: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          email: true,
          nickname: true,
          realName: true,
          avatar: true,
          gender: true,
          role: true,
          status: true,
          position: true,
          organizationId: true,
          advisorId: true,
          advisor: {
            select: {
              id: true,
              nickname: true,
              realName: true,
            },
          },
          createdAt: true,
        },
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

  async getAdvisorList() {
    return this.prisma.user.findMany({
      where: {
        role: 'ADVISOR',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        nickname: true,
        realName: true,
        phone: true,
        avatar: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignAdvisor(userId: string, advisorId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { advisorId },
    });
  }

  /**
   * 修改用户角色
   */
  async changeRole(userId: string, role: string) {
    // 验证角色是否有效
    const validRoles = ['STUDENT', 'ADVISOR', 'TEACHER', 'STAFF', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new Error('无效的角色');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  /**
   * 修改用户状态
   */
  async changeStatus(userId: string, status: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
  }

  /**
   * 获取用户统计数据
   */
  async getUserStats() {
    const [
      totalUsers,
      students,
      advisors,
      teachers,
      staff,
      admins,
      activeUsers,
      inactiveUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'ADVISOR' } }),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.user.count({ where: { role: 'STAFF' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'INACTIVE' } }),
    ]);

    return {
      totalUsers,
      byRole: {
        students,
        advisors,
        teachers,
        staff,
        admins,
      },
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
      },
    };
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

