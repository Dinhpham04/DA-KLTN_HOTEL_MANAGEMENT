import { roomApi } from '@/api/room.api'
import { useMutation } from '@tanstack/react-query'

interface UseDeleteRoomParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteRoom({ onSuccess, onError }: UseDeleteRoomParams = {}) {
  return useMutation({
    mutationKey: ['delete-room'],
    mutationFn: (roomId: number) => roomApi.deleteRoom(roomId),
    onSuccess,
    onError,
  })
}
