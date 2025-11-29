# SVG图标列表

本文件夹包含项目中所有使用的SVG图标。这些SVG将被转换为PNG格式以在小程序中使用。

## 图标清单

### 基础功能图标 (8个)
1. `search.svg` - 搜索图标
2. `message.svg` - 消息图标
3. `edit.svg` - 编辑图标
4. `scan.svg` - 扫码图标
5. `arrow-right.svg` - 右箭头图标
6. `close.svg` - 关闭图标
7. `delete.svg` - 删除图标
8. `back.svg` - 返回图标

### 用户相关图标 (4个)
9. `user.svg` - 用户图标
10. `teacher.svg` - 教师图标
11. `work.svg` - 工作图标
12. `logout.svg` - 退出登录图标

### 互动功能图标 (7个)
13. `star.svg` - 收藏图标（实心）
14. `star-o.svg` - 收藏图标（空心）
15. `share.svg` - 分享图标
16. `like.svg` - 点赞图标（空心）
17. `liked.svg` - 点赞图标（实心）
18. `check.svg` - 勾选图标
19. `view.svg` - 查看图标

### 业务模块图标 (4个)
20. `course.svg` - 课程图标
21. `association.svg` - 协会图标
22. `news.svg` - 新闻图标
23. `ai.svg` - AI图标

### 信息展示图标 (6个)
24. `time.svg` - 时间图标
25. `location.svg` - 位置图标
26. `status.svg` - 状态图标
27. `trend.svg` - 趋势图标
28. `download.svg` - 下载图标
29. `about.svg` - 关于图标

### 联系方式图标 (4个)
30. `service.svg` - 客服图标
31. `phone.svg` - 电话图标
32. `email.svg` - 邮箱图标
33. `wechat.svg` - 微信图标

## 转换说明

### 1. 批量转换为PNG
请将这33个SVG文件转换为PNG格式（建议尺寸：128x128px或256x256px），并保存在同一目录下。

### 2. 命名规则
PNG文件名应与SVG文件名一致，例如：
- `search.svg` → `search.png`
- `message.svg` → `message.png`
- ...以此类推

### 3. 颜色处理
由于小程序不支持SVG动态改变颜色，建议：
- 默认颜色的图标转换为PNG（如灰色 #666666）
- 如需不同颜色的图标，可创建多个颜色版本，如：
  - `search.png` - 默认灰色
  - `search-white.png` - 白色版本
  - `search-red.png` - 红色版本

### 4. 图标使用
转换完成后，Icon组件将自动使用PNG路径：
```vue
<Icon name="search" :size="44" color="#333" />
```
将会加载：`/static/icons/search.png`

## 使用的页面统计

- **首页**: search, message, course, association, ai, star, news, arrow-right, time, like
- **我的页面**: arrow-right, work, edit, star, trend, time, course, message, download, ai, service, about, logout
- **课程详情**: star, user, time, location, course, check, close, scan, edit
- **协会**: time, view, arrow-right, like, user, phone, news, email, wechat
- **新闻详情**: share
- **消息中心**: check, delete
- **搜索页**: search
- **活动详情**: time, view, share

## 注意事项

1. 确保所有PNG文件的透明背景保持完好
2. 建议使用2倍图（@2x）以保证清晰度
3. 图标颜色统一使用深灰色 (#666666) 或纯黑色 (#000000)
4. 特殊颜色需求的图标需要单独处理

