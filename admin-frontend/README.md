# EDP管理后台

## 项目简介

北大汇丰EDP管理后台系统，基于Vue 3 + TypeScript + Element Plus构建，提供完整的EDP小程序后台管理功能。

## 技术栈

### 核心框架
- **Vue 3.3+** - 使用Composition API
- **TypeScript 5.x** - 类型安全
- **Vite 5.x** - 构建工具
- **Element Plus** - UI组件库
- **Vue Router 4.x** - 路由管理
- **Pinia** - 状态管理

### 主要依赖
- **Axios** - HTTP请求
- **ECharts** - 数据可视化
- **WangEditor** - 富文本编辑器
- **NProgress** - 进度条
- **Day.js** - 时间处理
- **Lodash-es** - 工具库

## 功能模块

### 1. 认证与权限
- ✅ 用户登录/登出
- ✅ Token管理
- ✅ 角色权限控制（ADMIN/STAFF/TEACHER/ADVISOR）
- ✅ 路由权限守卫

### 2. 资讯管理
- 资讯列表（筛选/搜索/分页）
- 发布资讯（富文本编辑/图片上传）
- 编辑/删除资讯
- 资讯置顶（仅1篇）
- 定时发布

### 3. 协会管理
- 同学会管理（总会/各分会）
- 俱乐部管理
- 活动管理（发布/编辑/删除）
- 活动数据统计

### 4. 课程管理
- 课程CRUD（创建/编辑/删除）
- 课程审批流程
- 学分配置
- 报名状态管理
- 课程数据统计

### 5. 用户管理
- 用户列表（筛选/搜索）
- 用户详情查看
- 课程顾问分配
- 用户追踪（来源/转介绍）
- 学分管理

### 6. 企业管理
- 企业账户管理
- 学分分配
- 员工管理
- 课程分配
- 数据统计

### 7. 报名管理
- 报名列表
- 试听申请审核
- 签到管理
- 评价管理
- 数据导出

### 8. 课件管理
- 课件上传
- 课件管理
- 下载记录
- 权限控制

### 9. 数据统计
- 首页概览
- 用户数据分析
- 课程数据分析
- 讲师数据分析
- 企业数据分析
- 报表导出

### 10. 系统设置
- 基础设置
- 角色权限配置
- 业务配置
- 操作日志

## 项目结构

```
admin-frontend/
├── public/                  # 静态资源
├── src/
│   ├── api/                # API接口
│   │   ├── auth.ts         # 认证相关
│   │   ├── news.ts         # 资讯相关
│   │   ├── course.ts       # 课程相关
│   │   └── ...
│   ├── assets/             # 资源文件
│   │   ├── images/
│   │   └── styles/
│   │       └── index.scss  # 全局样式
│   ├── components/         # 公共组件
│   ├── composables/        # 组合式函数
│   ├── layouts/            # 布局组件
│   │   ├── AdminLayout.vue # 管理布局
│   │   └── components/     # 布局子组件
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── stores/             # Pinia状态管理
│   │   ├── auth.ts         # 认证状态
│   │   └── ...
│   ├── utils/              # 工具函数
│   │   └── request.ts      # Axios封装
│   ├── views/              # 页面组件
│   │   ├── Login/          # 登录页
│   │   ├── Dashboard/      # 首页
│   │   ├── News/           # 资讯管理
│   │   ├── Associations/   # 协会管理
│   │   ├── Courses/        # 课程管理
│   │   ├── Users/          # 用户管理
│   │   ├── Organizations/  # 企业管理
│   │   ├── Enrollments/    # 报名管理
│   │   ├── Materials/      # 课件管理
│   │   ├── Statistics/     # 数据统计
│   │   ├── Settings/       # 系统设置
│   │   └── Error/          # 错误页面
│   ├── App.vue
│   └── main.ts
├── .env.development        # 开发环境配置
├── .env.production         # 生产环境配置
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 1. 环境要求

- Node.js >= 18.x
- npm 或 yarn 或 pnpm

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 开发模式

```bash
npm run dev
```

访问地址：http://localhost:3001

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产版本

```bash
npm run preview
```

## 配置说明

### 环境变量

在 `.env.development` 和 `.env.production` 中配置：

```env
# 应用标题
VITE_APP_TITLE=EDP管理后台

# API基础路径
VITE_APP_BASE_API=/api

# 开发端口
VITE_APP_PORT=3001
```

### 代理配置

在 `vite.config.ts` 中配置后端代理：

```typescript
server: {
  port: 3001,
  host: '0.0.0.0',
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // 后端地址
      changeOrigin: true,
    },
  },
}
```

## 开发指南

### 路由配置

在 `src/router/index.ts` 中添加新路由：

```typescript
{
  path: '/your-module',
  name: 'YourModule',
  component: () => import('@/views/YourModule/index.vue'),
  meta: {
    title: '模块名称',
    icon: 'IconName',
    roles: ['ADMIN'],  // 可选：角色权限
  },
}
```

### API接口

在 `src/api/` 下创建新的API文件：

```typescript
import { request } from '@/utils/request'

export function getList(params: any) {
  return request.get('/your-api/list', { params })
}

export function create(data: any) {
  return request.post('/your-api', data)
}
```

### 状态管理

在 `src/stores/` 下创建新的store：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useYourStore = defineStore('your-store', () => {
  const data = ref([])

  const fetchData = async () => {
    // 获取数据
  }

  return {
    data,
    fetchData,
  }
})
```

### 组件使用

Element Plus组件已自动导入，可直接使用：

```vue
<template>
  <el-button type="primary">按钮</el-button>
  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名" />
  </el-table>
</template>
```

## 权限控制

### 角色类型

- **ADMIN** - 超级管理员（所有权限）
- **STAFF** - 教务人员（课程管理/用户管理）
- **TEACHER** - 讲师（查看自己的课程）
- **ADVISOR** - 课程顾问（查看自己的学员）

### 路由权限

```typescript
// 在路由meta中配置roles
meta: {
  title: '课程审批',
  roles: ['ADMIN'],  // 仅管理员可访问
}
```

### 按钮权限

```vue
<el-button v-if="authStore.hasRole('ADMIN')">
  删除
</el-button>
```

## 样式规范

### 使用SCSS

```scss
.your-component {
  padding: 20px;

  .title {
    font-size: 24px;
    color: #333;
  }
}
```

### 使用工具类

```html
<div class="flex-between mt-20">
  <span>左侧</span>
  <span>右侧</span>
</div>
```

## 最佳实践

### 1. 组件化开发

- 将可复用的UI抽取为组件
- 组件命名使用PascalCase
- Props定义明确的类型

### 2. TypeScript类型

- 为API响应定义接口类型
- 使用类型推断减少显式类型声明
- 避免使用any类型

### 3. 性能优化

- 使用v-if/v-show合理控制组件渲染
- 大列表使用虚拟滚动
- 图片懒加载
- 路由懒加载

### 4. 代码规范

- 使用ESLint和Prettier
- 提交前进行代码检查
- 遵循Vue 3 Composition API风格

## 后端API对接

### 需要后端新增的接口

详见 `管理后台功能思维导图.md` 文档中的"后端API需要新增的接口"章节。

主要包括：
- 资讯管理（增删改）
- 协会管理（增删改）
- 课程审批
- 用户管理（管理端接口）
- 企业管理
- 报名管理（审核）
- 课件管理
- 数据统计

## 部署说明

### 1. 构建项目

```bash
npm run build
```

生成的文件在 `dist/` 目录。

### 2. Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Docker部署

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 常见问题

### 1. 开发环境跨域问题

已在 `vite.config.ts` 中配置代理，无需额外配置。

### 2. 打包后路由404

需要配置服务器支持HTML5 History模式，将所有请求重定向到index.html。

### 3. Element Plus样式问题

已自动导入，如有问题检查 `vite.config.ts` 中的配置。

## 参考文档

- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [ECharts 官方文档](https://echarts.apache.org/)

## 开发团队

- **项目经理**: [姓名]
- **前端开发**: [姓名]
- **后端开发**: [姓名]
- **UI设计**: [姓名]

## 版本历史

### v1.0.0 (2025-10-31)
- ✅ 完成项目初始化
- ✅ 完成登录认证模块
- ✅ 完成主布局和路由配置
- ✅ 完成首页概览
- 🚧 其他模块开发中...

## 许可证

MIT License

---

**© 2025 北大汇丰EDP. All rights reserved.**


