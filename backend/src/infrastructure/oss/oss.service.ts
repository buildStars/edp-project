import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as COS from 'cos-nodejs-sdk-v5';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class OssService {
  private cos: any;
  private bucket: string;
  private region: string;
  private cdnDomain: string;
  private useLocalStorage: boolean;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    // 通过环境变量控制存储模式
    const storageMode = this.configService.get('STORAGE_MODE', 'local'); // 默认使用本地存储
    
    if (storageMode === 'cos') {
      // 腾讯云 COS 模式
      this.bucket = this.configService.get('COS_BUCKET');
      this.region = this.configService.get('COS_REGION');
      this.cdnDomain = this.configService.get('COS_CDN_DOMAIN');
      const secretId = this.configService.get('COS_SECRET_ID');
      const secretKey = this.configService.get('COS_SECRET_KEY');
      
      if (secretId && secretKey && this.bucket && this.region) {
        this.useLocalStorage = false;
        this.cos = new COS({
          SecretId: secretId,
          SecretKey: secretKey,
        });
        this.logger.log('✅ 使用腾讯云 COS 存储模式', 'OssService');
        this.logger.log(`Bucket: ${this.bucket}, Region: ${this.region}`, 'OssService');
      } else {
        this.logger.warn('⚠️ COS 配置不完整，降级为本地存储模式', 'OssService');
        this.useLocalStorage = true;
      }
    } else {
      // 本地存储模式
      this.useLocalStorage = true;
      this.logger.log('✅ 使用本地存储模式', 'OssService');
    }
    
    // 如果使用本地存储，创建上传目录
    if (this.useLocalStorage) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        this.logger.log(`📁 创建上传目录: ${uploadDir}`, 'OssService');
      }
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const filename = `${Date.now()}-${uuidv4()}.${ext}`;
    const key = `${folder}/${filename}`;

    // 本地存储模式
    if (this.useLocalStorage) {
      return this.uploadToLocal(file, folder, filename);
    }

    // 腾讯云 COS 模式
    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            // 返回CDN地址
            const url = this.cdnDomain
              ? `${this.cdnDomain}/${key}`
              : `https://${data.Location}`;
            resolve(url);
          }
        },
      );
    });
  }

  /**
   * 上传到本地存储
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    
    // 写入文件
    fs.writeFileSync(filePath, file.buffer);

    // 返回访问URL
    // 如果配置了 APP_URL（生产环境），使用完整 URL；否则使用相对路径（开发环境）
    const baseUrl = this.configService.get('APP_URL', '');
    const relativePath = `/uploads/${folder}/${filename}`;
    
    const fullUrl = baseUrl ? `${baseUrl}${relativePath}` : relativePath;
    
    this.logger.debug(`文件已保存: ${filePath}, URL: ${fullUrl}`, 'OssService');
    
    return fullUrl;
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  /**
   * 获取文件临时访问链接
   */
  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cos.getObjectUrl(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Sign: true,
          Expires: expires,
        },
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.Url);
          }
        },
      );
    });
  }
}

