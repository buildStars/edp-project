import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './infrastructure/logger/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // 获取日志服务
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // 配置静态资源目录（用于本地文件上传）
  // __dirname 在编译后是 dist/src，需要返回到项目根目录
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 启用CORS - 允许跨域请求
  app.enableCors({
    origin: [
      'http://localhost:5173',  // Vite 开发服务器
      'http://localhost:8080',  // uni-app H5 开发服务器
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,  // 禁用隐式转换，使用 @Transform 装饰器处理
      },
    }),
  );

  // 全局异常过滤器 - 使用 AllExceptionFilter 替代 HttpExceptionFilter
  // app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('EDP Backend API')
    .setDescription('北大汇丰EDP小程序后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();

