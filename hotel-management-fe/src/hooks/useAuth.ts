import { authApi } from '@/api/auth.api'
import type { User } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const AUTH_KEY = ['auth', 'me']
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export function useAuth() {
  const queryClient = useQueryClient()

  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY)

  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_KEY,
    queryFn: async () => {
      const response = await authApi.me()
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { accessToken, refreshToken, staff } = response.data
      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(staff))
      queryClient.setQueryData(AUTH_KEY, staff)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      queryClient.clear()
    },
  })

  const cachedUser: User | null = (() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })()

  return {
    user: user ?? cachedUser,
    isAuthenticated,
    isLoading: isAuthenticated && isLoading,
    login: loginMutation,
    logout: logoutMutation,
  }
}
