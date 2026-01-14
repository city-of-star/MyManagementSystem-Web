## MMS 管理系统前端（MyManagementSystem-Web）

一个基于 **Vue 3 + TypeScript + Vite** 的后台管理前端项目，对应后端 **MMS 管理系统**，用于实现：

- 用户管理、角色管理、权限管理
- 数据字典管理、系统配置管理
- 基础业务功能展示与操作

前端通过网关与后端微服务（`gateway` / `usercenter` / `base`）进行交互，实现完整的 RBAC 权限管理与系统管理能力。

---

## 项目简介

- **定位**：企业级管理后台前端界面  
- **架构**：前后端分离，前端只负责 UI 与接口调用，所有业务能力由后端微服务提供  
- **对接后端服务**（参考后端仓库 `MyManagementSystem-Backend`）：
  - 网关服务：`mms-gateway-bc`（默认端口 `5092`）
  - 用户中心服务：`mms-usercenter-bc`（网关前缀 `/usercenter`）
  - 基础数据服务：`mms-base-bc`（网关前缀 `/base`）

前端遵循后端统一的认证（JWT + Token 刷新）、鉴权（RBAC）和响应规范，通过 HTTP 模块与各微服务进行通信。

---

## 技术栈

### 核心框架

- **Vue 3**：组合式 API，`<script setup>` 写法
- **TypeScript**：类型安全支持
- **Vite**：开发与构建工具

### UI 与交互

- **Element Plus**：基础组件库
- **@element-plus/icons-vue**：图标组件
- **@vueup/vue-quill / quill**：富文本编辑（如相关页面使用）
- **ECharts**：数据可视化图表
- **NProgress**：路由切换进度条

### 路由与状态管理

- **Vue Router 4**：前端路由管理（见 `src/router/index.ts`）
- **Pinia 3**：状态管理（`src/store`，包含 `auth` / `menu` / `tabs` 等模块）

### HTTP 与工具

- **Axios**：HTTP 客户端
- 自封装 HTTP 模块：`src/utils/http`（统一拦截器、错误处理、Token 管理、服务前缀）

---

## 与后端服务协同

### 微服务前缀（Service Prefix）

在 `src/utils/http/config.ts` 中，集中维护了当前项目前端对接的后端服务前缀：

- `SERVICE.USERCENTER = '/usercenter'`：用户中心服务
- `SERVICE.BASE = '/base'`：基础数据服务

前端 API 调用时，统一通过服务前缀 + 具体路径访问网关，例如：

- 用户相关接口：`/usercenter/...`
- 字典、系统配置等接口：`/base/...`

示例（伪代码）：

```ts
import { httpGet, SERVICE } from '@/utils/http'

// 从用户中心查询用户列表
await httpGet(SERVICE.USERCENTER, '/api/user/list')
```

### 开发环境代理（避免跨域）

在 `vite.config.ts` 中配置了开发环境代理：

- `/usercenter` → `http://localhost:5092`
- `/base` → `http://localhost:5092`

> 因此，**本地开发时需要先确保后端网关服务 `mms-gateway-bc` 在 `5092` 端口启动**，并正确路由到 `usercenter`、`base` 等微服务。

---

## 项目结构（前端）

```text
MyManagementSystem-Web
├─ index.html
├─ public
│  └─ mms.svg                     # 公共静态资源（logo）
├─ src
│  ├─ main.ts                     # 入口文件
│  ├─ App.vue                     # 根组件
│  ├─ router
│  │  └─ index.ts                 # 路由配置
│  ├─ layouts                     # 布局相关组件
│  │  ├─ Layout.vue
│  │  ├─ LayoutHeader.vue
│  │  ├─ LayoutSidebar.vue
│  │  └─ LayoutTabs.vue
│  ├─ store                       # 全局状态（Pinia）
│  │  ├─ auth/                    # 认证与用户信息
│  │  ├─ menu/                    # 菜单状态
│  │  └─ tabs/                    # 多标签页状态
│  ├─ api                         # 与后端交互的 API 模块
│  │  ├─ auth/                    # 登录、刷新 Token 等
│  │  └─ system/                  # 系统管理相关（用户/角色/字典/配置等）
│  ├─ utils
│  │  ├─ http/                    # HTTP 请求封装（Axios 实例、拦截器、Token 管理等）
│  │  └─ base/                    # 通用工具（如字典工具等）
│  ├─ config
│  │  └─ app/appConfig.ts         # 应用基础配置（标题、主题色、logo 等）
│  ├─ views
│  │  ├─ auth/Login.vue           # 登录页面
│  │  ├─ system/user/UserPage.vue # 用户管理
│  │  ├─ system/role/RolePage.vue # 角色管理
│  │  ├─ system/dict/DictPage.vue # 字典管理
│  │  ├─ system/config/ConfigPage.vue # 系统配置管理
│  │  └─ test/TestPage.vue        # 示例测试页
│  └─ style.css                   # 全局样式
└─ vite.config.ts                 # Vite 配置（含开发代理）
```

---

## 核心功能概览

- **认证登录**
  - 页面：`src/views/auth/Login.vue`
  - 依赖模块：`src/api/auth`、`src/store/auth`
  - 功能：用户登录、Token 缓存、登录态维护等

- **菜单 & 标签页布局**
  - 布局组件：`Layout.vue` / `LayoutHeader.vue` / `LayoutSidebar.vue` / `LayoutTabs.vue`
  - 状态管理：`src/store/menu`、`src/store/tabs`
  - 工具：`src/utils/menu/menuUtils.ts`

- **系统管理模块**
  - 用户管理：`views/system/user/UserPage.vue`，API：`api/system/user/user.ts`
  - 角色管理：`views/system/role/RolePage.vue`，API：`api/system/role/role.ts`
  - 权限 / 菜单管理：`views/system/menu/MenuPage.vue`，API：`api/system/permission`、`api/system/role`
  - 数据字典：`views/system/dict/DictPage.vue`，API：`api/system/dict`
  - 系统配置：`views/system/config/ConfigPage.vue`，API：`api/system/config/config.ts`

- **HTTP 请求模块（统一封装）**
  - 目录：`src/utils/http`
  - 说明文档：`src/utils/http/README.md`
  - 特性：
    - 统一 Axios 实例与拦截器
    - 自动附加 Token、处理 401 并刷新 Token
    - 统一错误提示（Toast / Modal / Silent）
    - 统一响应结构 `HttpResponse<T>` 与错误类型

---

## 环境要求

- **Node.js**：建议 `18+`
- **包管理工具**：`npm` / `pnpm` / `yarn`（示例以 `npm` 为主）
- **后端依赖**：
  - 已按后端仓库 `MyManagementSystem-Backend` 的 README 完成数据库、Nacos、Redis 等配置
  - 网关服务 `mms-gateway-bc` 已在本地或远程可访问（默认 `http://localhost:5092`）

---

## 本地运行与调试

在前端项目根目录（`MyManagementSystem-Web`）执行：

```bash
# 1. 安装依赖
npm install

# 2. 启动开发环境（默认端口一般为 5173，具体以控制台输出为准）
npm run dev

# 3. 构建生产环境
npm run build

# 4. 本地预览构建产物
npm run preview
```

> 启动前，请确保后端网关服务已启动，并可通过 `http://localhost:5092` 访问。

---

## 配置说明

### 1. 应用配置（前端自身）

- 文件：`src/config/app/appConfig.ts`
- 主要配置项：
  - `title`：系统标题
  - `logoPath`：左上角 Logo 路径
  - `themeColors` / `defaultThemeColor`：主题色配置
  - `version`：前端版本号

### 2. HTTP 与环境变量

- 文件：`src/utils/http/config.ts`
- 相关环境变量（通过 `import.meta.env` 注入）：

  - `VITE_API_BASE_URL`：Axios 的 `baseURL`
    - 开发环境通常可以留空或与网关地址一致（通过 Vite 代理解决跨域）。
  - `VITE_SUCCESS_CODE`：后端约定的“业务成功”状态码（默认 `200`）。

示例（本地开发） `.env.development` 配置可参考：

```bash
VITE_API_BASE_URL=
VITE_SUCCESS_CODE=200
```

> 实际值请与后端约定保持一致，避免前后端状态码不匹配导致业务处理异常。

---

## 开发约定

- **HTTP 调用**
  - 统一通过 `src/utils/http` 导出的 `httpGet`、`httpPost` 等方法发起请求；
  - 统一使用 `SERVICE.USERCENTER` / `SERVICE.BASE` 等服务前缀，避免在各处硬编码字符串。

- **页面开发**
  - 在 `src/views` 下新增页面组件；
  - 在 `src/router/index.ts` 中配置对应路由；
  - 如需出现在侧边菜单，维护菜单数据或对接后端菜单接口。

- **状态管理**
  - 与认证、菜单、标签页相关的状态统一通过 Pinia 管理，减少组件间复杂的 props 传递。

---

## 目录说明（前端相关补充）

- `public/`：静态资源目录（打包时会被直接拷贝）
- `src/api/`：按业务域划分的接口定义层，负责组织请求参数与响应类型
- `src/utils/http/`：HTTP 核心封装（详情见目录内 `README.md`）
- `src/views/system/`：对应后端 `usercenter` / `base` 服务的系统管理页面

---

## 学习与参考

结合后端仓库 `MyManagementSystem-Backend`，这个前后端项目非常适合用于：

- 学习 **前后端分离 + 微服务架构** 的完整实践
- 理解 JWT + Token 刷新 + 网关转发 的认证流程
- 学习如何封装一个类型安全、职责清晰的前端 HTTP 模块
- 结合 RBAC 模型，扩展前端菜单、按钮级权限等

参考文档：

- Vue 3 官方文档：`https://vuejs.org/`
- Vue + TypeScript 指南：`https://vuejs.org/guide/typescript/overview.html`
- Vite 文档：`https://vitejs.dev/`
- Element Plus 文档：`https://element-plus.org/`

---

## 联系方式

- **开发团队**: MMS开发团队
- **邮箱**: 2722562862@qq.com
- **项目主页**: https://github.com/city-of-star/MyManagementSystem-Backend

## 许可证

本项目采用 [MIT License](LICENSE) 许可证，详见LICENSE文件

