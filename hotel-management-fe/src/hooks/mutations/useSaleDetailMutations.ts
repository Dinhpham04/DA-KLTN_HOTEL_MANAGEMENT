import { saleDetailApi } from '@/api/sale-detail.api'
import type { CreateSaleDetailBody, UpdateSaleDetailBody } from '@/types/billing'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateSaleDetail({ onSuccess, onError }: Params = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSaleDetailBody) => saleDetailApi.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['sale-details', vars.reserveId] })
      qc.invalidateQueries({ queryKey: ['request-details', vars.reserveId] })
      onSuccess?.()
    },
    onError,
  })
}

export function useUpdateSaleDetail(reserveId: number, { onSuccess, onError }: Params = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSaleDetailBody }) =>
      saleDetailApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-details', reserveId] })
      qc.invalidateQueries({ queryKey: ['request-details', reserveId] })
      onSuccess?.()
    },
    onError,
  })
}

export function useDeleteSaleDetail(reserveId: number, { onSuccess, onError }: Params = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => saleDetailApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-details', reserveId] })
      qc.invalidateQueries({ queryKey: ['request-details', reserveId] })
      onSuccess?.()
    },
    onError,
  })
}
