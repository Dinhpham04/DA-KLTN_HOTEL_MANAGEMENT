import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api/v1'
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
  meta?: { total: number; page: number; limit: number; totalPages: number }
  timestamp?: string
}

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

function isApiEnvelope<T>(data: unknown): data is ApiEnvelope<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    ('statusCode' in data || 'status' in data)
  )
}

// Custom params serializer to handle arrays correctly for NestJS
function paramsSerializer(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      // Use repeat format: dataTypes=1&dataTypes=2 (NestJS parses this as array)
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item))
        }
      }
    } else {
      searchParams.append(key, String(value))
    }
  }

  return searchParams.toString()
}

export const apiClient = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
  paramsSerializer: { serialize: paramsSerializer },
})

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token as string)
    }
  })
  failedQueue = []
}

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend wraps success responses in { statusCode, message, data, meta?, timestamp }.
    if (isApiEnvelope(response.data)) {
      const envelope = response.data as ApiEnvelope<unknown>
      if (envelope.meta) {
        // Paginated response — preserve { data, meta } shape
        response.data = { data: envelope.data, meta: envelope.meta }
      } else {
        response.data = envelope.data
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config as RetryRequestConfig

    const isLoginRequest = originalRequest.url?.includes('/auth/login')

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_URL}${API_PREFIX}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              timeout: 30000,
            }
          )

          const refreshData = isApiEnvelope<{ accessToken: string; refreshToken?: string }>(
            refreshResponse.data
          )
            ? refreshResponse.data.data
            : refreshResponse.data

          if (refreshData?.accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, refreshData.accessToken)
            if (refreshData.refreshToken) {
              localStorage.setItem(REFRESH_TOKEN_KEY, refreshData.refreshToken)
            }
            originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`

            processQueue(null, refreshData.accessToken)
            isRefreshing = false

            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          processQueue(refreshError, null)
          isRefreshing = false
        }
      } else {
        processQueue(new Error('No refresh token available'), null)
        isRefreshing = false
      }

      // If we reach here, either there's no refresh token or the refresh failed.
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
