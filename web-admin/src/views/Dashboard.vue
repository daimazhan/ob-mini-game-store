<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalUsers || 0 }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a;">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.todayNewUsers || 0 }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalGameRecords || 0 }}</div>
              <div class="stat-label">总游戏记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c;">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.activeUsers || 0 }}</div>
              <div class="stat-label">活跃用户(7天)</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-select v-model="growthDays" size="small" style="width: 100px" @change="loadUserGrowth">
                <el-option label="7天" :value="7" />
                <el-option label="30天" :value="30" />
                <el-option label="90天" :value="90" />
              </el-select>
            </div>
          </template>
          <div ref="growthChartRef" style="height: 300px; min-height: 300px;">
            <el-table v-if="growthData.length > 0 && !growthChart" :data="growthData" style="width: 100%">
              <el-table-column prop="date" label="日期" />
              <el-table-column prop="count" label="新增用户数" />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>游戏数据统计</span>
          </template>
          <el-table :data="gameStatistics" style="width: 100%">
            <el-table-column prop="gameName" label="游戏名称" />
            <el-table-column prop="totalCount" label="总记录数" />
            <el-table-column prop="maxScore" label="最高分" />
            <el-table-column prop="avgScore" label="平均分" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="recent-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>最近游戏记录</span>
          </template>
          <el-table :data="recentRecords" style="width: 100%">
            <el-table-column prop="gameName" label="游戏" width="120" />
            <el-table-column prop="nickname" label="用户" width="150" />
            <el-table-column prop="score" label="分数" width="100" />
            <el-table-column prop="difficulty" label="难度" width="100" />
            <el-table-column prop="submitTime" label="提交时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.submitTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { User, UserFilled, Trophy, DataLine } from '@element-plus/icons-vue'
import request from '../utils/request'

const overviewData = ref({})
const growthDays = ref(30)
const growthData = ref([])
const gameStatistics = ref([])
const recentRecords = ref([])
const growthChartRef = ref(null)
let growthChart = null

const loadOverview = async () => {
  try {
    const res = await request.get('/api/sys/dashboard/overview')
    overviewData.value = res || {}
  } catch (error) {
    console.error('加载概览数据失败:', error)
  }
}

const loadUserGrowth = async () => {
  try {
    const res = await request.get(`/api/sys/dashboard/userGrowth?days=${growthDays.value}`)
    growthData.value = res || []
    updateGrowthChart()
  } catch (error) {
    console.error('加载用户增长数据失败:', error)
  }
}

const loadGameStatistics = async () => {
  try {
    const res = await request.get('/api/sys/dashboard/gameStatistics')
    gameStatistics.value = res?.gameStatistics || []
  } catch (error) {
    console.error('加载游戏统计失败:', error)
  }
}

const loadRecentRecords = async () => {
  try {
    const res = await request.get('/api/sys/dashboard/recentRecords?limit=10')
    recentRecords.value = res || []
  } catch (error) {
    console.error('加载最近记录失败:', error)
  }
}

const updateGrowthChart = async () => {
  // 动态导入echarts，如果未安装则使用简单的表格展示
  try {
    const echartsModule = await import('echarts')
    const echarts = echartsModule.default || echartsModule
    await nextTick()
    if (!growthChartRef.value) return
    
    if (!growthChart) {
      growthChart = echarts.init(growthChartRef.value)
    }
    
    const dates = growthData.value.map(item => item.date)
    const counts = growthData.value.map(item => item.count)
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: counts,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        itemStyle: {
          color: '#409eff'
        }
      }]
    }
    
    growthChart.setOption(option)
  } catch (error) {
    console.warn('echarts未安装或加载失败，使用表格展示数据', error)
    // 如果echarts未安装，可以在这里显示一个提示或使用表格
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadOverview()
  loadUserGrowth()
  loadGameStatistics()
  loadRecentRecords()
  
  // 响应式调整图表大小
  window.addEventListener('resize', () => {
    if (growthChart) {
      growthChart.resize()
    }
  })
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-row {
  margin-bottom: 20px;
}

.recent-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
