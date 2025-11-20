import { Module } from '@nestjs/common';
import { CourseGiftsService } from './course-gifts.service';
import { CourseGiftsController } from './course-gifts.controller';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseGiftsController],
  providers: [CourseGiftsService],
  exports: [CourseGiftsService],
})
export class CourseGiftsModule {}




