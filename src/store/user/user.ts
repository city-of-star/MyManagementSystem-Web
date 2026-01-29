import { defineStore } from 'pinia'
import type { UserVo } from '@/api/system/user/user'

const USER_STORAGE_KEY = 'currentUser'

const defaultState: UserVo = {
  id: 0,
  username: '',
  nickname: '',
  realName: '',
  avatar: '',
  email: '',
  phone: '',
  gender: 0,
  birthday: '',
  status: 0,
  locked: 0,
  lockTime: '',
  lockReason: '',
  lastLoginTime: '',
  lastLoginIp: '',
  passwordUpdateTime: '',
  remark: '',
  createBy: 0,
  createTime: '',
  updateBy: 0,
  updateTime: '',
}

export const useUserStore = defineStore('user', {
  state: (): UserVo => {
    const cached = localStorage.getItem(USER_STORAGE_KEY)
    return cached ? { ...defaultState, ...JSON.parse(cached) } : { ...defaultState }
  },

  actions: {
    // 设置用户信息
    setUser(userInfo: Partial<UserVo>) {
      Object.assign(this.$state, userInfo)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.$state))
    },

    // 清除用户信息
    clearUser() {
      Object.assign(this.$state, defaultState)
      localStorage.removeItem(USER_STORAGE_KEY)
    },
  },
})