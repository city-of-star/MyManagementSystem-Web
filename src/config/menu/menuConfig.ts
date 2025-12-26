export interface MenuItem {
  path?: string
  label: string
  icon?: string
  children?: MenuItem[]
}

export const menus: MenuItem[] = [
  {
    label: '系统管理',
    icon: 'system',
    children: [
      {
        path: '/system/userPage',
        label: '用户管理',
      },
      {
        path: '/system/rolePage',
        label: '角色管理',
      },
      {
        path: '/system/menuPage',
        label: '菜单管理',
      },
      {
        path: '/system/paramPage',
        label: '参数管理',
      },
    ],
  },
]


