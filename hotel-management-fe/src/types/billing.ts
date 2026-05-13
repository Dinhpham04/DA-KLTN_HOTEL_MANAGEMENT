export interface RequestDetail {
  requestDetailId: number
  reserveId: number
  requestId: number | null
  requestTypeId: number
  stayTypeId: number | null
  occupierName: string | null
  titlePrefix: string | null
  titleSuffix: string | null
  taxFreeFlag: boolean
  requestFrom: string | null
  requestTo: string | null
  requestDayCount: number | null
  unitPrice: number | null
  totalPrice: number | null
  totalPriceChange: number | null
  peopleCount: number
  count: number
  countUnit: number
  chargeStaffId: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateRequestDetailBody {
  reserveId: number
  requestTypeId: number
  countUnit: number
  stayTypeId?: number
  occupierName?: string
  titlePrefix?: string
  titleSuffix?: string
  taxFreeFlag?: boolean
  requestFrom?: string
  requestTo?: string
  requestDayCount?: number
  unitPrice?: number
  totalPrice?: number
  totalPriceChange?: number
  peopleCount?: number
  count?: number
  chargeStaffId?: number
}

export type UpdateRequestDetailBody = Partial<Omit<CreateRequestDetailBody, 'reserveId'>>

export interface RequestDetailFilterParams {
  reserveId?: number
}

// ---------------------------------------------------------------------------

export interface SaleDetail {
  saleDetailId: number
  reserveId: number
  saleId: number | null
  requestDetailId: number | null
  requestTypeId: number
  paymentTypeId: number | null
  paymentMethodId: number | null
  stayTypeId: number | null
  occupierName: string | null
  titlePrefix: string | null
  titleSuffix: string | null
  taxFreeFlag: boolean
  isConfirmed: boolean
  confirmedDate: string | null
  requestFrom: string | null
  requestTo: string | null
  requestDayCount: number | null
  unitPrice: number | null
  totalPrice: number | null
  count: number
  countUnit: number
  chargeStaffId: number | null
  summary: string | null
  saleDate: string | null
  receiptPaymentDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSaleDetailBody {
  reserveId: number
  requestTypeId: number
  countUnit: number
  requestDetailId?: number
  paymentTypeId?: number
  paymentMethodId?: number
  stayTypeId?: number
  occupierName?: string
  taxFreeFlag?: boolean
  isConfirmed?: boolean
  confirmedDate?: string
  requestFrom?: string
  requestTo?: string
  requestDayCount?: number
  unitPrice?: number
  totalPrice?: number
  count?: number
  chargeStaffId?: number
  summary?: string
  saleDate?: string
  receiptPaymentDate?: string
}

export type UpdateSaleDetailBody = Partial<Omit<CreateSaleDetailBody, 'reserveId'>>

export interface SaleDetailFilterParams {
  reserveId?: number
}

// ---------------------------------------------------------------------------

export interface PaymentMethod {
  paymentMethodId: number
  paymentTypeId: number | null
  category: string | null
  displayName: string | null
  accountCode: number | null
  subAccountCode: string | null
  memo: string | null
}
