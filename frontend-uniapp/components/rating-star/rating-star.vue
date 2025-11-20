<template>
  <view class="rating-star">
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
    type: Number,
    default: 60
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
  gap: 16rpx;
  
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
}
</style>


