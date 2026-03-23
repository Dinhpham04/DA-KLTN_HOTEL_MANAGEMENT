import apiClient from '@/lib/axios'
import type { LoginRequest, LoginResponse, User } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', {
      mail: data.mail,
      password: data.password,
    }),

  me: () => apiClient.get<User>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    }),
}
