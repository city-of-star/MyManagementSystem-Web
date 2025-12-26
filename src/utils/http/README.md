# HTTP 请求模块

本模块提供了完整的 HTTP 请求封装，包括 Axios 实例配置、拦截器、错误处理和 Token 刷新等功能。

## 文件结构

```
http/
├── request.ts                   # 统一导出入口（向后兼容）
├── README.md                    # 文档
├── config/                      # 配置模块
│   ├── index.ts                # 统一导出
│   ├── config.ts                # 技术配置（API_BASE_URL, SUCCESS_CODE, HTTP_ERROR_MAP）
│   └── serviceConfig.ts         # 微服务前缀配置（SERVICE）
├── types/                       # 类型定义模块
│   ├── index.ts                # 统一导出
│   └── type.ts                 # 类型定义（HttpResponse, BusinessError, NetworkError）
├── core/                        # 核心模块
│   └── instance.ts             # Axios 实例创建和拦截器注册
├── client/                      # 客户端封装模块
│   └── index.ts                # HTTP 请求方法（httpGet, httpPost 等）
├── error/                       # 错误处理模块（UI层）
│   └── index.ts                # UI 层错误处理（Toast、Modal）
├── utils/                       # 工具函数模块
│   └── index.ts                # 工具函数（handleUnauthorized）
├── interceptors/               # 拦截器模块
│   ├── request.ts              # 请求拦截器（添加 Authorization header）
│   ├── response.ts             # 响应拦截器（成功/错误处理）
│   └── error/                  # 错误处理模块（拦截器层）
│       ├── index.ts            # 错误处理模块导出
│       ├── types.ts            # 错误类型守卫
│       ├── httpError.ts        # HTTP 错误处理（有响应）
│       ├── 401Error.ts         # 401 错误处理（Token 刷新）
│       └── networkError.ts     # 网络错误处理（无响应）
└── token/                       # Token 管理模块
    ├── types.ts                # Token 相关类型定义
    ├── queue.ts                # Token 刷新队列管理（防止并发刷新）
    ├── refresh.ts              # Token 刷新逻辑
    └── retry.ts                 # Token 刷新后重试请求
```

## 模块职责

### 核心模块

- **config/**: 集中管理所有配置和常量
  - `config.ts`: 技术配置（API_BASE_URL, SUCCESS_CODE, HTTP_ERROR_MAP）
  - `serviceConfig.ts`: 业务配置（微服务前缀 SERVICE）
- **types/**: 类型定义和错误类
- **core/instance.ts**: 创建 Axios 实例并注册拦截器
- **request.ts**: 统一导出入口，保持向后兼容

### 客户端模块

- **client/**: 提供便捷的 HTTP 请求方法（httpGet, httpPost 等）

### 拦截器模块

- **interceptors/request.ts**: 请求拦截器，自动添加认证 Token
- **interceptors/response.ts**: 响应拦截器，处理成功响应和错误分发
- **interceptors/error/**: 拦截器层错误处理模块
  - **httpError.ts**: 处理有响应的 HTTP 错误
  - **401Error.ts**: 处理 401 错误，自动刷新 Token 并重试
  - **networkError.ts**: 处理网络错误（超时、连接失败等）

### Token 管理模块

- **token/queue.ts**: Token 刷新队列管理，防止并发刷新
- **token/refresh.ts**: Token 刷新逻辑
- **token/retry.ts**: Token 刷新后重试原始请求

### 错误处理模块

- **error/**: UI 层错误处理（Toast、Modal 提示）

### 工具模块

- **utils/**: 通用工具函数（handleUnauthorized）

## 使用方式

### 基础使用

```typescript
import { http } from '@/utils/http/request'

// 直接使用 Axios 实例
const response = await http.get('/api/users')
```

### 使用封装的请求方法

```typescript
import { httpGet, httpPost, SERVICE } from '@/utils/http/request'

// GET 请求
const users = await httpGet<User[]>(SERVICE.USERCENTER, '/users')

// POST 请求
const result = await httpPost<CreateResult>(SERVICE.USERCENTER, '/users', { name: 'John' })
```

### 错误处理

```typescript
import { handleErrorToast, handleErrorModal } from '@/utils/http/request'

try {
  await httpPost(SERVICE.USERCENTER, '/users', data)
} catch (error) {
  // Toast 提示（默认方式）
  handleErrorToast(error, '保存失败')
  
  // 或弹窗提示（关键操作）
  handleErrorModal(error, '删除失败', '确定要删除吗？')
}
```

## 设计原则

1. **单一职责**: 每个文件只负责一个明确的功能
2. **模块化**: 按功能拆分到不同文件夹，便于维护和测试
3. **向后兼容**: `request.ts` 保持原有导出，不影响现有代码
4. **类型安全**: 完整的 TypeScript 类型定义
5. **避免循环依赖**: 通过参数传递解决依赖问题
6. **清晰的目录结构**: 所有文件按职责分类到对应文件夹

## 注意事项

- Token 刷新采用队列机制，防止并发刷新
- 401 错误会自动尝试刷新 Token 并重试请求
- 如果 Token 刷新失败，会自动跳转到登录页
- 错误处理分为业务错误（BusinessError）和网络错误（NetworkError）
- 所有导出都通过 `request.ts` 统一管理，保持向后兼容
