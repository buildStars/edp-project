import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../infrastructure/logger/logger.service';

/**
 * 请求日志中间件
 * 记录所有HTTP请求的详细信息
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(
      `[请求开始] ${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent}`,
      'HTTP',
    );

    // 监听响应结束事件
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      
      const logMessage = `[请求结束] ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`;

      // 根据状态码选择日志级别
      if (statusCode >= 500) {
        this.logger.error(logMessage, '', 'HTTP');
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, 'HTTP');
      } else {
        this.logger.log(logMessage, 'HTTP');
      }
    });

    next();
  }
}


