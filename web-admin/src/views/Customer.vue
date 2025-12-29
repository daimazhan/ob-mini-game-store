<template>
  <div class="customer-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button type="danger" size="small" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索昵称或openid"
          style="width: 300px;"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
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
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="openid" label="OpenID" width="200" show-overflow-tooltip />
        <el-table-column prop="avatarUrl" label="头像" width="100">
          <template #default="{ row }">
            <el-avatar v-if="row.avatarUrl" :src="row.avatarUrl" :size="40" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="points" label="积分" width="100" />
        <el-table-column prop="createTime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
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

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="客户详情" width="600px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentRow.nickname }}</el-descriptions-item>
        <el-descriptions-item label="OpenID">{{ currentRow.openid }}</el-descriptions-item>
        <el-descriptions-item label="UnionID">{{ currentRow.unionid || '-' }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar v-if="currentRow.avatarUrl" :src="currentRow.avatarUrl" :size="60" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ currentRow.gender === 1 ? '男' : currentRow.gender === 2 ? '女' : '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="国家">{{ currentRow.country || '-' }}</el-descriptions-item>
        <el-descriptions-item label="省份">{{ currentRow.province || '-' }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ currentRow.city || '-' }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ currentRow.points || 0 }}</el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">
          {{ formatDateTime(currentRow.createTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from '../utils/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const selectedIds = ref([])
const viewDialogVisible = ref(false)
const currentRow = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/sys/customer/page', {
      params: {
        current: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value || undefined
      }
    })
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
  searchKeyword.value = ''
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

const handleView = (row) => {
  currentRow.value = row
  viewDialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
      type: 'warning'
    })
    await request.delete(`/api/sys/customer/${row.id}`)
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个客户吗？`, '提示', {
      type: 'warning'
    })
    await request.delete('/api/sys/customer/batch', {
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
.customer-page {
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
