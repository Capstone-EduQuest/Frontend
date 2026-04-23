import api from './axios'

export interface PagedResponse<T> {
  results: T[]
  page?: number
  size?: number
  sort?: string
  is_asc?: boolean
}

export interface Stage {
  uuid: string
  title: string
  number: number
  reward: number
  created_at?: string
  updated_at?: string
}

export interface ProblemBlock {
  order?: number
  number?: number
  code: string
}

export interface ProblemDetail {
  uuid: string
  stage?: string
  stage_uuid?: string
  type: string
  number: number
  summary: string
  example?: string
  expectedOutput?: string
  blocks?: ProblemBlock[]
  block?: {
    answer: number[]
    blocks: ProblemBlock[]
  }
  hints?: Array<number | { level: number; point: number; content: string }>
}

export interface CreateProblemRequest {
  stage_uuid: string
  type: string
  number: number
  summary: string
  example: string
  expectedOutput: string
  block: {
    answer: number[]
    blocks: { order: number; code: string }[]
  }
  hints: { level: number; point: number; content: string }[]
}

export interface ProgressResponse {
  results: {
    stage: string | number
    total_question_count: number
    clear: number[]
  }[]
}

export const stageAPI = {
  getStageList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<PagedResponse<Stage>>('/stages', { params })
    return response.data
  },
  getStage: async (uuid: string) => {
    const response = await api.get<Stage>(`/stages/${uuid}`)
    return response.data
  },
  createStage: async (data: { title: string; number: number; reward: number }) => {
    const response = await api.post<Stage>('/stages', data)
    return response.data
  },
  updateStage: async (uuid: string, data: { title: string; number: number; reward: number }) => {
    await api.put(`/stages/${uuid}`, data)
  },
  deleteStage: async (uuid: string) => {
    await api.delete(`/stages/${uuid}`)
  },
}

export const problemAPI = {
  getProblemList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<PagedResponse<ProblemDetail>>('/problems', { params })
    return response.data
  },
  getProblemsByStage: async (stageNumber: number) => {
    const response = await api.get<{ results: ProblemDetail[] }>('/problems', {
      params: { stage_number: stageNumber },
    })
    return response.data
  },
  getProblem: async (uuid: string) => {
    const response = await api.get<ProblemDetail>(`/problems/${uuid}`)
    return response.data
  },
  createProblem: async (data: CreateProblemRequest) => {
    const response = await api.post('/problems', data)
    return response.data
  },
  updateProblem: async (uuid: string, data: FormData) => {
    await api.put(`/problems/${uuid}`, data)
  },
  deleteProblem: async (uuid: string) => {
    await api.delete(`/problems/${uuid}`)
  },
}

export const submissionAPI = {
  submitProblem: async (problemUuid: string, answer: string | number[]) => {
    const response = await api.post<{ result: boolean }>(`/problems/${problemUuid}/submissions`, { answer })
    return response.data
  },
}

export const hintAPI = {
  getHint: async (problemUuid: string, level: number) => {
    const response = await api.get<{ hint: string }>(`/problems/${problemUuid}/hint`, {
      params: { level },
    })
    return response.data
  },
}

export const progressAPI = {
  getProgress: async (userUuid: string) => {
    const response = await api.get<ProgressResponse>(`/users/${userUuid}/progress`)
    return response.data
  },
}
