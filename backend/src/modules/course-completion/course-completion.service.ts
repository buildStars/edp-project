import { Injectable, BadRequestException, NotFoundException, Logger, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { CreateCompletionRequestDto } from './dto/create-completion-request.dto';
import { ReviewCompletionRequestDto } from './dto/review-completion-request.dto';
import { QueryCompletionRequestDto } from './dto/query-completion-request.dto';

@Injectable()
export class CourseCompletionService {
  private readonly logger = new Logger(CourseCompletionService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AchievementsService))
    private achievementsService: AchievementsService,
  ) {}

  /**
   * 教师发起结课申请
   */
  async createCompletionRequest(teacherId: string, teacherName: string, dto: CreateCompletionRequestDto) {
    this.logger.log(`教师发起结课申请 - teacherId: ${teacherId}, courseId: ${dto.courseId}`);

    // 验证课程存在且属于该教师
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: {
        id: true,
        title: true,
        teacherId: true,
        requiredCheckins: true,
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    if (course.teacherId !== teacherId) {
      throw new BadRequestException('您无权为该课程申请结课');
    }

    // 检查是否已有待审批的结课申请
    const existingRequest = await this.prisma.courseCompletionRequest.findFirst({
      where: {
        courseId: dto.courseId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new BadRequestException('该课程已有待审批的结课申请');
    }

    // 获取课程学员签到情况
    const studentsData = await this.achievementsService.getCourseStudentsWithCheckins(dto.courseId);

    // 创建结课申请
    const request = await this.prisma.courseCompletionRequest.create({
      data: {
        courseId: dto.courseId,
        teacherId,
        teacherName,
        totalStudents: studentsData.totalStudents,
        qualifiedStudents: studentsData.qualifiedStudents,
        status: 'PENDING',
      },
    });

    this.logger.log(`结课申请创建成功 - id: ${request.id}`);

    return request;
  }

  /**
   * 教务/管理员审批结课申请
   */
  async reviewCompletionRequest(
    requestId: string,
    reviewerId: string,
    reviewerName: string,
    dto: ReviewCompletionRequestDto,
  ) {
    this.logger.log(`审批结课申请 - requestId: ${requestId}, status: ${dto.status}`);

    // 查询结课申请
    const request = await this.prisma.courseCompletionRequest.findUnique({
      where: { id: requestId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            requiredCheckins: true,
            achievementCredit: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('结课申请不存在');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('该申请已被处理');
    }

    // 更新申请状态
    const updatedRequest = await this.prisma.courseCompletionRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        reviewerId,
        reviewerName,
        reviewedAt: new Date(),
        reviewRemark: dto.remark,
      },
    });

    // 如果审批通过，执行结课操作
    if (dto.status === 'APPROVED') {
      this.logger.log(`结课申请审批通过，开始执行结课操作 - courseId: ${request.courseId}`);

      try {
        // 1. 更新课程状态为已归档
        await this.prisma.course.update({
          where: { id: request.courseId },
          data: { status: 'ARCHIVED' },
        });
        this.logger.log(`课程状态已更新为ARCHIVED - courseId: ${request.courseId}`);

        // 2. 获取所有符合签到要求的学员
        const studentsData = await this.achievementsService.getCourseStudentsWithCheckins(request.courseId);
        const qualifiedStudentIds = studentsData.students
          .filter(s => s.isQualified)
          .map(s => s.userId);

        this.logger.log(`符合条件的学员数: ${qualifiedStudentIds.length} / ${studentsData.totalStudents}`);

        // 3. 只更新符合条件的学员的报名记录为已完成
        if (qualifiedStudentIds.length > 0) {
          const updateEnrollmentsResult = await this.prisma.enrollment.updateMany({
            where: {
              courseId: request.courseId,
              userId: { in: qualifiedStudentIds },
              status: 'ENROLLED',
            },
            data: {
              status: 'COMPLETED',
            },
          });
          this.logger.log(`符合条件的学员标记为已完成 - 影响记录数: ${updateEnrollmentsResult.count}`);

          // 4. 自动发放学习成果（已经包含在 batchIssueAchievements 中）
          const issueResult = await this.achievementsService.batchIssueAchievements(reviewerId, {
            courseId: request.courseId,
            remark: `结课申请审批通过，自动发放 (申请ID: ${requestId})`,
          });

          this.logger.log(`学习成果发放完成 - ${issueResult.message}`);
        } else {
          this.logger.warn(`没有符合条件的学员，跳过发放操作`);
        }
      } catch (error) {
        this.logger.error(`结课操作失败: ${error.message}`);
        // 不阻断审批流程，记录错误即可
      }
    }

    return updatedRequest;
  }

  /**
   * 查询结课申请列表
   */
  async findAll(query: QueryCompletionRequestDto) {
    const { courseId, teacherId, status, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.courseCompletionRequest.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              teacherName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.courseCompletionRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取结课申请详情
   */
  async findOne(id: string) {
    const request = await this.prisma.courseCompletionRequest.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            teacherName: true,
            requiredCheckins: true,
            achievementCredit: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('结课申请不存在');
    }

    return request;
  }

  /**
   * 取消结课申请（教师）
   */
  async cancelCompletionRequest(requestId: string, teacherId: string) {
    this.logger.log(`取消结课申请 - requestId: ${requestId}, teacherId: ${teacherId}`);

    const request = await this.prisma.courseCompletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('结课申请不存在');
    }

    if (request.teacherId !== teacherId) {
      throw new BadRequestException('您无权取消该申请');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('只能取消待审批的申请');
    }

    const updatedRequest = await this.prisma.courseCompletionRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
    });

    return updatedRequest;
  }

  /**
   * 教师单独给学员发放海报（手动结课）
   */
  async completeStudentManually(
    teacherId: string,
    courseId: string,
    userId: string,
    remark?: string,
  ) {
    this.logger.log(`教师手动结课 - teacherId: ${teacherId}, courseId: ${courseId}, userId: ${userId}`);

    // 1. 验证课程是否属于该教师
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        teacherId: true,
        requiredCheckins: true,
        achievementCredit: true,
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    if (course.teacherId !== teacherId) {
      throw new BadRequestException('您无权操作该课程');
    }

    // 2. 检查学员是否已报名
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
        status: 'ENROLLED',
      },
    });

    if (!enrollment) {
      throw new BadRequestException('该学员未报名此课程或已完成');
    }

    // 3. 获取学员的签到次数
    const checkinCount = await this.prisma.checkin.count({
      where: {
        userId,
        session: {
          courseId,
        },
      },
    });

    // 4. 更新报名记录为已完成
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'COMPLETED' },
    });

    // 5. 发放学习成果
    await this.achievementsService.issueAchievements(teacherId, {
      courseId,
      userIds: [userId],
      remark: remark || '教师手动发放',
    });

    this.logger.log(`学员手动结课完成 - userId: ${userId}, courseId: ${courseId}`);

    return {
      success: true,
      message: '操作成功',
      data: {
        userId,
        courseId,
        checkinCount,
        requiredCheckins: course.requiredCheckins,
      },
    };
  }

  /**
   * 批量给学员发放海报（教师批量操作）
   */
  async completeStudentsBatch(
    teacherId: string,
    courseId: string,
    userIds: string[],
    remark?: string,
  ) {
    this.logger.log(`教师批量结课 - teacherId: ${teacherId}, courseId: ${courseId}, 学员数: ${userIds.length}`);

    // 1. 验证课程是否属于该教师
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        teacherId: true,
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    if (course.teacherId !== teacherId) {
      throw new BadRequestException('您无权操作该课程');
    }

    // 2. 批量更新报名记录为已完成
    const updateResult = await this.prisma.enrollment.updateMany({
      where: {
        courseId,
        userId: { in: userIds },
        status: 'ENROLLED',
      },
      data: {
        status: 'COMPLETED',
      },
    });

    // 3. 批量发放学习成果
    if (updateResult.count > 0) {
      await this.achievementsService.issueAchievements(teacherId, {
        courseId,
        userIds,
        remark: remark || '教师批量发放',
      });
    }

    this.logger.log(`批量结课完成 - 成功: ${updateResult.count} 人`);

    return {
      success: true,
      message: `成功为 ${updateResult.count} 名学员发放海报`,
      successCount: updateResult.count,
    };
  }
}

