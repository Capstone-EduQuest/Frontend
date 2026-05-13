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

export interface ProblemBlockPayload {
  answer?: number[]
  blocks?: ProblemBlock[]
}

export interface ProblemDetail {
  uuid: string
  stage?: string
  stage_uuid?: string
  stageUuid?: string
  stageTitle?: string
  stageNumber?: number
  type: string
  number: number
  summary: string
  example?: string
  expectedOutput?: string
  block?: string | ProblemBlockPayload
  hints?: Array<{ level: number; point: number; content: string }>
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
    total_question_count?: number
    totalQuestionCount?: number
    clear: number[]
  }[]
}

type StagePayload = {
  title: string
  number: number
  reward: number
}

type MaybePagedResponse<T> =
  | PagedResponse<T>
  | T[]

const normalizePagedResponse = <T>(data: MaybePagedResponse<T>) => {
  if (Array.isArray(data)) {
    return {
      results: data,
    }
  }

  return {
    ...data,
    results: Array.isArray(data.results) ? data.results : [],
  }
}

const normalizeStagePayload = (data: StagePayload) => {
  const title = data.title.trim()
  const number = Number(data.number)
  const reward = Number(data.reward)

  if (!title) {
    throw new Error('스테이지 제목을 입력해 주세요.')
  }

  if (!Number.isFinite(number) || number < 1) {
    throw new Error('스테이지 번호는 1 이상의 숫자여야 합니다.')
  }

  if (!Number.isFinite(reward) || reward < 0) {
    throw new Error('보상 코인은 0 이상의 숫자여야 합니다.')
  }

  return {
    title,
    number: Math.trunc(number),
    reward: Math.trunc(reward),
  }
}

export const stageAPI = {
  getStageList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<MaybePagedResponse<Stage>>('/stages', { params })
    return normalizePagedResponse(response.data)
  },
  getStage: async (uuid: string) => {
    const response = await api.get<Stage>(`/stages/${uuid}`)
    return response.data
  },
  createStage: async (data: StagePayload) => {
    const response = await api.post<Stage>('/stages', normalizeStagePayload(data))
    return response.data
  },
  updateStage: async (uuid: string, data: StagePayload) => {
    await api.put(`/stages/${uuid}`, normalizeStagePayload(data))
  },
  deleteStage: async (uuid: string) => {
    await api.delete(`/stages/${uuid}`)
  },
}

export const problemAPI = {
  getProblemList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<MaybePagedResponse<ProblemDetail>>('/problems', { params })
    return normalizePagedResponse(response.data)
  },
  getProblemsByStage: async (stageNumber: number) => {
    const response = await api.get<MaybePagedResponse<ProblemDetail>>('/problems', {
      params: { stage_number: stageNumber },
    })
    return normalizePagedResponse(response.data).results
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
    const response = await api.get<{ hint?: string; content?: string }>(`/problems/${problemUuid}/hint`, {
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
