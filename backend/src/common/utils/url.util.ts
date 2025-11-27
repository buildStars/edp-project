/**
 * URL 工具函数
 */

/**
 * 获取完整的文件 URL
 * @param path 文件路径（可以是相对路径或完整URL）
 * @returns 完整的文件 URL
 */
export function getFullUrl(path: string | null | undefined): string {
  if (!path) return '';

  // 如果已经是完整的 HTTP/HTTPS URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // 获取 APP_URL 环境变量
  // 生产环境：https://edp.yunchuangshuan.com
  // 开发环境：http://localhost:3000
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  // 如果是相对路径，拼接 APP_URL
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${APP_URL}${normalizedPath}`;
  
  // 在开发环境打印日志，方便调试
  if (process.env.NODE_ENV === 'development') {
    console.log(`[URL转换] ${path} -> ${fullUrl}`);
  }
  
  return fullUrl;
}

/**
 * 批量转换图片 URL（用于数组）
 * @param paths 路径数组
 * @returns 完整URL数组
 */
export function getFullUrls(
  paths: (string | null | undefined)[],
): string[] {
  return paths.map((path) => getFullUrl(path));
}










