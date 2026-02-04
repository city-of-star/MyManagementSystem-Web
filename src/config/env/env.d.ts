/**
 * 声明 Vue 单文件组件模块类型
 *
 * 作用：让 TypeScript 能够识别 .vue 文件的导入
 * 例如：import App from './App.vue' 不会报类型错误
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/**
 * 声明 Element Plus 语言包模块类型
 *
 * 作用：让 TypeScript 能够识别 Element Plus 语言包的导入
 */
declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: any
  export default zhCn
}

