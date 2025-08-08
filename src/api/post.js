import request from "@/utils/request.js"

export const listPostsService = (params) => {
    return request.get('/post/listPosts', { params: params });
}

export const getPostByPostIdService = (params) => {
    return request.get('/post/getPostByPostId', { params: params });
}