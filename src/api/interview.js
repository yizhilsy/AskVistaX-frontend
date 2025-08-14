import request from "@/utils/request.js"

export const getInterviewByIdService = (params) => {
    return request.get('/interview/getInterviewById', { params: params });
}

export const getInterviewRecordByIdService = (params) => {
    return request.get('/interview/getInterviewRecordById', { params: params });
}

export const startInterviewService = (params) => {
    const paramsURL = new URLSearchParams();
    for (let key in params) {
        paramsURL.append(key, params[key]);
    }
    return request.patch('/interview/startInterview', paramsURL);
}

export const endInterviewService = (params) => {
    const paramsURL = new URLSearchParams();
    for (let key in params) {
        paramsURL.append(key, params[key]);
    }
    return request.patch('/interview/endInterview', paramsURL);
}