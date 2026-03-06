import { reservationApi } from '@/api/reservation.api'
import type { PaginationParams } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useReservations(params?: PaginationParams) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: async () => {
      const response = await reservationApi.getList(params)
      return response.data
    },
  })
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: async () => {
      const response = await reservationApi.getById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationApi.checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
