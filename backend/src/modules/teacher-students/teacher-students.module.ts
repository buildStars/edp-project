import { Module } from '@nestjs/common';
import { TeacherStudentsController } from './teacher-students.controller';
import { TeacherStudentsService } from './teacher-students.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';

/**
 * 教师学员管理模块
 * 提供教师注册学员和管理师生关系的功能
 */
@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [TeacherStudentsController],
  providers: [TeacherStudentsService],
  exports: [TeacherStudentsService],
})
export class TeacherStudentsModule {}





