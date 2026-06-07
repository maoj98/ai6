<template>
  <div class="statistics-page">
    <el-row :gutter="24" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-header">
            <span class="stat-label">总访问量</span>
            <el-icon class="stat-icon blue"><DataLine /></el-icon>
          </div>
          <div class="stat-value">128,456</div>
          <div class="stat-trend up">
            <el-icon><Top /></el-icon>
            12.5%
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-header">
            <span class="stat-label">活跃用户</span>
            <el-icon class="stat-icon green"><User /></el-icon>
          </div>
          <div class="stat-value">3,248</div>
          <div class="stat-trend up">
            <el-icon><Top /></el-icon>
            8.2%
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-header">
            <span class="stat-label">订单数量</span>
            <el-icon class="stat-icon orange"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-value">1,256</div>
          <div class="stat-trend down">
            <el-icon><Bottom /></el-icon>
            3.1%
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-header">
            <span class="stat-label">营收金额</span>
            <el-icon class="stat-icon purple"><Money /></el-icon>
          </div>
          <div class="stat-value">¥89,520</div>
          <div class="stat-trend up">
            <el-icon><Top /></el-icon>
            15.8%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>访问趋势</span>
          </template>
          <div class="chart-placeholder">
            <el-icon size="64" color="#dcdfe6"><TrendCharts /></el-icon>
            <p>图表区域（可接入 ECharts 等图表库）</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>热门页面</span>
          </template>
          <div class="hot-pages">
            <div v-for="(page, index) in hotPages" :key="page.name" class="hot-page-item">
              <div class="page-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="page-info">
                <div class="page-name">{{ page.name }}</div>
                <div class="page-views">{{ page.views }} 次访问</div>
              </div>
              <el-progress :percentage="page.percent" :show-text="false" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hotPages = ref([
  { name: '首页', views: 45678, percent: 95 },
  { name: '用户管理', views: 23456, percent: 75 },
  { name: '数据统计', views: 18234, percent: 60 },
  { name: '角色管理', views: 12567, percent: 45 },
  { name: '系统设置', views: 8934, percent: 30 }
])
</script>

<style scoped>
.statistics-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 8px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-icon {
  font-size: 24px;
}

.stat-icon.blue { color: #409eff; }
.stat-icon.green { color: #67c23a; }
.stat-icon.orange { color: #e6a23c; }
.stat-icon.purple { color: #909399; }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  gap: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.hot-pages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hot-page-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.page-rank.rank-1 { background: #f56c6c; }
.page-rank.rank-2 { background: #e6a23c; }
.page-rank.rank-3 { background: #67c23a; }
.page-rank.rank-4, .page-rank.rank-5 { background: #909399; }

.page-info {
  flex: 1;
}

.page-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.page-views {
  font-size: 12px;
  color: #909399;
}
</style>
