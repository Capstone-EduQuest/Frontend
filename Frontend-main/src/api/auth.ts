import api from './axios'
import { decodeJwtUuid } from '../utils/jwt'

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
  email?: string
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

export interface UserListItem {
  uuid: string
  id: string
  email: string
  nickname: string
}

export const authAPI = {
  signIn: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/sign-in', data, { skipAuth: true })
    return response.data
  },
  signUp: async (data: FormData): Promise<void> => {
    await api.post('/sign-up', data, { skipAuth: true })
  },
  findId: async (data: { email: string }): Promise<void> => {
    await api.post('/auth/find-id', data, { skipAuth: true })
  },
  findPassword: async (data: { email: string; id: string }): Promise<void> => {
    await api.post('/auth/find-password', data, { skipAuth: true })
  },
  resetPassword: async (data: { token: string; new_password: string }): Promise<void> => {
    await api.put('/auth/reset-password', data, { skipAuth: true })
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
      results: UserListItem[]
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
  lockUser: async (uuid: string): Promise<void> => {
    await api.put(`/users/${uuid}/lock`)
  },
  getRoles: async (): Promise<{ uuid: string; name: string }[]> => {
    const response = await api.get<{ results: { uuid: string; name: string }[] }>('/users/roles')
    return response.data.results
  },
  deleteUser: async (uuid: string): Promise<void> => {
    await api.delete(`/users/${uuid}`)
  },
}

export const resolveProfileUuid = async (options: {
  accessToken?: string | null
  storedUuid?: string | null
  userId?: string | null
}) => {
  if (options.storedUuid) {
    return options.storedUuid
  }

  if (options.accessToken) {
    const uuidFromToken = decodeJwtUuid(options.accessToken)
    if (uuidFromToken) {
      return uuidFromToken
    }
  }

  if (options.userId) {
    const response = await userAPI.getUuidById(options.userId)
    return response.uuid
  }

  return null
}
