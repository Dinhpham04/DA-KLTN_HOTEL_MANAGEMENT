import { requestDetailApi } from '@/api/request-detail.api'
import type { RequestDetail } from '@/types/billing'
import { useQueryClient } from '@tanstack/react-query'

type RequestNormalRow = {
  request_detail_id?: number
  request_type_id?: string
  request_from?: string
  request_to?: string
  count?: string
  count_unit?: string
  unit_price?: string
  charge_staff_id?: string
}

/**
 * Syncs form request_normal rows → RequestDetail API (create/update/delete).
 * Call after reservation is saved successfully.
 */
export function useSyncRequestDetails() {
  const qc = useQueryClient()

  const sync = async (reserveId: number, rows: RequestNormalRow[], existing: RequestDetail[]) => {
    const existingById = new Map(existing.map((d) => [d.requestDetailId, d]))
    const keptIds = new Set<number>()

    for (const row of rows) {
      if (!row.request_type_id) continue

      const unitPrice = Number(row.unit_price ?? 0)
      const count = Number(row.count ?? 1)
      const countUnit = Number(row.count_unit ?? 2)
      const totalPrice = unitPrice * count

      const body = {
        requestTypeId: Number(row.request_type_id),
        countUnit,
        requestFrom: row.request_from || undefined,
        requestTo: row.request_to || undefined,
        unitPrice,
        count,
        totalPrice,
        chargeStaffId: row.charge_staff_id ? Number(row.charge_staff_id) : undefined,
      }

      if (row.request_detail_id && existingById.has(row.request_detail_id)) {
        await requestDetailApi.update(row.request_detail_id, body)
        keptIds.add(row.request_detail_id)
      } else {
        await requestDetailApi.create({ ...body, reserveId })
      }
    }

    // Delete rows removed from form
    for (const detail of existing) {
      if (!keptIds.has(detail.requestDetailId)) {
        await requestDetailApi.delete(detail.requestDetailId)
      }
    }

    await qc.invalidateQueries({ queryKey: ['request-details', reserveId] })
  }

  return { sync }
}
