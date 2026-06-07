<template>
  <div class="user-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon :size="24"><User /></el-icon>
          <span class="page-title">用户管理</span>
          <div class="header-actions">
            <el-button type="primary" size="small">
              <el-icon><Plus /></el-icon>
              新增用户
            </el-button>
          </div>
        </div>
      </template>

      <el-alert
        title="路由参数演示"
        type="info"
        :closable="false"
        show-icon
        class="param-alert"
      >
        <div>
          <span>当前路由参数 ID: </span>
          <el-tag type="success">{{ route.query.id || '未传入' }}</el-tag>
        </div>
        <div style="margin-top: 8px;">
          <el-button size="small" type="primary" @click="testWithId(1)">
            带参数 ?id=1
          </el-button>
          <el-button size="small" type="success" @click="testWithId(999)">
            带参数 ?id=999
          </el-button>
        </div>
      </el-alert>

      <el-table :data="userList" border style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="roleType(row.role)">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button size="small" type="primary" link>编辑</el-button>
            <el-button size="small" type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userList = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'editor', status: 'active' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'viewer', status: 'disabled' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'editor', status: 'active' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', role: 'viewer', status: 'active' }
])

function roleType(role) {
  switch (role) {
    case 'admin': return 'danger'
    case 'editor': return 'warning'
    case 'viewer': return 'info'
    default: return 'success'
  }
}

function testWithId(id) {
  router.push({ path: route.path, query: { id } })
}
</script>

<style scoped>
.user-page {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.param-alert {
  margin-top: 0;
}
</style>
