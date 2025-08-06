import request from "@/utils/request.js"

export const listPostsService = (params) => {
    return request.get('/post/listPosts', { params: params });
}