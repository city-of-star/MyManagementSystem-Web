import { httpPost } from '../../utils/http/request.ts'
import { SERVICE } from '../../config/http/serviceConfig.ts'

// 登录请求 DTO
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应 VO
export interface LoginVo {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
}

// 登出请求 DTO
export interface LogoutRequest {
  refreshToken: string
}

/**
 * 用户登录接口
 */
export function login(payload: LoginRequest): Promise<LoginVo> {
  return httpPost<LoginVo>(SERVICE.USERCENTER, '/auth/login', payload)
}

/**
 * 用户登出接口
 */
export function logout(payload: LogoutRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/auth/logout', payload)
}

