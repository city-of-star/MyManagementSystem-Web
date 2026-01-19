# HTTP 请求模块

## 📁 文件结构

```
http/
├── index.ts              # 统一导出入口（主入口文件）
├── instance.ts           # Axios 实例创建和拦截器注册
├── interceptors.ts       # 所有拦截器逻辑（请求+响应+错误处理）
├── token.ts              # Token 刷新相关逻辑（队列+刷新+重试）
├── error.ts              # UI 层错误处理（Toast、Modal）
├── client.ts             # HTTP 请求方法封装（httpGet, httpPost 等）
├── config.ts             # 配置和常量（API地址、状态码、错误映射等）
├── types.ts              # 类型定义和错误类（HttpResponse, BusinessError, NetworkError）
└── utils.ts              # 工具函数（handleUnauthorized）
```

## 🎯 设计原则

1. **扁平化结构**：文件数量精简，易于理解
2. **职责清晰**：每个文件负责一个明确的功能模块
3. **易于维护**：相关逻辑集中在一个文件中，修改时不需要跳转多个文件
4. **易于追踪**：从 `index.ts` 开始，按需查看

## 📖 文件说明

### 1. `index.ts` - 统一导出入口
**作用**：导出所有对外暴露的内容，提供清晰的 API 文档注释

**导出内容**：
- `http`: Axios 实例
- `httpGet`, `httpPost` 等请求方法
- `handleErrorToast` 等错误处理方法
- 类型定义和配置常量

### 2. `instance.ts` - Axios 实例
**作用**：创建 Axios 实例并注册拦截器

**核心功能**：
- 创建 Axios 实例
- 配置基础设置（baseURL、timeout 等）
- 注册请求拦截器（添加 Token）
- 注册响应拦截器（处理成功响应和错误）

### 3. `interceptors.ts` - 拦截器逻辑
**作用**：所有拦截器逻辑集中在一个文件中

**包含内容**：
- **请求拦截器**：自动添加 Authorization header
- **响应拦截器**：处理成功响应和业务错误
- **错误拦截器**：处理各种错误（401、网络错误等）
  - 401 错误：自动刷新 Token 并重试
  - 网络错误：超时、连接失败等
  - 其他 HTTP 错误：403、404、500 等

**优势**：所有拦截器逻辑集中在一个文件中，便于理解和维护

### 4. `token.ts` - Token 刷新逻辑
**作用**：Token 刷新相关逻辑集中在一个文件中

**包含内容**：
- **Token 刷新队列管理**：防止并发刷新
- **Token 刷新逻辑**：调用刷新接口并更新存储
- **Token 刷新后重试请求**：使用新 Token 重试原始请求

**优势**：所有 Token 相关逻辑集中在一个文件中，便于追踪和理解

### 5. `error.ts` - UI 层错误处理
**作用**：UI 层错误处理（Toast 提示）

**提供方法**：
- `handleErrorToast`: Toast 提示（默认方式）
- `handleErrorSilent`: 静默处理（不显示提示）

### 6. `client.ts` - HTTP 请求方法
**作用**：提供便捷的 HTTP 请求方法

**提供方法**：
- `httpGet`: GET 请求
- `httpPost`: POST 请求
- `httpPut`: PUT 请求
- `httpPatch`: PATCH 请求
- `httpDelete`: DELETE 请求

### 7. `config.ts` - 配置和常量
**作用**：集中管理所有配置和常量

**包含内容**：
- API 基础地址
- 成功状态码
- HTTP 错误映射表
- 请求超时时间
- 微服务前缀配置

### 8. `types.ts` - 类型定义
**作用**：类型定义和错误类

**包含内容**：
- `HttpResponse`: 统一响应接口
- `BusinessError`: 业务错误类
- `NetworkError`: 网络错误类

### 9. `utils.ts` - 工具函数
**作用**：通用工具函数

**包含内容**：
- `handleUnauthorized`: 处理未授权（清除 Token 并跳转登录）

## 🚀 使用方式

### 方式1：使用 Axios 实例

```typescript
import { http } from '@/utils/http'

const response = await http.get('/api/users')
```

### 方式2：使用封装的请求方法（推荐）

```typescript
import { httpGet, httpPost, SERVICE } from '@/utils/http'

// GET 请求
const users = await httpGet<User[]>(SERVICE.USERCENTER, '/users')

// POST 请求
const result = await httpPost<CreateResult>(SERVICE.USERCENTER, '/users', {
  name: 'John',
})
```

### 方式3：错误处理

```typescript
import { handleErrorToast } from '@/utils/http'

try {
  await httpPost(SERVICE.USERCENTER, '/users', data)
} catch (error) {
  // Toast 提示（默认方式）
  handleErrorToast(error, '保存失败')
}
```

## ✨ 核心特性

1. **自动 Token 刷新**：401 错误时自动刷新 Token 并重试请求
2. **防止并发刷新**：采用队列机制，防止多个请求同时刷新 Token
3. **智能错误处理**：区分业务错误和网络错误，提供不同的处理方式
4. **统一响应格式**：所有响应统一为 `HttpResponse<T>` 格式
5. **类型安全**：完整的 TypeScript 类型定义

## 📝 注意事项

- Token 刷新采用队列机制，防止并发刷新
- 401 错误会自动尝试刷新 Token 并重试请求
- 如果 Token 刷新失败，会自动跳转到登录页
- 错误处理分为业务错误（BusinessError）和网络错误（NetworkError）
- 所有导出都通过 `index.ts` 统一管理
