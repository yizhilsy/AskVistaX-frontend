import {createRouter,createWebHistory} from 'vue-router' 

import LoginVue from "@/views/Login.vue"
import LayoutVue from "@/views/Layout.vue"
import InterviewVue from "@/views/interview/interview.vue"
import TestVue from "@/views/test.vue"

import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'

//定义路由关系
const routes = [
    {path:'/', component:LayoutVue, children:[
        { path: '/interview', component: InterviewVue, meta: { keepAlive: true } }
    ]},
    {path:'/login', component:LoginVue},
    {path:'/test', component:TestVue}
]

//创建路由器
const router = createRouter({
    history:createWebHistory(),
    routes:routes
})

//导出路由
export default router