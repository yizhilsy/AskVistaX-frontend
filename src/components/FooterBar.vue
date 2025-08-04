<template>
  <a-layout-footer class="custom-footer">
    <!-- 顶部社交区域 -->
    <div class="footer-social">
      <span>关注MLab</span>
      <a-space size="small">
        <a-tag color="black">小程序</a-tag>
        <a-tag color="black">公众号</a-tag>
        <a-tag color="black">知乎</a-tag>
        <a-tag color="black">日历</a-tag>
        <a-tag color="black">B站</a-tag>
        <a-tag color="pink">Instagram</a-tag>
      </a-space>
    </div>

    <a-divider />

    <!-- 中部信息区域 -->
    <div class="footer-content">
      <div class="footer-columns">
        <div class="footer-col">
          <h4>公司</h4>
          <a-space direction="vertical" size="small">
            <a-link href="#">关于腾讯</a-link>
            <a-link href="#">腾讯公益</a-link>
            <a-link href="#">客服中心</a-link>
          </a-space>
        </div>
        <div class="footer-col">
          <h4>法律信息</h4>
          <a-space direction="vertical" size="small">
            <a-link href="#">服务协议</a-link>
            <a-link href="#">隐私政策</a-link>
            <a-link href="#">知识产权</a-link>
          </a-space>
        </div>
      </div>

      <!-- 右侧品牌 Logo -->
      <div class="footer-brand">
        <img src="@/assets/logo/mlabshu.png" alt="mlabshulogo" />
      </div>
    </div>

    <a-divider />

    <!-- 版权信息 -->
    <div class="footer-copy">
      Copyright © 1998 - 2025 Tencent. All Rights Reserved.
    </div>
  </a-layout-footer>
</template>

<script setup>
// 无需逻辑，仅静态展示
</script>

<style scoped>
.custom-footer {
  background: #f5f5f5;
  padding: 24px 40px;
  font-size: 14px;
  color: #333;
}

.footer-social {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 40px;
  margin: 24px 0;
}

.footer-columns {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
}

.footer-col h4 {
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 15px;
}

.footer-brand img {
  max-height: 40px;
  object-fit: contain;
}

.footer-copy {
  text-align: center;
  font-size: 13px;
  color: #999;
  margin-top: 12px;
}
</style>
