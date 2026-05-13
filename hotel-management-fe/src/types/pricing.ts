export interface RequestType {
  requestTypeId: number
  requestTypeName: string
  requestTypeNameEn?: string | null
  category: 'rent' | 'service' | 'parking' | 'trunkroom' | 'deposit' | 'discount' | 'other'
  taxFreeDefault: boolean
  isRefund: boolean
  orderNum: number
}

export type CountUnit = 1 | 2 | 3 // 1=Month, 2=Day, 3=Time

export interface CalculateFeesBody {
  roomTypeId: number
  stayTypeId: number
  periodFrom: string
  periodTo: string
  peopleCount?: 1 | 2
  countUnit: CountUnit
  serviceTypeIds?: number[]
  parkingId?: number
  facilityId?: number
}

export interface RentFee {
  unitPrice: number
  count: number
  totalPrice: number
  description: string
}

export interface ServiceFee {
  requestTypeId: number
  requestTypeName: string
  unitPrice: number
  count: number
  countUnit: CountUnit
  totalPrice: number
}

export interface ParkingFee {
  parkingId: number
  unitPrice: number
  count: number
  totalPrice: number
}

export interface CalculateFeesResponse {
  rentFee: RentFee
  rentExtraFees: ServiceFee[]
  serviceFees: ServiceFee[]
  parkingFee?: ParkingFee
  isTaxFree: boolean
  subtotal: number
  tax: number
  totalPrice: number
}

export interface RequestTypeFilterParams {
  category?: RequestType['category']
}
