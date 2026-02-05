import { httpPost, SERVICE } from '@/utils/http'
import type { UserDetailVo } from "@/api/system/user/user.ts";

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

// 刷新Token请求 DTO
export interface RefreshTokenRequest {
  refreshToken: string
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
 * 刷新Token接口
 */
export function refreshToken(payload: RefreshTokenRequest): Promise<LoginVo> {
  return httpPost<LoginVo>(SERVICE.USERCENTER, '/auth/refresh', payload)
}

/**
 * 用户登出接口
 */
export function logout(payload: LogoutRequest): Promise<void> {
  return httpPost<void>(SERVICE.USERCENTER, '/auth/logout', payload)
}

/**
 * 获取当前用户信息接口
 */
export function getCurrentUser(): Promise<UserDetailVo> {
  return httpPost<UserDetailVo>(SERVICE.USERCENTER, '/auth/getCurrentUser')
}
