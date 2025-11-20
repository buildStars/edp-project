import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { QueryChapterDto } from './dto/query-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建章节
   */
  async create(createChapterDto: CreateChapterDto) {
    // 验证课程是否存在
    const course = await this.prisma.course.findUnique({
      where: { id: createChapterDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 如果没有指定排序号，自动设置为最大值+1
    if (createChapterDto.sortOrder === undefined) {
      const maxOrderChapter = await this.prisma.courseChapter.findFirst({
        where: { courseId: createChapterDto.courseId },
        orderBy: { sortOrder: 'desc' },
      });
      createChapterDto.sortOrder = maxOrderChapter ? maxOrderChapter.sortOrder + 1 : 1;
    }

    return this.prisma.courseChapter.create({
      data: createChapterDto,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            materials: true,
            checkinSessions: true,
            evaluations: true,
          },
        },
      },
    });
  }

  /**
   * 查询章节列表
   */
  async findAll(query: QueryChapterDto, userId?: string) {
    const { courseId, status, keyword } = query;
    
    console.log('='.repeat(80));
    console.log('📖 查询章节列表');
    console.log('  courseId:', courseId);
    console.log('  status:', status);
    console.log('  userId:', userId || '❌ 未提供');
    console.log('='.repeat(80));

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const chapters = await this.prisma.courseChapter.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            materials: true,
            checkinSessions: true,
            evaluations: true,
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // 如果提供了 userId，查询用户的签到和评价状态
    const chaptersWithStatus = await Promise.all(
      chapters.map(async (chapter) => {
        let hasCheckedIn = false;
        let hasEvaluated = false;

        if (userId) {
          console.log(
            `查询章节 ${chapter.id} 的用户 ${userId} 签到状态`,
          );

          // 查询用户是否签到过这个章节（只要有记录就表示已签到）
          const checkinRecord = await this.prisma.checkin.findFirst({
            where: {
              userId,
              session: {
                chapterId: chapter.id,
              },
            },
          });
          hasCheckedIn = !!checkinRecord;

          console.log(
            `章节 ${chapter.id} 签到记录: ${checkinRecord ? `✅ 已签到 (ID: ${checkinRecord.id})` : '❌ 未签到'}`,
          );

          // 查询用户是否评价过这个章节
          const evaluation = await this.prisma.courseEvaluation.findFirst({
            where: {
              userId,
              courseId: chapter.courseId,
              chapterId: chapter.id,
            },
          });
          hasEvaluated = !!evaluation;
        } else {
          console.log(`未提供 userId，跳过签到和评价状态查询`);
        }

        return {
          ...chapter,
          hasCheckedIn,
          hasEvaluated,
        };
      }),
    );

    return {
      items: chaptersWithStatus,
      total: chaptersWithStatus.length,
    };
  }

  /**
   * 获取章节详情
   */
  async findOne(id: string, userId?: string) {
    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            teacherId: true,
            teacherName: true,
          },
        },
        materials: {
          orderBy: { createdAt: 'desc' },
        },
        checkinSessions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            materials: true,
            checkinSessions: true,
            evaluations: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 如果提供了 userId，查询用户的签到和评价状态
    let hasCheckedIn = false;
    let hasEvaluated = false;

    if (userId) {
      // 查询用户是否签到过这个章节（只要有记录就表示已签到）
      const checkinRecord = await this.prisma.checkin.findFirst({
        where: {
          userId,
          session: {
            chapterId: id,
          },
        },
      });
      hasCheckedIn = !!checkinRecord;

      // 查询用户是否评价过这个章节
      const evaluation = await this.prisma.courseEvaluation.findFirst({
        where: {
          userId,
          courseId: chapter.courseId,
          chapterId: id,
        },
      });
      hasEvaluated = !!evaluation;
    }

    return {
      ...chapter,
      hasCheckedIn,
      hasEvaluated,
    };
  }

  /**
   * 更新章节
   */
  async update(id: string, updateChapterDto: UpdateChapterDto) {
    // 验证章节是否存在
    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 如果更新了courseId，验证新课程是否存在
    if (updateChapterDto.courseId && updateChapterDto.courseId !== chapter.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: updateChapterDto.courseId },
      });
      if (!course) {
        throw new NotFoundException('目标课程不存在');
      }
    }

    return this.prisma.courseChapter.update({
      where: { id },
      data: updateChapterDto,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            materials: true,
            checkinSessions: true,
            evaluations: true,
          },
        },
      },
    });
  }

  /**
   * 删除章节
   */
  async remove(id: string) {
    // 验证章节是否存在
    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            materials: true,
            checkinSessions: true,
            evaluations: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 如果章节下有关联数据，提示用户
    const hasRelatedData = 
      chapter._count.materials > 0 ||
      chapter._count.checkinSessions > 0 ||
      chapter._count.evaluations > 0;

    if (hasRelatedData) {
      throw new BadRequestException(
        `该章节下有相关数据（课件${chapter._count.materials}个、签到${chapter._count.checkinSessions}次、评价${chapter._count.evaluations}条），无法删除`
      );
    }

    return this.prisma.courseChapter.delete({
      where: { id },
    });
  }

  /**
   * 批量更新排序
   */
  async updateSortOrder(updates: Array<{ id: string; sortOrder: number }>) {
    const transactions = updates.map(({ id, sortOrder }) =>
      this.prisma.courseChapter.update({
        where: { id },
        data: { sortOrder },
      })
    );

    await this.prisma.$transaction(transactions);

    return { message: '排序更新成功' };
  }

  /**
   * 批量删除章节
   */
  async batchDelete(ids: string[]) {
    // 检查每个章节是否可以删除
    for (const id of ids) {
      const chapter = await this.prisma.courseChapter.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              materials: true,
              checkinSessions: true,
              evaluations: true,
            },
          },
        },
      });

      if (!chapter) {
        continue;
      }

      const hasRelatedData = 
        chapter._count.materials > 0 ||
        chapter._count.checkinSessions > 0 ||
        chapter._count.evaluations > 0;

      if (hasRelatedData) {
        throw new BadRequestException(
          `章节"${chapter.title}"下有相关数据，无法删除`
        );
      }
    }

    const result = await this.prisma.courseChapter.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      message: '批量删除成功',
      deletedCount: result.count,
    };
  }
}

