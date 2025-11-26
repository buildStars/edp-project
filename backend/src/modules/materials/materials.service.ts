import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OssService } from '../../infrastructure/oss/oss.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private prisma: PrismaService,
    private ossService: OssService,
  ) {}

  async getCourseware(userId: string, courseId: string) {
    // 检查是否已评价
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment || !enrollment.rated) {
      throw new Error('请先完成课程评价');
    }

    // 获取课件列表
    const materials = await this.prisma.courseMaterial.findMany({
      where: { courseId },
    });

    // 记录下载
    for (const material of materials) {
      await this.prisma.download.create({
        data: {
          userId,
          materialId: material.id,
        },
      });
    }

    return materials;
  }

  /**
   * 记录下载
   */
  async recordDownload(userId: string, materialId: string) {
    await this.prisma.download.create({
      data: {
        userId,
        materialId,
      },
    });

    return { message: '下载记录成功' };
  }

  // ========== 管理端CRUD ==========

  /**
   * 获取课件列表（管理端）
   */
  async findAll(query: QueryMaterialDto) {
    const { courseId, fileType, page = 1, pageSize = 20, keyword } = query;

    const where: any = {};

    // courseId 可选
    if (courseId) {
      where.courseId = courseId;
    }

    // keyword 搜索
    if (keyword) {
      where.title = { contains: keyword };
    }

    // fileType 筛选
    if (fileType) {
      where.fileType = fileType;
    }

    const [items, total] = await Promise.all([
      this.prisma.courseMaterial.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          chapter: {
            select: {
              id: true,
              title: true,
              sortOrder: true,
            },
          },
          _count: {
            select: {
              downloads: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.courseMaterial.count({ where }),
    ]);

    this.logger.log(`获取课件列表 - courseId: ${courseId || '全部'}, fileType: ${fileType || '全部'}, total: ${total}`);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 创建课件（管理端）
   */
  async create(userId: string, dto: CreateMaterialDto) {
    const material = await this.prisma.courseMaterial.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
        chapterId: dto.chapterId,
      },
    });

    this.logger.log(`创建课件 - id: ${material.id}, title: ${material.title}, chapterId: ${dto.chapterId || '课程级'}, uploadedBy: ${userId}`);

    return material;
  }

  /**
   * 更新课件（管理端）
   */
  async update(id: string, dto: UpdateMaterialDto) {
    const material = await this.prisma.courseMaterial.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('课件不存在');
    }

    const updated = await this.prisma.courseMaterial.update({
      where: { id },
      data: dto,
    });

    this.logger.log(`更新课件 - id: ${id}, title: ${updated.title}`);

    return updated;
  }

  /**
   * 删除课件（管理端）
   */
  async delete(id: string) {
    const material = await this.prisma.courseMaterial.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('课件不存在');
    }

    await this.prisma.courseMaterial.delete({
      where: { id },
    });

    this.logger.log(`删除课件 - id: ${id}, title: ${material.title}`);

    return { message: '删除成功' };
  }

  /**
   * 批量删除课件（管理端）
   */
  async batchDelete(ids: string[]) {
    const result = await this.prisma.courseMaterial.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    this.logger.log(`批量删除课件 - count: ${result.count}`);

    return {
      message: `成功删除 ${result.count} 个课件`,
      count: result.count,
    };
  }

  /**
   * 上传课件文件
   */
  async uploadFile(file: Express.Multer.File) {
    // 使用 OSS 上传文件
    const url = await this.ossService.uploadFile(file, 'materials');

    // 自动检测文件类型
    const fileType = this.getFileType(file.mimetype, file.originalname);

    this.logger.log(`上传课件文件 - filename: ${file.originalname}, size: ${file.size}, type: ${fileType}`);

    return {
      url,
      size: file.size,
      type: fileType,
      filename: file.originalname,
    };
  }

  /**
   * 根据 MIME 类型和文件名判断文件类型
   */
  private getFileType(mimetype: string, filename: string): string {
    // PDF
    if (mimetype === 'application/pdf') return 'pdf';
    
    // Word
    if (mimetype === 'application/msword' || 
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'doc';
    }
    
    // Excel
    if (mimetype === 'application/vnd.ms-excel' || 
        mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return 'xls';
    }
    
    // PowerPoint
    if (mimetype === 'application/vnd.ms-powerpoint' || 
        mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      return 'ppt';
    }
    
    // 图片
    if (mimetype.startsWith('image/')) return 'image';
    
    // 视频
    if (mimetype.startsWith('video/')) return 'video';
    
    // 压缩包
    if (mimetype === 'application/zip' || 
        mimetype === 'application/x-rar-compressed' || 
        mimetype === 'application/x-7z-compressed') {
      return 'zip';
    }
    
    // 根据文件扩展名判断
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['xls', 'xlsx'].includes(ext)) return 'xls';
    if (['ppt', 'pptx'].includes(ext)) return 'ppt';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return 'video';
    if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
    
    return 'other';
  }
}

