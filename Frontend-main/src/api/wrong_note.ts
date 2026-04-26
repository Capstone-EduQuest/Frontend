import api from './axios'

export interface WrongNote {
  uuid: string
  id?: number
  problem_id?: number
  user_uuid?: string
  wrong_answer: string
  feedback?: string
  is_reviewed: boolean
  last_submitted_at?: string
  created_at: string
  updated_at?: string
}

const mapWrongNote = (note: Record<string, unknown>): WrongNote => ({
  uuid: String(note.uuid ?? note.id ?? ''),
  id: typeof note.id === 'number' ? note.id : undefined,
  problem_id: typeof note.problemId === 'number' ? note.problemId : undefined,
  user_uuid: typeof note.userUuid === 'string' ? note.userUuid : undefined,
  wrong_answer: typeof note.wrongAnswer === 'string' ? note.wrongAnswer : '',
  feedback: typeof note.feedback === 'string' ? note.feedback : undefined,
  is_reviewed: Boolean(note.isReviewed),
  last_submitted_at: typeof note.lastSubmittedAt === 'string' ? note.lastSubmittedAt : undefined,
  created_at: typeof note.createdAt === 'string' ? note.createdAt : '',
  updated_at: typeof note.updatedAt === 'string' ? note.updatedAt : undefined,
})

export const wrongNoteAPI = {
  getWrongNote: async (uuid: string) => {
    const response = await api.get<Record<string, unknown>>(`/wrong-notes/${uuid}`)
    return mapWrongNote(response.data)
  },
  getWrongNoteList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<{ results: Record<string, unknown>[] }>('/wrong-notes', { params })
    return {
      ...response.data,
      results: response.data.results.map(mapWrongNote),
    }
  },
  getUserWrongNotes: async (userUuid: string, params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<{ results: Record<string, unknown>[] }>(`/wrong-notes/users/${userUuid}`, { params })
    return {
      ...response.data,
      results: response.data.results.map(mapWrongNote),
    }
  },
  deleteWrongNote: async (uuid: string) => {
    await api.delete(`/wrong-notes/${uuid}`)
  },
}
