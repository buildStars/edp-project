import { Injectable } from '@nestjs/common';
import { OssService } from '../../infrastructure/oss/oss.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private readonly ossService: OssService) {}

  /**
   * 上传图片
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return this.ossService.uploadFile(file, 'images');
  }

  /**
   * 上传文件
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return this.ossService.uploadFile(file, 'files');
  }

  /**
   * 删除文件
   */
  async deleteFile(url: string): Promise<void> {
    // 从URL中提取文件路径
    const filename = url.split('/').pop();
    if (filename) {
      await this.ossService.deleteFile(filename);
    }
  }
}

