import { roomApi } from '@/api/room.api'
import type { CreateRoomBody } from '@/types/room'
import { useMutation } from '@tanstack/react-query'

interface UseCreateRoomParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateRoom({ onSuccess, onError }: UseCreateRoomParams = {}) {
  return useMutation({
    mutationKey: ['create-room'],
    mutationFn: (data: CreateRoomBody) => roomApi.createRoom(data),
    onSuccess,
    onError,
  })
}
