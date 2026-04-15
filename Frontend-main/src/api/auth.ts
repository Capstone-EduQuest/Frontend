import api from './axios';

// Request/Response Types
export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface UserProfile {
  uuid: string;
  user_id: string;
  birth: string;
  nickname: string;
  is_locked: boolean;
  created_at: string;
  updated_at?: string;
  role: string;
  profile_image_url?: string;
  profile_image?: string;
  profile_url?: string;
  avatar_url?: string;
  wallet?: {
    uuid: string;
    balance: number;
  };
}

export interface FindPasswordRequest {
  email: string;
  id: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// Auth API Functions
export const authAPI = {
  // 로그인
  signIn: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/sign-in', data);
    return response.data;
  },

  // 회원가입
  signUp: async (data: FormData): Promise<void> => {
    await api.post('/sign-up', data);
  },

  // 아이디 찾기
  findId: async (data: { email: string }): Promise<void> => {
    await api.post('/auth/find-id', data);
  },

  // 비밀번호 찾기 (이메일 발송)
  findPassword: async (data: FindPasswordRequest): Promise<void> => {
    await api.post('/auth/find-password', data);
  },

  // 비밀번호 재설정
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  // 토큰 갱신
  refresh: async (): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh', {}, { withCredentials: true });
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await api.post('/auth/logout', {}, { withCredentials: true });
  },
};

// User API Functions
export const userAPI = {
  // 사용자 프로필 조회
  getProfile: async (uuid: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/users/${uuid}`);
    return response.data;
  },

  // 사용자 목록 조회
  getUserList: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    is_asc?: boolean;
  }): Promise<{ results: UserProfile[]; page: number; size: number; sort: string; is_asc: boolean }> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // 프로필 수정
  updateProfile: async (uuid: string, data: FormData): Promise<void> => {
    await api.put(`/users/${uuid}`, data);
  },

  // 사용자 삭제
  deleteUser: async (uuid: string): Promise<void> => {
    await api.delete(`/users/${uuid}`);
  },

  // 역할 변경
  updateRole: async (uuid: string, roleUuid: string): Promise<void> => {
    await api.put(`/users/${uuid}/role`, { role_uuid: roleUuid });
  },

  // 계정 잠금/해제
  lockUser: async (uuid: string, isLocked: boolean): Promise<void> => {
    await api.put(`/users/${uuid}/lock`, { is_locked: isLocked });
  },

  // 역할 목록 조회
  getRoles: async (): Promise<{ uuid: string; name: string }[]> => {
    const response = await api.get('/users/roles');
    return response.data.results;
  },
};