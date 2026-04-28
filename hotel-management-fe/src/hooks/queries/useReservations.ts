import { reservationApi } from '@/api/reservation.api'
import type { ReservationFilterParams } from '@/types/reservation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const RESERVATION_KEYS = {
  all: ['reservations'] as const,
  lists: () => [...RESERVATION_KEYS.all, 'list'] as const,
  list: (params?: ReservationFilterParams) => [...RESERVATION_KEYS.lists(), params] as const,
  details: () => [...RESERVATION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...RESERVATION_KEYS.details(), id] as const,
}

interface UseReservationsOptions {
  enabled?: boolean
}

export function useReservations(
  params?: ReservationFilterParams,
  options: UseReservationsOptions = {}
) {
  const { enabled = true } = options

  return useQuery({
    queryKey: RESERVATION_KEYS.list(params),
    queryFn: async () => {
      const response = await reservationApi.getList(params)
      return response.data
    },
    enabled,
  })
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: RESERVATION_KEYS.detail(id),
    queryFn: async () => {
      const response = await reservationApi.getById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reservationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success('Tạo đặt phòng thành công')
    },
    onError: () => {
      toast.error('Tạo đặt phòng thất bại')
    },
  })
}

export function useUpdateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reservationApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success('Cập nhật đặt phòng thành công')
    },
    onError: () => {
      toast.error('Cập nhật đặt phòng thất bại')
    },
  })
}

export function useDeleteReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reservationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success('Xóa đặt phòng thành công')
    },
    onError: () => {
      toast.error('Xóa đặt phòng thất bại')
    },
  })
}

export function useConfirmReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reservationApi.confirm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success('Xác nhận đặt phòng thành công')
    },
    onError: () => {
      toast.error('Xác nhận đặt phòng thất bại')
    },
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reservationApi.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Check-in thành công')
    },
    onError: () => {
      toast.error('Check-in thất bại')
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reservationApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Check-out thành công')
    },
    onError: () => {
      toast.error('Check-out thất bại')
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: number; cancelReason?: string }) =>
      reservationApi.cancel(params.id, params.cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success('Hủy đặt phòng thành công')
    },
    onError: () => {
      toast.error('Hủy đặt phòng thất bại')
    },
  })
}
