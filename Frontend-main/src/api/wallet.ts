import api from './axios';

// Types
export interface Wallet {
  uuid: string;
  balance: number;
  created_at: string;
  updated_at?: string;
}

export interface WalletHistory {
  uuid: string;
  amount: number;
  reason?: string;
  created_at: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface UpdateWalletRequest {
  amount: number;
  reason?: string;
}

// Wallet API
export const walletAPI = {
  // 사용자 지갑 조회
  getWallet: async (): Promise<Wallet> => {
    const response = await api.get<Wallet>('/wallet');
    return response.data;
  },

  // 지갑 잔액 조회
  getBalance: async (): Promise<{ balance: number }> => {
    const response = await api.get<{ balance: number }>('/wallet/balance');
    return response.data;
  },

  // 지갑 거래 내역 조회
  getHistory: async (params?: {
    page?: number;
    size?: number;
    type?: 'INCOME' | 'EXPENSE';
  }): Promise<{ results: WalletHistory[]; page: number; size: number }> => {
    const response = await api.get('/wallet/history', { params });
    return response.data;
  },

  // 포인트 추가 (관리자 기능)
  addBalance: async (data: UpdateWalletRequest): Promise<Wallet> => {
    const response = await api.post<Wallet>('/wallet/add', data);
    return response.data;
  },

  // 포인트 차감 (관리자 기능)
  subtractBalance: async (data: UpdateWalletRequest): Promise<Wallet> => {
    const response = await api.post<Wallet>('/wallet/subtract', data);
    return response.data;
  },
};
