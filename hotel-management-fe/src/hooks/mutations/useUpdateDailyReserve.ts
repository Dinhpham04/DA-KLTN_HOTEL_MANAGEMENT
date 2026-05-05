import { dailyReserveApi } from '@/api/daily-reserve.api'
import { DAILY_RESERVE_KEYS } from '@/hooks/queries/useDailyReserve'
import type {
  UpdateAllDailyReserveBody,
  UpdateAllDailyReserveResponse,
  UpdateDailyReserveBody,
} from '@/types/daily-reserve'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

interface MutationOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateDailyReserve(options: MutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDailyReserveBody) => dailyReserveApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RESERVE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Cập nhật nhận phòng thành công')
      options.onSuccess?.()
    },
    onError: (error) => {
      toast.error('Cập nhật nhận phòng thất bại')
      options.onError?.(error)
    },
  })
}

export function useUpdateAllDailyReserve(options: MutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateAllDailyReserveBody) => {
      const response = await dailyReserveApi.updateAll(data)
      return response.data as UpdateAllDailyReserveResponse
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DAILY_RESERVE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      if (data.errors.length > 0) {
        toast.error(`Có ${data.errors.length} dòng cập nhật thất bại`)
      } else {
        toast.success('Cập nhật tất cả nhận phòng thành công')
      }
      options.onSuccess?.()
    },
    onError: (error) => {
      toast.error('Cập nhật tất cả nhận phòng thất bại')
      options.onError?.(error)
    },
  })
}
