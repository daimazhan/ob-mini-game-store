import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store'

// 创建 axios 实例
// 注意：后端的 context-path 是 /api，所以 baseURL 不应该包含 /api
// 请求路径中需要包含 /api 前缀，例如：/api/sys/auth/login
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2026'
const service = axios.create({
  baseURL: baseURL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 localStorage 直接读取 token，避免在拦截器中使用 store 可能的问题
    const token = localStorage.getItem('token')
    if (token) {
      // Sa-Token 配置的 token-prefix 是 Bearer
      config.headers['Authorization'] = `Bearer ${token}`
      // 调试日志（开发环境）
      if (import.meta.env.DEV) {
        console.log('请求携带 token:', config.url, config.headers['Authorization'])
      }
    } else {
      // 调试日志（开发环境）
      if (import.meta.env.DEV) {
        console.warn('请求未携带 token:', config.url)
      }
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 调试日志（开发环境）
    if (import.meta.env.DEV) {
      console.log('响应数据:', response.config.url, res)
    }
    
    // 根据后端返回的数据结构处理
    if (res.code !== undefined && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    // 返回data字段，如果没有data字段则返回整个res
    const result = res.data !== undefined ? res.data : res
    if (import.meta.env.DEV) {
      console.log('处理后返回:', result)
    }
    return result
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求错误，未找到该资源')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '网络错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

export default service
