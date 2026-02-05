<script setup lang="ts">
import {
  ElCard,
  ElRow,
  ElCol,
  ElTag,
  ElDescriptions,
  ElDescriptionsItem,
  ElIcon
} from 'element-plus'
import {
  User,
  Lock,
  Setting,
  Connection,
  DataAnalysis,
  Files,
  Tools,
  OfficeBuilding,
  Menu,
  Briefcase,
  Document
} from '@element-plus/icons-vue'
import { ref } from 'vue'
import QuillEditor from '@/components/quill/QuillEditor.vue'
import FileUpload, { type AttachmentItem } from '@/components/upload/FileUpload.vue'
import { appConfig } from '@/config/app/appConfig'

// 首页富文本内容示例
const homeIntro = ref<string>('<p>这里是首页的富文本示例内容，可以在此编辑系统简介。</p>')

// 附件列表示例
const attachments = ref<AttachmentItem[]>([])

// 系统功能模块（根据实际菜单配置）
const systemModules = [
  {
    title: '用户管理',
    icon: User,
    description: '用户信息管理、用户状态控制、用户登录日志记录',
    color: '#409EFF'
  },
  {
    title: '角色管理',
    icon: Lock,
    description: '角色信息管理、角色权限分配、RBAC权限模型',
    color: '#67C23A'
  },
  {
    title: '菜单管理',
    icon: Menu,
    description: '权限菜单管理、目录/菜单/按钮/接口权限配置',
    color: '#E6A23C'
  },
  {
    title: '部门管理',
    icon: OfficeBuilding,
    description: '部门信息管理、组织架构树形展示、部门层级关系',
    color: '#F56C6C'
  },
  {
    title: '岗位管理',
    icon: Briefcase,
    description: '岗位信息管理、岗位等级设置、岗位状态控制',
    color: '#909399'
  },
  {
    title: '系统配置',
    icon: Setting,
    description: '系统参数配置、配置项管理、动态配置更新',
    color: '#606266'
  },
  {
    title: '数据字典',
    icon: Files,
    description: '字典类型管理、字典数据维护、字典数据查询',
    color: '#9C27B0'
  }
]

// 后端技术栈
const backendTech = [
  { name: 'Spring Boot 3.2.4', type: 'success' },
  { name: 'Spring Cloud 2023.0.1', type: 'success' },
  { name: 'Spring Cloud Alibaba', type: 'success' },
  { name: 'Nacos', type: 'info' },
  { name: 'Spring Cloud Gateway', type: 'info' },
  { name: 'MyBatis Plus', type: 'warning' },
  { name: 'MySQL 8.0', type: 'warning' },
  { name: 'Redis', type: 'warning' },
  { name: 'JWT + RSA', type: 'danger' },
  { name: 'OpenFeign', type: '' },
  { name: 'Knife4j', type: '' }
]

// 前端技术栈
const frontendTech = [
  { name: 'Vue 3', type: 'success' },
  { name: 'TypeScript', type: 'success' },
  { name: 'Vite', type: 'success' },
  { name: 'Element Plus', type: 'info' },
  { name: 'Vue Router 4', type: 'info' },
  { name: 'Pinia', type: 'info' },
  { name: 'Axios', type: 'warning' },
  { name: 'ECharts', type: 'warning' }
]

// 微服务架构
const microservices = [
  {
    name: '网关服务 (Gateway)',
    port: '5092',
    description: '统一API入口、路由转发、JWT+RSA双重鉴权、链路追踪',
    icon: Connection
  },
  {
    name: '用户中心服务 (UserCenter)',
    port: '5090',
    description: '用户管理、角色权限管理、登录认证、Token管理',
    icon: User
  },
  {
    name: '基础数据服务 (Base)',
    port: '5091',
    description: '数据字典管理、系统配置管理、基础业务数据维护',
    icon: DataAnalysis
  }
]
</script>

<template>

  <!-- 首页富文本编辑器示例 -->
  <el-card class="section-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon :size="20" style="margin-right: 8px; color: #409EFF">
          <Document />
        </el-icon>
        <span>首页简介（富文本示例）</span>
      </div>
    </template>
    <QuillEditor v-model="homeIntro" />
  </el-card>

  <!-- 附件上传示例 -->
  <el-card class="section-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon :size="20" style="margin-right: 8px; color: #67C23A">
          <Files />
        </el-icon>
        <span>附件上传示例</span>
      </div>
    </template>
    <FileUpload
      v-model="attachments"
      upload-url="/api/files/upload"
      :max-size="10"
      :max-count="5"
      :accept="['doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx', 'jpg', 'png']"
      @upload-success="(file) => console.log('上传成功:', file)"
      @upload-error="(error) => console.error('上传失败:', error)"
      @remove="(file) => console.log('删除文件:', file)"
    />
  </el-card>

  <!-- 系统标题区域 -->
  <el-card class="welcome-card" shadow="hover">
    <div class="welcome-header">
      <div class="welcome-content">
        <h1 class="system-title">
          <el-icon :size="32" style="margin-right: 12px; color: #409EFF">
            <OfficeBuilding />
          </el-icon>
          {{ appConfig.title }}
        </h1>
        <p class="system-subtitle">企业级微服务管理系统</p>
        <p class="system-description">
          基于 Spring Cloud 微服务架构，提供完整的 RBAC 权限管理体系，
          支持用户管理、角色权限、数据字典、系统配置等企业级功能。
        </p>
      </div>
      <div class="version-badge">
        <el-tag type="info" size="large">{{ appConfig.version }}</el-tag>
      </div>
    </div>
  </el-card>

  <!-- 系统功能模块 -->
  <el-card class="section-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon :size="20" style="margin-right: 8px; color: #409EFF">
          <Tools />
        </el-icon>
        <span>核心功能模块</span>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col
        v-for="(module, index) in systemModules"
        :key="index"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
        style="margin-bottom: 20px"
      >
        <el-card class="module-card" shadow="hover" :body-style="{ padding: '20px' }">
          <div class="module-icon" :style="{ backgroundColor: module.color + '20' }">
            <el-icon :size="32" :style="{ color: module.color }">
              <component :is="module.icon" />
            </el-icon>
          </div>
          <h3 class="module-title">{{ module.title }}</h3>
          <p class="module-description">{{ module.description }}</p>
        </el-card>
      </el-col>
    </el-row>
  </el-card>

  <!-- 微服务架构 -->
  <el-card class="section-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon :size="20" style="margin-right: 8px; color: #67C23A">
          <Connection />
        </el-icon>
        <span>微服务架构</span>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col
        v-for="(service, index) in microservices"
        :key="index"
        :xs="24"
        :sm="24"
        :md="8"
        :lg="8"
      >
        <el-card class="service-card" shadow="hover">
          <div class="service-header">
            <el-icon :size="24" style="color: #409EFF; margin-right: 8px">
              <component :is="service.icon" />
            </el-icon>
            <div>
              <h4 class="service-name">{{ service.name }}</h4>
              <el-tag type="info" size="small">端口: {{ service.port }}</el-tag>
            </div>
          </div>
          <p class="service-description">{{ service.description }}</p>
        </el-card>
      </el-col>
    </el-row>
  </el-card>

  <!-- 技术栈 -->
  <el-row :gutter="20">
    <el-col :xs="24" :sm="24" :md="12" :lg="12">
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20" style="margin-right: 8px; color: #E6A23C">
              <Setting />
            </el-icon>
            <span>后端技术栈</span>
          </div>
        </template>
        <div class="tech-tags">
          <el-tag
            v-for="(tech, index) in backendTech"
            :key="index"
            :type="tech.type as any"
            size="large"
            style="margin: 8px"
          >
            {{ tech.name }}
          </el-tag>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="24" :md="12" :lg="12">
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20" style="margin-right: 8px; color: #F56C6C">
              <Setting />
            </el-icon>
            <span>前端技术栈</span>
          </div>
        </template>
        <div class="tech-tags">
          <el-tag
            v-for="(tech, index) in frontendTech"
            :key="index"
            :type="tech.type as any"
            size="large"
            style="margin: 8px"
          >
            {{ tech.name }}
          </el-tag>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 系统特性 -->
  <el-card class="section-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon :size="20" style="margin-right: 8px; color: #909399">
          <Document />
        </el-icon>
        <span>系统特性</span>
      </div>
    </template>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="架构设计">
        <el-tag type="success">微服务架构</el-tag>
        <el-tag type="info" style="margin-left: 8px">前后端分离</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="安全认证">
        <el-tag type="danger">JWT + RSA双重认证</el-tag>
        <el-tag type="warning" style="margin-left: 8px">Token刷新机制</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="权限模型">
        <el-tag type="success">RBAC权限模型</el-tag>
        <el-tag type="info" style="margin-left: 8px">菜单级权限控制</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="服务治理">
        <el-tag type="info">Nacos注册中心</el-tag>
        <el-tag type="info" style="margin-left: 8px">配置中心</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="数据管理">
        <el-tag type="warning">MyBatis Plus</el-tag>
        <el-tag type="warning" style="margin-left: 8px">逻辑删除</el-tag>
        <el-tag type="warning" style="margin-left: 8px">审计功能</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="开发规范">
        <el-tag>统一响应格式</el-tag>
        <el-tag style="margin-left: 8px">全局异常处理</el-tag>
        <el-tag style="margin-left: 8px">链路追踪</el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style scoped>
.welcome-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.welcome-card :deep(.el-card__body) {
  padding: 40px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: white;
}

.welcome-content {
  flex: 1;
}

.system-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  color: white;
}

.system-subtitle {
  font-size: 18px;
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.system-description {
  font-size: 16px;
  line-height: 1.8;
  margin: 0;
  opacity: 0.85;
  max-width: 800px;
}

.version-badge {
  margin-left: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.module-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.module-card:hover {
  transform: translateY(-5px);
}

.module-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
}

.module-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.service-card {
  height: 100%;
}

.service-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.service-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
  }

  .version-badge {
    margin-left: 0;
    margin-top: 16px;
  }

  .system-title {
    font-size: 24px;
  }

  .system-subtitle {
    font-size: 16px;
  }

  .system-description {
    font-size: 14px;
  }
}
</style>
