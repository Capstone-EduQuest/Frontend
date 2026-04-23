import api from './axios'

export interface LoginRequest {
  id: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface UserProfile {
  uuid: string
  id?: string
  user_id?: string
  birth: string
  nickname: string
  point?: number
  role: string
  is_locked: boolean
  profile?: string
  profile_image_url?: string
  profile_image?: string
  profile_url?: string
  avatar_url?: string
  wallet?: {
    uuid: string
    balance: number
  }
}

export const authAPI = {
  signIn: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/sign-in', data)
    return response.data
  },
  signUp: async (data: FormData): Promise<void> => {
    await api.post('/sign-up', data)
  },
  findId: async (data: { email: string }): Promise<void> => {
    await api.post('/auth/find-id', data)
  },
  findPassword: async (data: { email: string; id: string }): Promise<void> => {
    await api.post('/auth/find-password', data)
  },
  resetPassword: async (data: { token: string; new_password: string }): Promise<void> => {
    await api.put('/auth/reset-password', data)
  },
  refresh: async (): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh', {})
    return response.data
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout', {})
  },
}

export const userAPI = {
  getProfile: async (uuid: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/users/${uuid}`)
    return response.data
  },
  getUserList: async (params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get('/users', { params })
    return response.data as {
      results: UserProfile[]
      page: number
      size: number
      sort: string
      is_asc: boolean
    }
  },
  getUuidById: async (id: string): Promise<{ uuid: string }> => {
    const response = await api.get<{ uuid: string }>(`/users/${id}/uuid`)
    return response.data
  },
  updateProfile: async (uuid: string, data: FormData): Promise<void> => {
    await api.put(`/users/${uuid}`, data)
  },
  updateRole: async (uuid: string, roleUuid: string): Promise<void> => {
    await api.put(`/users/${uuid}/role`, { role_uuid: roleUuid })
  },
  lockUser: async (uuid: string, isLocked: boolean): Promise<void> => {
    await api.put(`/users/${uuid}/lock`, { is_locked: isLocked })
  },
  getRoles: async (): Promise<{ uuid: string; name: string }[]> => {
    const response = await api.get<{ results: { uuid: string; name: string }[] }>('/users/roles')
    return response.data.results
  },
  deleteUser: async (uuid: string): Promise<void> => {
    await api.delete(`/users/${uuid}`)
  },
}
