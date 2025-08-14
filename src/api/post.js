import request from "@/utils/request.js"

export const listPostsService = (params) => {
    return request.get('/post/listPosts', { params: params });
}

export const getPostByPostIdService = (params) => {
    return request.get('/post/getPostByPostId', { params: params });
}

export const deliveryPostService = (params) => {
    const paramsURL = new URLSearchParams();
    for(let key in params){
        paramsURL.append(key,params[key]);
    }

    return request.post('/post/deliveryPost', paramsURL);
}

export const llMyDeliveryPostsService = () => {
    return request.get('/post/llMyDeliveryPosts');
}