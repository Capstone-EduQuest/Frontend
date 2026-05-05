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
  problem_id:
    typeof note.problemId === 'number'
      ? note.problemId
      : typeof note.problem_id === 'number'
        ? note.problem_id
        : undefined,
  user_uuid:
    typeof note.userUuid === 'string'
      ? note.userUuid
      : typeof note.user_uuid === 'string'
        ? note.user_uuid
        : undefined,
  wrong_answer:
    typeof note.wrongAnswer === 'string'
      ? note.wrongAnswer
      : typeof note.wrong_answer === 'string'
        ? note.wrong_answer
        : '',
  feedback: typeof note.feedback === 'string' ? note.feedback : undefined,
  is_reviewed: typeof note.isReviewed === 'boolean' ? note.isReviewed : Boolean(note.is_reviewed),
  last_submitted_at:
    typeof note.lastSubmittedAt === 'string'
      ? note.lastSubmittedAt
      : typeof note.last_submitted_at === 'string'
        ? note.last_submitted_at
        : undefined,
  created_at:
    typeof note.createdAt === 'string'
      ? note.createdAt
      : typeof note.created_at === 'string'
        ? note.created_at
        : '',
  updated_at:
    typeof note.updatedAt === 'string'
      ? note.updatedAt
      : typeof note.updated_at === 'string'
        ? note.updated_at
        : undefined,
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
  requestAiFeedback: async (uuid: string) => {
    await api.put(`/wrong-notes/${uuid}/ai-feedback`)
  },
}
