<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store'
import request from './utils/request'

const router = useRouter()
const userStore = useUserStore()

// 应用启动时，如果有token，尝试获取用户信息
onMounted(async () => {
  if (userStore.token) {
    try {
      const res = await request.get('/api/sys/auth/userInfo')
      if (res) {
        userStore.setUserInfo({
          userId: res.id,
          username: res.username,
          realName: res.realName,
          role: res.role
        })
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // token可能已过期，清除token
      userStore.logout()
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
