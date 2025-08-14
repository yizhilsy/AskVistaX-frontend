<!-- 用户投递的岗位 -->

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, watch } from 'vue'

import { useRouter } from 'vue-router';
const router = useRouter();

const deliveryPosts = ref([
    {
    "interviewId": '',
    "postId": '',
    "postName": '',
    "postDescription": '',
    'postRequirement': '',
    "postNote": '',
    "postLocation": '',
    "postBusinessGroup": '',
    "postType": ''
  }
]);

import { llMyDeliveryPostsService } from '@/api/post'
const llMyDeliveryPosts = async () => {
    let result = await llMyDeliveryPostsService();
    deliveryPosts.value = result.data;
}

const handleDeliveryPost = (deliveryPost) => {
    console.log('handleDeliveryPost:', deliveryPost);
  router.push({
    path: '/interview',
      query: {
          interviewId: deliveryPost.interviewId,
          postId: deliveryPost.postId
    }
  })
}

onMounted(() => {
  llMyDeliveryPosts();
});

</script>

<template>

<el-card class="page-container">
    <template #header>
        <div class="header">

            <span style="font-size: 24px;font-weight: bold;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <icon-lark-color size="32px"/> 我的投递
            </span>
            <div class="extra">
                <!-- <el-button type="primary" @click="visibleDrawer=true">发布帖子</el-button> -->
                <!-- <el-button type="primary" @click="gotoMyPage">我的帖子</el-button> -->
            </div>
        </div>
    </template>


    <div class="search-post-container">
      <div class="post-list">
        <a-card
          v-for="(deliveryPost, index) in deliveryPosts"
          :key="index"
          hoverable
          class="card-demo"
          @click="handleDeliveryPost(deliveryPost)"
        >
          <template #title>
            <div class="post-title">{{ deliveryPost.postName }}</div>
          </template>

          <div class="post-tags">
            <span class="tag"> {{ deliveryPost.postCategory === 0 ? '技术' : '职能' }} </span>
            <span class="divider">|</span>
            <span class="tag">{{ deliveryPost.postType === 0 ? '实习生' : deliveryPost.postType === 1 ? '应届生' : '社会招聘' }}</span>
            <span class="divider">|</span>
            <span class="tag">{{ deliveryPost.postBusinessGroup }}</span>
          </div>

          <div class="post-location">
            工作地点：{{ deliveryPost.postLocation }}
          </div>
        </a-card>
      </div>

    </div>

</el-card>

</template>

<style lang="scss" scoped>

.page-container {
    min-height: 100%;
    box-sizing: border-box;
    width: calc(100% + 40px);
    display: flex;
    flex-direction: column;
    justify-content: center; /* 整体居中 */
    gap: 24px; /* 两个子组件之间的间距 */
    
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

.search-post-container {
  display: flex;
  justify-content: center; /* 整体居中 */
  gap: 64px; /* 两个子组件之间的间距 */
  width: 70%;
  flex-direction: row;
}

// post list 样式
.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 16px;
  padding-left: 16px;
  padding-right: 16px;
  flex: 1;
}

.post-title {
  font-size: 20px;
  font-weight: bold;
}

.post-tags {
  margin-top: 6px;
  color: #555;
}

.tag {
  margin-right: 8px;
  font-size: 16px;
}

.divider {
  margin: 0 8px;
  color: #999;
}

// 显示岗位所在地点的样式
.post-location {
  margin-top: 6px;
  color: #888;
  font-size: 14px;
}

.card-demo {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-demo:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}



</style>