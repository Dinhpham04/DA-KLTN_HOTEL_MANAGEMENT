export interface BicycleParking {
  bicycleParkingId: number
  dataStatus: number
  parentFacilityId: number
  number: string
  notice: string | null
  orderNum: number
  createdAt: string
  updatedAt: string
  updatedStaffName: string | null
}

export interface BicycleParkingListResponse {
  bicycleParkings: BicycleParking[]
}

export interface CreateBicycleParkingBody {
  parentFacilityId: number
  number: string
  notice?: string
  orderNum?: number
}

export interface UpdateBicycleParkingBody {
  bicycleParkingId: number
  parentFacilityId?: number
  number?: string | null
  notice?: string
  orderNum?: number
  dataStatus?: number
}

export interface BicycleParkingFilterParams {
  facilityId?: number
}

export interface UpdateBicycleParkingOrderBody {
  ids: number[]
}

export interface BicycleParkingErrorResponse {
  message: string | string[]
  errors?: Record<string, string[]>
}
