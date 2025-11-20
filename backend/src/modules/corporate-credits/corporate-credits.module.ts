import { Module } from '@nestjs/common';
import { CorporateCreditsController } from './corporate-credits.controller';
import { CorporateCreditsService } from './corporate-credits.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CorporateCreditsController],
  providers: [CorporateCreditsService],
  exports: [CorporateCreditsService],
})
export class CorporateCreditsModule {}
