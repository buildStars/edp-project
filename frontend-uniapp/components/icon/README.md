# Icon 图标组件

统一的图标组件，使用PNG图片实现，支持自定义大小。

## 重要说明

**组件已从SVG改为PNG图片实现**，以支持小程序环境。所有SVG文件已提取到 `/static/icons/` 目录，请将这些SVG转换为PNG格式后使用。

## 使用方法

```vue
<template>
  <icon name="search" :size="48" />
</template>

<script setup>
import Icon from '@/components/icon/icon.vue'
</script>
```

## Props 参数

| 参数 | 说明 | 类型 | 默认值 | 备注 |
|------|------|------|--------|------|
| name | 图标名称 | String | - | 必填，对应icons文件夹中的PNG文件名 |
| size | 图标大小（rpx） | Number/String | 48 | 图标的宽高尺寸 |
| color | 图标颜色 | String | #666666 | **注意：PNG图片不支持动态颜色，此参数保留用于向后兼容** |

## 支持的图标列表

### 通用图标
- `search` - 搜索
- `message` - 消息
- `edit` - 编辑
- `arrow-right` - 右箭头
- `close` - 关闭
- `delete` - 删除
- `back` - 返回

### 功能图标
- `star` - 收藏（实心）
- `star-o` - 收藏（空心）
- `share` - 分享
- `like` - 点赞（空心）
- `liked` - 点赞（实心）
- `download` - 下载

### 业务图标
- `ai` - AI
- `service` - 客服
- `about` - 关于
- `time` - 时间
- `location` - 位置
- `teacher` - 教师
- `status` - 状态

## 使用示例

### 基础用法
```vue
<!-- 默认样式 -->
<icon name="search" />

<!-- 自定义大小 -->
<icon name="search" :size="64" />

<!-- 自定义颜色 -->
<icon name="search" color="#C8161D" />

<!-- 完整配置 -->
<icon name="search" :size="48" color="#1890FF" />
```

### 点击事件
```vue
<icon name="search" :size="44" color="#666" @click="handleSearch" />
```

### 在导航栏中使用
```vue
<view class="navbar-icons">
  <icon name="search" :size="44" color="#666" @click="goSearch" />
  <icon name="message" :size="44" color="#666" @click="goMessage" />
</view>
```

### 在菜单列表中使用
```vue
<view class="menu-item">
  <icon name="star" :size="48" color="#C8161D" />
  <text>我的收藏</text>
  <icon name="arrow-right" :size="32" color="#ccc" />
</view>
```

### 状态切换
```vue
<icon 
  :name="isCollected ? 'star' : 'star-o'" 
  :size="48" 
  :color="isCollected ? '#C8161D' : '#999'" 
/>
```

## 样式定制

组件内部使用 `display: inline-flex`，可以直接在外层添加样式：

```vue
<view class="icon-wrapper">
  <icon name="search" />
</view>

<style>
.icon-wrapper {
  padding: 10rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
}
</style>
```

## 颜色规范

推荐使用以下颜色值：

| 场景 | 颜色 | 色值 |
|------|------|------|
| 主题色 | 北大红 | #C8161D |
| 成功 | 绿色 | #52C41A |
| 警告 | 橙色 | #FF6B00 |
| 信息 | 蓝色 | #1890FF |
| 默认 | 深灰 | #666666 |
| 禁用 | 浅灰 | #999999 |
| 边框 | 超浅灰 | #CCCCCC |

## 注意事项

1. **尺寸单位**：size 参数使用 rpx 单位，会自动适配不同屏幕
2. **颜色格式**：支持所有 CSS 颜色格式（HEX、RGB、颜色名称等）
3. **SVG 优势**：矢量图标，支持任意缩放不失真
4. **性能优化**：所有图标内联在组件中，无需额外网络请求

## 添加新图标

如需添加新图标，在 `icon.vue` 中添加对应的 SVG 路径：

```vue
<!-- 新图标 -->
<svg v-else-if="name === 'new-icon'" viewBox="0 0 1024 1024" :fill="color">
  <path d="...SVG路径数据..." />
</svg>
```

推荐的 SVG 来源：
- [Iconfont 阿里巴巴矢量图标库](https://www.iconfont.cn/)
- [Iconify](https://iconify.design/)
- 使用设计工具（Figma、Sketch）导出

## Tab 栏图标

Tab 栏使用独立的 SVG 文件，位于 `/static/tabbar/` 目录：

| 图标 | 文件名 | 说明 |
|------|--------|------|
| 学校资讯 | news.svg / news-active.svg | 新闻样式 |
| EDP协会 | association.svg / association-active.svg | 人群样式 |
| 课程中心 | course.svg / course-active.svg | 公文包样式 |
| 个人中心 | mine.svg / mine-active.svg | 个人头像样式 |

每个图标都有两个状态：
- 普通态：灰色 #999999
- 激活态：北大红 #C8161D

