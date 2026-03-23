import type { ApiError } from '@/types'
import type { AxiosError } from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr = 'dd/MM/yyyy') {
  return format(new Date(date), formatStr, { locale: vi })
}

export function formatCurrency(amount: number, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  statusMessages?: Record<number, string>
): string {
  const axiosError = error as AxiosError<ApiError>
  const status = axiosError?.response?.status

  if (status && statusMessages?.[status]) {
    return statusMessages[status]
  }

  return axiosError?.response?.data?.message || fallback
}
