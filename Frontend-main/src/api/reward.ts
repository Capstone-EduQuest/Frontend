import api from './axios';

// Types
export interface RewardHistory {
  uuid: string;
  stage_uuid: string;
  amount: number;
  created_at: string;
  stage?: {
    uuid: string;
    title: string;
    number: number;
  };
}

// Reward API
export const rewardAPI = {
  // 보상 이력 목록 조회
  getRewardHistory: async (params?: {
    page?: number;
    size?: number;
  }): Promise<{ results: RewardHistory[]; page: number; size: number }> => {
    const response = await api.get('/rewards/history', { params });
    return response.data;
  },

  // 총 보상 포인트 조회
  getTotalReward: async (): Promise<{ total_reward: number }> => {
    const response = await api.get<{ total_reward: number }>('/rewards/total');
    return response.data;
  },

  // 스테이지별 보상 조회
  getStageReward: async (stageUuid: string): Promise<{ amount: number; is_completed: boolean }> => {
    const response = await api.get<{ amount: number; is_completed: boolean }>(`/rewards/stages/${stageUuid}`);
    return response.data;
  },
};
