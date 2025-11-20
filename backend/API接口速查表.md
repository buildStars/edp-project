# EDP管理后台 - API接口速查表

> 快速查找管理后台的所有API接口

---

## 🔐 认证说明

所有接口（除公开接口外）都需要在请求头中携带JWT Token：

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📁 1. 文件上传模块

### 上传图片
```
POST /api/upload/image
Content-Type: multipart/form-data
权限: 需登录

参数:
  file: 图片文件（jpg/png/gif/webp，最大5MB）

响应:
{
  "url": "https://your-cos.com/images/xxx.jpg",
  "filename": "原始文件名.jpg",
  "size": 102400
}
```

### 上传文件
```
POST /api/upload/file
Content-Type: multipart/form-data
权限: 需登录

参数:
  file: 任意文件（最大50MB）

响应:
{
  "url": "https://your-cos.com/files/xxx.pdf",
  "filename": "原始文件名.pdf",
  "size": 1024000,
  "mimetype": "application/pdf"
}
```

---

## 📰 2. 资讯管理模块

### 获取资讯列表
```
GET /api/news?page=1&pageSize=20&status=PUBLISHED&keyword=关键词
权限: 公开

查询参数:
  page: 页码（默认1）
  pageSize: 每页数量（默认20）
  status: 状态筛选（DRAFT/PUBLISHED/ARCHIVED）
  keyword: 关键词搜索
  admin: true（管理端查询，包含所有状态）
```

### 创建资讯
```
POST /api/news
权限: ADMIN/STAFF

请求体:
{
  "title": "资讯标题",
  "content": "资讯内容",
  "coverImage": "封面图URL",
  "category": "分类",
  "status": "DRAFT",
  "isTop": false
}
```

### 更新资讯
```
PUT /api/news/:id
权限: ADMIN/STAFF

请求体: 同创建资讯
```

### 删除资讯
```
DELETE /api/news/:id
权限: ADMIN/STAFF
```

### 批量删除资讯
```
POST /api/news/batch-delete
权限: ADMIN/STAFF

请求体:
{
  "ids": ["id1", "id2", "id3"]
}
```

### 置顶/取消置顶
```
PUT /api/news/:id/top
权限: ADMIN/STAFF

请求体:
{
  "isTop": true
}
```

### 发布资讯
```
PUT /api/news/:id/publish
权限: ADMIN/STAFF
```

### 归档资讯
```
PUT /api/news/:id/archive
权限: ADMIN/STAFF
```

---

## 📚 3. 课程管理模块

### 获取课程列表
```
GET /api/courses?page=1&pageSize=20&category=分类&status=PUBLISHED
权限: 公开

查询参数:
  page: 页码
  pageSize: 每页数量
  category: 分类筛选
  status: 状态筛选
  teacherId: 讲师筛选
```

### 创建课程
```
POST /api/courses
权限: ADMIN/STAFF

请求体:
{
  "title": "课程标题",
  "description": "课程描述",
  "coverImage": "封面图URL",
  "category": "分类",
  "credit": 10,
  "teacherId": "讲师ID",
  "enrollStatus": "OPEN"
}
```

### 更新课程
```
PUT /api/courses/:id
权限: ADMIN/STAFF

请求体: 同创建课程
```

### 删除课程
```
DELETE /api/courses/:id
权限: ADMIN/STAFF
```

### 批量删除课程
```
POST /api/courses/batch-delete
权限: ADMIN/STAFF

请求体:
{
  "ids": ["id1", "id2"]
}
```

### 审批课程
```
POST /api/courses/:id/approve
权限: ADMIN（仅管理员）

请求体:
{
  "action": "approve",  // 或 "reject"
  "reason": "拒绝原因"  // 拒绝时必填
}
```

### 更新报名状态
```
PUT /api/courses/:id/enroll-status
权限: ADMIN/STAFF

请求体:
{
  "status": "OPEN"  // OPEN/CLOSED/FULL
}
```

### 发布课程
```
PUT /api/courses/:id/publish
权限: ADMIN/STAFF
```

### 归档课程
```
PUT /api/courses/:id/archive
权限: ADMIN/STAFF
```

---

## 🏢 4. 协会管理模块

### 获取协会列表
```
GET /api/associations?type=ALUMNI
权限: 公开

查询参数:
  type: 类型（ALUMNI/CLUB）
```

### 创建协会
```
POST /api/associations
权限: ADMIN/STAFF

请求体:
{
  "name": "协会名称",
  "description": "协会介绍",
  "coverImage": "封面图URL",
  "type": "ALUMNI"
}
```

### 更新协会
```
PUT /api/associations/:id
权限: ADMIN/STAFF

请求体: 同创建协会
```

### 删除协会
```
DELETE /api/associations/:id
权限: ADMIN/STAFF
```

---

## 🎉 5. 活动管理模块

### 获取活动列表
```
GET /api/activities?associationId=xxx&status=PUBLISHED
权限: 公开

查询参数:
  associationId: 协会ID
  status: 状态筛选
```

### 创建活动
```
POST /api/activities
权限: ADMIN/STAFF

请求体:
{
  "title": "活动标题",
  "description": "活动描述",
  "coverImage": "封面图URL",
  "associationId": "协会ID",
  "location": "活动地点",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T18:00:00Z"
}
```

### 更新活动
```
PUT /api/activities/:id
权限: ADMIN/STAFF

请求体: 同创建活动
```

### 删除活动
```
DELETE /api/activities/:id
权限: ADMIN/STAFF
```

---

## 👥 6. 用户管理模块

### 获取用户列表
```
GET /api/users?page=1&pageSize=20&role=STUDENT&keyword=张三
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  role: 角色筛选（ADMIN/STAFF/TEACHER/ADVISOR/STUDENT）
  status: 状态筛选（ACTIVE/INACTIVE）
  keyword: 关键词搜索（姓名/手机号/邮箱）
```

### 获取顾问列表
```
GET /api/users/advisors
权限: ADMIN/STAFF

响应: 返回所有激活的课程顾问
```

### 获取用户详情
```
GET /api/users/:id
权限: ADMIN/STAFF
```

### 更新用户信息
```
PUT /api/users/:id
权限: ADMIN/STAFF

请求体:
{
  "realName": "真实姓名",
  "phone": "手机号",
  "email": "邮箱",
  "role": "STUDENT",
  "status": "ACTIVE"
}
```

### 分配课程顾问
```
POST /api/users/:id/assign-advisor
权限: ADMIN/STAFF

请求体:
{
  "advisorId": "顾问ID"
}
```

### 删除用户
```
DELETE /api/users/:id
权限: ADMIN（仅管理员）
```

---

## 🏭 7. 企业管理模块

### 获取企业列表
```
GET /api/organizations?page=1&pageSize=20&keyword=企业名&status=ACTIVE
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  keyword: 关键词搜索（企业名/编码）
  type: 类型筛选
  status: 状态筛选
```

### 获取企业详情
```
GET /api/organizations/:id
权限: ADMIN/STAFF
```

### 创建企业
```
POST /api/organizations
权限: ADMIN

请求体:
{
  "name": "企业名称",
  "code": "企业编码",
  "type": "ENTERPRISE",
  "contact": "联系人",
  "phone": "联系电话"
}
```

### 更新企业
```
PUT /api/organizations/:id
权限: ADMIN

请求体: 同创建企业
```

### 删除企业
```
DELETE /api/organizations/:id
权限: ADMIN
```

### 批量分配学分
```
POST /api/organizations/:id/allocate-credits
权限: ADMIN

请求体:
{
  "specId": "学分规格ID",
  "validDays": 365  // 有效期（天）
}

说明: 会为该企业所有激活用户分配学分
```

### 获取企业用户列表
```
GET /api/organizations/:id/users?page=1&pageSize=20&keyword=张三
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  keyword: 关键词搜索
```

---

## 📝 8. 报名管理模块

### 获取报名列表
```
GET /api/enrollments?page=1&pageSize=20&courseId=xxx&status=ENROLLED
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  courseId: 课程ID
  status: 状态筛选（ENROLLED/COMPLETED）
  keyword: 关键词搜索（用户姓名/手机号）
```

### 获取试听申请列表
```
GET /api/enrollments/trials?page=1&pageSize=20&status=PENDING
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  status: 审核状态（PENDING/APPROVED/REJECTED）
```

### 审核试听申请
```
PUT /api/enrollments/:id/trial-status
权限: ADMIN/STAFF

请求体:
{
  "status": "APPROVED",  // APPROVED/REJECTED
  "rejectReason": "拒绝原因"  // 拒绝时填写
}
```

### 获取签到记录
```
GET /api/enrollments/checkins?page=1&pageSize=20&courseId=xxx
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  courseId: 课程ID（可选）
```

### 获取评价列表
```
GET /api/enrollments/evaluations?page=1&pageSize=20&courseId=xxx
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  courseId: 课程ID（可选）
```

---

## 💳 9. 学分管理模块

### 获取学分列表
```
GET /api/credits?page=1&pageSize=20&userId=xxx&organizationId=xxx
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  userId: 用户ID
  organizationId: 企业ID
  status: 状态筛选（ACTIVE/EXPIRED）
```

### 分配学分
```
POST /api/credits/allocate
权限: ADMIN/STAFF

请求体:
{
  "userId": "用户ID",
  "specId": "学分规格ID",
  "validDays": 365  // 有效期（天），默认365
}
```

### 获取学分规格列表
```
GET /api/credits/specs
权限: ADMIN/STAFF

响应: 返回所有激活的学分规格
```

### 创建学分规格
```
POST /api/credits/specs
权限: ADMIN

请求体:
{
  "name": "标准学分包",
  "amount": 100,
  "description": "规格说明"
}
```

### 更新学分规格
```
PUT /api/credits/specs/:id
权限: ADMIN

请求体: 同创建学分规格
```

### 删除学分规格
```
DELETE /api/credits/specs/:id
权限: ADMIN

说明: 软删除，将状态改为INACTIVE
```

### 获取学分使用记录
```
GET /api/credits/records?page=1&pageSize=20&userId=xxx&type=CONSUME
权限: ADMIN/STAFF

查询参数:
  page: 页码
  pageSize: 每页数量
  userId: 用户ID
  type: 类型筛选（CONSUME/REFUND）
```

---

## 📊 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

### 分页响应
```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "error": "详细错误说明"
}
```

---

## 🔑 常用HTTP状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证（需要登录） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 📝 使用示例

### JavaScript/Axios

```javascript
// 设置默认请求头
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 获取资讯列表
const response = await axios.get('/api/news', {
  params: {
    page: 1,
    pageSize: 20,
    status: 'PUBLISHED'
  }
});

// 创建资讯
const newsData = {
  title: '新资讯',
  content: '内容',
  coverImage: 'https://...',
  category: '分类'
};
await axios.post('/api/news', newsData);

// 上传图片
const formData = new FormData();
formData.append('file', file);
const uploadResponse = await axios.post('/api/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 🎯 快速查找

**按功能分类：**
- **内容管理：**资讯、课程、协会、活动
- **用户管理：**用户列表、顾问分配、企业管理
- **业务管理：**报名审核、学分分配、签到记录
- **基础服务：**文件上传、图片上传

**按权限分类：**
- **公开接口：**资讯列表、课程列表、协会列表、活动列表
- **登录即可：**文件上传、图片上传
- **ADMIN/STAFF：**大部分管理接口
- **仅ADMIN：**课程审批、用户删除、企业管理、学分规格

---

**最后更新：2025-10-31**


