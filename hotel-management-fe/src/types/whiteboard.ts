export interface WhiteboardReserveItem {
  reserveId: number
  clientId: number | null
  clientName: string | null
  occupierName: string | null
  periodFrom: string | null
  periodTo: string | null
  reserveStatus: number
  confirmFlag: boolean
  checkinFlag: boolean
  draftFlag: boolean
  rakutenFlag: boolean
  directcheckinFlag: boolean
  campaignPriceFlag: boolean
  disableReservation: boolean
  petFlag: boolean
  futonFlag: boolean
  deliveryboxFlag: boolean
  clientDataType: number | null
  clientAdvertisingType: number | null
  advertisingType: number | null
  earlyExitDatetime: string | null
  noreserveCountBefore: number | null
  noreserveCountAfter: number | null
  extensionTime: number | null
  parkingReserveCount: number
  bicycleParkingReserveCount: number
  memo: string | null
}

export interface WhiteboardStayTypeRent {
  stayTypeId: number
  stayTypeNameShort: string | null
  price: number | null
}

export interface WhiteboardRoom {
  roomId: number
  facilityId: number
  roomNumber: string
  roomTypeId: number
  roomTypeName: string | null
  roomTypeNameShort: string | null
  roomClassId: number | null
  roomClassName: string | null
  roomStatus: number
  petFlag: boolean
  deliveryboxFlag: boolean
  acreage: string | null
  stayTypeRents: WhiteboardStayTypeRent[]
  usageStatus: WhiteboardReserveItem[]
  constructions: unknown[]
  memos: unknown[]
}

export interface WhiteboardFacility {
  facilityId: number
  facilityNo: string
  facilityName: string
  colorOption: string | null
  parkingFlag: boolean
  bicycleParkingFlag: boolean
  deliveryboxFlag: boolean
  parkingCount: number
  parkingHasReserveCount: number
  rooms: WhiteboardRoom[]
}

export interface WhiteboardPagination {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
}

export interface WhiteboardResponse {
  pagination: WhiteboardPagination
  usageStatuses: WhiteboardFacility[]
}

export interface WhiteboardFilterParams {
  page?: number
  perPage?: number
  facilityIds?: number[]
  roomClassIds?: number[]
  serviceTypes?: number[]
  cleanTypes?: number[]
  roomNumber?: string | null
  facilityNo?: string | null
  periodFrom?: string | null
  periodTo?: string | null
}

export const WHITEBOARD_SERVICE = {
  PARKING: 1,
  BICYCLE: 2,
  PET: 4,
  BOX: 5,
} as const

export const WHITEBOARD_CLEAN_STATUS = {
  ALL_CLEAN_REMAIN: 1,
  CLEAN_REMAIN: 2,
  FINISH_REMAIN: 3,
  IN_USE: 4,
  RAKUTEN: 5,
} as const
