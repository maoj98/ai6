<template>
  <div class="menu-form">
    <div class="form-header">
      <h2 class="form-title">
        <el-icon><Edit /></el-icon>
        编辑菜单 - {{ item.name }}
      </h2>
      <div v-if="hasErrors" class="error-summary">
        <el-alert
          v-for="(error, index) in itemErrors"
          :key="index"
          :title="error"
          type="error"
          effect="dark"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <el-form label-width="120px" class="form-content">
      <el-collapse v-model="activePanels" accordion>
        <el-collapse-item name="basic" title="基本配置">
          <el-form-item label="菜单名称" required>
            <el-input
              v-model="formData.name"
              placeholder="请输入菜单名称"
              @input="updateField('name', $event)"
            />
          </el-form-item>

          <el-form-item label="路由路径" required>
            <el-input
              v-model="formData.path"
              placeholder="/preview/xxx"
              @input="updateField('path', $event)"
            />
            <div class="form-tip">路径必须以 /preview/ 开头</div>
          </el-form-item>

          <el-form-item label="组件名称" required>
            <el-input
              v-model="formData.component"
              placeholder="请输入组件名称"
              @input="updateField('component', $event)"
            />
            <div class="form-tip">对应 src/views/preview/ 目录下的组件</div>
          </el-form-item>

          <el-form-item label="菜单图标">
            <IconSelector v-model="formData.icon" @change="updateField('icon', $event)" />
          </el-form-item>

          <el-form-item label="菜单显隐">
            <el-switch
              v-model="formData.hidden"
              active-text="显示"
              inactive-text="隐藏"
              @change="updateField('hidden', $event)"
            />
            <div class="form-tip">隐藏后在预览页面不显示，但路由仍可访问</div>
          </el-form-item>

          <el-form-item label="可见角色">
            <el-select
              v-model="formData.visibleRoles"
              multiple
              filterable
              placeholder="选择可见角色"
              style="width: 100%;"
              @change="updateField('visibleRoles', $event)"
            >
              <el-option label="admin (管理员)" value="admin" />
              <el-option label="editor (编辑)" value="editor" />
              <el-option label="viewer (访客)" value="viewer" />
              <el-option label="guest (游客)" value="guest" />
            </el-select>
            <div class="form-tip">未选择任何角色时，所有角色都不可见</div>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item name="params" title="路由参数">
          <div class="section-header">
            <span>参数列表</span>
            <el-button type="primary" size="small" @click="addParam">
              <el-icon><Plus /></el-icon>
              添加参数
            </el-button>
          </div>
          
          <div v-if="formData.params.length === 0" class="empty-params">
            <el-icon size="48" color="#dcdfe6"><Setting /></el-icon>
            <p>暂无参数配置</p>
          </div>

          <div
            v-for="(param, index) in formData.params"
            :key="index"
            class="param-item"
          >
            <el-input
              v-model="param.key"
              placeholder="参数名"
              class="param-key"
              @input="updateParams"
            />
            <el-select
              v-model="param.type"
              placeholder="类型"
              class="param-type"
              @change="updateParams"
            >
              <el-option label="字符串" value="string" />
              <el-option label="数字" value="number" />
              <el-option label="布尔值" value="boolean" />
            </el-select>
            <el-checkbox
              v-model="param.required"
              label="必填"
              @change="updateParams"
            />
            <el-input
              v-model="param.default"
              placeholder="默认值"
              class="param-default"
              @input="updateParams"
            />
            <el-button
              type="danger"
              size="small"
              circle
              :icon="Delete"
              @click="removeParam(index)"
            />
          </div>
        </el-collapse-item>

        <el-collapse-item name="interceptor" title="路由拦截">
          <el-form-item label="启用拦截">
            <el-switch
              v-model="interceptorEnabled"
              active-text="启用"
              inactive-text="禁用"
              @change="toggleInterceptor"
            />
          </el-form-item>

          <div v-if="interceptorEnabled" class="interceptor-config">
            <el-form-item label="拦截类型">
              <el-select
                v-model="formData.interceptor.type"
                placeholder="请选择拦截类型"
                @change="updateInterceptor"
              >
                <el-option label="权限验证" value="auth" />
                <el-option label="登录验证" value="login" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="formData.interceptor.type === 'auth'" label="允许角色">
              <el-select
                v-model="formData.interceptor.roles"
                multiple
                filterable
                allow-create
                placeholder="选择或输入角色"
                @change="updateInterceptor"
              >
                <el-option label="admin" value="admin" />
                <el-option label="editor" value="editor" />
                <el-option label="viewer" value="viewer" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="formData.interceptor.type === 'custom'" label="自定义规则">
              <el-input
                v-model="formData.interceptor.rule"
                type="textarea"
                :rows="4"
                placeholder="例如: return user.level > 3"
                @input="updateInterceptor"
              />
            </el-form-item>

            <el-form-item label="跳转路径">
              <el-input
                v-model="formData.interceptor.redirect"
                placeholder="/preview/403"
                @input="updateInterceptor"
              />
            </el-form-item>
          </div>

          <div v-else class="interceptor-disabled">
            <el-icon size="48" color="#dcdfe6"><Lock /></el-icon>
            <p>路由拦截未启用</p>
          </div>
        </el-collapse-item>

        <el-collapse-item name="preview" title="配置预览">
          <div class="preview-content">
            <h4>JSON 配置</h4>
            <pre class="json-preview">{{ jsonPreview }}</pre>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useMenuStore } from '@/store/menu'
import IconSelector from './IconSelector.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const menuStore = useMenuStore()

const activePanels = ref(['basic'])

const formData = reactive({
  name: props.item.name,
  path: props.item.path,
  component: props.item.component,
  icon: props.item.icon,
  hidden: props.item.hidden,
  visibleRoles: JSON.parse(JSON.stringify(props.item.visibleRoles || ['admin', 'editor', 'viewer', 'guest'])),
  params: JSON.parse(JSON.stringify(props.item.params || [])),
  interceptor: props.item.interceptor ? JSON.parse(JSON.stringify(props.item.interceptor)) : null
})

const interceptorEnabled = ref(!!props.item.interceptor)

const hasErrors = computed(() => {
  return menuStore.errors[props.item.id] && menuStore.errors[props.item.id].length > 0
})

const itemErrors = computed(() => {
  return menuStore.errors[props.item.id] || []
})

const jsonPreview = computed(() => {
  return JSON.stringify({
    id: props.item.id,
    name: formData.name,
    path: formData.path,
    component: formData.component,
    icon: formData.icon,
    hidden: formData.hidden,
    visibleRoles: formData.visibleRoles,
    params: formData.params,
    interceptor: formData.interceptor
  }, null, 2)
})

watch(() => props.item, (newItem) => {
  formData.name = newItem.name
  formData.path = newItem.path
  formData.component = newItem.component
  formData.icon = newItem.icon
  formData.hidden = newItem.hidden
  formData.visibleRoles = JSON.parse(JSON.stringify(newItem.visibleRoles || ['admin', 'editor', 'viewer', 'guest']))
  formData.params = JSON.parse(JSON.stringify(newItem.params || []))
  formData.interceptor = newItem.interceptor ? JSON.parse(JSON.stringify(newItem.interceptor)) : null
  interceptorEnabled.value = !!newItem.interceptor
}, { deep: true })

function updateField(field, value) {
  menuStore.updateMenuItem(props.item.id, { [field]: value })
}

function updateParams() {
  menuStore.updateMenuItem(props.item.id, { params: JSON.parse(JSON.stringify(formData.params)) })
}

function addParam() {
  formData.params.push({
    key: '',
    type: 'string',
    required: false,
    default: ''
  })
  updateParams()
}

function removeParam(index) {
  formData.params.splice(index, 1)
  updateParams()
}

function toggleInterceptor(enabled) {
  if (enabled) {
    formData.interceptor = {
      type: 'auth',
      roles: [],
      redirect: '/preview/403'
    }
  } else {
    formData.interceptor = null
  }
  updateInterceptor()
}

function updateInterceptor() {
  menuStore.updateMenuItem(props.item.id, {
    interceptor: formData.interceptor ? JSON.parse(JSON.stringify(formData.interceptor)) : null
  })
}
</script>

<style scoped>
.menu-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.form-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.form-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.error-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-content {
  padding: 24px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  color: #303133;
}

.empty-params,
.interceptor-disabled {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  gap: 12px;
}

.param-item {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.param-key {
  flex: 1;
}

.param-type {
  width: 100px;
}

.param-default {
  width: 120px;
}

.interceptor-config {
  padding-top: 16px;
}

.preview-content {
  padding: 16px 0;
}

.preview-content h4 {
  margin: 0 0 12px 0;
  color: #606266;
}

.json-preview {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 300px;
  margin: 0;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-collapse-item__content) {
  padding-top: 8px;
}
</style>
