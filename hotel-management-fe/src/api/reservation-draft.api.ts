import apiClient from '@/lib/axios'
import type {
  CreateReservationDraftBody,
  ReservationDraftResponse,
} from '@/types/reservation-draft'

export const reservationDraftApi = {
  create: (data: CreateReservationDraftBody) =>
    apiClient.post<ReservationDraftResponse>('/reservation-draft', data),
}
