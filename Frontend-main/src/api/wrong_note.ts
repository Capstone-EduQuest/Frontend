import api from './axios'

export interface WrongNote {
  uuid: string
  user_uuid?: string
  problem_uuid?: string
  wrong_answer: string
  correct_answer?: string
  ai_explanation?: string
  is_reviewed: boolean
  created_at: string
  reviewed_at?: string
}

export const wrongNoteAPI = {
  getWrongNote: async (uuid: string) => {
    const response = await api.get<WrongNote>(`/wrong-notes/${uuid}`)
    return response.data
  },
  getWrongNoteList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<{ results: WrongNote[] }>('/wrong-notes', { params })
    return response.data
  },
  getUserWrongNotes: async (userUuid: string, params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<{ results: WrongNote[] }>(`/wrong-notes/users/${userUuid}`, { params })
    return response.data
  },
  deleteWrongNote: async (uuid: string) => {
    await api.delete(`/wrong-notes/${uuid}`)
  },
}
