import api from './axios';

// Types
export interface CommunityPost {
  uuid: string;
  title: string;
  content: string;
  is_adopted: boolean;
  created_at: string;
  member: {
    uuid: string;
    user_id: string;
    nickname: string;
  };
  answers_count?: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface CommunityAnswer {
  uuid: string;
  content: string;
  is_adopted: boolean;
  created_at: string;
  member: {
    uuid: string;
    user_id: string;
    nickname: string;
  };
}

export interface CreateAnswerRequest {
  content: string;
}

// Community Post API
export const communityPostAPI = {
  // 커뮤니티 글 목록 조회
  getPostList: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    is_asc?: boolean;
  }): Promise<{ results: CommunityPost[]; page: number; size: number; sort: string; is_asc: boolean }> => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // 커뮤니티 글 상세 조회
  getPost: async (uuid: string): Promise<CommunityPost> => {
    const response = await api.get<CommunityPost>(`/questions/${uuid}`);
    return response.data;
  },

  // 커뮤니티 글 생성
  createPost: async (data: CreatePostRequest): Promise<CommunityPost> => {
    const response = await api.post<CommunityPost>('/questions', data);
    return response.data;
  },

  // 커뮤니티 글 수정
  updatePost: async (uuid: string, data: CreatePostRequest): Promise<CommunityPost> => {
    const response = await api.put<CommunityPost>(`/questions/${uuid}`, data);
    return response.data;
  },

  // 커뮤니티 글 삭제
  deletePost: async (uuid: string): Promise<void> => {
    await api.delete(`/questions/${uuid}`);
  },
};

// Community Answer API
export const communityAnswerAPI = {
  // 댓글 목록 조회
  getAnswerList: async (postUuid: string, params?: {
    page?: number;
    size?: number;
  }): Promise<{ results: CommunityAnswer[]; page: number; size: number }> => {
    const response = await api.get(`/questions/${postUuid}/answers`, { params });
    return response.data;
  },

  // 댓글 상세 조회
  getAnswer: async (uuid: string): Promise<CommunityAnswer> => {
    const response = await api.get<CommunityAnswer>(`/answers/${uuid}`);
    return response.data;
  },

  // 댓글 생성
  createAnswer: async (postUuid: string, data: CreateAnswerRequest): Promise<CommunityAnswer> => {
    const response = await api.post<CommunityAnswer>(`/questions/${postUuid}/answers`, data);
    return response.data;
  },

  // 댓글 수정
  updateAnswer: async (uuid: string, data: CreateAnswerRequest): Promise<CommunityAnswer> => {
    const response = await api.put<CommunityAnswer>(`/answers/${uuid}`, data);
    return response.data;
  },

  // 댓글 삭제
  deleteAnswer: async (uuid: string): Promise<void> => {
    await api.delete(`/answers/${uuid}`);
  },

  // 댓글 채택
  adoptAnswer: async (uuid: string): Promise<CommunityAnswer> => {
    const response = await api.post<CommunityAnswer>(`/answers/${uuid}/adopt`);
    return response.data;
  },
};