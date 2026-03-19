export interface Facility {
  facilityId: number
  dataStatus: number
  facilityType: number
  facilityNo: string
  facilityName: string
  facilityNameEn: string
  zipCode: string
  address: string
  addressEn: string
  keyFunction: boolean
  sharePlaceFlag: boolean
  parkingFlag: boolean
  parkingImg: string
  bicycleParkingFlag: boolean
  bicycleParkingImg: string
  deliveryboxFlag: boolean
  memo: string | null
  orderNum: number
  colorOption: string | null
  createdAt: string
  updatedAt: string
  updatedByName?: string | null
}

export interface FacilityListData {
  facilities: Facility[]
}

export interface FacilityPaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedFacilityResponse {
  data: Facility[]
  meta: FacilityPaginationMeta
}

export interface CreateFacilityBody {
  facilityNo: string
  facilityName: string
  facilityNameEn: string
  zipCode: string
  address: string
  addressEn: string
  facilityType?: number
  keyFunction?: boolean
  sharePlaceFlag?: boolean
  parkingFlag?: boolean
  parkingImg?: string
  bicycleParkingFlag?: boolean
  bicycleParkingImg?: string
  deliveryboxFlag?: boolean
  memo?: string
  orderNum?: number
  colorOption?: string | null
}

export interface UpdateFacilityBody {
  facilityId: number
  dataStatus?: number
  facilityType?: number
  facilityNo?: string
  facilityName?: string
  facilityNameEn?: string
  zipCode?: string
  address?: string
  addressEn?: string
  keyFunction?: boolean
  sharePlaceFlag?: boolean
  parkingFlag?: boolean
  parkingImg?: string
  bicycleParkingFlag?: boolean
  bicycleParkingImg?: string
  deliveryboxFlag?: boolean
  memo?: string | null
  orderNum?: number
  colorOption?: string | null
}

export interface FacilityFilterParams {
  page?: number
  limit?: number
  search?: string
  facilityType?: number
  dataStatus?: number
}

export interface FacilityErrorResponse {
  message: string | string[]
  errors?: Record<string, string[]>
}
