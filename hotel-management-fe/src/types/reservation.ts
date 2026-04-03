export interface Reservation {
  reserveId: number
  parentReserveId: number | null
  clientId: number | null
  facilityId: number | null
  roomId: number | null
  stayTypeId: number | null
  dataStatus: number
  reserveStatus: number
  reserveType: number | null
  deleteStatus: number | null

  // Flags
  draftFlag: boolean
  memoFlag: boolean
  confirmFlag: boolean
  checkinFlag: boolean
  directcheckinFlag: boolean
  directcheckinType: number | null
  petFlag: boolean
  futonFlag: boolean
  deliveryboxFlag: boolean
  campaignPriceFlag: boolean
  autoExtendFlag: boolean
  disableReservation: boolean
  contactedFlag: boolean | null

  // Period
  periodFrom: string | null
  periodTo: string | null
  originalPeriodFrom: string | null
  originalPeriodTo: string | null

  // Dates
  checkedInAt: string | null
  checkoutAt: string | null
  checkinDate: string | null
  lastStayDate: string | null
  earlyExitDatetime: string | null
  paymentDueDate: string | null
  cancelledAt: string | null

  // Pricing
  bookingUnitPrice: number | null
  adjustmentUnitPrice: number | null
  deposit: number | null

  // Pet
  dogCount: number | null
  catCount: number | null
  otherCount: number | null
  petNote: string | null

  // Key management
  rentalKeys: number | null
  returnKeys: number | null
  keyReturnContactType: number | null
  keyReturnFlag: boolean | null

  // Notes
  note: string | null
  memo: string | null
  overdueDebtNote: string | null
  amendment: string | null
  cancelReason: string | null
  announcement: string | null
  requestAnnouncement: string | null
  saleAnnouncement: string | null
  noticeComment: string | null

  advertisingType: number | null
  roomDirtyLevel: number | null

  // Staff IDs
  chargeStaffId: number | null
  chargeStaffId2: number | null
  checkinReceptionistId: number | null
  diContactStaffId: number | null
  checkoutReceptionistId: number | null
  checkoutReceptionistId2: number | null
  confirmStaffId: number | null

  // Audit
  createdAt: string
  updatedAt: string

  // Joined fields
  clientName?: string
  clientNameEn?: string
  facilityName?: string
  roomNumber?: string
  roomTypeName?: string
  roomClassName?: string
  stayTypeName?: string
  chargeStaffName?: string
  chargeStaff2Name?: string
  confirmStaffName?: string
}

export interface ReservationFilterParams {
  page?: number
  limit?: number
  search?: string
  reserveStatus?: number
  clientId?: number
  facilityId?: number
  roomId?: number
  stayTypeId?: number
  dataStatus?: number
  deleteStatus?: number
  checkinFlag?: boolean
  confirmFlag?: boolean
  draftFlag?: boolean
  chargeStaffId?: number
  periodFrom?: string
  periodTo?: string
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface ReservationPaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedReservationResponse {
  items: Reservation[]
  meta: ReservationPaginationMeta
}

export interface CreateReservationBody {
  clientId: number
  facilityId?: number
  roomId?: number
  stayTypeId?: number
  periodFrom: string
  periodTo: string
  reserveType?: number
  bookingUnitPrice?: number
  adjustmentUnitPrice?: number
  deposit?: number
  advertisingType?: number
  draftFlag?: boolean
  memoFlag?: boolean
  confirmFlag?: boolean
  directcheckinFlag?: boolean
  directcheckinType?: number
  directcheckinNote?: string
  petFlag?: boolean
  dogCount?: number
  catCount?: number
  otherCount?: number
  petNote?: string
  note?: string
  memo?: string
  amendment?: string
  announcement?: string
  requestAnnouncement?: string
  saleAnnouncement?: string
  futonFlag?: boolean
  deliveryboxFlag?: boolean
  deliveryboxCardNumber?: string
  campaignPriceFlag?: boolean
  autoExtendFlag?: boolean
  chargeStaffId?: number
  chargeStaffId2?: number
  diContactStaffId?: number
}

export interface UpdateReservationBody extends Partial<CreateReservationBody> {
  reserveId: number
  dataStatus?: number
  contactedFlag?: boolean
  rentalKeys?: number
  returnKeys?: number
  keyReturnContactType?: number
  keyReturnFlag?: boolean
  overdueDebtNote?: string
  noticeComment?: string
  disableReservation?: boolean
  roomDirtyLevel?: number
  earlyExitDatetime?: string
  paymentDueDate?: string
}

// Reserve status enum
export const ReserveStatus = {
  PENDING: 1,
  CONFIRMED: 2,
  CHECKED_IN: 3,
  CHECKED_OUT: 4,
  CANCELLED: 5,
} as const

// Delete status
export const DeleteStatus = {
  DELETED: 1,
  CANCELLED: 2,
  NO_SHOW: 3,
} as const

// Advertising type
export const AdvertisingType = {
  REPEAT: 1,
  WALK_IN: 2,
  HOMEPAGE: 3,
  RAKUTEN: 4,
  ENGLISH_SITE: 5,
  OTHER: 9,
} as const

// Direct check-in type
export const DirectCheckinType = {
  VISIT: 1,
  SIX_BUILDING: 2,
  DIRECT_IN: 3,
  YCAT: 4,
  ROOM_DELIVERY: 5,
} as const
