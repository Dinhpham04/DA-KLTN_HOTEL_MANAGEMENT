// Individual rent item per stay type
export interface RentItem {
  stayTypeId: number
  stayTypeName: string
  dataStatus: number | null
  dayRent: number | null
  monthRent: number | null
  dayRentOver3: number | null
  monthRentOver3: number | null
  dayCleanFee: number | null
  monthCleanFee: number | null
  dayCleanFeeOver3: number | null
  monthCleanFeeOver3: number | null
  dayMainteFee: number | null
  dayUtilityFee: number | null
  depositPay: number | null
  depositPayOver3: number | null
  monthMainteFee: number | null
  monthUtilityFee: number | null
}

// Rent grouped by room type (API response)
export interface RentGroup {
  roomTypeId: number | string
  roomClassId: number | string | null
  roomTypeNameShort: string | null
  monthMainteFee: number | null
  monthUtilityFee: number | null
  orderNum: number
  rents: RentItem[]
}

// API response for rent list
export interface RentListResponse {
  rents: RentGroup[]
}

// Filter params
export interface RentFilterParams {
  depositFlag?: number
}

// Rent item input for bulk update
export interface RentItemInput {
  stayTypeId: number
  dataStatus: number
  dayRent?: number | null
  monthRent?: number | null
  dayRentOver3?: number | null
  monthRentOver3?: number | null
  dayCleanFee?: number | null
  monthCleanFee?: number | null
  dayCleanFeeOver3?: number | null
  monthCleanFeeOver3?: number | null
  dayMainteFee?: number | null
  dayUtilityFee?: number | null
  depositPay?: number | null
  depositPayOver3?: number | null
}

// Rent group input for bulk update
export interface RentGroupInput {
  roomTypeId: number
  roomClassId?: number
  monthMainteFee?: number | null
  monthUtilityFee?: number | null
  rents: RentItemInput[]
}

// Bulk update body
export interface BulkUpdateRentBody {
  data: RentGroupInput[]
}
