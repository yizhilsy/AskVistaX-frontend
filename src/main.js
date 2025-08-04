import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'

// 引入组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css'

// 引入路由及持久化存储
import router from '@/router'
import { createPersistedState } from 'pinia-persistedstate-plugin'
import { createPinia } from 'pinia'

import locale from 'element-plus/dist/locale/zh-cn.js'

const app = createApp(App);

const persist = createPersistedState();
const pinia = createPinia();
pinia.use(persist)
app.use(pinia)
app.use(router)

app.use(ElementPlus, {locale});
app.use(ArcoVue);
app.use(ArcoVueIcon);

app.mount('#app');
