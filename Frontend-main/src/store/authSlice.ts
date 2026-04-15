// src/store/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    uuid: string;
    user_id: string;
    nickname: string;
    role: string;
    birth: string;
    is_locked: boolean;
    balance?: number;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isAuthReady: boolean;
}

const storedAccessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const initialState: AuthState = {
  user: null,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  isLoggedIn: Boolean(storedAccessToken),
  isAuthReady: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그인 성공 시 유저 정보와 토큰을 저장하는 기능
    loginSuccess: (state, action: PayloadAction<{
      user: AuthState['user'];
      accessToken: string;
      refreshToken?: string;
    }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || state.refreshToken;
      state.isLoggedIn = true;
      state.isAuthReady = true;

      // localStorage에 토큰 저장
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    // 로그아웃 시 정보를 비우는 기능
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.isAuthReady = true;

      // localStorage에서 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    // 사용자 정보 업데이트
    updateUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    // 토큰 업데이트
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || state.refreshToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    // 지갑 잔액 업데이트
    updateBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.balance = action.payload;
      }
    },
  },
});

export const { loginSuccess, logout, updateUser, updateTokens, updateBalance } = authSlice.actions;
export default authSlice.reducer;