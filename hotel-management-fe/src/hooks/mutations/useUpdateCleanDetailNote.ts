import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpdateCleanDetailNoteBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateCleanDetailNote({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-clean-detail-note'],
    mutationFn: ({ noteId, data }: { noteId: number; data: UpdateCleanDetailNoteBody }) =>
      cleaningShiftApi.updateNote(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clean-detail-notes'] })
      onSuccess?.()
    },
    onError,
  })
}
