export interface AppConfig {
  version: string
  title: string
  logoPath: string
  waterMark: boolean
  themeColors: string[]
  defaultThemeColor: string
}

export const appConfig: AppConfig = {
  version: 'v1.0.0',
  title: 'My Management System',
  logoPath: '/mms.svg',
  waterMark: false,
  themeColors: ['#007aff', '#1aa97b', '#ff4d53'],
  defaultThemeColor: '#0085d0',
}


