import { roomApi } from '@/api/room.api'
import type { UpdateRoomBody } from '@/types/room'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateRoomParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateRoom({ onSuccess, onError }: UseUpdateRoomParams = {}) {
  return useMutation({
    mutationKey: ['update-room'],
    mutationFn: (data: UpdateRoomBody) => roomApi.updateRoom(data),
    onSuccess,
    onError,
  })
}
