import api from './axios'

export interface Note {
  uuid: string
  title: string
  content: string
  created_at: string
  updated_at?: string
}

export const noteAPI = {
  getNoteList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<{ results: Note[] }>('/notes', { params })
    return response.data
  },
  getNote: async (uuid: string) => {
    const response = await api.get<Note>(`/notes/${uuid}`)
    return response.data
  },
  createNote: async (data: { title: string; content: string }) => {
    const response = await api.post<Note>('/notes', data)
    return response.data
  },
  updateNote: async (uuid: string, data: { title: string; content: string }) => {
    await api.put(`/notes/${uuid}`, data)
  },
  deleteNote: async (uuid: string) => {
    await api.delete(`/notes/${uuid}`)
  },
}
