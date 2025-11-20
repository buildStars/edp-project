# ActivityCard 组件

活动卡片组件，用于展示活动信息。

## 功能

- 展示活动封面图
- 展示活动标题（最多2行，超出省略）
- 展示发布时间、阅读量、点赞数等元数据
- 支持图片懒加载
- 支持图片加载失败处理
- 支持点击事件

## Props

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| activity | Object | 是 | - | 活动对象 |

### activity 对象结构

```javascript
{
  id: String,           // 活动ID
  title: String,        // 活动标题
  coverImage: String,   // 封面图URL
  publishTime: String,  // 发布时间
  views: Number,        // 阅读量
  likes: Number         // 点赞数（可选）
}
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | activity | 点击卡片时触发，返回活动对象 |

## 使用示例

```vue
<template>
  <view>
    <activity-card 
      v-for="item in activityList" 
      :key="item.id"
      :activity="item"
      @click="goActivityDetail"
    />
  </view>
</template>

<script setup>
import ActivityCard from '@/components/activity-card/activity-card.vue'

const activityList = ref([
  {
    id: '1',
    title: '北大汇丰校友会年度聚会',
    coverImage: 'https://example.com/image.jpg',
    publishTime: '2025-10-30T10:00:00',
    views: 1234,
    likes: 56
  }
])

const goActivityDetail = (activity) => {
  uni.navigateTo({
    url: `/pages/association/activity-detail?id=${activity.id}`
  })
}
</script>
```

## 样式定制

可以通过 SCSS 变量覆盖默认样式：

```scss
.activity-card {
  // 自定义样式
  border-radius: 16rpx;
  
  .activity-title {
    font-size: 32rpx;
    color: #000;
  }
}
```

## 注意事项

1. **图片懒加载**: 组件已启用图片懒加载，适合长列表场景
2. **图片错误处理**: 图片加载失败时会在控制台输出警告
3. **点击反馈**: 卡片支持点击态效果（透明度和缩放）
4. **文字溢出**: 标题最多显示2行，超出自动省略
5. **性能优化**: 建议配合虚拟列表使用（数据量>100条时）

## 更新日志

- 2025-10-31: 初始版本


