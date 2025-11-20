import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { CorporateCreditsService } from './corporate-credits.service';
import { AllocateCreditDto } from './dto/allocate-credit.dto';
import { PurchaseCourseDto } from './dto/purchase-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('corporate')
@UseGuards(JwtAuthGuard)
export class CorporateCreditsController {
  constructor(private readonly corporateCreditsService: CorporateCreditsService) {}

  /**
   * 分配学分给员工
   */
  @Post('credits/allocate')
  async allocateCredit(
    @CurrentUser() user: any,
    @Body() dto: AllocateCreditDto,
  ) {
    return this.corporateCreditsService.allocateCredit(user.id, dto);
  }

  /**
   * 为员工购买课程
   */
  @Post('credits/purchase-course')
  async purchaseCourse(
    @CurrentUser() user: any,
    @Body() dto: PurchaseCourseDto,
  ) {
    return this.corporateCreditsService.purchaseCourse(user.id, dto);
  }

  /**
   * 获取企业员工列表
   */
  @Get('employees')
  async getEmployees(@CurrentUser() user: any) {
    return this.corporateCreditsService.getEmployees(user.id);
  }

  /**
   * 获取学分分配记录
   */
  @Get('credits/allocations')
  async getAllocationRecords(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.corporateCreditsService.getAllocationRecords(
      user.id,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 10,
    );
  }

  /**
   * 获取课程购买记录
   */
  @Get('credits/purchases')
  async getPurchaseRecords(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.corporateCreditsService.getPurchaseRecords(
      user.id,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 10,
    );
  }
}
