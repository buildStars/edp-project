/**
 * 表单验证规则
 */

// 手机号验证
export const validatePhone = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 邮箱验证
export const validateEmail = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailReg.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

// 身份证验证
export const validateIdCard = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!idCardReg.test(value)) {
    callback(new Error('请输入正确的身份证号'))
  } else {
    callback()
  }
}

// URL验证
export const validateUrl = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const urlReg = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
  if (!urlReg.test(value)) {
    callback(new Error('请输入正确的URL地址'))
  } else {
    callback()
  }
}

// 数字验证
export const validateNumber = (_rule: any, value: any, callback: any) => {
  if (!value && value !== 0) {
    callback()
    return
  }
  if (isNaN(Number(value))) {
    callback(new Error('请输入数字'))
  } else {
    callback()
  }
}

// 正整数验证
export const validatePositiveInteger = (_rule: any, value: any, callback: any) => {
  if (!value && value !== 0) {
    callback()
    return
  }
  const num = Number(value)
  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    callback(new Error('请输入正整数'))
  } else {
    callback()
  }
}
