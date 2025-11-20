/**
 * 确认对话框工具
 */
import { ElMessageBox } from 'element-plus'

/**
 * 删除确认对话框
 * @param message 确认消息
 * @param title 标题
 */
export function confirmDelete(
  message = '确定要删除吗？删除后无法恢复！',
  title = '删除确认'
): Promise<void> {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
    autofocus: false,
  })
}

/**
 * 批量删除确认对话框
 * @param count 删除数量
 */
export function confirmBatchDelete(count: number): Promise<void> {
  return confirmDelete(
    `确定要删除选中的 ${count} 条记录吗？删除后无法恢复！`,
    '批量删除确认'
  )
}

/**
 * 操作确认对话框
 * @param message 确认消息
 * @param title 标题
 * @param type 类型
 */
export function confirmAction(
  message: string,
  title = '操作确认',
  type: 'warning' | 'info' | 'success' | 'error' = 'warning'
): Promise<void> {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type,
    autofocus: false,
  })
}

/**
 * 状态变更确认
 * @param action 操作名称
 * @param targetName 目标名称
 */
export function confirmStatusChange(
  action: string,
  targetName?: string
): Promise<void> {
  const message = targetName
    ? `确定要${action}"${targetName}"吗？`
    : `确定要${action}吗？`

  return confirmAction(message, '状态变更确认', 'warning')
}

/**
 * 发布确认
 * @param itemName 项目名称
 */
export function confirmPublish(itemName?: string): Promise<void> {
  const message = itemName
    ? `确定要发布"${itemName}"吗？发布后所有用户可见。`
    : '确定要发布吗？发布后所有用户可见。'

  return confirmAction(message, '发布确认', 'info')
}

/**
 * 归档确认
 * @param itemName 项目名称
 */
export function confirmArchive(itemName?: string): Promise<void> {
  const message = itemName
    ? `确定要归档"${itemName}"吗？归档后将不再显示。`
    : '确定要归档吗？归档后将不再显示。'

  return confirmAction(message, '归档确认', 'warning')
}

/**
 * 提交确认（带输入框）
 * @param message 确认消息
 * @param inputLabel 输入框标签
 * @param title 标题
 */
export function confirmWithInput(
  message: string,
  inputLabel = '请输入原因',
  title = '操作确认'
): Promise<string> {
  return ElMessageBox.prompt(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: inputLabel,
    inputType: 'textarea',
    inputValidator: (value) => {
      if (!value || value.trim().length === 0) {
        return '请输入内容'
      }
      return true
    },
  }).then(({ value }) => value)
}

/**
 * 审批拒绝确认（需要输入原因）
 * @param itemName 项目名称
 */
export function confirmReject(itemName?: string): Promise<string> {
  const message = itemName
    ? `确定要拒绝"${itemName}"吗？`
    : '确定要拒绝吗？'

  return confirmWithInput(message, '请输入拒绝原因', '拒绝确认')
}


