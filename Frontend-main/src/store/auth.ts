import { reactive } from 'vue'
import { authAPI, userAPI, type UserProfile } from '../api/auth'
import { decodeJwtUuid } from '../utils/jwt'

export interface AuthUser {
  uuid: string
  user_id: string
  nickname: string
  role: string
  birth: string
  is_locked: boolean
  balance?: number
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isLoggedIn: boolean
  isAuthReady: boolean
}

const state = reactive<AuthState>({
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  isLoggedIn: typeof window !== 'undefined' ? Boolean(localStorage.getItem('accessToken')) : false,
  isAuthReady: false,
})

let restorePromise: Promise<void> | null = null

const mapProfile = (profile: UserProfile): AuthUser => ({
  uuid: profile.uuid,
  user_id: profile.user_id ?? profile.id ?? '',
  nickname: profile.nickname,
  birth: profile.birth,
  role: profile.role,
  is_locked: profile.is_locked,
  balance: profile.wallet?.balance ?? profile.point ?? 0,
})

const setAccessToken = (token: string | null) => {
  state.accessToken = token
  state.isLoggedIn = Boolean(token)

  if (typeof window === 'undefined') {
    return
  }

  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}

const applyProfile = async (token: string) => {
  const uuid = decodeJwtUuid(token)
  if (!uuid) {
    throw new Error('invalid access token')
  }

  const profile = await userAPI.getProfile(uuid)
  state.user = mapProfile(profile)
  setAccessToken(token)
}

const clearAuth = () => {
  state.user = null
  setAccessToken(null)
}

const restoreAuth = async (pathname?: string) => {
  void pathname
  if (restorePromise) {
    return restorePromise
  }

  restorePromise = (async () => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

      if (storedToken) {
        try {
          await applyProfile(storedToken)
          return
        } catch {
          clearAuth()
        }
      }

      const refreshResponse = await authAPI.refresh()
      if (refreshResponse.accessToken) {
        await applyProfile(refreshResponse.accessToken)
      }
    } catch {
      clearAuth()
    } finally {
      state.isAuthReady = true
      restorePromise = null
    }
  })()

  return restorePromise
}

const loginSuccess = (payload: { user: AuthUser; accessToken: string }) => {
  state.user = payload.user
  setAccessToken(payload.accessToken)
  state.isAuthReady = true
}

const logout = () => {
  clearAuth()
  state.isAuthReady = true
}

export const useAuthStore = () => ({
  state,
  restoreAuth,
  loginSuccess,
  logout,
})
