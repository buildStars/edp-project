# 北大汇丰EDP小程序

## 项目简介

北大汇丰EDP小程序是一个综合性的教育管理平台，面向EDP（Executive Development Programs）学员提供资讯浏览、课程报名、协会活动、个人学分管理等功能。

## 技术栈

- **框架**: uniapp + Vue 3
- **语法**: Composition API + setup语法糖
- **状态管理**: Pinia
- **样式**: SCSS
- **小程序平台**: 微信小程序

## 功能模块

### 1. 首页模块 (pages/index)

**功能说明**: 综合性入口页面，展示各板块精选内容，提供快速访问入口

**页面设计**:

#### 顶部区域
- 左侧：北大汇丰EDP官方LOGO
- 右侧：搜索图标、消息通知图标

#### Banner轮播
- 自动轮播，3秒切换一次
- 支持点击跳转（可配置链接）
- 圆点指示器（激活态为北大红#C8161D）

#### 快捷入口（4个）
- **课程中心**：紫色渐变图标，跳转课程列表
- **EDP协会**：粉色渐变图标，跳转协会首页
- **AI报告**：蓝色渐变图标，带NEW标签，跳转AI年度报告
- **我的课程**：橙色渐变图标，跳转我的课程

#### 内容板块

**最新资讯**（展示前3条）
- 卡片式布局，左侧封面图，右侧标题、时间、阅读量
- 标题最多显示1行，超出省略
- 点击"更多"跳转资讯列表页

**热门课程**（展示前2条）
- 课程卡片完整展示
- 显示课程封面、标题、学分、讲师信息、报名状态
- 点击"更多"跳转课程中心

**精彩活动**（展示前3条）
- 横向卡片布局，左侧活动封面，右侧标题和元信息
- 显示发布时间和点赞数
- 点击"更多"跳转活动列表

**交互功能**:
- 下拉刷新：刷新所有板块数据
- 点击各板块内容：跳转到对应详情页
- 点击快捷入口：快速访问主要功能

**页面路径**: `/pages/index/index`

---

### 2. 资讯模块 (pages/news)

**功能说明**: 展示学校活动信息，采用类公众号小程序形式

**主要功能**:
- 资讯列表展示（发布时间、标题、封面图、内容摘要）
- 按分类筛选（全部、官方动态、校友故事）
- 卡片式布局：左侧封面图（官方动态用学校实景图，校友故事用校友访谈图），右侧展示标题（1行truncate）、发布时间、阅读量
- 资讯详情查看（完整图文内容）
- 下拉刷新、上拉加载更多
- 收藏功能（需登录）
- 分享到微信好友/朋友圈

**页面路径**:
- 资讯列表: `/pages/news/index`
- 资讯详情: `/pages/news/detail`

### 3. 协会介绍模块 (pages/association)

**功能说明**: 展示同学会、俱乐部等协会信息及活动动态

**主要功能**:
- 同学会列表（总会、北京分会、东莞分会、香港分会等）
- 俱乐部列表（EDP高尔夫俱乐部等）
- 协会详情展示（介绍、联系人、联系方式）
- 活动展示（活动列表、活动详情）
- 活动点赞、分享功能

**页面路径**:
- 协会首页: `/pages/association/index`
- 协会详情: `/pages/association/detail`
- 活动详情: `/pages/association/activity-detail`

### 4. 课程模块 (pages/course)

**功能说明**: 课程展示、报名、签到、评价、课件下载等完整流程

**主要功能**:
- 课程分类展示（加速课堂、大师课堂、赋能课堂）
- 课程信息展示（名称、时间、地点、讲师、学分、报名状态）
- 课程报名
  - 未购次卡：申请试听（填写姓名、电话、公司、职位）
  - 已购次卡：直接核销报名
- 课程签到（上课时在线签到）
- 课程评价（签到后进行评分）
- 课件下载（评价后可下载，支持在线预览和离线下载）
- 次卡管理（查看类型、剩余次数、有效期）
- 次卡赠送（赠送好友课程）
- 企业账户课程分配

**页面路径**:
- 课程列表: `/pages/course/index`
- 课程详情: `/pages/course/detail`

### 5. 个人中心模块 (pages/mine)

**功能说明**: 用户信息管理、学习记录查看、学分管理等

**主要功能**:
- 微信授权登录 + 手机号绑定
- 用户信息展示与编辑（头像、昵称、公司、职位、手机号）
- 我的课程（已报名课程、学习记录、签到记录）
- 我的学分（已购总学分、剩余次数、有效期）
- 我的收藏（收藏的资讯列表）
- 课件下载（已下载课件及记录）
- 联系客服（客服微信/电话）
- 关于我们（版本信息、使用指南）

**页面路径**:
- 个人中心: `/pages/mine/index`
- 编辑资料: `/pages/mine/edit-info`
- 我的课程: `/pages/mine/my-courses`
- 我的学分: `/pages/mine/my-credits`
- 我的收藏: `/pages/mine/my-collection`
- 课件下载: `/pages/mine/download-list`

### 6. AI能力模块 (pages/ai)

**功能说明**: AI生成的个人年度学习报告

**主要功能**:
- **年度报告展示**（图文结合）
  - 学习统计：已学学分、学习课程数、学习时长、学习天数
  - 课程分类分布：各类型课程的学习比例（加速课堂/大师课堂/赋能课堂）
- **能力雷达图**（彩色动态展示）
  - 5维能力评估：战略思维、领导力、创新能力、财务管理、市场营销
  - Canvas绘制的彩色雷达图
  - 每项能力显示具体分数
- **知识掌握**
  - AI 根据老师课程介绍自动生成的学习总结
  - 知识标签云展示（如：战略管理、领导力、创新思维等）
- **学习建议**
  - 推荐后续哪些板块可以继续加强
  - 个性化学习路径建议
- **分享功能**
  - 分享报告到微信好友/朋友圈

**入口位置**:
- 个人中心菜单"AI报告"（带NEW标识）
- 页面右上角设置图标快速访问（规划中）

**页面路径**:
- AI报告: `/pages/ai/report`

**数据来源**:
- 实际学习数据（已完成的课程、学分记录）
- AI 分析生成（知识总结、能力评估、学习建议）

### 7. 搜索功能模块 (pages/search)

**功能说明**: 全局搜索功能，支持搜索资讯、活动、课程

**主要功能**:
- **智能搜索**
  - 支持搜索资讯、活动、课程
  - 实时搜索结果展示
  - 搜索历史记录（最多保存10条）
- **分类结果**
  - Tab 切换查看不同类型的搜索结果
  - 资讯、课程、活动分别展示
- **搜索优化**
  - 搜索历史管理（可清空）
  - 快速选择历史记录再次搜索
  - 空状态提示

**入口位置**:
- 首页右上角搜索图标
- 支持从任意页面通过导航栏搜索图标进入

**页面路径**:
- 搜索页面: `/pages/search/index`

### 7. 其他功能模块

- **登录页面**: `/pages/login/index` （微信授权登录 + 手机号绑定）
- **自定义导航栏**: `/components/custom-navbar/custom-navbar.vue`
  - 支持显示 Logo（首页）
  - 支持自定义右侧按钮（搜索、消息通知等）
  - 自动适配不同机型的状态栏高度

## 项目结构

```
edp-uniapp/
├── pages/                    # 页面文件
│   ├── index/               # 资讯首页
│   ├── news/                # 资讯详情
│   ├── association/         # 协会模块
│   ├── course/              # 课程模块
│   ├── mine/                # 个人中心
│   ├── ai/                  # AI报告
│   ├── search/              # 搜索页面
│   └── login/               # 登录页面
├── components/              # 公共组件
│   ├── news-card/          # 资讯卡片组件
│   ├── course-card/        # 课程卡片组件
│   ├── custom-navbar/      # 自定义导航栏
│   └── empty-view/         # 空状态组件
├── store/                   # 状态管理
│   ├── user.js             # 用户状态
│   ├── course.js           # 课程状态
│   └── news.js             # 资讯状态
├── api/                     # API接口
│   ├── request.js          # 请求封装
│   ├── news.js             # 资讯接口
│   ├── course.js           # 课程接口
│   ├── user.js             # 用户接口
│   └── association.js      # 协会接口
├── utils/                   # 工具函数
│   ├── auth.js             # 登录鉴权
│   ├── util.js             # 通用工具
│   └── storage.js          # 本地存储
├── static/                  # 静态资源
│   ├── images/             # 图片资源
│   ├── tabbar/             # 底部导航图标
│   └── styles/             # 全局样式
├── App.vue                  # 应用入口
├── main.js                  # 入口文件
├── manifest.json            # 应用配置
├── pages.json               # 页面配置
└── package.json             # 依赖配置
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# 微信小程序
npm run dev:mp-weixin
```

### 构建项目

```bash
# 微信小程序
npm run build:mp-weixin
```

## 设计规范

### 颜色规范
- 主题色: `#C8161D` （北大红）
- 文字颜色: `#333333` （主要文字）、`#666666` （次要文字）、`#999999` （辅助文字）
- 背景色: `#FFFFFF` （卡片背景）、`#F8F8F8` （页面背景）

### 字体规范
- 标题: `32rpx - 36rpx`
- 正文: `28rpx - 30rpx`
- 辅助文字: `24rpx - 26rpx`

### 间距规范
- 页面边距: `24rpx`
- 卡片间距: `24rpx`
- 元素间距: `16rpx、24rpx、32rpx`

### 圆角规范
- 卡片圆角: `12rpx`
- 按钮圆角: `8rpx`
- 图片圆角: `8rpx`

## 用户角色

### 个人用户
- 购买次卡学习课程
- 查看剩余学分和有效期
- 赠送好友课程
- 收藏资讯、参与活动

### 企业用户
- 企业总负责人管理课程分配
- 分配员工学习课程或学分
- 查看企业整体学习情况

### 学校端角色
- 管理员：后台管理、审批课程
- 教务：发布课程信息
- 课程顾问：对接学员、处理试听申请

## API接口说明

所有API接口统一使用 `/api` 作为前缀，需要在 `api/request.js` 中配置baseURL。

### 通用响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

### 主要接口列表

**资讯模块**:
- `GET /api/news/list` - 获取资讯列表
- `GET /api/news/detail` - 获取资讯详情
- `POST /api/news/collect` - 收藏资讯
- `DELETE /api/news/collect` - 取消收藏

**课程模块**:
- `GET /api/course/list` - 获取课程列表
- `GET /api/course/detail` - 获取课程详情
- `POST /api/course/enroll` - 报名课程
- `POST /api/course/checkin` - 课程签到
- `POST /api/course/evaluate` - 课程评价
- `GET /api/course/download` - 课件下载

**用户模块**:
- `POST /api/user/login` - 登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息
- `GET /api/user/credits` - 获取用户学分

**协会模块**:
- `GET /api/associations?type=alumni` - 获取协会列表
- `GET /api/associations/:id` - 获取协会详情
- `GET /api/activities` - 获取活动列表
- `GET /api/activities/:id` - 获取活动详情
- `POST /api/activities/like` - 活动点赞
- `DELETE /api/activities/like` - 取消点赞

## 注意事项

1. **微信授权**: 首次使用需要微信授权登录并绑定手机号
2. **课程顾问关联**: 用户注册时会自动关联课程顾问，转发和赠送行为会追踪到对应顾问
3. **次卡有效期**: 次卡默认有效期1年，可在后台更新
4. **课程签到**: 需要在上课时间内进行签到，签到后才能评价和下载课件
5. **企业账户**: 企业总负责人可以分配课程给员工，需要指定具体课程或分配学分让员工自选
6. **分享追踪**: 分享行为会在后台记录，用于追踪课程顾问业绩

## 联系方式

- 官方客服电话: 40077-20111
- 技术支持: 请联系技术团队

## 常见问题

### 1. 数据渲染问题

**问题**: 后端返回了数据但前端没有正确渲染

**原因**: 后端返回的数据结构与前端期望的不一致
- 后端使用的是 `PaginatedResult` 类，返回格式为: `{ data: [], total, page, pageSize, totalPages }`
- 前端之前期望的是: `{ list: [], total, page, pageSize }`

**解决方案**: 在前端代码中兼容两种数据格式
```javascript
// 使用 data.data 或 data.list，兼容不同的返回格式
const list = data.data || data.list || []
```

**已修复的文件**:
- `store/course.js` - 课程列表和我的课程数据处理
- `store/news.js` - 资讯列表数据处理
- `pages/course/index.vue` - 课程页面分页逻辑
- `pages/mine/my-courses.vue` - 我的课程页面数据处理
- `pages/association/index.vue` - 协会和活动数据处理

### 2. 详情页渲染错误问题

**问题**: 打开详情页时报错 `Cannot read properties of undefined`，以及 `uni.onShareAppMessage is not a function`

**原因**: 
1. 详情数据初始化为空对象 `{}`，在数据加载前访问属性会报错
2. 在 Vue 3 + setup 语法中，错误地使用了 `uni.onShareAppMessage()`，应该使用 `onShareAppMessage` 生命周期钩子

**解决方案**: 
```javascript
// 1. 初始化详情对象时设置默认值
const newsDetail = ref({
  title: '',
  publishTime: '',
  views: 0,
  category: '',
  content: '',
  coverImage: ''
})

// 2. 正确使用分享钩子
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

onShareAppMessage(() => {
  return {
    title: newsDetail.value.title || '北大汇丰EDP',
    path: `/pages/news/detail?id=${newsId.value}`,
    imageUrl: newsDetail.value.coverImage
  }
})
```

**已修复的文件**:
- `pages/news/detail.vue` - 资讯详情页
- `pages/course/detail.vue` - 课程详情页
- `pages/association/detail.vue` - 协会详情页
- `pages/association/activity-detail.vue` - 活动详情页

## 版本历史

### v1.0.8 (2025-10-31)
- ✨ 重构首页模块，改为综合性入口页面
  - Banner 轮播图展示
  - 4个快捷入口（课程中心、EDP协会、AI报告、我的课程）
  - 最新资讯板块（展示前3条）
  - 热门课程板块（展示前2条）
  - 精彩活动板块（展示前3条）
  - 每个板块可点击"更多"跳转详情页
- ✨ 创建独立的资讯列表页面（`/pages/news/index.vue`）
  - 分类筛选（全部、官方动态、校友故事）
  - 下拉刷新和上拉加载
  - 资讯卡片展示
- ✨ 创建首页 Tab 栏图标（home.svg）
- 🎨 优化页面布局和交互体验
- 📝 更新 Tab 栏文案（"学校资讯" → "首页"）

### v1.0.7 (2025-10-31)
- ✨ 创建统一的图标组件（`/components/icon/icon.vue`）
  - 支持 22+ SVG 图标（搜索、消息、编辑、收藏、分享、点赞、AI、下载、课程、协会等）
  - 可自定义图标大小和颜色
  - 所有图标使用 SVG 矢量格式，支持任意缩放
- ✨ 创建 Tab 栏图标（`/static/tabbar/`）
  - 首页图标（房子样式）
  - 学校资讯图标（新闻样式）- 已弃用
  - EDP协会图标（人群样式）
  - 课程中心图标（公文包样式）
  - 个人中心图标（个人头像样式）
  - 每个图标都有普通态（灰色 #999）和激活态（北大红 #C8161D）
- 🎨 更新首页导航栏使用图标组件
- 🎨 更新个人中心菜单使用彩色图标
- 🎨 更新搜索页面使用图标组件
- 📝 完善图标使用说明

### v1.0.6 (2025-10-31)
- ✨ 完善 AI 报告模块文档说明
  - 详细描述 AI 报告功能（学习统计、能力雷达图、知识掌握、学习建议）
  - 修复分享功能钩子使用
- ✨ 完善搜索功能模块文档说明
  - 详细描述搜索功能（智能搜索、分类结果、搜索历史）
- ✨ 添加自定义导航栏组件说明
- 📝 创建 AI API 文件（`/api/ai.js`）

### v1.0.5 (2025-10-31)
- 🐛 修复课程分类参数大小写问题
  - 课程分类改为使用大写枚举值（`ACCELERATE`/`MASTER`/`EMPOWER`）
  - 与后端枚举定义保持一致
- 📝 添加课程分类参数说明

### v1.0.4 (2025-10-31)
- 🐛 修复协会列表数据格式处理问题
  - 后端协会接口直接返回数组，不使用 `PaginatedResult` 包装
  - 前端兼容数组和对象两种返回格式
- 📝 完善 API 数据格式说明文档

### v1.0.3 (2025-10-31)
- 🐛 修复活动模块 API 路径错误
  - `/api/activity/list` → `/api/activities`
  - `/api/activity/detail` → `/api/activities/:id`
  - `/api/activity/like` → `/api/activities/like`
  - `/api/activity/unlike` → `/api/activities/like` (DELETE)
- ✨ 统一所有 API 路径命名规范

### v1.0.2 (2025-10-31)
- 🐛 修复详情页渲染错误问题（Cannot read properties of undefined）
- 🐛 修复 Vue 3 setup 语法中分享功能报错（uni.onShareAppMessage is not a function）
- 💪 详情对象初始化时增加默认值，防止渲染报错
- ✨ 统一使用 onShareAppMessage/onShareTimeline 生命周期钩子

### v1.0.1 (2025-10-31)
- 🐛 修复后端数据返回格式不一致导致的渲染问题
- 💪 增强数据处理容错性，兼容多种返回格式

### v1.0.0 (2025-10-31)
- 初始版本发布
- 实现资讯、协会、课程、个人中心、AI报告等核心功能模块
- 支持微信小程序平台

