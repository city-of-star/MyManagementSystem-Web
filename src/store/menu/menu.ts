import { defineStore } from 'pinia'

// 菜单项类型
export interface MenuItem {
  path?: string
  label: string
  icon?: string
  children?: MenuItem[]
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [] as MenuItem[],
  }),

  actions: {
    setMenus(menus: MenuItem[]) {
      this.menus = menus
    },

    clearMenus() {
      this.menus = []
    },
  },
})

