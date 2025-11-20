import { Module } from '@nestjs/common';
import { CreditRequestsController } from './credit-requests.controller';
import { CreditRequestsService } from './credit-requests.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';

/**
 * 学分申请模块
 * 提供教师申请学分和管理员审批的功能
 */
@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CreditRequestsController],
  providers: [CreditRequestsService],
  exports: [CreditRequestsService],
})
export class CreditRequestsModule {}





