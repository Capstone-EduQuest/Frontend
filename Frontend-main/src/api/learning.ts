import api from './axios';

// Types
export interface Stage {
  uuid: string;
  title: string;
  number: number;
  reward: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateStageRequest {
  title: string;
  number: number;
  reward: number;
}

export interface Problem {
  uuid: string;
  type: string;
  number: number;
  summary: string;
  example: string;
  expectedOutput: string;
  block?: {
    answer: number[];
    blocks: { order: number; code: string }[];
  };
  stage_uuid: string;
  created_at: string;
}

export interface CreateProblemRequest {
  stage_uuid: string;
  type: string;
  number: number;
  summary: string;
  example: string;
  expectedOutput: string;
  block?: {
    answer: number[];
    blocks: { order: number; code: string }[];
  };
}

export interface Hint {
  uuid: string;
  problem_uuid: string;
  level: number;
  point: number;
  content: string;
  created_at: string;
}

export interface Submission {
  uuid: string;
  problem_uuid: string;
  answer: string;
  created_at: string;
  evaluation?: {
    uuid: string;
    is_correct: boolean;
    created_at: string;
  };
}

export interface SubmitProblemRequest {
  answer: string;
}

export interface SubmitProblemResponse {
  uuid: string;
  is_correct: boolean;
}

// Stage API
export const stageAPI = {
  // 스테이지 목록 조회
  getStageList: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    is_asc?: boolean;
  }): Promise<{ results: Stage[]; page: number; size: number; sort: string; is_asc: boolean }> => {
    const response = await api.get('/stages', { params });
    return response.data;
  },

  // 스테이지 조회
  getStage: async (uuid: string): Promise<Stage> => {
    const response = await api.get<Stage>(`/stages/${uuid}`);
    return response.data;
  },

  // 스테이지 생성
  createStage: async (data: CreateStageRequest): Promise<Stage> => {
    const response = await api.post<Stage>('/stages', data);
    return response.data;
  },

  // 스테이지 수정
  updateStage: async (uuid: string, data: CreateStageRequest): Promise<Stage> => {
    const response = await api.put<Stage>(`/stages/${uuid}`, data);
    return response.data;
  },

  // 스테이지 삭제
  deleteStage: async (uuid: string): Promise<void> => {
    await api.delete(`/stages/${uuid}`);
  },
};

// Problem API
export const problemAPI = {
  // 문제 목록 조회
  getProblemList: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    is_asc?: boolean;
  }): Promise<{ results: Problem[]; page: number; size: number; sort: string; is_asc: boolean }> => {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  // 스테이지별 문제 목록
  getProblemsByStage: async (stageNumber: number, params?: {
    page?: number;
    size?: number;
  }): Promise<{ results: Problem[]; page: number; size: number }> => {
    const response = await api.get('/problems', {
      params: {
        stage_number: stageNumber,
        ...params,
      },
    });
    return response.data;
  },

  // 문제 조회
  getProblem: async (uuid: string): Promise<Problem> => {
    const response = await api.get<Problem>(`/problems/${uuid}`);
    return response.data;
  },

  // 문제 생성
  createProblem: async (data: CreateProblemRequest): Promise<Problem> => {
    const response = await api.post<Problem>('/problems', data);
    return response.data;
  },

  // 문제 수정
  updateProblem: async (uuid: string, data: CreateProblemRequest): Promise<Problem> => {
    const response = await api.put<Problem>(`/problems/${uuid}`, data);
    return response.data;
  },

  // 문제 삭제
  deleteProblem: async (uuid: string): Promise<void> => {
    await api.delete(`/problems/${uuid}`);
  },
};

// Hint API
export const hintAPI = {
  // 문제의 힌트 목록 (백엔드에서 별도 목록 지원이 없을 수 있음)
  getHints: async (_problemUuid: string): Promise<Hint[]> => {
    throw new Error('백엔드에서 힌트 목록 조회 엔드포인트를 지원하지 않습니다.');
  },

  // 특정 레벨 힌트 조회 및 포인트 차감
  getHint: async (problemUuid: string, level: number): Promise<Hint> => {
    const response = await api.get<Hint>(`/problems/${problemUuid}/hint`, {
      params: { level },
    });
    return response.data;
  },

  // 힌트 생성
  createHint: async (problemUuid: string, data: Omit<Hint, 'uuid' | 'created_at' | 'problem_uuid'>): Promise<Hint> => {
    const response = await api.post<Hint>(`/problems/${problemUuid}/hints`, data);
    return response.data;
  },
};

// Submission API
export const submissionAPI = {
  // 문제 풀이 제출
  submitProblem: async (problemUuid: string, data: SubmitProblemRequest): Promise<SubmitProblemResponse> => {
    const response = await api.post<SubmitProblemResponse>(`/problems/${problemUuid}/submissions`, data);
    return response.data;
  },

  // 사용자의 제출 목록
  getUserSubmissions: async (params?: {
    page?: number;
    size?: number;
  }): Promise<{ results: Submission[]; page: number; size: number }> => {
    const response = await api.get('/submissions', { params });
    return response.data;
  },

  // 문제별 제출 목록
  getProblemSubmissions: async (problemUuid: string, params?: {
    page?: number;
    size?: number;
  }): Promise<{ results: Submission[]; page: number; size: number }> => {
    const response = await api.get(`/problems/${problemUuid}/submissions`, { params });
    return response.data;
  },

  // 제출 상세 조회
  getSubmission: async (uuid: string): Promise<Submission> => {
    const response = await api.get<Submission>(`/submissions/${uuid}`);
    return response.data;
  },
};