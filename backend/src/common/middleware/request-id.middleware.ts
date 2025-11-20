import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求ID中间件
 * 为每个请求生成唯一ID，便于追踪和调试
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 从请求头获取或生成新的请求ID
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    
    // 设置到请求对象上
    (req as any).requestId = requestId;
    
    // 设置到响应头
    res.setHeader('X-Request-Id', requestId);
    
    next();
  }
}


