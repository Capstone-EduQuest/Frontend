import api from './axios'

export interface Note {
  uuid?: string
  title: string
  content: string
  author_uuid?: string
  created_at?: string
  updated_at?: string
}

const mapNote = (note: Record<string, unknown>): Note => ({
  uuid: typeof note.uuid === 'string' ? note.uuid : undefined,
  title: typeof note.title === 'string' ? note.title : '',
  content: typeof note.content === 'string' ? note.content : '',
  author_uuid: typeof note.author_uuid === 'string' ? note.author_uuid : undefined,
  created_at:
    typeof note.created_at === 'string'
      ? note.created_at
      : typeof note.createdAt === 'string'
        ? note.createdAt
        : undefined,
  updated_at:
    typeof note.updated_at === 'string'
      ? note.updated_at
      : typeof note.updatedAt === 'string'
        ? note.updatedAt
        : undefined,
})

export const noteAPI = {
  getNoteList: async (params?: {
    page?: number
    size?: number
    sort?: string
    is_asc?: boolean
    searchBy?: 'title' | 'content'
    keyword?: string
  }) => {
    const response = await api.get<{ results: Record<string, unknown>[] }>('/notes', { params })
    return {
      ...response.data,
      results: response.data.results.map(mapNote),
    }
  },
  getNote: async (uuid: string) => {
    const response = await api.get<Record<string, unknown>>(`/notes/${uuid}`)
    return mapNote(response.data)
  },
  createNote: async (data: { title: string; content: string }) => {
    const response = await api.post<string | void>('/notes', data)
    return response.data
  },
  updateNote: async (uuid: string, data: { title: string; content: string }) => {
    await api.put(`/notes/${uuid}`, data)
  },
  deleteNote: async (uuid: string) => {
    await api.delete(`/notes/${uuid}`)
  },
}
