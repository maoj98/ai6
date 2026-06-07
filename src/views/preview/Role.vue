<template>
  <div class="role-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon :size="24"><UserFilled /></el-icon>
          <span class="page-title">角色管理</span>
          <div class="header-actions">
            <el-button type="primary" size="small">
              <el-icon><Plus /></el-icon>
              新增角色
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="24">
        <el-col :span="8" v-for="role in roles" :key="role.id">
          <el-card class="role-card" shadow="hover">
            <div class="role-icon" :class="role.type">
              <el-icon :size="36">
                <component :is="role.icon" />
              </el-icon>
            </div>
            <h3 class="role-name">{{ role.name }}</h3>
            <p class="role-desc">{{ role.description }}</p>
            <div class="role-perms">
              <el-tag
                v-for="perm in role.permissions.slice(0, 4)"
                :key="perm"
                size="small"
                effect="light"
              >
                {{ perm }}
              </el-tag>
              <el-tag v-if="role.permissions.length > 4" size="small" effect="light">
                +{{ role.permissions.length - 4 }}
              </el-tag>
            </div>
            <div class="role-actions">
              <el-button size="small" type="primary" plain>编辑权限</el-button>
              <el-button size="small" type="danger" plain>删除</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    icon: 'Crown',
    type: 'admin',
    description: '拥有系统所有权限',
    permissions: ['用户管理', '角色管理', '系统设置', '数据统计', '日志查看', '配置管理']
  },
  {
    id: 2,
    name: '内容编辑',
    icon: 'EditPen',
    type: 'editor',
    description: '负责内容的创建和编辑',
    permissions: ['内容管理', '图片上传', '文章发布', '评论管理']
  },
  {
    id: 3,
    name: '普通用户',
    icon: 'User',
    type: 'viewer',
    description: '仅可查看公开内容',
    permissions: ['内容查看', '个人中心', '消息通知']
  }
])
</script>

<style scoped>
.role-page {
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

.role-card {
  text-align: center;
  margin-bottom: 24px;
}

.role-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.role-icon.admin {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.role-icon.editor {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.role-icon.viewer {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.role-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.role-desc {
  margin: 0 0 16px 0;
  color: #909399;
  font-size: 13px;
}

.role-perms {
  margin-bottom: 16px;
  min-height: 32px;
}

.role-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
