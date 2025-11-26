import { Module, forwardRef } from '@nestjs/common';
import { CourseCompletionController } from './course-completion.controller';
import { CourseCompletionService } from './course-completion.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AchievementsModule),
  ],
  controllers: [CourseCompletionController],
  providers: [CourseCompletionService],
  exports: [CourseCompletionService],
})
export class CourseCompletionModule {}










