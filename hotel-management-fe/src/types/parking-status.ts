// --- Parking Reserve Item ---
export interface ParkingReserveItem {
  parkingReserveId: number
  parkingId: number
  reserveId: number | null
  clientId: number | null
  clientName: string | null
  clientDataType: number | null
  dataStatus: number
  periodFrom: string
  periodTo: string | null
  confirmFlag: boolean
  checkinFlag: boolean
  checkoutFlag: boolean
  carType: string | null
  licensePlate: string | null
  note: string | null
  saleDate: string | null
  chargeStaffId: number | null
  facilityNo: string | null
  roomNumber: string | null
  reservePeriodFrom: string | null
  reservePeriodTo: string | null
}

// --- Parking Slot ---
export interface ParkingSlot {
  parkingId: number
  number: string
  heightLimit: number
  notice: string | null
  dataStatus: number
  facilityId: number
  facilityName: string
  parkingReserves: ParkingReserveItem[]
}

// --- Bicycle Parking Reserve Item ---
export interface BicycleParkingReserveItem {
  bicycleParkingReserveId: number
  bicycleParkingId: number
  reserveId: number | null
  clientId: number | null
  clientName: string | null
  clientDataType: number | null
  dataStatus: number
  periodFrom: string
  periodTo: string | null
  confirmFlag: boolean
  checkinFlag: boolean
  checkoutFlag: boolean
  bicycleTypeNote: string | null
  note: string | null
  saleDate: string | null
  chargeStaffId: number | null
  facilityNo: string | null
  roomNumber: string | null
  reservePeriodFrom: string | null
  reservePeriodTo: string | null
}

// --- Bicycle Parking Slot ---
export interface BicycleParkingSlot {
  bicycleParkingId: number
  number: string
  notice: string | null
  dataStatus: number
  facilityId: number
  facilityName: string
  bicycleParkingReserves: BicycleParkingReserveItem[]
}

// --- Facility Parking Status ---
export interface FacilityParkingStatus {
  facilityId: number
  facilityName: string
  colorOption: string | null
  parkings: ParkingSlot[]
  bicycleParkings: BicycleParkingSlot[]
  prices: Record<number, number>
}

// --- API Response ---
export type ParkingStatusResponse = FacilityParkingStatus[]

// --- Filter Params ---
export interface ParkingStatusFilterParams {
  facilityId?: number
  type?: number // 1=Both, 2=Car only, 3=Bicycle only
}

// --- Unified Reserve Item (for shared component rendering) ---
export interface UnifiedReserveItem {
  id: number
  parkingId: number
  reserveId: number | null
  clientId: number | null
  clientName: string | null
  clientDataType: number | null
  dataStatus: number
  periodFrom: string
  periodTo: string | null
  confirmFlag: boolean
  checkinFlag: boolean
  checkoutFlag: boolean
  vehicleInfo: string | null
  licensePlate: string | null
  note: string | null
  saleDate: string | null
  chargeStaffId: number | null
  facilityNo: string | null
  roomNumber: string | null
  reservePeriodFrom: string | null
  reservePeriodTo: string | null
}

// --- Unified Parking Slot (for shared component rendering) ---
export interface UnifiedParkingSlot {
  id: number
  number: string
  heightLimit: number | null
  notice: string | null
  dataStatus: number
  facilityId: number
  facilityName: string
  reserves: UnifiedReserveItem[]
  isBicycle: boolean
}
