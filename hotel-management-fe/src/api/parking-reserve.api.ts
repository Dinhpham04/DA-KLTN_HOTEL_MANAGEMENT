import apiClient from '@/lib/axios'

// ─── Types ─────────────────────────────────────────

export interface CreateParkingReservePayload {
  parkingId: number
  reserveId?: number
  clientId?: number
  periodFrom: string
  periodTo?: string
  stayTypeId?: number
  confirmFlag?: boolean
  carType?: string
  licensePlate?: string
  note?: string
  saleDate?: string
}

export interface UpdateParkingReservePayload extends Partial<CreateParkingReservePayload> {
  checkinFlag?: boolean
  checkoutFlag?: boolean
}

export interface CreateBicycleParkingReservePayload {
  bicycleParkingId: number
  reserveId?: number
  clientId?: number
  periodFrom: string
  periodTo?: string
  stayTypeId?: number
  confirmFlag?: boolean
  bicycleTypeNote?: string
  note?: string
  saleDate?: string
}

export interface UpdateBicycleParkingReservePayload
  extends Partial<CreateBicycleParkingReservePayload> {
  checkinFlag?: boolean
  checkoutFlag?: boolean
}

// ─── API Functions ─────────────────────────────────

export const parkingReserveApi = {
  // Car parking
  create: (data: CreateParkingReservePayload) => apiClient.post('/parking-reserves', data),

  update: (id: number, data: UpdateParkingReservePayload) =>
    apiClient.patch(`/parking-reserves/${id}`, data),

  delete: (id: number) => apiClient.delete(`/parking-reserves/${id}`),

  checkin: (id: number) => apiClient.patch(`/parking-reserves/${id}/checkin`),

  checkout: (id: number) => apiClient.patch(`/parking-reserves/${id}/checkout`),

  // Bicycle parking
  createBicycle: (data: CreateBicycleParkingReservePayload) =>
    apiClient.post('/bicycle-parking-reserves', data),

  updateBicycle: (id: number, data: UpdateBicycleParkingReservePayload) =>
    apiClient.patch(`/bicycle-parking-reserves/${id}`, data),

  deleteBicycle: (id: number) => apiClient.delete(`/bicycle-parking-reserves/${id}`),

  checkinBicycle: (id: number) => apiClient.patch(`/bicycle-parking-reserves/${id}/checkin`),

  checkoutBicycle: (id: number) => apiClient.patch(`/bicycle-parking-reserves/${id}/checkout`),
}
