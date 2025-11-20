import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { getFullUrl } from '../../common/utils/url.util';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createCourseDto: CreateCourseDto, user?: any) {
    // 如果是教师创建，自动设置为草稿状态并关联教师ID
    const data: any = { ...createCourseDto };
    
    if (user && user.role === 'TEACHER') {
      data.status = 'DRAFT'; // 教师创建的课程默认为草稿状态
      data.teacherId = user.id; // 关联教师ID
      data.teacherName = user.realName || user.nickname; // 设置教师姓名
    }
    
    return this.prisma.course.create({
      data,
    });
  }

  async findAll(query: QueryCourseDto, userId?: string) {
    const { page = 1, pageSize = 10, status, approvalStatus, keyword } = query as any;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    
    // 关键词搜索
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { teacherName: { contains: keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    // 如果提供了 userId，批量查询报名状态和退课申请状态
    let coursesWithEnrollStatus = list;
    if (userId) {
      const courseIds = list.map(course => course.id);
      
      // 批量查询报名记录（排除已取消的）
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: courseIds },
          status: { not: 'CANCELLED' }, // 排除已取消的报名
        },
        select: { 
          id: true,
          courseId: true 
        },
      });
      
      const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e.id]));
      
      // 批量查询待处理的退课申请
      const enrollmentIds = enrollments.map(e => e.id);
      const refundRequests = await this.prisma.refundRequest.findMany({
        where: {
          enrollmentId: { in: enrollmentIds },
          status: 'PENDING',
        },
        select: {
          enrollmentId: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      const refundStatusMap = new Map(refundRequests.map(r => [r.enrollmentId, r.status]));
      
      coursesWithEnrollStatus = list.map(course => {
        const enrollmentId = enrollmentMap.get(course.id);
        const isEnrolled = !!enrollmentId;
        const refundStatus = enrollmentId ? refundStatusMap.get(enrollmentId) || null : null;
        
        return {
          ...course,
          coverImage: getFullUrl(course.coverImage),
          teacherAvatar: getFullUrl(course.teacherAvatar),
          isEnrolled,
          refundStatus,
        };
      });
    } else {
      coursesWithEnrollStatus = list.map(course => ({
        ...course,
        coverImage: getFullUrl(course.coverImage),
        teacherAvatar: getFullUrl(course.teacherAvatar),
        isEnrolled: false,
        refundStatus: null,
      }));
    }

    return new PaginatedResult(coursesWithEnrollStatus, total, page, pageSize);
  }

  async findOne(id: string, userId?: string) {
    this.logger.debug(`查询课程详情 - courseId: ${id}, userId: ${userId || 'null'}`, 'CoursesService');
    
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        materials: true,
      },
    });

    if (!course) {
      return null;
    }

    // 如果提供了 userId，检查是否已报名
    let isEnrolled = false;
    let enrollmentId: string | null = null;
    let enrollmentStatus: string | null = null;
    let refundStatus: string | null = null;
    let hasEvaluated = false;
    
    if (userId) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          userId,
          courseId: id,
          status: { not: 'CANCELLED' }, // 排除已取消的报名
        },
      });
      isEnrolled = !!enrollment;
      enrollmentId = enrollment?.id || null;
      enrollmentStatus = enrollment?.status || null; // 添加报名状态
      
      // 如果已报名，检查是否有待处理的退课申请
      if (enrollment) {
        const refundRequest = await this.prisma.refundRequest.findFirst({
          where: {
            enrollmentId: enrollment.id,
            status: 'PENDING', // 只查询待处理的申请
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        
        if (refundRequest) {
          refundStatus = refundRequest.status;
        }
      }
      
      // 检查是否已评价（课程级别）
      const evaluation = await this.prisma.courseEvaluation.findFirst({
        where: {
          courseId: id,
          userId,
          chapterId: null, // 只检查课程级别的评价
        },
      });
      hasEvaluated = !!evaluation;
      
      this.logger.debug(
        `课程报名状态 - enrollment: ${enrollment ? 'found' : 'not found'}, isEnrolled: ${isEnrolled}, enrollmentId: ${enrollmentId}, refundStatus: ${refundStatus}, hasEvaluated: ${hasEvaluated}`,
        'CoursesService'
      );
    } else {
      this.logger.debug('没有提供 userId，返回 isEnrolled: false', 'CoursesService');
    }

    return {
      ...course,
      coverImage: getFullUrl(course.coverImage),
      teacherAvatar: getFullUrl(course.teacherAvatar),
      isEnrolled,
      enrollmentId,
      enrollmentStatus, // 添加报名状态字段
      refundStatus,
      hasEvaluated,
    };
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user?: any) {
    // 如果是教师，验证课程是否属于该教师
    if (user && user.role === 'TEACHER') {
      const course = await this.prisma.course.findUnique({
        where: { id },
        select: { teacherId: true },
      });
      
      if (!course) {
        throw new Error('课程不存在');
      }
      
      if (course.teacherId !== user.id) {
        throw new Error('无权编辑此课程');
      }
      
      // 教师只能编辑草稿状态的课程
      const data: any = { ...updateCourseDto };
      if (data.status && data.status !== 'DRAFT') {
        delete data.status; // 教师不能直接修改状态
      }
    }
    
    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: string) {
    return this.prisma.course.delete({
      where: { id },
    });
  }

  async incrementViews(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  // ========== 管理端方法 ==========

  async batchDelete(ids: string[]) {
    return this.prisma.course.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async approveCourse(id: string, action: 'approve' | 'reject', userId: string, reason?: string) {
    const data: any = {};
    
    if (action === 'approve') {
      data.status = 'PUBLISHED';
      data.approvalStatus = 'APPROVED';
      data.approvedBy = userId;
      data.approvedAt = new Date();
    } else {
      data.status = 'DRAFT';
      data.approvalStatus = 'REJECTED';
      data.approvalRemark = reason;
    }

    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  /**
   * 提交课程审批（教师提交课程待审批）
   */
  async submitForApproval(id: string, userId: string) {
    this.logger.debug(`课程 ${id} 提交审批 - 提交人: ${userId}`);

    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new Error('课程不存在');
    }

    if (course.approvalStatus !== 'DRAFT') {
      throw new Error('只有草稿状态的课程才能提交审批');
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        approvalStatus: 'PENDING_REVIEW',
        status: 'DRAFT', // 审批通过前保持草稿状态
      },
    });

    this.logger.log(`课程已提交审批 - ID: ${id}`);
    return updated;
  }

  /**
   * 审批课程（管理员/教务审批）
   */
  async reviewCourse(id: string, action: 'APPROVE' | 'REJECT', userId: string, remark?: string) {
    this.logger.debug(`审批课程 ${id} - 动作: ${action}`);

    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new Error('课程不存在');
    }

    if (course.approvalStatus !== 'PENDING_REVIEW') {
      throw new Error('只能审批待审核状态的课程');
    }

    const data: any = {
      approvedBy: userId,
      approvedAt: new Date(),
      approvalRemark: remark,
    };

    if (action === 'APPROVE') {
      data.approvalStatus = 'APPROVED';
      data.status = 'PUBLISHED'; // 审批通过后自动发布
    } else {
      data.approvalStatus = 'REJECTED';
      data.status = 'DRAFT'; // 拒绝后回到草稿状态
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data,
    });

    this.logger.log(`课程审批完成 - ID: ${id}, 结果: ${action}`);
    return updated;
  }

  async updateEnrollStatus(id: string, enrollStatus: string) {
    return this.prisma.course.update({
      where: { id },
      data: { enrollStatus: enrollStatus as any },
    });
  }

  async publishCourse(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async archiveCourse(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  /**
   * 获取课程课件列表
   */
  async getCourseMaterials(courseId: string, chapterId?: string) {
    const where: any = { courseId };
    
    // 如果指定了章节ID，只查询该章节的课件
    if (chapterId && chapterId.trim() !== '') {
      where.chapterId = chapterId;
    }
    
    const materials = await this.prisma.courseMaterial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    console.log(`[获取课件] courseId: ${courseId}, chapterId: ${chapterId || '全部'}, 课件数: ${materials.length}`);
    
    return materials;
  }

  /**
   * 提交课程审批（教师使用）
   */
  async submitApproval(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        id: true, 
        teacherId: true, 
        status: true, 
        title: true 
      },
    });

    if (!course) {
      throw new Error('课程不存在');
    }

    if (course.teacherId !== teacherId) {
      throw new Error('无权操作此课程');
    }

    if (course.status !== 'DRAFT') {
      throw new Error('只能提交草稿状态的课程');
    }

    this.logger.log(
      `教师提交课程审批 - courseId: ${courseId}, title: ${course.title}`,
      'CoursesService',
    );

    return {
      success: true,
      message: '审批申请已提交，请等待管理员审核',
    };
  }

  /**
   * 分配老师到课程（管理员/教务功能）
   */
  async assignTeacher(
    courseId: string,
    data: { teacherId: string; teacherName: string; teacherAvatar?: string },
  ) {
    // 验证课程是否存在
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 验证教师是否存在
    const teacher = await this.prisma.user.findUnique({
      where: { id: data.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('教师不存在');
    }

    if (teacher.role !== 'TEACHER') {
      throw new BadRequestException('所选用户不是教师角色');
    }

    // 更新课程的教师信息
    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        teacherId: data.teacherId,
        teacherName: data.teacherName,
        teacherAvatar: data.teacherAvatar,
      },
    });

    this.logger.log(
      `课程分配老师 - courseId: ${courseId}, teacherId: ${data.teacherId}, teacherName: ${data.teacherName}`,
      'CoursesService',
    );

    return updatedCourse;
  }
}

