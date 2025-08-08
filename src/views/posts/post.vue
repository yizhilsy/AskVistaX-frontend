<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, watch } from 'vue'

import {
  LocationInformation, OfficeBuilding, Opportunity
} from '@element-plus/icons-vue'

import { useRouter } from 'vue-router';
const router = useRouter();

// 引入防抖调用
import { debounce } from 'lodash-es';

// 招聘岗位轮播图源
const images = [
  'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp',
  'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp',
  'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp',
  'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/24e0dd27418d2291b65db1b21aa62254.png~tplv-uwbnlip3yd-webp.webp',
];

// 搜索岗位折叠控制

const collapseActiveKeys = ref(['postType', 'postCategory', 'postLocation', 'postBusinessGroup']);

// 搜索岗位js逻辑
const pageParams = ref({
  pageNum: 1,
  pageSize: 10,
  pageTotal: 20,
});

// 每页条数变化的处理函数
const onPageSizeChange = (size) => {
  pageParams.value.pageSize = size;
  listPosts();
}


// 当前页码变化的处理函数
const onPageNumChange = (page) => {
  pageParams.value.pageNum = page;
  listPosts();
}


const searchParams = ref({
  postName: '',
  postType: [],
  postCategory: [],
  postLocation: [],
  postBusinessGroup: []
})

// 招聘岗位列表数据模型
const posts = ref([
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
]);

import { listPostsService } from '@/api/post';
const listPosts = async () => {
  // 构建分页查询参数
  let params = {
    page: pageParams.value.pageNum,
    pageSize: pageParams.value.pageSize,
    postName: searchParams.value.postName,
    postType: searchParams.value.postType.join(','),
    postCategory: searchParams.value.postCategory.join(','),
    postLocation: searchParams.value.postLocation.join(','),
    postBusinessGroup: searchParams.value.postBusinessGroup.join(',')
  }
  
  let result = await listPostsService(params);
  pageParams.value.pageTotal = result.data.total;
  posts.value = result.data.rows;
}

// 封装防抖函数
const debouncedListPosts = debounce(() => {
  listPosts();
}, 100); // 100ms 的防抖延迟

// 设置监听searchParams变化的函数
const watchFilterChanges = () => {
  watch(() => searchParams.value.postType, debouncedListPosts, { deep: true });
  watch(() => searchParams.value.postLocation, debouncedListPosts, { deep: true });
  watch(() => searchParams.value.postBusinessGroup, debouncedListPosts, { deep: true });
  watch(() => searchParams.value.postCategory, debouncedListPosts, { deep: true });
};

const handlePostInfo = (post) => {
  router.push({
    path: '/post/detail',
    query: { postId: post.postId }
  })
}



onMounted(() => {
  listPosts();
  watchFilterChanges();
});

onBeforeUnmount(() => {
  debouncedListPosts.cancel();
});

</script>

<template>

<!-- 招聘岗位轮播组件 -->
<div class="carousel">
  <a-carousel
    :autoPlay="true"
    animation-name="card"
    show-arrow="hover"
    indicator-type="line"
    indicator-position="bottom"
    :style="{
      width: '100%',
      height: '240px',
    }"
  >
    <a-carousel-item v-for="image in images" :style="{ width: '60%' }">
      <img
        :src="image"
        :style="{
          width: '100%',
        }"
      />
    </a-carousel-item>
  </a-carousel>
</div>

<!-- 招聘岗位搜索菜单及列表item -->

<div class="search-post-container">
  <a-card hoverable
          style = "width: 340px; border-radius: 14px; padding: 10px;
          display: flex; flex-direction: column; gap: 16px;
          box-sizing: border-box;"
  >
    <!-- 搜索框 -->
    <div class="search-card-item">
      <a-input-search placeholder="搜索工作岗位" allow-clear 
      search-button v-model="searchParams.postName"
      @search="listPosts">
        <template #prefix>
          <icon-search />
        </template>
        <template #button-default>
          查看
        </template>
        <template #button-icon>
          <icon-right />
        </template>

      </a-input-search>
    </div>

    <!-- 分类折叠选择面板 -->
    <div class="search-card-item">
      <a-collapse
        expand-icon-position="right"
        ghost
        v-model:activeKey="collapseActiveKeys"
      >
        <a-collapse-item key="postType">
          <template #header>
            <icon-computer style="margin-right: 8px;" />
            招聘类型
          </template>

          <template #expand-icon>
            <component :is="collapseActiveKeys.includes('postType') ? 'icon-minus' : 'icon-plus'" />
          </template>

          <a-checkbox-group direction="vertical" v-model="searchParams.postType">
            <a-checkbox value="0">实习生</a-checkbox>
            <a-checkbox value="1">应届生</a-checkbox>
            <a-checkbox value="2">社会招聘</a-checkbox>
          </a-checkbox-group>
        </a-collapse-item>

        <a-collapse-item key="postCategory">
          <template #header>
            <el-icon style="margin-right: 8px;"><Opportunity /></el-icon>
            岗位类别
          </template>

          <template #expand-icon>
            <component :is="collapseActiveKeys.includes('postCategory') ? 'icon-minus' : 'icon-plus'" />
          </template>

          <a-checkbox-group direction="vertical" v-model="searchParams.postCategory">
            <a-checkbox value="0">技术</a-checkbox>
            <a-checkbox value="1">职能</a-checkbox>
          </a-checkbox-group>
        </a-collapse-item>


        <a-collapse-item key="postLocation">
          <template #header>
            <el-icon style="margin-right: 8px;"><LocationInformation /></el-icon>
            工作城市
          </template>

          <template #expand-icon>
            <component :is="collapseActiveKeys.includes('postLocation') ? 'icon-minus' : 'icon-plus'" />
          </template>

          <a-checkbox-group direction="vertical" v-model="searchParams.postLocation">
            <a-checkbox value="深圳">深圳</a-checkbox>
            <a-checkbox value="北京">北京</a-checkbox>
            <a-checkbox value="广州">广州</a-checkbox>
            <a-checkbox value="上海">上海</a-checkbox>
            <a-checkbox value="杭州">杭州</a-checkbox>
          </a-checkbox-group>
        </a-collapse-item>

        <a-collapse-item key="postBusinessGroup">
          <template #header>
            <el-icon style="margin-right: 8px;"><OfficeBuilding /></el-icon>
            事业群
          </template>

          <template #expand-icon>
            <component :is="collapseActiveKeys.includes('postBusinessGroup') ? 'icon-minus' : 'icon-plus'" />
          </template>

          <a-checkbox-group direction="vertical" v-model="searchParams.postBusinessGroup">
            <a-checkbox value="企业发展事业群CDG">企业发展事业群CDG</a-checkbox>
            <a-checkbox value="云与智慧产业事业群CSIG">云与智慧产业事业群CSIG</a-checkbox>
            <a-checkbox value="互动娱乐事业群IEG">互动娱乐事业群IEG</a-checkbox>
            <a-checkbox value="平台与内容事业群PCG">平台与内容事业群PCG</a-checkbox>
            <a-checkbox value="技术工程事业群TEG">技术工程事业群TEG</a-checkbox>
            <a-checkbox value="微信事业群WXG">微信事业群WXG</a-checkbox>
            <a-checkbox value="职能系统－职能线S1">职能系统－职能线S1</a-checkbox>
            <a-checkbox value="职能系统－财经线S2">职能系统－财经线S2</a-checkbox>
          </a-checkbox-group>
        </a-collapse-item>
      </a-collapse>
    </div>

  </a-card>

  <div class="post-list">
    <a-card
      v-for="(post, index) in posts"
      :key="index"
      hoverable
      class="card-demo"
      @click="handlePostInfo(post)"
    >
      <template #title>
        <div class="post-title">{{ post.postName }}</div>
      </template>

      <div class="post-tags">
        <span class="tag"> {{ post.postCategory === 0 ? '技术' : '职能' }} </span>
        <span class="divider">|</span>
        <span class="tag">{{ post.postType === 0 ? '实习生' : post.postType === 1 ? '应届生' : '社会招聘' }}</span>
        <span class="divider">|</span>
        <span class="tag">{{ post.postBusinessGroup }}</span>
      </div>

      <div class="post-location">
        工作地点：{{ post.postLocation }}
      </div>
    </a-card>

    <a-pagination :total="pageParams.pageTotal" :current="pageParams.pageNum" :page-size="pageParams.pageSize"
    size="medium" show-total show-jumper show-page-size show-more :page-size-options="[3, 5, 10, 15]"
    @change="onPageNumChange" @page-size-change="onPageSizeChange"/>

  </div>

</div>

</template>

<style lang="scss" scoped>

.search-post-container {
  display: flex;
  justify-content: center; /* 整体居中 */
  align-items: flex-start; /* 顶部对齐 */
  gap: 64px; /* 两个子组件之间的间距 */
  width: 90%;
  flex-direction: row;
}


.carousel {
  display: flex;
  justify-content: center;
  width: 100%;
  // border: 1px solid red; /* 测试可视化边框 */
}

.search-card-item {
  margin: 0;
  padding: 0;
  width: 100%;
  margin-bottom: 16px;
}
.search-card-item:last-child {
  margin-bottom: 0;
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