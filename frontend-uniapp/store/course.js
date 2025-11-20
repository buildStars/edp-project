/**
 * 课程状态管理
 */
import { defineStore } from 'pinia'
import { getCourseList, getMyCourses } from '@/api/course'

export const useCourseStore = defineStore('course', {
  state: () => ({
    currentCategory: '', // 当前选中的课程分类
    courseList: [], // 课程列表
    myCourses: {
      enrolled: [], // 已报名课程
      completed: [] // 已完成课程
    }
  }),
  
  getters: {
    // 获取当前分类的课程列表
    currentCourseList: (state) => {
      if (!state.currentCategory) return state.courseList
      return state.courseList.filter(item => item.category === state.currentCategory)
    },
    
    // 即将开课的课程（3天内）
    upcomingCourses: (state) => {
      const now = Date.now()
      const threeDays = 3 * 24 * 60 * 60 * 1000
      return state.myCourses.enrolled.filter(course => {
        const courseTime = new Date(course.startTime).getTime()
        return courseTime > now && courseTime - now <= threeDays
      })
    }
  },
  
  actions: {
    /**
     * 设置当前分类
     */
    setCurrentCategory(category) {
      this.currentCategory = category
    },
    
    /**
     * 获取课程列表
     */
    async fetchCourseList(params = {}) {
      try {
        const data = await getCourseList(params)
        // 后端返回的是 { items: [], total, page, pageSize, totalPages }
        // request.js 已经提取了 data.data，所以这里直接用 items
        const list = data.items || data.data || data.list || []
        
        if (params.page === 1) {
          this.courseList = list
        } else {
          this.courseList = [...this.courseList, ...list]
        }
        return data
      } catch (error) {
        console.error('获取课程列表失败：', error)
        throw error
      }
    },
    
    /**
     * 获取我的课程
     */
    async fetchMyCourses(status) {
      try {
        const data = await getMyCourses(status)
        
        // 后端返回的是数组 [{ id, userId, courseId, course: {...} }]
        // 需要提取其中的 course 对象
        let list = []
        if (Array.isArray(data)) {
          // 直接返回数组
          list = data.map(enrollment => enrollment.course).filter(course => course !== null)
        } else {
          // 返回分页对象
          const enrollments = data.items || data.data || data.list || []
          list = enrollments.map(enrollment => enrollment.course).filter(course => course !== null)
        }
        
        if (status === 'enrolled') {
          this.myCourses.enrolled = list
        } else if (status === 'completed') {
          this.myCourses.completed = list
        }
        return data
      } catch (error) {
        console.error('获取我的课程失败：', error)
        throw error
      }
    },
    
    /**
     * 清空课程列表
     */
    clearCourseList() {
      this.courseList = []
    }
  }
})

