<template>
  <div class="ranking-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>排行管理</span>
          <el-button type="danger" size="small" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchForm.gameName"
          placeholder="游戏名称"
          style="width: 150px;"
          clearable
        />
        <el-input
          v-model="searchForm.openid"
          placeholder="用户openid"
          style="width: 200px;"
          clearable
        />
        <el-input
          v-model="searchForm.difficulty"
          placeholder="难度等级"
          style="width: 150px;"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="gameName" label="游戏" width="120" />
        <el-table-column prop="nickname" label="用户" width="150" />
        <el-table-column prop="score" label="分数" width="100" sortable />
        <el-table-column prop="duration" label="时长(秒)" width="100" />
        <el-table-column prop="difficulty" label="难度" width="100" />
        <el-table-column prop="submitTime" label="提交时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 游戏统计对话框 -->
    <el-dialog v-model="statisticsDialogVisible" title="游戏统计" width="600px">
      <el-descriptions :column="2" border v-if="statisticsData">
        <el-descriptions-item label="总记录数">{{ statisticsData.totalCount }}</el-descriptions-item>
        <el-descriptions-item label="最高分">{{ statisticsData.maxScore }}</el-descriptions-item>
        <el-descriptions-item label="平均分">{{ statisticsData.avgScore }}</el-descriptions-item>
        <el-descriptions-item label="最高分用户" :span="2">
          {{ statisticsData.topRecord?.nickname || '-' }} ({{ statisticsData.topRecord?.score || 0 }}分)
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref([])
const searchForm = reactive({
  gameName: '',
  openid: '',
  difficulty: ''
})
const statisticsDialogVisible = ref(false)
const statisticsData = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: currentPage.value,
      size: pageSize.value
    }
    if (searchForm.gameName) params.gameName = searchForm.gameName
    if (searchForm.openid) params.openid = searchForm.openid
    if (searchForm.difficulty) params.difficulty = searchForm.difficulty

    const res = await request.get('/api/sys/ranking/page', { params })
    if (res) {
      tableData.value = res.records || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.gameName = ''
  searchForm.openid = ''
  searchForm.difficulty = ''
  currentPage.value = 1
  loadData()
}

const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该排行记录吗？', '提示', {
      type: 'warning'
    })
    await request.delete(`/api/sys/ranking/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', {
      type: 'warning'
    })
    await request.delete('/api/sys/ranking/batch', {
      data: { ids: selectedIds.value }
    })
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.ranking-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
