<!-- 面试对应的vue页面 -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

import { Notification } from '@arco-design/web-vue';

import { useTokenStore } from '@/stores/token.js';
const tokenStore = useTokenStore();

const videoRef = ref(null);
let mediaStream = null;
let mediaRecorder = null;
let socket = null;

// 初始化并开始访问媒体设备
const startMedia = async () => {
    try {
        // 1. 获取摄像头和麦克风权限
        mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
            aspectRatio: 16 / 9,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: true
        });

        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream;
        }

        // 2. 初始化 WebSocket
        socket = new WebSocket(`ws://localhost:8445/interviewing?Authorization=${encodeURIComponent(tokenStore.token)}`);
        socket.binaryType = 'arraybuffer';

        // 3. 启动 MediaRecorder
        socket.onopen = () => {
            mediaRecorder = new MediaRecorder(mediaStream, {
                mimeType: 'video/webm; codecs=vp8,opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                    socket.send(event.data);
                }
            };

            mediaRecorder.start(500); // 每 500ms 切片并发送
        };

        socket.onerror = (e) => {
            Notification.error({
                title: '面试出错',
                content: e.message || 'WebSocket 连接失败',
            });
        };

        // 关闭 WebSocket 时的调用函数
        socket.onclose = (event) => {
            if (event.code === 1000) {
                Notification.success({
                    title: '面试结束',
                    content: '辛苦啦！请稍后查看面试结果。',
                })
            }
            else if (event.code === 1006) {
                // 握手阶段失败，可能是 401、403 等
                console.warn('WebSocket 握手失败，可能是权限问题（如401）');
                Notification.error({
                    title: '面试出错',
                    content: 'WebSocket 凭证过期或无效，请重新登录。',
                })
                router.push('/login');
            }
        };

        Notification.success({
            title: 'Success',
            content: '请开始您的面试！',
        })

    } catch (error) {
        console.error('获取媒体流失败:', err);
        Notification.error({
            title: '面试出错',
            content: err,
        })
    }
};

// 停止所有媒体流
const stopMedia = () => {
    // 停止媒体流
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    // 关闭 websocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send("__END__");

      // 稍微延迟关闭，确保后端接收到消息
      setTimeout(() => {
        socket.close();
      }, 100); // 100ms 延迟足够让消息发出
    }
};

// onMounted(() => {
//     startMedia();
// });

onBeforeUnmount(() => {
    stopMedia();
});


</script>

<template>
    <div>
        <video ref="videoRef" autoplay muted playsinline class="interview_video"></video>
        <br />
        <button @click="startMedia">开始录制</button>
        <button @click="stopMedia">停止录制</button>
    </div>



</template>

<style lang="scss" scoped>
  .interview_video {
    width: 320px;
    height: 180px;
    aspect-ratio: 16 / 9;
    border: 1px solid #ccc;
    background: black;
    display: block;
    margin: 0 auto;
  }

  button {
    display: block;
    margin: 20px auto;
    padding: 10px 20px;
    font-size: 16px;
  }

</style>