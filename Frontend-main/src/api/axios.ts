import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  timeout: 10000,
  withCredentials: true,
});

// Request Interceptor - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 토큰 만료 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도: Refresh token은 HttpOnly 쿠키로 전달됨
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = refreshResponse.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 로그인 페이지로 이동
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
