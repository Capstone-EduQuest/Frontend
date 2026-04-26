import api from './axios'

export interface BookmarkItem {
  uuid?: string
  stage?: string
  type?: string
  number?: number
  problem_uuid?: string
  problem?: {
    uuid: string
    number: number
    summary: string
  }
}

export const bookmarkAPI = {
  getBookmarkList: async (userUuid: string, params?: { page?: number; size?: number; sort?: string; is_asc?: boolean }) => {
    const response = await api.get<{ results: BookmarkItem[] }>(`/users/${userUuid}/bookmarks`, { params })
    return response.data
  },
  createBookmark: async (problemUuid: string) => {
    await api.post(`/problems/${problemUuid}/bookmark`)
  },
  deleteBookmark: async (problemUuid: string) => {
    await api.delete(`/problems/${problemUuid}/bookmark`)
  },
}
