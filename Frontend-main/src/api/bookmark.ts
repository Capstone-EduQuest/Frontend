import api from './axios';

// Types
export interface Bookmark {
  uuid: string;
  problem_uuid: string;
  created_at: string;
  problem?: {
    uuid: string;
    number: number;
    summary: string;
  };
}

export interface CreateBookmarkRequest {
  problem_uuid: string;
}

// Bookmark API
export const bookmarkAPI = {
  // 북마크 목록 조회
  getBookmarkList: async (userUuid: string, params?: {
    page?: number;
    size?: number;
  }): Promise<{ results: Bookmark[]; page: number; size: number }> => {
    const response = await api.get(`/users/${userUuid}/bookmarks`, { params });
    return response.data;
  },

  // 북마크 생성
  createBookmark: async (problemUuid: string): Promise<void> => {
    await api.post(`/problems/${problemUuid}/bookmark`);
  },

  // 북마크 삭제
  deleteBookmark: async (problemUuid: string): Promise<void> => {
    await api.delete(`/problems/${problemUuid}/bookmark`);
  },

  // 문제가 북마크 되어 있는지 확인
  isBookmarked: async (problemUuid: string): Promise<{ is_bookmarked: boolean; bookmark_uuid?: string }> => {
    const response = await api.get<{ is_bookmarked: boolean; bookmark_uuid?: string }>(`/problems/${problemUuid}/bookmark`);
    return response.data;
  },
};
