# EDP 企业管理系统

北大汇丰 EDP（Executive Development Programs）企业培训管理系统，包含管理后台、小程序端和后端API服务。

## 📋 项目简介

EDP 系统是一个完整的企业培训管理解决方案，提供课程管理、学分管理、签到打卡、学员管理、活动组织等功能。

### 核心功能

- 🎓 **课程管理** - 课程发布、报名、审批、评价
- 💰 **学分系统** - 个人学分、企业学分、学分消耗、学分申请
- ✅ **签到管理** - 扫码签到、补签、签到记录、章节签到
- 👥 **用户管理** - 多角色权限、教师管理、学员管理
- 📱 **活动组织** - 协会活动、活动报名、活动评价
- 📰 **资讯发布** - 新闻资讯、公告通知
- 🎨 **AI 报告** - 学习数据分析、智能报告生成
- 🎁 **课程赠送** - 课程分享、赠送码、礼品卡
- 🏢 **企业管理** - 企业账户、员工管理、学分分配

## 🏗️ 项目结构

```
edp-project/
├── backend/                # 后端服务（NestJS + Prisma + MySQL）
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
├── admin-frontend/         # 管理后台（Vue3 + Element Plus）
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── frontend-uniapp/        # 小程序端（Uni-app + Vue3）
│   ├── pages/
│   ├── components/
│   └── package.json
├── docker-stack/           # Docker 编排配置
│   ├── docker-compose.yml
│   ├── deploy.sh
│   ├── env-template.txt
│   └── README.md
├── .github/                # GitHub Actions CI/CD
│   └── workflows/
│       └── deploy.yml
└── README.md
```

## 🚀 快速开始

### 方式一：Docker 一键部署（推荐）

适合快速体验和生产环境部署。

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd edp-project

# 2. 配置环境变量
cd docker-stack
cp env-template.txt .env
nano .env  # 修改配置

# 3. 启动所有服务
./deploy.sh start

# 4. 访问系统
# 管理后台: http://localhost/
# 后端API: http://localhost:3000/
```

详细说明请查看 [Docker部署方案完整指南.md](./Docker部署方案完整指南.md)

### 方式二：本地开发模式

适合开发调试。

#### 1. 后端服务

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env

# 数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run start:dev
```

后端服务运行在 http://localhost:3000

#### 2. 管理后台

```bash
cd admin-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

管理后台运行在 http://localhost:3001

#### 3. 小程序端

```bash
cd frontend-uniapp

# 安装依赖
npm install

# 使用微信开发者工具打开项目
# 导入 frontend-uniapp 目录
```

## 🛠️ 技术栈

### 后端 (Backend)

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.0 + Prisma ORM
- **缓存**: Redis 7.x
- **认证**: JWT
- **文件存储**: 本地存储 / 腾讯云 COS
- **语言**: TypeScript

### 管理后台 (Admin Frontend)

- **框架**: Vue 3 + Vite
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios
- **语言**: TypeScript

### 小程序端 (Uni-app)

- **框架**: Uni-app + Vue 3
- **编译**: HBuilderX / Vite
- **平台**: 微信小程序
- **UI**: 自定义组件库
- **语言**: JavaScript

## 📦 环境要求

### 开发环境

- Node.js >= 18.x
- MySQL >= 8.0
- Redis >= 7.0
- npm >= 9.x

### 生产环境

- Docker >= 20.10
- Docker Compose >= 2.0

## 🔐 默认账号

### 管理后台

- **超级管理员**
  - 账号: `admin`
  - 密码: `admin123`

- **教务人员**
  - 账号: `staff`
  - 密码: `staff123`

- **教师**
  - 账号: `teacher`
  - 密码: `teacher123`

⚠️ **生产环境请务必修改默认密码！**

## 📖 文档

- [项目启动指南](./项目启动指南.md)
- [Docker 部署方案](./Docker部署方案完整指南.md)
- [API 接口文档](./API_ROUTES.md)
- [后端 README](./backend/README.md)
- [管理后台 README](./admin-frontend/README.md)
- [小程序 README](./frontend-uniapp/README.md)

## 🎯 核心功能模块

### 1. 课程管理

- 课程创建与编辑
- 课程分类（加速、大师、赋能）
- 课程审批流程
- 课程章节管理
- 课程资料管理
- 课程评价系统

### 2. 学分系统

- 个人学分账户
- 企业学分管理
- 学分消耗记录
- 学分申请与审批
- 学分统计报表

### 3. 报名管理

- 课程报名
- 试听申请
- 报名审批
- 退课申请
- 课程赠送

### 4. 签到系统

- 二维码签到
- 签到码签到
- 补签功能
- 签到统计
- 章节签到

### 5. 用户管理

- 多角色权限（管理员、教务、教师、学员）
- 用户信息管理
- 教师管理
- 学员管理
- 权限配置

### 6. 协会活动

- 活动发布
- 活动报名
- 活动签到
- 活动评价
- 协会管理

### 7. 资讯管理

- 新闻发布
- 公告通知
- 资讯分类
- 资讯收藏
- 资讯点赞

### 8. 系统设置

- 轮播图管理
- 系统配置
- 联系方式
- 社交媒体
- 维护模式

### 9. AI 智能报告

- 学习数据分析
- 年度学习报告
- 能力雷达图
- 学习建议
- 报告分享

## 🔒 权限角色

| 角色 | 说明 | 主要权限 |
|------|------|---------|
| ADMIN | 超级管理员 | 全部权限 |
| STAFF | 教务人员 | 课程审批、报名管理、学分管理 |
| TEACHER | 教师 | 课程管理、学员管理、签到管理 |
| ADVISOR | 顾问 | 课程推广、学员咨询 |
| USER | 普通用户 | 课程学习、报名、签到 |

## 🌐 API 接口

后端提供 RESTful API，支持：

- 用户认证（JWT）
- 课程管理
- 学分管理
- 报名管理
- 签到管理
- 文件上传
- 数据统计

详细 API 文档请参考 [API_ROUTES.md](./API_ROUTES.md)

## 🔄 开发流程

### 分支策略

- `main` - 生产环境分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

### 提交规范

使用 Conventional Commits 规范：

```bash
feat: 新功能
fix: Bug 修复
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链更新
```

### 代码审查

所有代码合并到 `main` 分支前需要经过 Pull Request 审查。

## 📊 数据库

### 主要数据表

- `users` - 用户表
- `courses` - 课程表
- `course_chapters` - 课程章节表
- `enrollments` - 报名表
- `credits` - 学分账户表
- `credit_records` - 学分记录表
- `checkin_sessions` - 签到场次表
- `checkins` - 签到记录表
- `course_evaluations` - 课程评价表
- `associations` - 协会表
- `activities` - 活动表
- `news` - 资讯表
- `organizations` - 企业表

详细数据库设计请查看 `backend/prisma/schema.prisma`

## 🧪 测试

### 后端测试

```bash
cd backend

# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

### 前端测试

```bash
cd admin-frontend

# 单元测试
npm run test:unit

# E2E 测试
npm run test:e2e
```

## 📈 性能优化

- 数据库索引优化
- Redis 缓存
- 图片懒加载
- 代码分割
- Gzip 压缩
- CDN 加速

## 🔧 故障排查

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 是否启动
   - 检查 .env 中的数据库配置
   - 检查网络连接

2. **前端无法访问后端**
   - 检查后端服务是否启动
   - 检查端口是否被占用
   - 检查防火墙设置

3. **小程序登录失败**
   - 检查微信 AppID 和 Secret
   - 检查服务器域名配置
   - 检查 SSL 证书

更多问题请查看 [故障排查文档](./docker-stack/README.md#故障排查)

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 👥 团队

- **开发团队**: EDP Developer
- **项目经理**: 待定
- **技术支持**: dev@edp-project.com

## 📞 联系我们

- **邮箱**: dev@edp-project.com
- **GitHub**: https://github.com/buildStars
- **问题反馈**: [GitHub Issues](../../issues)

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

**Built with ❤️ by EDP Team**

**Last Updated**: 2025-01-20
