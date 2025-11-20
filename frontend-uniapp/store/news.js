/**
 * 资讯状态管理
 */
import { defineStore } from 'pinia'
import { getNewsList } from '@/api/news'

export const useNewsStore = defineStore('news', {
  state: () => ({
    currentCategory: '', // 当前选中的资讯分类
    newsList: [], // 资讯列表
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true
  }),
  
  getters: {
    // 获取当前分类的资讯列表
    currentNewsList: (state) => {
      if (!state.currentCategory) return state.newsList
      return state.newsList.filter(item => item.category === state.currentCategory)
    }
  },
  
  actions: {
    /**
     * 设置当前分类
     */
    setCurrentCategory(category) {
      this.currentCategory = category
      this.clearNewsList()
    },
    
    /**
     * 获取资讯列表
     */
    async fetchNewsList(isRefresh = false) {
      try {
        if (isRefresh) {
          this.page = 1
          this.hasMore = true
        }
        
        const params = {
          page: this.page,
          pageSize: this.pageSize
        }
        
        if (this.currentCategory) {
          params.category = this.currentCategory
        }
        
        const data = await getNewsList(params)
        
        // 后端返回的是 { items: [], total, page, pageSize, totalPages }
        const list = data.items || data.data || data.list || []
        
        if (isRefresh) {
          this.newsList = list
        } else {
          this.newsList = [...this.newsList, ...list]
        }
        
        this.total = data.total || 0
        this.page++
        this.hasMore = this.newsList.length < this.total
        
        return data
      } catch (error) {
        console.error('获取资讯列表失败：', error)
        throw error
      }
    },
    
    /**
     * 清空资讯列表
     */
    clearNewsList() {
      this.newsList = []
      this.page = 1
      this.hasMore = true
    }
  }
})

