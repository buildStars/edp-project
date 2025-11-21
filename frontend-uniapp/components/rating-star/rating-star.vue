<template>
  <view class="rating-star" :class="[`size-${size}`]">
    <view 
      v-for="(star, index) in stars" 
      :key="index" 
      class="star-item"
      @click="handleClick(index + 1)"
    >
      <text class="star-icon" :class="{ active: index < modelValue }">★</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5
  },
  size: {
    type: String,
    default: 'normal' // 'small', 'normal', 'large'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const stars = computed(() => {
  return Array.from({ length: props.max })
})

const handleClick = (value) => {
  if (props.disabled) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style lang="scss" scoped>
.rating-star {
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  .star-item {
    cursor: pointer;
    
    .star-icon {
      font-size: 60rpx;
      color: #E0E0E0;
      transition: all 0.2s;
      
      &.active {
        color: #FFB400;
      }
    }
    
    &:active .star-icon {
      transform: scale(1.2);
    }
  }
  
  // 小尺寸
  &.size-small {
    gap: 8rpx;
    
    .star-icon {
      font-size: 40rpx;
    }
  }
  
  // 普通尺寸
  &.size-normal {
    gap: 12rpx;
    
    .star-icon {
      font-size: 60rpx;
    }
  }
  
  // 大尺寸
  &.size-large {
    gap: 16rpx;
    
    .star-icon {
      font-size: 80rpx;
    }
  }
}
</style>


