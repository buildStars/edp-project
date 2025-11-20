/**
 * 表格通用逻辑Hook
 */
import { ref, reactive, computed } from 'vue'
import type { PageParams, PageResult } from '@/types'

export interface UseTableOptions<T = any> {
  // 获取数据的API函数
  fetchApi: (params: any) => Promise<PageResult<T>>
  // 初始查询参数
  initialParams?: Record<string, any>
  // 是否立即加载数据
  immediate?: boolean
}

export function useTable<T = any>(options: UseTableOptions<T>) {
  const { fetchApi, initialParams = {}, immediate = true } = options

  // 加载状态
  const loading = ref(false)

  // 表格数据
  const tableData = ref<T[]>([])

  // 总数
  const total = ref(0)

  // 查询参数
  const queryParams = reactive<PageParams & Record<string, any>>({
    page: 1,
    pageSize: 10,
    ...initialParams,
  })

  // 获取数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await fetchApi(queryParams)
      tableData.value = res.items
      total.value = res.total
    } catch (error) {
      console.error('Failed to fetch data:', error)
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    queryParams.page = 1
    fetchData()
  }

  // 重置
  const handleReset = () => {
    Object.assign(queryParams, {
      page: 1,
      pageSize: 10,
      ...initialParams,
    })
    fetchData()
  }

  // 分页改变
  const handlePageChange = (page: number) => {
    queryParams.page = page
    fetchData()
  }

  // 每页大小改变
  const handleSizeChange = (size: number) => {
    queryParams.pageSize = size
    queryParams.page = 1
    fetchData()
  }

  // 刷新当前页
  const refresh = () => {
    fetchData()
  }

  // 是否为空
  const isEmpty = computed(() => !loading.value && tableData.value.length === 0)

  // 立即加载
  if (immediate) {
    fetchData()
  }

  return {
    loading,
    tableData,
    total,
    queryParams,
    isEmpty,
    fetchData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    refresh,
  }
}


