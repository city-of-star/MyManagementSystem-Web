import { httpPost, type HttpResponse } from '../utils/request'

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
export function loginApi(payload: LoginRequest): Promise<HttpResponse<LoginVo>> {
  return httpPost<LoginVo>('/auth/login', payload)
}

/**
 * 用户登出接口
 */
export function logoutApi(payload: LogoutRequest): Promise<HttpResponse<void>> {
  return httpPost<void>('/auth/logout', payload)
}

