import api from './axios';

// Types
export interface WrongNote {
  uuid: string;
  wrong_answer: string;
  ai_explanation?: string;
  is_reviewed: boolean;
  next_review_at?: string;
  created_at: string;
  problem?: {
    uuid: string;
    number: number;
    summary: string;
  };
}

export interface CreateWrongNoteRequest {
  problem_uuid: string;
  wrong_answer: string;
}

export interface UpdateWrongNoteRequest {
  wrong_answer?: string;
  is_reviewed?: boolean;
}

// Wrong Note API
export const wrongNoteAPI = {
  // 오답 노트 목록 조회
  getWrongNoteList: async (params?: {
    page?: number;
    size?: number;
    is_reviewed?: boolean;
  }): Promise<{ results: WrongNote[]; page: number; size: number }> => {
    const response = await api.get('/wrong-notes', { params });
    return response.data;
  },

  // 오답 노트 상세 조회
  getWrongNote: async (uuid: string): Promise<WrongNote> => {
    const response = await api.get<WrongNote>(`/wrong-notes/${uuid}`);
    return response.data;
  },

  // 오답 노트 생성
  createWrongNote: async (data: CreateWrongNoteRequest): Promise<WrongNote> => {
    const response = await api.post<WrongNote>('/wrong-notes', data);
    return response.data;
  },

  // 오답 노트 수정
  updateWrongNote: async (uuid: string, data: UpdateWrongNoteRequest): Promise<WrongNote> => {
    const response = await api.put<WrongNote>(`/wrong-notes/${uuid}`, data);
    return response.data;
  },

  // 오답 노트 삭제
  deleteWrongNote: async (uuid: string): Promise<void> => {
    await api.delete(`/wrong-notes/${uuid}`);
  },

  // AI 설명 생성 요청
  generateAIExplanation: async (uuid: string): Promise<WrongNote> => {
    const response = await api.post<WrongNote>(`/wrong-notes/${uuid}/generate-explanation`);
    return response.data;
  },

  // 재검토 필요한 오답 노트 목록
  getReviewNeeded: async (params?: {
    page?: number;
    size?: number;
  }): Promise<{ results: WrongNote[]; page: number; size: number }> => {
    const response = await api.get('/wrong-notes/review-needed', { params });
    return response.data;
  },
};
