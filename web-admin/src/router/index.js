import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: {
        title: '登录'
      }
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: {
            title: '仪表盘',
            requiresAuth: true
          }
        },
        {
          path: 'customer',
          name: 'Customer',
          component: () => import('../views/Customer.vue'),
          meta: {
            title: '客户管理',
            requiresAuth: true
          }
        },
        {
          path: 'sys-user',
          name: 'SysUser',
          component: () => import('../views/SysUser.vue'),
          meta: {
            title: '系统用户',
            requiresAuth: true
          }
        },
        {
          path: 'ranking',
          name: 'Ranking',
          component: () => import('../views/Ranking.vue'),
          meta: {
            title: '排行管理',
            requiresAuth: true
          }
        },
        {
          path: 'system',
          name: 'System',
          component: () => import('../views/System.vue'),
          meta: {
            title: '系统管理',
            requiresAuth: true
          }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 小程序管理后台`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }
  
  next()
})

export default router
