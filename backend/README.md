# 北大汇丰EDP后端服务

## 项目简介

基于 NestJS 框架开发的北大汇丰EDP小程序后端服务，提供完整的 RESTful API 接口。

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL 8.0 + Prisma ORM
- **缓存**: Redis 7.x
- **队列**: BullMQ
- **对象存储**: 腾讯云COS
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **日志**: Winston
- **测试**: Jest

## 项目结构

```
backend/
├── prisma/                    # Prisma配置和数据模型
│   └── schema.prisma         # 数据库模型定义
├── src/
│   ├── common/               # 公共模块
│   │   ├── decorators/      # 装饰器
│   │   ├── filters/         # 异常过滤器
│   │   ├── guards/          # 守卫
│   │   ├── interceptors/    # 拦截器
│   │   └── dto/             # 通用DTO
│   ├── infrastructure/       # 基础设施层
│   │   ├── prisma/          # 数据库服务
│   │   ├── redis/           # Redis服务
│   │   ├── queue/           # 队列服务
│   │   ├── oss/             # 对象存储服务
│   │   └── logger/          # 日志服务
│   ├── modules/              # 业务模块
│   │   ├── auth/            # 认证模块
│   │   ├── users/           # 用户模块
│   │   ├── courses/         # 课程模块
│   │   ├── credits/         # 学分模块
│   │   ├── enrollments/     # 报名模块
│   │   ├── materials/       # 课件模块
│   │   ├── organizations/   # 企业模块
│   │   ├── cms/             # CMS内容管理
│   │   │   ├── news/        # 资讯
│   │   │   ├── associations/# 协会
│   │   │   └── activities/  # 活动
│   │   └── reports/         # AI报告模块
│   ├── app.module.ts        # 应用根模块
│   └── main.ts              # 应用入口
├── .env.sample              # 环境变量示例
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript配置
└── README.md                # 项目文档
```

## 快速开始

### 1. 环境准备

确保已安装以下软件：

- Node.js >= 18.x
- MySQL >= 8.0
- Redis >= 7.x
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.sample` 为 `.env` 并修改配置：

```bash
cp .env.sample .env
```

主要配置项：

```env
# 数据库
DATABASE_URL="mysql://root:password@localhost:3306/edp_db"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# 微信小程序
WECHAT_APPID=your-appid
WECHAT_SECRET=your-secret

# 腾讯云COS
COS_SECRET_ID=your-secret-id
COS_SECRET_KEY=your-secret-key
COS_BUCKET=your-bucket
COS_REGION=ap-guangzhou
```

### 4. 初始化数据库

```bash
# 生成Prisma Client
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate

# 查看数据库（可选）
npm run prisma:studio
```

### 5. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后访问：

- 应用地址: http://localhost:3000
- API文档: http://localhost:3000/api/docs

## API文档

项目集成了 Swagger/OpenAPI 文档，启动服务后访问 `/api/docs` 查看完整的API文档。

### 主要接口模块

#### 1. 认证模块 (/api/auth)

- `POST /auth/wx-login` - 微信登录
- `POST /auth/bind-phone` - 绑定手机号
- `GET /auth/profile` - 获取当前用户信息

#### 2. 用户模块 (/api/users)

- `GET /users/info` - 获取用户信息
- `PUT /users/info` - 更新用户信息
- `POST /users/upload-avatar` - 上传头像
- `GET /users/advisor` - 获取课程顾问

#### 3. 课程模块 (/api/courses)

- `GET /courses` - 获取课程列表
- `GET /courses/:id` - 获取课程详情
- `POST /courses` - 创建课程（管理员）
- `PUT /courses/:id` - 更新课程（管理员）
- `DELETE /courses/:id` - 删除课程（管理员）

#### 4. 学分模块 (/api/credits)

- `GET /credits/my` - 获取我的学分

#### 5. 报名模块 (/api/enrollments)

- `POST /enrollments/enroll` - 报名课程
- `POST /enrollments/apply-trial` - 申请试听
- `POST /enrollments/checkin` - 签到
- `POST /enrollments/evaluate` - 评价
- `GET /enrollments/my` - 我的课程

#### 6. 课件模块 (/api/materials)

- `GET /materials/courseware` - 获取课件

#### 7. 资讯模块 (/api/news)

- `GET /news` - 获取资讯列表
- `GET /news/:id` - 获取资讯详情
- `POST /news/collect` - 收藏资讯
- `DELETE /news/collect` - 取消收藏
- `GET /news/my-collection` - 我的收藏

#### 8. 协会模块 (/api/associations)

- `GET /associations` - 获取协会列表
- `GET /associations/:id` - 获取协会详情

#### 9. 活动模块 (/api/activities)

- `GET /activities` - 获取活动列表
- `GET /activities/:id` - 获取活动详情
- `POST /activities/like` - 点赞活动
- `DELETE /activities/like` - 取消点赞

#### 10. AI报告模块 (/api/reports)

- `GET /reports/annual-report` - 获取年度报告

## 数据库模型

### 核心表结构

- **users** - 用户表
- **organizations** - 企业组织表
- **courses** - 课程表
- **course_materials** - 课件表
- **credits** - 学分/次卡表
- **credit_records** - 学分使用记录表
- **enrollments** - 报名表
- **news** - 资讯表
- **associations** - 协会表
- **activities** - 活动表
- **activity_likes** - 活动点赞表
- **collections** - 收藏表
- **downloads** - 下载记录表

详细模型定义见 `prisma/schema.prisma`

## 开发指南

### 添加新模块

1. 使用NestJS CLI生成模块：

```bash
nest g module modules/your-module
nest g controller modules/your-module
nest g service modules/your-module
```

2. 在 `app.module.ts` 中导入新模块

3. 添加相应的DTO、Entity和业务逻辑

### 数据库变更

1. 修改 `prisma/schema.prisma`

2. 生成迁移文件：

```bash
npm run prisma:migrate
```

3. 应用迁移：

```bash
npm run prisma:migrate
```

### 权限控制

使用装饰器控制接口权限：

```typescript
// 公开接口（无需登录）
@Public()
@Get()
findAll() {}

// 需要登录
@UseGuards(JwtAuthGuard)
@Get()
findAll() {}

// 需要特定角色
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get()
findAll() {}
```

### 日志记录

```typescript
import { LoggerService } from './infrastructure/logger/logger.service';

constructor(private logger: LoggerService) {}

this.logger.log('普通日志');
this.logger.error('错误日志', error.stack);
this.logger.warn('警告日志');
```

## 测试

```bash
# 单元测试
npm run test

# e2e测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t edp-backend .

# 运行容器
docker run -d -p 3000:3000 --name edp-backend edp-backend
```

### 生产环境注意事项

1. 修改环境变量为生产配置
2. 配置HTTPS
3. 设置合适的CORS策略
4. 配置反向代理（Nginx）
5. 设置进程管理（PM2）
6. 配置日志轮转
7. 配置监控和告警

## 性能优化

1. **数据库优化**
   - 合理使用索引
   - 优化查询语句
   - 使用数据库连接池

2. **缓存策略**
   - Redis缓存热点数据
   - 接口响应缓存
   - 数据库查询结果缓存

3. **接口优化**
   - 分页查询
   - 字段筛选
   - 数据压缩

## 安全建议

1. 使用强密码策略
2. 定期更新JWT密钥
3. 实施API限流
4. 输入验证和过滤
5. SQL注入防护
6. XSS防护
7. CSRF防护
8. 敏感数据加密
9. 安全的文件上传
10. 定期安全审计

## 常见问题

### 1. 数据库连接失败

检查数据库配置和网络连接，确保MySQL服务已启动。

### 2. Redis连接失败

检查Redis服务状态和配置。

### 3. 微信登录失败

确认微信小程序的appid和secret配置正确。

### 4. 文件上传失败

检查COS配置和权限设置。

## 贡献指南

1. Fork本仓库
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 技术支持: tech@edp.pku.edu.cn
- 官方网站: https://edp.pku.edu.cn

---

**版本**: 1.0.0  
**最后更新**: 2025-10-31

