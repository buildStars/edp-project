import { Module } from '@nestjs/common';
import { NewsModule } from './news/news.module';
import { AssociationsModule } from './associations/associations.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [NewsModule, AssociationsModule, ActivitiesModule],
})
export class CmsModule {}

