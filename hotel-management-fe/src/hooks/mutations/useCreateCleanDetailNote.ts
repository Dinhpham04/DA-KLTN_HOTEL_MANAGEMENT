import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { CreateCleanDetailNoteBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateCleanDetailNote({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['create-clean-detail-note'],
    mutationFn: ({ detailId, data }: { detailId: number; data: CreateCleanDetailNoteBody }) =>
      cleaningShiftApi.addNote(detailId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clean-detail-notes', vars.detailId] })
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
