/**
 * 错误码枚举
 * 定义系统中所有可能的错误码
 */
export enum ErrorCode {
  // ========== 系统级错误 (1000-1999) ==========
  SUCCESS = 200,
  INTERNAL_ERROR = 1000,
  BUSINESS_ERROR = 1001,
  OPERATION_FAILED = 1002,

  // ========== 请求相关错误 (2000-2999) ==========
  INVALID_PARAMS = 2000,
  MISSING_PARAMS = 2001,
  INVALID_FORMAT = 2002,

  // ========== 权限相关错误 (3000-3999) ==========
  UNAUTHORIZED = 3000,
  TOKEN_EXPIRED = 3001,
  TOKEN_INVALID = 3002,
  FORBIDDEN = 3003,
  INSUFFICIENT_PERMISSIONS = 3004,

  // ========== 资源相关错误 (4000-4999) ==========
  NOT_FOUND = 4000,
  DATA_EXISTS = 4001,
  DATA_NOT_EXISTS = 4002,
  INVALID_STATUS = 4003,

  // ========== 用户相关错误 (5000-5999) ==========
  USER_NOT_FOUND = 5000,
  USER_EXISTS = 5001,
  USER_DISABLED = 5002,
  PASSWORD_ERROR = 5003,
  PHONE_EXISTS = 5004,
  EMAIL_EXISTS = 5005,

  // ========== 课程相关错误 (6000-6999) ==========
  COURSE_NOT_FOUND = 6000,
  COURSE_FULL = 6001,
  COURSE_CLOSED = 6002,
  ALREADY_ENROLLED = 6003,
  NOT_ENROLLED = 6004,

  // ========== 学分相关错误 (7000-7999) ==========
  CREDIT_NOT_ENOUGH = 7000,
  CREDIT_EXPIRED = 7001,
  CREDIT_NOT_FOUND = 7002,

  // ========== 文件相关错误 (8000-8999) ==========
  FILE_UPLOAD_FAILED = 8000,
  FILE_TOO_LARGE = 8001,
  FILE_TYPE_ERROR = 8002,
  FILE_NOT_FOUND = 8003,

  // ========== 第三方服务错误 (9000-9999) ==========
  WECHAT_API_ERROR = 9000,
  SMS_SEND_FAILED = 9001,
  OSS_UPLOAD_FAILED = 9002,
}

/**
 * 错误码对应的默认消息
 */
export const ErrorMessage: Record<ErrorCode, string> = {
  // 系统级错误
  [ErrorCode.SUCCESS]: '成功',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.BUSINESS_ERROR]: '业务处理失败',
  [ErrorCode.OPERATION_FAILED]: '操作失败',

  // 请求相关错误
  [ErrorCode.INVALID_PARAMS]: '请求参数错误',
  [ErrorCode.MISSING_PARAMS]: '缺少必要参数',
  [ErrorCode.INVALID_FORMAT]: '参数格式错误',

  // 权限相关错误
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  [ErrorCode.TOKEN_EXPIRED]: 'Token已过期',
  [ErrorCode.TOKEN_INVALID]: 'Token无效',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: '权限不足',

  // 资源相关错误
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.DATA_EXISTS]: '数据已存在',
  [ErrorCode.DATA_NOT_EXISTS]: '数据不存在',
  [ErrorCode.INVALID_STATUS]: '数据状态错误',

  // 用户相关错误
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_EXISTS]: '用户已存在',
  [ErrorCode.USER_DISABLED]: '用户已被禁用',
  [ErrorCode.PASSWORD_ERROR]: '密码错误',
  [ErrorCode.PHONE_EXISTS]: '手机号已被使用',
  [ErrorCode.EMAIL_EXISTS]: '邮箱已被使用',

  // 课程相关错误
  [ErrorCode.COURSE_NOT_FOUND]: '课程不存在',
  [ErrorCode.COURSE_FULL]: '课程已满员',
  [ErrorCode.COURSE_CLOSED]: '课程已截止报名',
  [ErrorCode.ALREADY_ENROLLED]: '已报名该课程',
  [ErrorCode.NOT_ENROLLED]: '未报名该课程',

  // 学分相关错误
  [ErrorCode.CREDIT_NOT_ENOUGH]: '学分不足',
  [ErrorCode.CREDIT_EXPIRED]: '学分已过期',
  [ErrorCode.CREDIT_NOT_FOUND]: '学分记录不存在',

  // 文件相关错误
  [ErrorCode.FILE_UPLOAD_FAILED]: '文件上传失败',
  [ErrorCode.FILE_TOO_LARGE]: '文件大小超出限制',
  [ErrorCode.FILE_TYPE_ERROR]: '文件类型错误',
  [ErrorCode.FILE_NOT_FOUND]: '文件不存在',

  // 第三方服务错误
  [ErrorCode.WECHAT_API_ERROR]: '微信接口调用失败',
  [ErrorCode.SMS_SEND_FAILED]: '短信发送失败',
  [ErrorCode.OSS_UPLOAD_FAILED]: '文件存储失败',
};


