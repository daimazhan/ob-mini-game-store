<template>
  <div class="system-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1" border v-if="systemInfo">
            <el-descriptions-item label="Java版本">
              {{ systemInfo.javaVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="操作系统">
              {{ systemInfo.osName }} {{ systemInfo.osVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="总内存">
              {{ formatBytes(systemInfo.memory?.total) }}
            </el-descriptions-item>
            <el-descriptions-item label="已用内存">
              {{ formatBytes(systemInfo.memory?.used) }}
            </el-descriptions-item>
            <el-descriptions-item label="空闲内存">
              {{ formatBytes(systemInfo.memory?.free) }}
            </el-descriptions-item>
            <el-descriptions-item label="最大内存">
              {{ formatBytes(systemInfo.memory?.max) }}
            </el-descriptions-item>
            <el-descriptions-item label="内存使用率">
              <el-progress :percentage="systemInfo.memory?.usedPercent || 0" />
            </el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" style="margin-top: 20px;" @click="loadSystemInfo">刷新</el-button>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统配置</span>
          </template>
          <el-descriptions :column="1" border v-if="systemConfig">
            <el-descriptions-item label="应用名称">
              {{ systemConfig.appName }}
            </el-descriptions-item>
            <el-descriptions-item label="版本号">
              {{ systemConfig.version }}
            </el-descriptions-item>
            <el-descriptions-item label="维护状态">
              <el-tag :type="systemConfig.maintenance ? 'warning' : 'success'">
                {{ systemConfig.maintenance ? '维护中' : '正常运行' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="维护提示" v-if="systemConfig.maintenance">
              {{ systemConfig.maintenanceMessage || '系统维护中，请稍后再试' }}
            </el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" style="margin-top: 20px;" @click="loadSystemConfig">刷新</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const systemInfo = ref(null)
const systemConfig = ref(null)

const loadSystemInfo = async () => {
  try {
    const res = await request.get('/api/sys/system/info')
    systemInfo.value = res || {}
  } catch (error) {
    console.error('加载系统信息失败:', error)
    ElMessage.error('加载系统信息失败')
  }
}

const loadSystemConfig = async () => {
  try {
    const res = await request.get('/api/sys/system/config')
    systemConfig.value = res || {}
  } catch (error) {
    console.error('加载系统配置失败:', error)
    ElMessage.error('加载系统配置失败')
  }
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

onMounted(() => {
  loadSystemInfo()
  loadSystemConfig()
})
</script>

<style scoped>
.system-page {
  padding: 0;
}
</style>
