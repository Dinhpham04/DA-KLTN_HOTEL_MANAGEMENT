import apiClient from '@/lib/axios'
import type { Reservation } from '@/types/reservation'

export interface CreateParkingReservePayload {
  parkingId: number
  periodFrom?: string
  periodTo?: string | null
  stayTypeId?: number
  carType?: string
  licensePlate?: string
  note?: string
  saleDate?: string | null
}

export interface CreateBicycleParkingReservePayload {
  bicycleParkingId: number
  periodFrom?: string
  periodTo?: string | null
  stayTypeId?: number
  bicycleTypeNote?: string
  note?: string
  saleDate?: string | null
}

export interface CreateReservationWithParkingsPayload {
  reservation: Record<string, unknown>
  parkingReserves?: CreateParkingReservePayload[]
  bicycleParkingReserves?: CreateBicycleParkingReservePayload[]
}

export const reservationWithParkingApi = {
  createWithParkings: (data: CreateReservationWithParkingsPayload) =>
    apiClient.post<{ data: Reservation }>('/reservations/with-parking', data),
}
