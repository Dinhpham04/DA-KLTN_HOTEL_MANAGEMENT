import { reservationDraftApi } from '@/api/reservation-draft.api'
import type { CreateReservationDraftBody } from '@/types/reservation-draft'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseCreateReservationDraftParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateReservationDraft({
  onSuccess,
  onError,
}: UseCreateReservationDraftParams = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-reservation-draft'],
    mutationFn: (data: CreateReservationDraftBody) => reservationDraftApi.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['whiteboard'] })
      onSuccess?.()
    },
    onError,
  })
}
