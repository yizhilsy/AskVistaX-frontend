import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'

// 引入lottie动画播放库
import '@lottiefiles/lottie-player';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

// 引入 ECharts 核心和图表类型
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

// 引入 vue-echarts
import VueECharts from 'vue-echarts'

// 按需使用
use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

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

// 全局注册lottie动画组件
app.component('DotLottieVue', DotLottieVue)

// 注册 Vue ECharts 组件
app.component('v-chart', VueECharts)

app.mount('#app');
