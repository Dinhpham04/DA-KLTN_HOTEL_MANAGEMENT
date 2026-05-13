import { requestDetailApi } from '@/api/request-detail.api'
import type { CreateRequestDetailBody, UpdateRequestDetailBody } from '@/types/billing'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateRequestDetail({ onSuccess, onError }: Params = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRequestDetailBody) => requestDetailApi.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['request-details', vars.reserveId] })
      onSuccess?.()
    },
    onError,
  })
}

export function useUpdateRequestDetail(reserveId: number, { onSuccess, onError }: Params = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRequestDetailBody }) =>
      requestDetailApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request-details', reserveId] })
      onSuccess?.()
    },
    onError,
  })
}

export function useDeleteRequestDetail(reserveId: number, { onSuccess, onError }: Params = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => requestDetailApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request-details', reserveId] })
      onSuccess?.()
    },
    onError,
  })
}
