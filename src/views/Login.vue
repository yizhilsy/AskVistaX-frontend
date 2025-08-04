<script setup>
import { User, Lock, Postcard, Phone, Top, School, MagicStick, OfficeBuilding, CoffeeCup } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus';

// 默认显示登录表单
const isLogin = ref(true)
// 默认选中求职者注册角色
const isCandidate = ref(true)

// 定义数据模型
// 注册数据模型
const registerBasicData = ref({
    // basic user info
    userAccount: '',
    password: '',
    rePassword: '',
    userName: '',
    roleType: '',
    avatar: '',
    birth: '',
    phone: '',
    email: '',
    gender: ''
})

const registerCandidateData = ref({
    // candidate info
    realName: '',
    education: '',
    university: '',
    major: '',
    applyType: '',
    userAccount: ''
})

const registerInterviewerData = ref({
    // interviewer info
    realName: '',
    businessGroup: '',
    department: '',
    rankLevel: '',
    position: '',
    userAccount: ''
})


const loginData = ref({
    userAccount: '',
    password: '',
})


const checkRePassword_login = (rule,value,callback) => {
    if(value===''){
        callback(new Error('请再次确认密码'))
    }else if(value !== loginData.value.password){
        callback(new Error('请确保两次输入的密码一样'))
    }else{
        callback()
    }
}

const checkRePassword_register = (rule,value,callback) => {
    if(value===''){
        callback(new Error('请再次确认密码'))
    }else if(value !== registerBasicData.value.password){
        callback(new Error('请确保两次输入的密码一样'))
    }else{
        callback()
    }
}

// 定义表单校验规则
const rules_login = {
    userAccount: [
        { required: true, message: '请输入账户名', trigger: 'blur' },
        { min: 3, max: 16, message: '账号应为3~16位非空字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5, max: 16, message: '密码应为5~16位非空字符', trigger: 'blur' }
    ],
    rePassword: [
        { validator: checkRePassword_login, trigger: 'blur' }
    ]
};

const rules_register = {
    userAccount:[
        {required:true, message:'请输入账户名', trigger:'blur'},
        {min:3, max:16, message:'账号应为3~16位非空字符', trigger:'blur'}
    ],
    password:[
        {required:true, message:'请输入密码', trigger:'blur'},
        {min:5, max:16, message:'密码应为5~16位非空字符', trigger:'blur'}
    ],
    rePassword:[
        {validator:checkRePassword_register,trigger:'blur'}
    ]
};


// 登录函数
import { useTokenStore } from '@/stores/token.js';
import { useRouter } from 'vue-router'
import { loginService } from '@/api/common.js';
const router = useRouter()
const tokenStore = useTokenStore();
const login = async() => {
    // 调用接口，完成登录
    let result = await loginService(loginData.value);
    ElMessage.success(result.msg ? result.msg : "登录成功");
    // 将响应的token存到pinia中
    tokenStore.setToken(result.data)

    clearLoginData();
    // 跳转到首页 路由完成跳转
    router.push('/')
}

const clearLoginData = () => {
    loginData.value = {
        userAccount:'',
        password: ''
    }
}

const clearRegisterData = () => {
    registerBasicData.value = {
        userAccount: '',
        password: '',
        rePassword: '',
        userName: '',
        roleType: '',
        avatar: '',
        birth: '',
        phone: '',
        email: '',
        gender: ''
    };
    registerCandidateData.value = {
        realName: '',
        education: '',
        university: '',
        major: '',
        applyType: '',
        userAccount: ''
    };
    registerInterviewerData.value = {
        realName: '',
        businessGroup: '',
        department: '',
        rankLevel: '',
        position: '',
        userAccount: ''
    };
}

import { registerCandidateService, registerInterviewerService } from '@/api/common.js';

const register = async () => {
    let result = null;
    if (isCandidate.value === true) {
        registerCandidateData.value.userAccount = registerBasicData.value.userAccount;
        result = await registerCandidateService(registerBasicData.value, registerCandidateData.value);
    }
    else {
        registerInterviewerData.value.userAccount = registerBasicData.value.userAccount;
        result = await registerInterviewerService(registerBasicData.value, registerInterviewerData.value);
    }
    clearRegisterData();
    ElMessage.success(result.msg?result.msg:"注册成功")
}

const reg_current = ref(1);

const onPrev = () => {
    reg_current.value = Math.max(1, reg_current.value - 1);
}

const onNext = () => {
    reg_current.value = Math.min(3, reg_current.value + 1);
}

import candidateicon from '@/assets/candidateicon2.webp'
import interviewericon from '@/assets/interviewer2.webp'
import administratoricon from '@/assets/administratoricon.webp'

const roles = [
    { name: 'Administrator', image: administratoricon },
    { name: 'Interviewer', image: interviewericon },
    { name: 'Candidate', image: candidateicon }
]

const selectedRoleIndex = ref(2)
registerBasicData.value.roleType = selectedRoleIndex.value; // 默认选中Candidate角色

</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="isLogin ? 6 : 8" :offset="isLogin ? 3 : 2" class="form">
            <!-- 登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isLogin" :model="loginData" :rules="rules_login">
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="userAccount">
                    <el-input :prefix-icon="User" placeholder="请输入账户名" v-model="loginData.userAccount"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input :prefix-icon="Lock" type="password" show-password placeholder="请输入密码" v-model="loginData.password"></el-input>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="clearLoginData(); isLogin = false;">
                        注册 →
                    </el-link>
                </el-form-item>
            </el-form>
            
            <div v-else class="register-container">
                <!-- 注册步骤条 -->
                <div class="register-steps-aside">
                    <div class="steps-center-wrapper">
                        <a-steps :current="reg_current" direction="vertical">
                            <a-step>用户基本信息</a-step>
                            <a-step>用户身份信息</a-step>
                            <a-step>完成注册</a-step>
                        </a-steps>
                    </div>

                    <div class="back-login-link">
                        <el-form-item>
                            <el-link type="info" :underline="false" @click="clearRegisterData(); isLogin = true;">
                                ← 返回登录
                            </el-link>
                        </el-form-item>
                    </div>
                </div>
                
                <!-- 注册表单主体部分 -->
                <div class="register-main">

                    <!-- 用户基本信息注册表单 -->
                    <el-form ref="form" size="large" autocomplete="off" 
                        label-width="120px" label-align="left" 
                        v-if="reg_current === 1"
                        :model="registerBasicData" :rules="rules_register">
                        <el-form-item>
                            <h1>注册</h1>
                        </el-form-item>

                        <el-form-item label="账户名" prop="userAccount">
                            <el-input :prefix-icon="User" placeholder="请输入账户名" v-model="registerBasicData.userAccount"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input :prefix-icon="Lock" type="password" show-password placeholder="请输入密码" v-model="registerBasicData.password"></el-input>
                        </el-form-item>
                        <el-form-item label="重复密码" prop="rePassword">
                            <el-input :prefix-icon="Lock" type="password" show-password placeholder="请再次输入密码" v-model="registerBasicData.rePassword"></el-input>
                        </el-form-item>

                        <el-form-item label="用户名" prop="userName">
                            <el-input :prefix-icon="Postcard" placeholder="请输入用户名" v-model="registerBasicData.userName"></el-input>
                        </el-form-item>

                        <el-form-item label="出生年月" prop="birth">
                            <el-date-picker
                                style="--el-input-border-radius: 20px; width: 100%;"
                                v-model="registerBasicData.birth"
                                type="date"
                                format="YYYY/MM/DD"
                                value-format="YYYY-MM-DD"
                                placeholder="请输入出生年月"
                            />
                        </el-form-item>


                        <el-form-item label="联系电话" prop="phone">
                            <el-input :prefix-icon="Phone" placeholder="请输入联系电话" v-model="registerBasicData.phone"></el-input>
                        </el-form-item>

                        <el-form-item label="联系邮箱" prop="email">
                            <el-input placeholder="请输入联系邮箱" v-model="registerBasicData.email">
                                <template #prefix>
                                <icon-email />
                                </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item label="性别" prop="gender">
                        <el-radio-group v-model="registerBasicData.gender">
                            <el-radio value="0">
                                Confidential
                            </el-radio>
                            <el-radio value="1">
                                <icon-man />Male
                            </el-radio>
                            <el-radio value="2">
                                <icon-woman />Female
                            </el-radio>
                        </el-radio-group>
                        </el-form-item>
                    </el-form>

                    <!-- 用户身份选择区域 -->
                    <div class="role-selection" v-if="reg_current === 2">
                      <div v-for="(role, index) in roles" :key="index" class="role-card">
                        <!-- 头像区域 -->
                        <img
                          :src="role.image"
                          class="avatar"
                          :class="{ 'selected-avatar': selectedRoleIndex === index }"
                          @click="selectedRoleIndex = index; isCandidate = (index === 2); registerBasicData.roleType = selectedRoleIndex;"
                        />

                        <!-- 姓名区域 -->
                        <div class="role-name">{{ role.name }}</div>
                      </div>
                    </div>

                    <!-- 用户身份信息注册表单 -->
                    <!-- candidate -->
                    <el-form ref="form" size="large" autocomplete="off" 
                        label-width="120px" label-align="left" 
                        v-if="reg_current === 2 && isCandidate === true"
                        :model="registerCandidateData" :rules="rules">

                        <el-form-item label="真实姓名" prop="realName">
                            <el-input placeholder="请输入真实姓名" v-model="registerCandidateData.realName">
                            <template #prefix>
                                <icon-user />
                            </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item label="学历" prop="education">
                        <el-select size="large" v-model="registerCandidateData.education">
                            <el-option label="其他" value=0 />
                            <el-option label="普通本科" value=1 />
                            <el-option label="硕士" value=2 />
                            <el-option label="博士" value=3 />
                            <el-option label="博士后" value=4 />
                        </el-select>

                        <template #prefix>
                            <icon-book />
                        </template>
                        </el-form-item>

                        <el-form-item label="毕业院校" prop="university">
                            <el-input :prefix-icon="School" placeholder="请输入毕业院校" v-model="registerCandidateData.university"></el-input>
                        </el-form-item>

                        <el-form-item label="专业" prop="major">
                            <el-input :prefix-icon="MagicStick" placeholder="请输入专业" v-model="registerCandidateData.major"></el-input>
                        </el-form-item>

                        <el-form-item label="应聘类型" prop="applyType">
                        <el-select size="large" v-model="registerCandidateData.applyType">
                            <el-option label="校园招聘" value=0 />
                            <el-option label="社会招聘" value=1 />
                        </el-select>
                        </el-form-item>
                    </el-form>

                    <!-- interviewer/admin -->
                    <el-form ref="form" size="large" autocomplete="off" 
                        label-width="120px" label-align="left" 
                        v-if="reg_current === 2 && isCandidate === false"
                        :model="registerInterviewerData" :rules="rules">

                        <el-form-item label="真实姓名" prop="realName">
                            <el-input placeholder="请输入真实姓名" v-model="registerInterviewerData.realName">
                            <template #prefix>
                                <icon-user />
                            </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item label="所属事业群" prop="businessGroup">
                            <el-input :prefix-icon="OfficeBuilding" placeholder="请输入所属事业群" v-model="registerInterviewerData.businessGroup"></el-input>
                        </el-form-item>

                        <el-form-item label="所属部门" prop="department">
                            <el-input :prefix-icon="CoffeeCup" placeholder="请输入所属部门" v-model="registerInterviewerData.department"></el-input>
                        </el-form-item>
                        
                        <el-form-item label="职级" prop="rankLevel">
                            <el-select size="large" v-model="registerInterviewerData.rankLevel">
                                <el-option label="资深专家" value="P9" />
                                <el-option label="研究员" value="P10" />
                                <el-option label="高级研究员" value="P11" />
                                <el-option label="资深研究员" value="P12" />
                                <el-option label="科学家" value="P13" />
                                <el-option label="资深科学家" value="P14" />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="职位" prop="position">
                            <el-input placeholder="请输入职位" v-model="registerInterviewerData.position">
                                <template #prefix>
                                    <icon-user-group />
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>



                    <el-form-item v-if="reg_current === 3">
                        <el-button class="button" type="primary" auto-insert-space @click="register(); isLogin = true;">
                            注册
                        </el-button>
                    </el-form-item>



                    <div class="register-bottom">
                    <a-button :disabled="reg_current===1" @click="onPrev">
                        <icon-left />
                        Back
                    </a-button>
                    <a-button :disabled="reg_current===3" @click="onNext">
                        Next
                        <icon-right />
                    </a-button>
                    </div>
                </div>
                


            </div>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: #ffffff;

    .bg {
        background: 
            url('@/assets/Cover.webp') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;

        .title {
            margin: 0 auto;
        }

        .button {
            width: 100%;
        }

        .input {

        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }

    }
}

.el-input{
    --el-input-border-radius: 20px;
}

.register-container {
  display: flex;
  gap: 20px; // 左右间距
  align-items: center;
}

.register-steps-aside {
  width: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  min-height: 100%;
}

.steps-center-wrapper {
    display: flex;
    justify-content: center;
    flex-direction: column;
    flex: 1;
    margin-bottom: 80px; /* 保证它比返回链接高出一些 */
}

.back-login-link {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-top: 12px;
}


.register-main {
    flex: 1;
}

.register-bottom {
  display: flex;
  justify-content: center;

  button {
    margin: 0 20px;
  }
}

.role-selection {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 24px;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
}

/* 默认头像样式 */
.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ccc;
    transition: border-color 0.3s ease, transform 0.2s ease; /* ✅ 添加 transform 动画 */
    cursor: pointer;
    box-sizing: border-box; /* ✅ 保持含边框整体宽高不变 */
}

/* 被选中的头像样式（淡紫色边框） */
.selected-avatar {
    border-color: #d6b4fc;
    border-width: 4px;
    transform: scale(0.95); /* ✅ 缩小到 95% 大小 */
}

/* 姓名样式 */
.role-name {
    margin-top: 8px;
    font-weight: bold;
    text-align: center;
}


</style>
