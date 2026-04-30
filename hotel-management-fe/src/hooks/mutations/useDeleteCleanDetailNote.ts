import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteCleanDetailNote({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['delete-clean-detail-note'],
    mutationFn: (noteId: number) => cleaningShiftApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clean-detail-notes'] })
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
