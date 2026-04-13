import api from './axios';

// Types
export interface Note {
  uuid: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

// Note API
export const noteAPI = {
  // 노트 목록 조회
  getNoteList: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    is_asc?: boolean;
  }): Promise<{ results: Note[]; page: number; size: number; sort: string; is_asc: boolean }> => {
    const response = await api.get('/notes', { params });
    return response.data;
  },

  // 노트 상세 조회
  getNote: async (uuid: string): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${uuid}`);
    return response.data;
  },

  // 노트 생성
  createNote: async (data: CreateNoteRequest): Promise<Note> => {
    const response = await api.post<Note>('/notes', data);
    return response.data;
  },

  // 노트 수정
  updateNote: async (uuid: string, data: UpdateNoteRequest): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${uuid}`, data);
    return response.data;
  },

  // 노트 삭제
  deleteNote: async (uuid: string): Promise<void> => {
    await api.delete(`/notes/${uuid}`);
  },
};
