import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'
const GUEST_PATHS = new Set(['/', '/login', '/signup'])

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true

      try {
        const refreshResponse = await axios.post<{ accessToken: string }>(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const nextToken = refreshResponse.data.accessToken
        localStorage.setItem('accessToken', nextToken)
        originalRequest.headers.Authorization = `Bearer ${nextToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('authUserUuid')
        localStorage.removeItem('authUserId')

        const currentPath = typeof window !== 'undefined' ? window.location.pathname : null
        if (currentPath && !GUEST_PATHS.has(currentPath)) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
