import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';

/**
 * 业务异常类
 * 用于处理业务逻辑中的异常情况
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCode.BUSINESS_ERROR,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        code: errorCode,
        msg: message,
        data: null,
      },
      statusCode,
    );
  }

  /**
   * 参数错误
   */
  static badRequest(message: string = '请求参数错误') {
    return new BusinessException(message, ErrorCode.INVALID_PARAMS, HttpStatus.BAD_REQUEST);
  }

  /**
   * 未授权
   */
  static unauthorized(message: string = '未授权访问') {
    return new BusinessException(message, ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }

  /**
   * 禁止访问
   */
  static forbidden(message: string = '禁止访问') {
    return new BusinessException(message, ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN);
  }

  /**
   * 资源不存在
   */
  static notFound(message: string = '资源不存在') {
    return new BusinessException(message, ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  /**
   * 操作失败
   */
  static operationFailed(message: string = '操作失败') {
    return new BusinessException(message, ErrorCode.OPERATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * 数据已存在
   */
  static dataExists(message: string = '数据已存在') {
    return new BusinessException(message, ErrorCode.DATA_EXISTS, HttpStatus.CONFLICT);
  }

  /**
   * 数据状态错误
   */
  static invalidStatus(message: string = '数据状态错误') {
    return new BusinessException(message, ErrorCode.INVALID_STATUS, HttpStatus.BAD_REQUEST);
  }
}


