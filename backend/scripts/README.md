# 测试脚本使用说明

## 📝 可用脚本

### 1. 创建测试通知 (推荐使用 JavaScript 版本)

#### JavaScript 版本（推荐）
```bash
# 在 backend 目录下运行
node scripts/test-notifications-simple.js
```

**优点**：
- ✅ 无需 TypeScript 编译
- ✅ 运行更快
- ✅ 错误信息更清晰

#### TypeScript 版本
```bash
# 在 backend 目录下运行
npx ts-node scripts/create-test-notifications.ts
```

**注意**：TypeScript 版本可能需要先安装 `ts-node`：
```bash
npm install -D ts-node
```

---

## 🚀 使用步骤

### 步骤 1：获取测试用户 ID

有几种方式获取用户 ID：

**方式 1：从前端获取**
1. 在浏览器中打开开发者工具（F12）
2. 切换到 Console 标签
3. 输入并执行：`localStorage.getItem('userId')`
4. 复制返回的用户 ID

**方式 2：从数据库查询**
```sql
SELECT id, phone, nickname FROM users WHERE status = 'ACTIVE' LIMIT 5;
```

**方式 3：通过 Prisma Studio**
```bash
npx prisma studio
```
然后在浏览器中查看用户表，复制任意用户的 ID。

### 步骤 2：修改脚本中的用户 ID

编辑 `scripts/test-notifications-simple.js` 文件：

```javascript
// 第 13 行，修改为你的用户 ID
const TEST_USER_ID = 'your-user-id-here';
```

### 步骤 3：运行脚本

```bash
cd backend
node scripts/test-notifications-simple.js
```

### 步骤 4：查看结果

**在终端中查看：**
```
🚀 开始创建测试通知...

准备创建 7 条测试通知...

✅ 已创建通知: 新资讯发布
   ID: abc123...
   类型: NEWS_UPDATE
   时间: 2024/11/1 16:00:00

✅ 已创建通知: 活动即将开始
   ...

🎉 成功创建 7 条测试通知！

📊 当前未读消息数: 7
📋 最近10条通知:

1. [未读] 系统维护通知
2. [未读] 学分即将到期
...
```

**在前端查看：**
1. 登录到你修改的测试用户账号
2. 查看首页右上角消息图标，应该显示红色徽章 (7)
3. 点击消息图标或进入"个人中心 > 消息中心"
4. 可以看到刚创建的 7 条测试通知

---

## 🐛 常见问题

### 问题 1：找不到 @prisma/client

**错误信息：**
```
Cannot find module '@prisma/client'
```

**解决方案：**
```bash
npm install
npx prisma generate
```

### 问题 2：数据库连接失败

**错误信息：**
```
Can't reach database server at `localhost:3306`
```

**解决方案：**
1. 检查 MySQL 是否正在运行
2. 检查 `.env` 文件中的数据库配置
3. 确认数据库连接字符串正确

### 问题 3：用户 ID 不存在

**错误信息：**
```
Foreign key constraint failed on the field: `userId`
```

**解决方案：**
1. 确认你输入的用户 ID 确实存在于数据库中
2. 检查用户状态是否为 `ACTIVE`
3. 使用上面提到的方式重新获取正确的用户 ID

### 问题 4：通知类型错误

**错误信息：**
```
Invalid value for argument `type`
```

**解决方案：**
确保通知类型是以下之一：
- `NEWS_UPDATE`
- `ACTIVITY_REMIND`
- `COURSE_CHECKIN`
- `ENROLLMENT_AUDIT`
- `COURSE_EVALUATE`
- `CREDIT_EXPIRE`
- `SYSTEM`

---

## 📋 通知类型说明

| 类型 | 中文名称 | 使用场景 |
|------|---------|----------|
| `NEWS_UPDATE` | 资讯更新 | 发布新资讯时 |
| `ACTIVITY_REMIND` | 活动提醒 | 发布新活动或活动即将开始 |
| `COURSE_CHECKIN` | 课程签到 | 课程开始时提醒签到 |
| `ENROLLMENT_AUDIT` | 报名审核 | 课程报名成功或审核结果 |
| `COURSE_EVALUATE` | 评价提醒 | 课程结束后提醒评价 |
| `CREDIT_EXPIRE` | 学分到期 | 学分即将到期提醒 |
| `SYSTEM` | 系统通知 | 系统维护、升级等通知 |

---

## 🔧 自定义测试数据

你可以编辑 `test-notifications-simple.js` 文件来自定义测试通知：

```javascript
const testNotifications = [
  {
    userId: TEST_USER_ID,
    type: 'NEWS_UPDATE',           // 通知类型
    title: '你的自定义标题',        // 通知标题
    content: '你的自定义内容',      // 通知内容
    data: {                        // 额外数据（可选）
      newsId: 'xxx',
      url: '/pages/xxx/xxx',       // 点击后跳转的页面
    },
  },
  // 添加更多通知...
];
```

---

## 🧹 清理测试数据

如果需要删除测试通知，可以使用以下 SQL：

```sql
-- 删除指定用户的所有通知
DELETE FROM notifications WHERE userId = 'your-user-id';

-- 删除所有测试通知（谨慎使用）
DELETE FROM notifications WHERE title LIKE '%测试%';

-- 只删除未读通知
DELETE FROM notifications WHERE userId = 'your-user-id' AND isRead = false;
```

或者在 Prisma Studio 中手动删除：
```bash
npx prisma studio
```

---

## 📚 相关文档

- [消息推送功能实现说明.md](../../消息推送功能实现说明.md)
- [消息推送功能集成说明.md](../../消息推送功能集成说明.md)
- [Prisma 文档](https://www.prisma.io/docs)

