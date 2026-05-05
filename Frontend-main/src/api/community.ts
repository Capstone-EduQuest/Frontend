import api from './axios'

export interface CommunityUser {
  uuid?: string
  nickname?: string
}

export interface CommunityPost {
  uuid: string
  title: string
  content?: string
  created_at: string
  user?: CommunityUser
  member?: CommunityUser
  is_adopt?: boolean
  adopted_answer?: string | null
}

export interface CommunityAnswer {
  uuid: string
  content: string
  created_at: string
  is_adopt?: boolean
  user?: CommunityUser
  member?: CommunityUser
}

export const communityPostAPI = {
  getPostList: async (params?: {
    page?: number
    size?: number
    sort?: string
    is_asc?: boolean
    searchBy?: 'title' | 'content' | 'nickname'
    keyword?: string
  }) => {
    const response = await api.get<{ results: CommunityPost[] }>('/questions', { params })
    return response.data
  },
  getPost: async (uuid: string) => {
    const response = await api.get<CommunityPost>(`/questions/${uuid}`)
    return response.data
  },
  createPost: async (data: { title: string; content: string }) => {
    const response = await api.post('/questions', data)
    return response.data
  },
  deletePost: async (uuid: string) => {
    await api.delete(`/questions/${uuid}`)
  },
}

export const communityAnswerAPI = {
  getAnswerList: async (questionUuid: string, params?: { page?: number; size?: number; is_asc?: boolean }) => {
    const response = await api.get<{ results: CommunityAnswer[] }>(`/questions/${questionUuid}/answers`, { params })
    return response.data
  },
  createAnswer: async (questionUuid: string, data: { content: string }) => {
    const response = await api.post(`/question/${questionUuid}/answers`, data)
    return response.data
  },
  deleteAnswer: async (uuid: string) => {
    await api.delete(`/answers/${uuid}`)
  },
  adoptAnswer: async (uuid: string) => {
    const response = await api.post(`/answers/${uuid}/adopt`)
    return response.data
  },
}
