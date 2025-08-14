<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, watch } from 'vue'

import { useRouter } from 'vue-router';
const router = useRouter();

import useUserInfoStore from '@/stores/userInfo.js';
import { useTokenStore } from '@/stores/token.js';

import { Notification } from '@arco-design/web-vue';

const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

// 招聘岗位详情数据模型
const post = ref(
  {
    "postId": '',
    "postName": '',
    "postDescription": '',
    'postRequirement': '',
    "postNote": '',
    "postLocation": '',
    "postBusinessGroup": '',
    "postType": ''
  }
);

import { getPostByPostIdService } from '@/api/post';
const getPostByPostId = async (postId) => {
    // 构造get请求参数
    let params = {
        postId: postId
    }

    let result = await getPostByPostIdService(params);
    post.value = result.data;
}

onMounted(() => {
  const postId = router.currentRoute.value.query.postId;
  getPostByPostId(postId);
})



const fileInput = ref(null);
const resumeUrl = ref(null);

import { uploadService } from '@/api/common';
import { deliveryPostService } from '@/api/post';

const deliveryPost = async () => {
  const postId = router.currentRoute.value.query.postId;
  let params = {
    postId: postId,
    resumeUrl: resumeUrl.value
  }

  console.log(params)
  console.log('postId:', router.currentRoute.value.query.postId);
  console.log('resumeUrl:', resumeUrl.value);


  let result = await deliveryPostService(params);
  if (result.code === 1) {
    Notification.success({
        title: 'Success',
        content: '投递岗位成功',
    })
  }

}

const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click(); // 触发文件选择对话框
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log('选择的文件：', file.name);

  uploadService(file).then(res => {
    console.log('上传成功，文件URL:', res.data);
    // 这里可以把 URL 存到响应式变量，用于展示或提交表单
    resumeUrl.value = res.data;
    deliveryPost();
    router.push('/post')
  })
  .catch(err => {
    console.error('上传失败', err);
  });
  
};


</script>



<template>




<div class="post-header">
    <!-- 动画容器 -->
    <div class="post-header-bg">
      <DotLottieVue
        src="/animation/sMgZRawi3Z.lottie"
        autoplay loop speed="0.5"
        style="width: 100%; height: 100%; display: block; object-fit: cover; transform: scale(1.0); transform-origin: center;"
        />
    </div>
    

    <!-- 正文内容包裹 -->
    <div class="post-header-content">
      <div class="title">{{ post.postName }}</div>
      <a-space wrap size="medium">
        <a-tag bordered size="large" class="custom-tag">
          {{ post.postCategory === 0 ? '技术' : '职能' }}
        </a-tag>
        <a-tag bordered size="large" class="custom-tag">
          {{ post.postType === 0 ? '实习生' : post.postType === 1 ? '应届生' : '社会招聘' }}
        </a-tag>
      </a-space>
    </div>
</div>

<a-card hoverable
        style = "width: 100%; border-radius: 14px; padding: 10px;
        display: flex; flex-direction: column; gap: 20px;
        box-sizing: border-box;"
>

<a-typography>
  <a-typography-title :heading="5" class="post-column-title">岗位描述</a-typography-title>
  <a-typography-paragraph class="post-description">
    {{ post.postDescription }}
  </a-typography-paragraph>

  <br/>

  <a-typography-title :heading="5" class="post-column-title">岗位要求</a-typography-title>
  <a-typography-paragraph class="post-description">
    {{ post.postRequirement }}
  </a-typography-paragraph>

  <br/>

  <a-typography-title :heading="5" class="post-column-title">加分项或注意事项</a-typography-title>
  <a-typography-paragraph class="post-description">
    {{ post.postNote }}
  </a-typography-paragraph>

  <br/>

  <a-typography-title :heading="5" class="post-column-title">工作地点</a-typography-title>
  <a-typography-paragraph class="post-description">
    {{ post.postLocation }}
  </a-typography-paragraph>

  <br/>

  <a-typography-title :heading="5" class="post-column-title">招聘事业群</a-typography-title>
  <a-typography-paragraph class="post-description">
    {{ post.postBusinessGroup }}
  </a-typography-paragraph>
</a-typography>

<a-button type="primary" shape="round" size="large" style="margin-top: 40px; padding: 10px 20px; 
font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;" @click="openFileDialog">
投递简历
</a-button>

<!-- 隐藏的文件选择器 -->
<input
  type="file"
  ref="fileInput"
  accept="application/pdf"
  style="display: none"
  @change="handleFileChange"
/>

</a-card>



</template>

<style lang="scss" scoped>

// 展现岗位简介的header头样式
.post-header {
  position: relative;
  overflow: hidden;
  width: calc(100% + 40px);
  height: 240px;
  box-sizing: border-box; /* padding不会额外撑宽 */
  padding-left: 120px;
  padding-top: 20px;

  display: flex;
  flex-direction: column;   // 纵向排列post-header内的组件
  gap: 20px;
  
  .post-header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    
    :deep(.dotlottie-vue) {
      width: 100%;
      height: 100%;
      display: block;
      position: relative !important; // ✅ 防止其内部使用 absolute 撑破
    }

    ::v-deep(lottie-player) {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      padding: 0 !important;       // ✅ 清除 padding
      margin: 0 !important;        // ✅ 清除 margin
      position: relative !important; // ✅ 防止脱离流布局撑破
    }
  }

  .post-header-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 使用 macOS 默认字体 */
      color: #1f1f1f;
      font-size: 36px;       // 标题字号
      font-weight: 600;      // 半粗体
      line-height: 1.4;      // 行高
    }

    :deep(.custom-tag) {
      background-color: transparent !important; /* 背景透明 */
      border: 1px solid #fff2b0 !important;     /* 边框样式 */
      color: #fff2b0 !important;                /* 文字颜色 */
      font-size: 14px;                           /* 字号 */
      border-radius: 6px;                        /* 圆角 */
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 使用 macOS 默认字体 */
    }

  }

}

.post-description {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-line;
}

.post-column-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 20px;
  line-height: 1.5;
  color: #333;
  font-weight: 500;
}


</style>