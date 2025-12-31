import { defineStore } from 'pinia'
import type { MenuItem } from '@/config/menu/menuConfig'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [] as MenuItem[],
    menuLoaded: false,
  }),

  actions: {
    setMenus(menus: MenuItem[]) {
      this.menus = menus
      this.menuLoaded = true
    },

    clearMenus() {
      this.menus = []
      this.menuLoaded = false
    },
  },
})

