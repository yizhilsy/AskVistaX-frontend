<script setup>

import { ref, onMounted, onUnmounted, computed } from 'vue'

import {
    Management, Promotion, UserFilled, User, Crop, EditPen, SwitchButton, CaretBottom
} from '@element-plus/icons-vue'

import { ElMessage, ElMessageBox } from 'element-plus';

import { useRouter } from 'vue-router';
const router = useRouter();

// 获取用户信息
import { getUserInfoService } from '@/api/common.js';
import useUserInfoStore from '@/stores/userInfo.js';
import { useTokenStore } from '@/stores/token.js';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

const getUserInfo = async () => {
  const result = await getUserInfoService();
  //数据存储到pinia
  userInfoStore.setInfo(result.data)
}

getUserInfo();

// 折叠和展开header的逻辑
const contentWrapperRef = ref(null);
console.log(contentWrapperRef.value);

const isHeaderHidden = ref(false);
let lastScrollTop = 0;

const handleScroll = () => {
  const scrollTop = contentWrapperRef.value?.scrollTop || 0;

  if (scrollTop > lastScrollTop + 5) {
    isHeaderHidden.value = true;
  } else if (scrollTop < lastScrollTop - 5) {
    isHeaderHidden.value = false;
  }

  lastScrollTop = scrollTop;
};

onMounted(() => {
  if (contentWrapperRef.value) {
    contentWrapperRef.value.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  if (contentWrapperRef.value) {
    contentWrapperRef.value.removeEventListener('scroll', handleScroll);
  }
});

import { logoutService } from '@/api/common.js';

// 点击header dropdown菜单事件处理函数
const header_dropdownSelect = (key) => {
  // 判断指令
  if (key === 'logout') {
      //退出登录
      ElMessageBox.confirm(
          '您确认退出登录吗？',
          '温馨提示',
          {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning',
          }
      ).then(async () => {
          //退出登录
          //1.清空pinia中存储的token以及个人信息
          let result = await logoutService();
          tokenStore.removeToken();
          userInfoStore.removeInfo();
          //2.跳转到登录页面
          router.push('/login')
          ElMessage({
              type: 'success',
              message: result.msg?result.msg:"退出登录成功"
          })
      }).catch(() => {
          ElMessage({
              type: 'info',
              message: '用户已取消退出登录'
          })
      })
  }


}




// 当前时间（只取小时数）
const currentHour = ref(new Date().getHours())

// 计算属性：根据小时数生成问候语
const greetingMessage = computed(() => {
  if (currentHour.value < 12 && currentHour.value >= 4) {
    return '早上好'
  } else if (currentHour.value < 18 && currentHour.value >= 12) {
    return '下午好'
  } else {
    return '晚上好'
  }
})

// 负责更新当前时间的定时器Id
let currentHourIntervalId = null

onMounted(() => {
  currentHourIntervalId = setInterval(() => {
    const hourNow = new Date().getHours()
    if (hourNow !== currentHour.value) {
      currentHour.value = hourNow
    }
  }, 60 * 1000) // 每分钟检查一次
})

onUnmounted(() => {
  clearInterval(currentHourIntervalId)
})



// 侧边菜单栏点击item事件处理
const onClickMenuItem = (key) => {
  router.push(key);
}

</script>

<template>
    <a-layout class="layout-demo">

      <a-layout-sider collapsible breakpoint="xl">
        <div class="sider_logo" ></div>
        <a-menu
          :default-open-keys="['/interview']"
          :default-selected-keys="['/interview']"
          :style="{ width: '100%' }"
          @menu-item-click="onClickMenuItem"
        >
          <a-menu-item key="/interview">
            <IconHome></IconHome>
            AI 智能面试
          </a-menu-item>
          <a-menu-item key="/post">
            <IconCalendar></IconCalendar>
            投递岗位
          </a-menu-item>
          <a-menu-item key="0_3">
            <IconCalendar></IconCalendar>
            个人信息
          </a-menu-item>
          <a-sub-menu key="1">
            <template #title>
              <IconCalendar></IconCalendar> Navigation 1
            </template>
            <a-menu-item key="1_1">Menu 1</a-menu-item>
            <a-menu-item key="1_2">Menu 2</a-menu-item>
            <a-sub-menu key="2" title="Navigation 2">
              <a-menu-item key="2_1">Menu 1</a-menu-item>
              <a-menu-item key="2_2">Menu 2</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="3" title="Navigation 3">
              <a-menu-item key="3_1">Menu 1</a-menu-item>
              <a-menu-item key="3_2">Menu 2</a-menu-item>
              <a-menu-item key="3_3">Menu 3</a-menu-item>
            </a-sub-menu>
          </a-sub-menu>
          <a-sub-menu key="4">
            <template #title>
              <IconCalendar></IconCalendar> Navigation 4
            </template>
            <a-menu-item key="4_1">Menu 1</a-menu-item>
            <a-menu-item key="4_2">Menu 2</a-menu-item>
            <a-menu-item key="4_3">Menu 3</a-menu-item>
          </a-sub-menu>
        </a-menu>
        <!-- trigger -->
        <template #trigger="{ collapsed }">
          <IconCaretRight v-if="collapsed"></IconCaretRight>
          <IconCaretLeft v-else></IconCaretLeft>
        </template>
      </a-layout-sider>

      <a-layout>
        <a-layout-header :class="{ 'header-hidden': isHeaderHidden }">
            <!-- header_logo -->
            <div class="header_logo"></div>

            <!-- header right part -->
            <div class="header_right_part">
              <!-- 显示用户名 -->
              <span style="font-size: 16px; color: #333;">
                <span>{{ greetingMessage }}, </span>
                <strong>{{ userInfoStore.info.userName }}</strong>
              </span>
            

              <a-dropdown @select="header_dropdownSelect" trigger="hover">
                <span class="arco-dropdown__box">
                  <a-avatar v-if="userInfoStore.info.avatar" :size="48">
                      <img
                        :src="userInfoStore.info.avatar"
                        style="
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                          display: block;
                        "
                      />
                  </a-avatar>

                  <a-avatar v-else :size="48" :style="{ backgroundColor: '#9d42fa' }">
                    <icon-user />
                  </a-avatar>
                  <icon-down />
                </span>
                
                <!-- dropdown menu -->
                <template #content>
                  <a-doption value="info">
                    <template #icon>
                      <icon-idcard />
                    </template>
                    个人信息
                  </a-doption>
                  
                  <a-doption value="logout">
                    退出登录
                    <template #icon>
                      <icon-poweroff />
                    </template>
                  </a-doption>
                </template>
              </a-dropdown>

            </div>
            
            
        </a-layout-header >

        <div ref="contentWrapperRef" class="arco-layout-content-wrapper">
            <!-- 面包屑导航组件 -->
            <a-breadcrumb :style="{ margin: '16px 0' }">
                <a-breadcrumb-item>Home</a-breadcrumb-item>
                <a-breadcrumb-item>List</a-breadcrumb-item>
                <a-breadcrumb-item>App</a-breadcrumb-item>
            </a-breadcrumb>


            <a-layout-content>
                <router-view></router-view>
                

            </a-layout-content>
        
        </div>

        <a-layout-footer>

            <a-divider />
            <div class="footer-content">
                <div class="footer-column-box">
                    <div class="text-container">
                        AskVistaX 问见未来AI面试平台
                    </div>
                    <div class="social-container">
                        <div class="social-content">
                            <div class="social-text">
                              关于我们
                            </div>

                            <a-space wrap class="social-tags">
                                <a-tag color="gray" size="large"><template #icon><icon-github/></template>Github</a-tag>
                                <a-tag color="orangered" size="large"><template #icon><icon-gitlab/></template>Gitlab</a-tag>
                                <a-tag color="blue" size="large"><template #icon><icon-twitter/></template>Twitter</a-tag>
                                <a-tag color="arcoblue" size="large"><template #icon><icon-facebook/></template>Facebook</a-tag>
                                <a-tag color="green" size="large"><template #icon><icon-google /></template>Google</a-tag>
                                <a-tag color="blue" size="large"><template #icon><icon-bytedance-color /></template>ByteDance</a-tag>
                            </a-space>
                        </div>


                        
                    </div>
                </div>

                <div class="footer-logo-box">
                  <div class="footer_logo_mlab"></div>
                  <div class="footer_logo"></div>
                </div>
            </div>
            
            
            <a-divider />
            <div class="text-container" style="font-size: 14px;">
                  Copyright ©2025 ShanghaiUniversity. All Rights Reserved.
            </div>
        </a-layout-footer>

        
        





      </a-layout>

    </a-layout>

</template>
    


<style lang="scss" scoped>
.layout-container {
    height: 100vh;

    .el-aside {
        background-color: #232323;

        &__logo {
            height: 200px;
            background: url('@/assets/google.png') no-repeat center / 200px auto;
        }

        .el-menu {
            border-right: none;
        }
    }

    .el-header {
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .el-dropdown__box {
            display: flex;
            align-items: center;

            .el-icon {
                color: #999;
                margin-left: 10px;
            }

            &:active,
            &:focus {
                outline: none;
            }
        }
    }

    .el-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #666;
    }
}

// arco Layout布局样式
.layout-demo {
    height: 100vh; /* 关键，让布局撑满视口 */
    background: var(--color-fill-2);
    // border: 1px solid var(--color-border);
    display: flex;
    overflow: hidden; /* 防止内容溢出 */
  }
  .layout-demo :deep(.arco-layout) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .layout-demo :deep(.arco-layout-sider) {
    height: 100%;
    flex-shrink: 0;
  }
  .layout-demo :deep(.arco-layout-sider) .sider_logo {
    height: 64px;
    margin: 12px 8px;
    // background: rgba(255, 255, 255, 0.2);
    background: url('@/assets/logo/AX_logo.png') no-repeat center / contain;
  }
  .layout-demo :deep(.arco-layout-sider-light) .logo{
    background: var(--color-fill-2);
  }
  .layout-demo :deep(.arco-layout-header)  {
    display: flex;
    align-items: center;    /* 垂直居中对齐 */
    justify-content: space-between;
    height: auto;
    line-height: 80px;
    background: var(--color-bg-3);
    flex-shrink: 0;
    padding: 0 20px;
    padding-left: 20px;
    position: relative;
    z-index: 1000;

    /* 过渡动画 */
    transition:
      transform 0.4s ease,
      opacity 0.4s ease,
      margin-bottom 0.4s ease;
    will-change: transform, opacity;

    /* 默认状态 */
    transform: translateY(0);
    opacity: 1;
    margin-bottom: 0;
  }

  .layout-demo :deep(.header-hidden)  {
    transform: translateY(-100%);
    opacity: 0;
    margin-bottom: -80px; /* 推动下方内容上来 */
  }

  .layout-demo :deep(.arco-layout-header .header_logo) {
    width: 270px;
    height: 80px;
    background: url('@/assets/logo/AskVistaX_logo16_9_color.png') no-repeat left center / contain;
  }

  .layout-demo :deep(.arco-layout-header .header_right_part) {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
  }

  .layout-demo :deep(.arco-layout-header .arco-dropdown__box) {
    display: flex;
    align-items: center;
    gap: 10px; // 控制 avatar 和下拉图标的间距

    &:active,
    &:focus {
        outline: none;
    }
  }

  .layout-demo :deep(.arco-layout-header .arco-dropdown-open .arco-icon-down) {
    transform: rotate(180deg); /* 下拉时旋转图标 */
  }

  .layout-demo :deep(.arco-layout-content-wrapper) {
    flex: 1;
    padding: 0 128px;
    background: #f5f5f5;
    overflow: auto;
    transition: margin-top 0.4s ease;
  }

  .layout-demo :deep(.arco-layout-content-wrapper) > .arco-breadcrumb {
    margin: 16px 0;
  }

  .layout-demo :deep(.arco-layout-footer) {
    display: flex;
    flex-direction: column;
    padding: 5px 240px;
    background: #f0f0f0;
    width: 100%;
    box-sizing: border-box;
  }

  .layout-demo :deep(.arco-divider) {
    margin-bottom: 8px;
    margin-top: 8px;
  }

  .layout-demo :deep(.arco-layout-footer .footer-content) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }

  .layout-demo :deep(.arco-layout-footer .footer-content .footer-column-box) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px; /* 上下内容间距 */
  }

  .layout-demo :deep(.arco-layout-footer .footer-content .footer-logo-box) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 12px; /* 左右内容间距 */
  }


  .layout-demo :deep(.arco-layout-footer .footer_logo) {
    width: 143px;
    height: 48px;
    background: url('@/assets/logo/shu.png') no-repeat right center / contain;
    background-size: contain;
    background-position: right center;
    flex-shrink: 0;
  }

  .layout-demo :deep(.arco-layout-footer .footer_logo_mlab) {
    width: 143px;
    height: 48px;
    background: url('@/assets/logo/mlabshu.png') no-repeat right center / contain;
    background-size: contain;
    background-position: right center;
    flex-shrink: 0;
  }

  .layout-demo :deep(.social-container) {
    width: 100%;
    display: flex;
    justify-content: flex-start;
  }

  .layout-demo :deep(.social-content) {
    display: flex;
    align-items: baseline;
    flex-wrap: nowrap; /* 不换行 */
    gap: 20px; /* Tag 和 说明文字之间的间距 */
    width: 100%;
  }

  .layout-demo :deep(.social-tags) {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .layout-demo :deep(.social-text) {
    font-size: 14px;
    white-space: nowrap;
  }


  .layout-demo :deep(.arco-layout-footer .text-container) {
    margin-top: 5px;
    font-size: 16px;
    width: 100%;
    text-align: left;
    text-decoration: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 使用 macOS 默认字体 */
    font-weight: 450; /* 字体粗细 */
    color: #000; /* 文字颜色设置为黑色，与背景色对比清晰 */
  }

  .layout-demo :deep(.arco-layout-content) {
    color: var(--color-white);
    background: var(--color-bg-3);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 1000px;
    gap: 24px;
    padding-left: 20px;
    padding-right: 20px;
    align-items: center;
  }





// 圆角滑动条样式
::-webkit-scrollbar {
width: 16px;
height: 4px;
}

::-webkit-scrollbar-thumb {
border: 4px solid transparent;
background-clip: padding-box;
border-radius: 10px;
background-color: var(--color-text-4);
}

::-webkit-scrollbar-thumb:hover {
background-color: var(--color-text-3);
}


</style>