import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建评价
   */
  async create(userId: string, dto: CreateEvaluationDto) {
    // 检查课程是否存在
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 检查是否已报名
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: dto.courseId,
        status: 'ENROLLED',
      },
    });

    if (!enrollment) {
      throw new BadRequestException('您未报名该课程');
    }

    // 检查是否已签到
    const checkin = await this.prisma.checkin.findFirst({
      where: {
        userId,
        session: {
          courseId: dto.courseId,
        },
      },
    });

    if (!checkin) {
      throw new BadRequestException('请先完成签到后再评价');
    }

    // 检查是否已评价
    const existingEvaluation = await this.prisma.courseEvaluation.findFirst({
      where: {
        courseId: dto.courseId,
        chapterId: dto.chapterId || null,
        userId,
      },
    });

    if (existingEvaluation) {
      throw new ConflictException('您已经评价过该课程');
    }

    // 创建评价
    const evaluation = await this.prisma.courseEvaluation.create({
      data: {
        userId,
        courseId: dto.courseId,
        chapterId: dto.chapterId || null,
        enrollmentId: enrollment.id,
        rating: dto.rating,
        // 新的评价字段
        attitude1: dto.attitude1,
        attitude2: dto.attitude2,
        content1: dto.content1,
        content2: dto.content2,
        method1: dto.method1,
        method2: dto.method2,
        effect1: dto.effect1,
        effect2: dto.effect2,
        organization: dto.organization,
        suggestion: dto.suggestion,
        // 旧字段（兼容）
        contentRating: dto.contentRating,
        teacherRating: dto.teacherRating,
        organizationRating: dto.organizationRating,
        comment: dto.comment,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            sortOrder: true,
          },
        },
      },
    });

    return {
      message: '评价成功',
      evaluation,
    };
  }

  /**
   * 获取我的评价列表
   */
  async getMyEvaluations(userId: string) {
    const evaluations = await this.prisma.courseEvaluation.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            startTime: true,
            teacherName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return evaluations;
  }

  /**
   * 获取课程评价列表
   */
  async getCourseEvaluations(courseId: string) {
    const evaluations = await this.prisma.courseEvaluation.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            realName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return evaluations;
  }

  /**
   * 获取课程评价统计
   */
  async getCourseEvaluationStats(courseId: string) {
    const evaluations = await this.prisma.courseEvaluation.findMany({
      where: { courseId },
      select: {
        rating: true,
        contentRating: true,
        teacherRating: true,
        organizationRating: true,
      },
    });

    if (evaluations.length === 0) {
      return {
        total: 0,
        averageRating: 0,
        averageContentRating: 0,
        averageTeacherRating: 0,
        averageOrganizationRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    // 计算平均分
    const total = evaluations.length;
    const sumRating = evaluations.reduce((sum, e) => sum + e.rating, 0);
    const sumContent = evaluations
      .filter((e) => e.contentRating)
      .reduce((sum, e) => sum + e.contentRating!, 0);
    const sumTeacher = evaluations
      .filter((e) => e.teacherRating)
      .reduce((sum, e) => sum + e.teacherRating!, 0);
    const sumOrganization = evaluations
      .filter((e) => e.organizationRating)
      .reduce((sum, e) => sum + e.organizationRating!, 0);

    const contentCount = evaluations.filter((e) => e.contentRating).length;
    const teacherCount = evaluations.filter((e) => e.teacherRating).length;
    const organizationCount = evaluations.filter((e) => e.organizationRating).length;

    // 评分分布
    const ratingDistribution = {
      5: evaluations.filter((e) => e.rating === 5).length,
      4: evaluations.filter((e) => e.rating === 4).length,
      3: evaluations.filter((e) => e.rating === 3).length,
      2: evaluations.filter((e) => e.rating === 2).length,
      1: evaluations.filter((e) => e.rating === 1).length,
    };

    return {
      total,
      averageRating: parseFloat((sumRating / total).toFixed(2)),
      averageContentRating: contentCount > 0 ? parseFloat((sumContent / contentCount).toFixed(2)) : 0,
      averageTeacherRating: teacherCount > 0 ? parseFloat((sumTeacher / teacherCount).toFixed(2)) : 0,
      averageOrganizationRating: organizationCount > 0 ? parseFloat((sumOrganization / organizationCount).toFixed(2)) : 0,
      ratingDistribution,
    };
  }

  /**
   * 检查用户是否已评价
   */
  async hasEvaluated(userId: string, courseId: string, chapterId?: string): Promise<boolean> {
    const evaluation = await this.prisma.courseEvaluation.findFirst({
      where: {
        courseId,
        chapterId: chapterId || null,
        userId,
      },
    });

    return !!evaluation;
  }

  /**
   * 获取用户对课程的评价
   */
  async getUserCourseEvaluation(userId: string, courseId: string, chapterId?: string) {
    // 构建查询条件
    const where: any = {
      courseId,
      userId,
    };
    
    // 处理 chapterId：如果传了章节ID则查询章节评价，否则查询课程评价
    if (chapterId && chapterId.trim() !== '') {
      where.chapterId = chapterId;
      console.log(`[查询评价] 查询章节评价 - userId: ${userId}, courseId: ${courseId}, chapterId: ${chapterId}`);
    } else {
      where.chapterId = null;
      console.log(`[查询评价] 查询课程评价 - userId: ${userId}, courseId: ${courseId}`);
    }
    
    const evaluation = await this.prisma.courseEvaluation.findFirst({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            sortOrder: true,
          },
        },
      },
    });

    if (evaluation) {
      console.log(`[查询评价] ✅ 找到评价记录:`, { id: evaluation.id, rating: evaluation.rating });
    } else {
      console.log(`[查询评价] ⚠️ 未找到评价记录`);
    }

    return evaluation;
  }

  /**
   * 获取所有评价列表（管理员）
   */
  async getAllEvaluations(query: any = {}) {
    const { page = 1, pageSize = 10, courseId, userId, rating, keyword } = query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where: any = {};

    // 课程筛选
    if (courseId) {
      where.courseId = courseId;
    }

    // 用户筛选
    if (userId) {
      where.userId = userId;
    }

    // 评分筛选
    if (rating) {
      where.rating = parseInt(rating);
    }

    // 关键词搜索（课程标题、用户名）
    if (keyword) {
      where.OR = [
        {
          course: {
            title: { contains: keyword },
          },
        },
        {
          user: {
            OR: [
              { realName: { contains: keyword } },
              { nickname: { contains: keyword } },
            ],
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.courseEvaluation.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              teacherName: true,
            },
          },
          user: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              avatar: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.courseEvaluation.count({ where }),
    ]);

    return {
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / parseInt(pageSize)),
    };
  }

  /**
   * 删除评价（管理员）
   */
  async deleteEvaluation(id: string) {
    const evaluation = await this.prisma.courseEvaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      throw new NotFoundException('评价不存在');
    }

    await this.prisma.courseEvaluation.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }
}

