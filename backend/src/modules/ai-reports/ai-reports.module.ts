import { Module } from '@nestjs/common';
import { AiReportsController } from './ai-reports.controller';
import { AiReportsService } from './ai-reports.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [PrismaModule, AiConfigModule],
  controllers: [AiReportsController],
  providers: [AiReportsService],
  exports: [AiReportsService],
})
export class AiReportsModule {}








