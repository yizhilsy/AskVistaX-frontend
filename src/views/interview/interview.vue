<!-- 面试对应的vue页面 -->
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

import { Notification } from '@arco-design/web-vue';

import { useTokenStore } from '@/stores/token.js';
const tokenStore = useTokenStore();

const videoRef = ref(null);
let mediaStream = null;
let mediaRecorder = null;
let vsSocket = null;

// 问题及音频列表
const questions = ref([]);
const audios = ref([]);
const questionPos = ref(null);

// 语音转写结果字符串
const transcriptText = ref(''); // 存放语音转写结果

function playAudio(index) {
  const audio = new Audio(audios.value[index]);
  audio.play();
}


let audioContext, processor, source, socket;

const startAudioPush = async () => {
    questionPos.value = null;
    questions.value = [];
    audios.value = [];
    transcriptText.value = ''; // 清空转写结果
  
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaStreamSource(stream);

        // 创建 ScriptProcessorNode 处理音频数据
        processor = audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(audioContext.destination);

        // 初始化 WebSocket
        socket = new WebSocket(`ws://localhost:8445/audio?Authorization=${encodeURIComponent(tokenStore.token)}&interviewId=${interviewId.value}`);
        socket.binaryType = "arraybuffer";

        socket.onopen = () => {
            console.log("WebSocket 连接已打开");
        };

        processor.onaudioprocess = (event) => {
            // 1) 转单声道
            let monoData = mergeToMono(event.inputBuffer);

            // 2) 重采样到目标采样率（例如 16000）
            monoData = resampleToTarget(monoData, audioContext.sampleRate, 16000);

            // 3) 转成 little-endian PCM byte buffer
            const pcmBuffer = floatTo16BitPCMBytes(monoData);

            // 4) 发送
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(pcmBuffer);
            }
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

        socket.onmessage = (event) => {
            if (typeof event.data === 'string') {
                console.log('接收到文本数据');
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'question') {
                        console.log('检索出的面试题目:', message.content);
                        questions.value.push(message.content);
                        questionPos.value = questions.value.length - 1;
                    }
                    else if (message.type === 'transcript') {
                        transcriptText.value += message.content; // 更新响应式变量
                    }
                    else if (message.type === 'end') {
                      stopInterview();
                    }
                    else {
                        console.warn('未知消息类型:', message);
                    }
                } catch (err) {
                    console.error('消息JSON解析失败:', err, '原始数据:', event.data);
                }
            }
            else if (event.data instanceof ArrayBuffer) {
                console.log('接收到二进制数据');
                // 后端发来的消息是二进制音频数据
                const audioBlob = new Blob([event.data], { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audios.value.push(audioUrl);
                // 自动播放音频
                const audio = new Audio(audioUrl);
                audio.play();
            }
        };

        Notification.success({
            title: 'Success',
            content: '请开始您的面试！',
        })

    } catch (err) {
        console.error("获取麦克风失败", err);
        Notification.error({
          title: '面试出错',
          content: err,
        });
    }
};

function mergeToMono(inputBuffer) {
    if (inputBuffer.numberOfChannels === 1) {
        return inputBuffer.getChannelData(0);
    }
    const channelData = [];
    for (let c = 0; c < inputBuffer.numberOfChannels; c++) {
        channelData.push(inputBuffer.getChannelData(c));
    }
    const length = channelData[0].length;
    const mono = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        let sum = 0;
        for (let c = 0; c < channelData.length; c++) {
            sum += channelData[c][i];
        }
        mono[i] = sum / channelData.length;
    }
    return mono;
}

function floatTo16BitPCMBytes(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // true => little-endian
    }
    return buffer; // 返回 ArrayBuffer (16bit LE)
}

function resampleToTarget(monoData, sourceRate, targetRate) {
    if (sourceRate === targetRate) return monoData;
    const ratio = targetRate / sourceRate;
    const newLength = Math.round(monoData.length * ratio);
    const resampled = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
        const srcIndex = i / ratio;
        const srcFloor = Math.floor(srcIndex);
        const srcCeil = Math.min(monoData.length - 1, srcFloor + 1);
        const t = srcIndex - srcFloor;
        resampled[i] = (1 - t) * monoData[srcFloor] + t * monoData[srcCeil];
    }
    return resampled;
}




/**
 * 停止推送 PCM 音频并关闭 WebSocket
 */
const stopAudioPush = () => {
    // 停止 ScriptProcessorNode
    if (processor) {
        processor.disconnect();
        processor.onaudioprocess = null;
    }

    // 停止 MediaStream
    if (source) {
        const stream = source.mediaStream;
        stream.getTracks().forEach(track => track.stop());
        source.disconnect();
    }

    // 关闭 AudioContext
    if (audioContext) {
        audioContext.close();
    }

    // 关闭 WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send("__END__");
        socket.close();
        console.log("WebSocket 已关闭");
    }
};


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
        vsSocket = new WebSocket(`ws://localhost:8445/interviewing?Authorization=${encodeURIComponent(tokenStore.token)}&interviewId=${interviewId.value}`);
        vsSocket.binaryType = 'arraybuffer';

        // 3. 启动 MediaRecorder
        vsSocket.onopen = () => {
            mediaRecorder = new MediaRecorder(mediaStream, {
                mimeType: 'video/webm; codecs=vp8,opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0 && vsSocket.readyState === WebSocket.OPEN) {
                    vsSocket.send(event.data);
                }
            };

            mediaRecorder.start(500); // 每 500ms 切片并发送
        };

        vsSocket.binaryType = 'arraybuffer';


        vsSocket.onerror = (e) => {
            Notification.error({
                title: '面试出错',
                content: e.message || 'WebSocket 连接失败',
            });
        };

        // 关闭 WebSocket 时的调用函数
        vsSocket.onclose = (event) => {
            if (event.code === 1000) {
                console.log('vsWebSocket 连接正常关闭');
            }
            else if (event.code === 1006) {
                // 握手阶段失败，可能是 401、403 等
                console.warn('vsWebSocket 握手失败，可能是权限问题（如401）');
                // router.push('/login');
            }
        };

    } catch (err) {
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
    if (vsSocket && vsSocket.readyState === WebSocket.OPEN) {
        vsSocket.send("__END__");
        vsSocket.close();
        // // 稍微延迟关闭，确保后端接收到消息
        // setTimeout(() => {
        //     vsSocket.close();
        // }, 10); // 10ms 延迟足够让消息发出
    }
};


const nextQuestion = () => {
  socket.send("__NEXT__");
}

// onMounted(() => {
//     startMedia();
// });

const startInterview = () => {
  startInterviewBackend(interviewId.value);
  startAudioPush();
  startMedia();
};

const stopInterview = () => {
  stopAudioPush();
  stopMedia();
  endInterviewBackend(interviewId.value);
};



onBeforeUnmount(() => {
  stopAudioPush();
  stopMedia();
});


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

// 面试结果数据模型
const interviewResult = ref([
  {
    "interviewResultId": '',
    "interviewId": '',
    "question": '',
    "answer": '',
    "overallScore": '',
    "dimensions": {
      "completeness": '',
      "accuracy": '',
      "clarity": '',
      "depth": '',
      "experience": ''
    },
    "feedback": '',
    "needFollowup": ''
  }
]);

const interview = ref({
    "interviewId": '',
    "uid": '',
    "postId": '',
    "startTime": '',
    "endTime": '',
    "videoUrl": '',
    "resumeUrl": '',
    "audioAnalyzeResult": '',
    "videoAnalyzeResult": '',
    "summary": '',
    "messageHistory": [],
})

import { getPostByPostIdService } from '@/api/post';
const getPostByPostId = async (postId) => {
    // 构造get请求参数
    let params = {
        postId: postId
    }

    let result = await getPostByPostIdService(params);
    post.value = result.data;
}

import { startInterviewService, endInterviewService, getInterviewRecordByIdService, getInterviewByIdService } from '@/api/interview';
const getInterviewRecordById = async (interviewId) => {
    // 构造get请求参数
    let params = {
        interviewId: interviewId
    }

    let result = await getInterviewRecordByIdService(params);
    interviewResult.value = result.data;
}

const startInterviewBackend = async (interviewId) => {
  // 构造get请求参数
  let params = {
      interviewId: interviewId
  }
  let result = await startInterviewService(params);
}

const endInterviewBackend = async (interviewId) => {
  // 构造get请求参数
  let params = {
    interviewId: interviewId
  }
  let result = await endInterviewService(params);
}

const getInterviewById = async (interviewId) => {
    // 构造get请求参数
    let params = {
        interviewId: interviewId
    }
    let result = await getInterviewByIdService(params);
  interview.value = result.data;
  console.log('interview data:', interview.value);
}


const interviewId = ref(null);
const postId = ref(null);

onMounted(() => {
    interviewId.value = router.currentRoute.value.query.interviewId;
    postId.value = router.currentRoute.value.query.postId;
    
    getPostByPostId(postId.value);
  getInterviewRecordById(interviewId.value);
    getInterviewById(interviewId.value);
})

// 把对象转成 [{ key: '字段名', value: '字段值' }] 方便 v-for
const objectToList = (obj) => {
  return Object.entries(obj || {}).map(([key, value]) => ({
    key,
    value
  }))
}

// 驼峰 key → 中文名 映射表
const keyMap = {
  technicalSkills: '技术能力',
  communicationExpression: '沟通表达',
  logicalThinking: '逻辑思维',
  learningAbility: '学习能力',
  teamWork: '团队协作',
  stressTolerance: '抗压能力',
  innovativeThinking: '创新思维',
  problemSolving: '问题解决'
}

const radarOption = computed(() => {
  const radarData = interview.value.summary?.ability_radar || {}

  return {
    title: { text: '能力雷达图' },
    tooltip: {},
    radar: {
      indicator: Object.keys(radarData).map(key => ({
        name: keyMap[key] || key, // 显示中文
        max: 10
      }))
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: Object.values(radarData),
            name: '评分'
          }
        ]
      }
    ]
  }
})


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

    <a-card v-if="interview.endTime === null"
            style=" width: 100%;
            border-radius: 14px;
            padding-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-sizing: border-box;
            border: 2px solid black; /* 黑色边框 */
            box-shadow: 0 0 15px rgba(128, 128, 128, 0.6); /* 灰色光晕 */"
                    
                    
    >

      <!-- interview header -->
      <div class="interview_header">
          <!-- 展现题号 -->
          <span class="question-number"> {{ questionPos === null ? '面试尚未开始' : `问题 ${questionPos + 1}` }}</span>

          <video ref="videoRef" autoplay muted playsinline class="interview_video"></video>
      </div>
      
      <!-- interview content -->
      <div class="interview_content">
        <div class="speak_box">
          <span class="info_word"> 请回答以下问题：</span>
          <div class="display_word">
            {{ questionPos === null ? '面试尚未开始' : (questions[questionPos] || '没有更多问题') }}
          </div>

        </div>

        <a-divider direction="vertical" />

        <div class="speak_box">
          <span class="info_word"> 你的回答：</span>

          <div class="display_word">
            {{ transcriptText || '（暂无回答）' }}
          </div>
        </div>

      </div>


      <a-space wrap size="medium" style="margin-top: 10px;">
        <a-button type="primary" shape="round" @click="startInterview()">开始面试</a-button>
        <a-button type="primary" shape="round" @click="stopInterview()">停止面试</a-button>
        <a-button type="primary" shape="round" @click="nextQuestion">下一题</a-button>
      </a-space>

      <div class="question-list">
        <a-card
          v-for="(question, index) in questions"
          :key="index"
          hoverable
          class="card-demo"
        >
          <template #title>
            <div class="question-title">Question {{ index + 1 }}</div>
          </template>

          <div>{{ question }}</div>
          <button @click="playAudio(index)">播放音频</button>
        </a-card>
      </div>
    
    </a-card>


    <a-card style=" width: 100%;
                    border-radius: 14px;
                    padding-top: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    box-sizing: border-box;
                    border: 2px solid black; /* 黑色边框 */
                    box-shadow: 0 0 15px rgba(128, 128, 128, 0.6); /* 灰色光晕 */"
                    v-else
    >
      <!-- 简历 & 视频 -->
      <div>
        <a-typography-title :heading="4">面试视频 & 简历</a-typography-title>
        <video v-if="interview.videoUrl" :src="interview.videoUrl" controls width="400"></video>
        <br />        
        <div v-if="interview.videoUrl">
          视频：
          <a :href="interview.videoUrl" target="_blank" download>点击下载视频</a>
        </div>
        <div v-if="interview.resumeUrl">
          简历：
          <a :href="interview.resumeUrl" target="_blank" download>点击下载简历</a>
        </div>
      </div>
      
      <a-divider />
      
      <!-- 面试总结 -->
      <template v-if="interview.summary">
        <a-typography-title :heading="4">面试总结</a-typography-title>

        <!-- 总体评价 -->
        <a-typography>
          <a-typography-title :heading="5">总体评价</a-typography-title>
          <a-typography-paragraph>
            {{ interview.summary.overall_assessment }}
          </a-typography-paragraph>
        </a-typography>

        <!-- 能力雷达 -->
        <a-typography>
          <a-typography-title :heading="5">能力评分</a-typography-title>
          <a-space wrap>
            <a-tag
              v-for="(score, ability) in interview.summary.ability_radar"
              :key="ability"
              color="arcoblue"
            >
              {{ ability }}: {{ score }} / 10.0
            </a-tag>
          </a-space>
        </a-typography>

        <div v-if="interview.summary?.ability_radar">
          <a-typography-title :heading="4">能力雷达图</a-typography-title>
          <v-chart :option="radarOption" style="width: 500px; height: 400px;" />
        </div>


        <!-- 关键问题 -->
        <a-typography style="margin-top: 16px">
          <a-typography-title :heading="5">关键问题</a-typography-title>
          <div v-for="(issue, index) in interview.summary.key_issues" :key="index" style="margin-bottom: 12px">
            <a-tag color="red">{{ issue.category }}</a-tag>
            <a-typography-paragraph>{{ issue.feedback }}</a-typography-paragraph>
          </div>
        </a-typography>

        <!-- 行为反馈 -->
        <a-typography style="margin-top: 16px">
          <a-typography-title :heading="5">行为反馈</a-typography-title>
          <ul>
            <li v-for="(feedback, index) in interview.summary.behavioral_feedback" :key="index">
              {{ feedback }}
            </li>
          </ul>
        </a-typography>

        <!-- 招聘建议 -->
        <a-typography style="margin-top: 16px">
          <a-typography-title :heading="5">招聘建议</a-typography-title>
          <a-typography-paragraph>
            {{ interview.summary.recommendation }}
          </a-typography-paragraph>
        </a-typography>

        <!-- 改进建议 -->
        <a-typography style="margin-top: 16px">
          <a-typography-title :heading="5">改进建议</a-typography-title>
          <ul>
            <li v-for="(suggestion, index) in interview.summary.improvement_suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </a-typography>
      </template>






      <!-- 视频分析结果 -->
      <template v-if="interview.videoAnalyzeResult && interview.videoAnalyzeResult.videoAssessment">
        <a-divider />
        <a-typography-title :heading="4">视频分析结果</a-typography-title>

        <!-- 数值字段 -->
        <a-space wrap>
          <a-tag color="blue">
            参与度 (Engagement): {{ interview.videoAnalyzeResult.videoAssessment.engagement }} / 1.0
          </a-tag>
          <a-tag color="green">
            自信度 (Confidence): {{ interview.videoAnalyzeResult.videoAssessment.confidence }} / 1.0
          </a-tag>
          <a-tag color="orange">
            压力水平 (Stress): {{ interview.videoAnalyzeResult.videoAssessment.stress }} / 1.0
          </a-tag>
        </a-space>

        <!-- Notes -->
        <a-typography style="margin-top: 8px">
          <a-typography-title :heading="5">分析备注</a-typography-title>
          <a-typography-paragraph>
            {{ interview.videoAnalyzeResult.videoAssessment.notes }}
          </a-typography-paragraph>
        </a-typography>

        <!-- Summary -->
        <a-typography>
          <a-typography-title :heading="5">总结</a-typography-title>
          <a-typography-paragraph>
            {{ interview.videoAnalyzeResult.summary }}
          </a-typography-paragraph>
        </a-typography>
      </template>

      <a-divider />

      <!-- 音频分析结果 -->
      <a-typography-title :heading="4">音频分析结果</a-typography-title>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="item in objectToList(interview.audioAnalyzeResult)"
          :key="item.key"
          :span="6"
        >
          <a-card hoverable>
            <template #title>{{ item.key }}</template>
            <p>{{ item.value }}</p>
          </a-card>
        </a-col>
      </a-row>

      <a-typography-title :heading="4">试题回答质量分析</a-typography-title>

      <a-typography v-for="item in interviewResult" :key="item.interviewResultId">
        <a-typography-title :heading="5" class="result-title">
          {{ item.question }}
        </a-typography-title>

        <a-typography-paragraph class="result-description">
          {{ item.answer }}
        </a-typography-paragraph>

        <!-- 总分 -->
        <a-tag color="blue">
          总分：{{ item.overallScore }} / 10.0
        </a-tag>

        <!-- 各维度得分 -->
        <a-divider />
        <div class="dimensions">
          <a-tag color="arcoblue">完整性: {{ item.dimensions.completeness }} / 10.0 </a-tag>
          <a-tag color="green">准确性: {{ item.dimensions.accuracy }} / 10.0 </a-tag>
          <a-tag color="orange">清晰度: {{ item.dimensions.clarity }} / 10.0 </a-tag>
          <a-tag color="purple">深度: {{ item.dimensions.depth }} / 10.0 </a-tag>
          <a-tag color="red">经验: {{ item.dimensions.experience }} / 10.0 </a-tag>
        </div>

        <!-- 反馈 -->
        <a-divider />
        <a-typography-paragraph>
          <strong>反馈：</strong>{{ item.feedback }}
        </a-typography-paragraph>

        <!-- 是否需要跟进 -->
        <a-space>
          <a-tag v-if="item.needFollowup" color="red">需要跟进</a-tag>
          <a-tag v-else color="green">无需跟进</a-tag>
        </a-space>

        <br/>
      </a-typography>


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

.interview_header {
  display: flex;              /* 使用flex布局 */
  justify-content: space-between; /* 左右两端对齐 */
  align-items: center;        /* 垂直居中对齐 */
  width: 100%;                /* 撑满父容器 */
  padding: 0;

  .question-number {
    /* 你可以加一些样式美化题号 */
    font-size: 48px;
    font-weight: bold;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 使用 macOS 默认字体 */
    margin-left: 20px;
  }

  .interview_video {
    width: 320px;
    height: 180px;
    aspect-ratio: 16 / 9;
    border: 1px solid #ccc;
    background: black;
    display: block;
  }
}

.interview_content {
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  min-height: 500px;

  border: 1px solid #ccc; /* 灰色边框 */
  border-radius: 8px;     /* 圆角 */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

  background-color: #fff; /* 建议加个白底，让阴影更明显 */

  .speak_box {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;     /* 垂直居中 */
    gap: 24px;
  }

  .info_word {
    font-size: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 使用 macOS 默认字体 */
  }

  .display_word {
    font-size: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 使用 macOS 默认字体 */
  }

}



  .question-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 16px;
    padding-left: 16px;
    padding-right: 16px;
    flex: 1;
  }

  .question-title {
    font-size: 20px;
    font-weight: bold;
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


  .result-description {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: #333;
    white-space: pre-line;
  }

  .result-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 20px;
    line-height: 1.5;
    color: #333;
    font-weight: 500;
  }

  .result-card {
    width: 80%;
  }

  .dimensions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

</style>