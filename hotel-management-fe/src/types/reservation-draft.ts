export interface CreateReservationDraftBody {
  clientId: number
  facilityId: number
  roomId: number
  periodFrom: string
  periodTo: string
  expiredDate?: 1 | 2 | 3
  eternityDraft?: boolean
  note?: string
}

export interface ReservationDraftResponse {
  reserveId: number
  clientId: number
  facilityId: number
  roomId: number
  periodFrom: string
  periodTo: string
  draftFlag: boolean
  eternityDraft: boolean
  expiredDate: number | null
  note: string | null
  createdAt: string
}
