/**
 * 微服务前缀常量
 * 在这里集中维护所有后端服务在网关中的前缀
 */
export const SERVICE = {
  USERCENTER: '/usercenter',
  BASE: '/base',
} as const

export type ServicePrefix = (typeof SERVICE)[keyof typeof SERVICE]

