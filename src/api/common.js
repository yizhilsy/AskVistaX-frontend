import request from "@/utils/request.js"

// 用户登录函数
export const loginService = (loginData) => {
    const params = new URLSearchParams();
    for(let key in loginData){
        params.append(key,loginData[key]);
    }
    return request.post('/common/login', params);
}

export const logoutService = () => {
    return request.post('/common/logout');
}

export const registerCandidateService = (registerBasicData, registerCandidateData) => {
    const payload = {
      registerUser: registerBasicData,
      registerCandidate: registerCandidateData
    };

    return request.post('/common/registerCandidate', payload);
}

export const registerInterviewerService = (registerBasicData, registerInterviewerData) => {
    const payload = {
      registerUser: registerBasicData,
      registerInterviewer: registerInterviewerData
    };

    return request.post('/common/registerInterviewer', payload);
}

export const getUserInfoService = () => {
    return request.get('/common/getMyInfo');
}

export const uploadService = (file) => {
  const formData = new FormData();
  formData.append('file', file); // key必须和后端MultipartFile参数名一致

  return request.post('/common/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};