export interface ParkingRent {
  parkingRentId: number
  stayTypeId: number
  rent: number
}

export interface Parking {
  parkingId: number
  dataStatus: number
  parentFacilityId: number
  number: string
  heightLimit: number
  notice: string | null
  orderNum: number
  createdAt: string
  updatedAt: string
  parkingRents: ParkingRent[]
  updatedStaffName: string | null
}

export interface ParkingListResponse {
  parkings: Parking[]
}

export interface ParkingRentInput {
  stayTypeId: number
  rent: number
}

export interface CreateParkingBody {
  parentFacilityId: number
  number: string
  heightLimit: number
  notice?: string
  orderNum?: number
  parkingRents?: ParkingRentInput[]
}

export interface UpdateParkingBody {
  parkingId: number
  parentFacilityId?: number
  number?: string | null
  heightLimit?: number
  notice?: string
  orderNum?: number
  dataStatus?: number
  parkingRents?: ParkingRentInput[]
}

export interface ParkingFilterParams {
  facilityId?: number
}

export interface UpdateParkingOrderBody {
  ids: number[]
}

export interface ParkingErrorResponse {
  message: string | string[]
  errors?: Record<string, string[]>
}
