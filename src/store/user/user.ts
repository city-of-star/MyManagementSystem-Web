import { defineStore } from 'pinia'
import type {UserVo} from "@/api/system/user/user.ts";

export const useUserStore = defineStore('user', {
    state: (): UserVo => ({
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
        updateTime: ''
    }),

    actions: {
        // 设置用户信息
        setUser(userInfo: Partial<UserVo>) {
            Object.assign(this.$state, userInfo)
        },

        // 清除用户信息
        clearUser() {
            this.$reset()
        },
    },
})
