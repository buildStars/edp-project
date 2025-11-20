import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 引入全局样式
import 'element-plus/dist/index.css'
import './assets/styles/index.scss'
import 'nprogress/nprogress.css'

// 引入权限指令
import permission from './directives/permission'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例并使用持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

// 注册全局指令
app.directive('permission', permission)

app.mount('#app')
