import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { LoggerModule } from '../../infrastructure/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}












