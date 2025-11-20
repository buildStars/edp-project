import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { ErrorCode } from '../enums/error-code.enum';

/**
 * 全局异常过滤器
 * 捕获所有异常并统一处理
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.INTERNAL_ERROR;
    let message = '服务器内部错误';
    let data: any = null;

    // HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const response = exceptionResponse as any;
        code = response.code || status;
        message = Array.isArray(response.message) 
          ? response.message[0] 
          : response.message || message;
        data = response.data || null;
      } else {
        message = exceptionResponse as string;
      }
    } 
    // Prisma错误
    else if (exception instanceof Error) {
      const error = exception as any;
      
      // Prisma错误码处理
      if (error.code) {
        switch (error.code) {
          case 'P2002': // 唯一约束冲突
            status = HttpStatus.CONFLICT;
            code = ErrorCode.DATA_EXISTS;
            message = '数据已存在';
            break;
          case 'P2025': // 记录不存在
            status = HttpStatus.NOT_FOUND;
            code = ErrorCode.NOT_FOUND;
            message = '记录不存在';
            break;
          case 'P2003': // 外键约束失败
            status = HttpStatus.BAD_REQUEST;
            code = ErrorCode.INVALID_PARAMS;
            message = '关联数据不存在';
            break;
          default:
            message = error.message || message;
        }
      } else {
        message = error.message || message;
      }
    }

    // 记录错误日志
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : '',
      'AllExceptionFilter',
    );

    // 返回统一格式的错误响应
    response.status(status).json({
      code,
      msg: message,
      data,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}


