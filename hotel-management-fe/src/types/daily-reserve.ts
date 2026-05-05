export interface DailyReserveSmartLock {
  roomPinCredentialId: number | null
  maskedPin: string | null
  cardCount: number | null
  validFrom: string | null
  validTo: string | null
  status: number | null
}

export interface DailyReserveServiceFlags {
  deliverybox: boolean
  parking: boolean
  bicycleParking: boolean
  pet: boolean
  futon: boolean
}

export interface DailyReserveParking {
  id: number
  type: 'car' | 'bicycle'
  number: string | null
  facilityName: string | null
  periodFrom: string | null
  periodTo: string | null
  checkinFlag: boolean
  checkoutFlag: boolean
}

export interface DailyReserve {
  reserveId: number
  clientId: number | null
  clientName: string | null
  contactName: string | null
  clientDataType: number | null
  facilityId: number | null
  facilityNo: string | null
  facilityName: string | null
  roomId: number | null
  roomNumber: string | null
  occupierName: string | null
  periodFrom: string | null
  periodTo: string | null
  lastStayDate: string | null
  newReserveDate: string | null
  rentalTime: number
  result: string
  flagOrderFirst: boolean
  confirmFlag: boolean
  checkinFlag: boolean
  canCheckIn: boolean
  directcheckinFlag: boolean
  directcheckinType: number | null
  directcheckinNote: string | null
  note: string | null
  advertisingType: number | null
  chargeStaffId: number | null
  chargeStaffName: string | null
  chargeStaffNameShort: string | null
  diContactStaffId: number | null
  diContactStaffName: string | null
  checkinReceptionistId: number | null
  checkinReceptionistName: string | null
  deliveryboxCardNumber: string | null
  parkingReservesCount: number
  bicycleParkingReservesCount: number
  serviceFlags: DailyReserveServiceFlags
  smartLock: DailyReserveSmartLock
  parkingReserves: DailyReserveParking[]
}

export interface DailyReserveResponse {
  reserves: DailyReserve[]
  statusCode: number
}

export interface DailyReserveFilterParams {
  date?: string
  time?: string
  dashboardFlag?: boolean
}

export interface UpdateDailyReserveBody {
  reserveId: number
  note?: string | null
  chargeStaffId?: number | null
  diContactStaffId?: number | null
  directcheckinType?: number | null
  smartLockPin?: string | null
  smartLockCardCount?: number | null
  checkinFlag?: boolean
}

export interface UpdateAllDailyReserveBody {
  reserves: UpdateDailyReserveBody[]
}

export interface UpdateAllDailyReserveResponse {
  statusCode: number
  errors: Array<{ index: number; reserveId?: number; error: string }>
}
