/**
 * 本地存储工具函数
 */

/**
 * 存储数据
 * @param {String} key 键名
 * @param {*} value 值
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (error) {
    console.error('存储数据失败：', error)
    return false
  }
}

/**
 * 获取数据
 * @param {String} key 键名
 * @param {*} defaultValue 默认值
 */
export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key)
    return value !== undefined && value !== null ? value : defaultValue
  } catch (error) {
    console.error('获取数据失败：', error)
    return defaultValue
  }
}

/**
 * 删除数据
 * @param {String} key 键名
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (error) {
    console.error('删除数据失败：', error)
    return false
  }
}

/**
 * 清空所有数据
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
    return true
  } catch (error) {
    console.error('清空数据失败：', error)
    return false
  }
}

