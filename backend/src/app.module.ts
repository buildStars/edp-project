import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Infrastructure
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { OssModule } from './infrastructure/oss/oss.module';
import { LoggerModule } from './infrastructure/logger/logger.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CreditsModule } from './modules/credits/credits.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CmsModule } from './modules/cms/cms.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { EnrollmentRequestsModule } from './modules/enrollment-requests/enrollment-requests.module';
import { RefundRequestsModule } from './modules/refund-requests/refund-requests.module';
import { CourseGiftsModule } from './modules/course-gifts/course-gifts.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { CorporateCreditsModule } from './modules/corporate-credits/corporate-credits.module';
import { CreditRequestsModule } from './modules/credit-requests/credit-requests.module';
import { TeacherStudentsModule } from './modules/teacher-students/teacher-students.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { CourseCompletionModule } from './modules/course-completion/course-completion.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { AiConfigModule } from './modules/ai-config/ai-config.module';
import { AiReportsModule } from './modules/ai-reports/ai-reports.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';

// Middleware
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

// Controllers
import { HealthController } from './health.controller';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 基础设施
    LoggerModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    OssModule,

    // 业务模块
    AuthModule,
    UsersModule,
    CoursesModule,
    CreditsModule,
    EnrollmentsModule,
    MaterialsModule,
    OrganizationsModule,
    CmsModule,
    ReportsModule,
    UploadModule,
    NotificationsModule,
    SearchModule,
    CheckinModule,
    EnrollmentRequestsModule,
    RefundRequestsModule,
    CourseGiftsModule,
    EvaluationsModule,
    StatisticsModule,
    CorporateCreditsModule,
    CreditRequestsModule,
    TeacherStudentsModule,
    PermissionsModule,
    TeachersModule,
    AchievementsModule,
    CourseCompletionModule,
    ChaptersModule,
    AiConfigModule,
    AiReportsModule,
    SystemSettingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用请求ID中间件到所有路由
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // 应用日志中间件到所有路由
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

