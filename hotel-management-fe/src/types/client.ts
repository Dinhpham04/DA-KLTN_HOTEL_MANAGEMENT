export interface ServiceUsed {
  id: number
  type: number // 1: Car, 2: Bicycle, 4: Dog, 5: Trash
}

export interface Client {
  clientId: number
  dataStatus: number
  dataType: number
  clientName: string
  clientNameEn: string | null
  birthday: string | null
  sex: number
  contactName: string | null
  contactNameEn: string | null
  companyName: string | null
  companyNameEn: string | null
  email: string | null
  zipCode: string | null
  companyZipCode: string | null
  countryId: number | null
  address1: string | null
  address2: string | null
  companyAddress1: string | null
  companyAddress2: string | null
  tel: string | null
  telPhone: string | null
  telEmergency: string | null
  companyTel: string | null
  emergencyRelation: string | null
  fax: string | null
  postpaidFlag: boolean
  advertisingType: number | null
  memo: string | null
  useCount: number
  ugFlag?: boolean
  stayDurationAutoFlag?: boolean
  usedMessyLevel?: number
  expirationDateLast?: string | null
  lastUsedServiceIds?: ServiceUsed[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  countryName?: string
}

export interface ClientFilterParams {
  page?: number
  limit?: number
  search?: string
  // Individual filter fields
  clientName?: string
  contactName?: string
  email?: string
  tel?: string
  telPhone?: string
  telEmergency?: string
  // Type filters
  dataType?: number
  dataTypes?: number[]
  dataStatus?: number
  countryId?: number
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface ClientPaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedClientResponse {
  items: Client[]
  meta: ClientPaginationMeta
}

export interface CreateClientBody {
  dataType: number
  clientName: string
  clientNameEn?: string
  birthday?: string
  sex?: number
  contactName?: string
  contactNameEn?: string
  companyName?: string
  companyNameEn?: string
  email?: string
  zipCode?: string
  companyZipCode?: string
  countryId?: number
  address1?: string
  address2?: string
  companyAddress1?: string
  companyAddress2?: string
  tel?: string
  telPhone?: string
  telEmergency?: string
  companyTel?: string
  emergencyRelation?: string
  fax?: string
  postpaidFlag?: boolean
  advertisingType?: number
  stayDurationAutoFlag?: boolean
  ugFlag?: boolean
  usedMessyLevel?: number
  memo?: string
}

export interface UpdateClientBody extends Partial<CreateClientBody> {
  clientId: number
  dataStatus?: number
}

export interface ClientErrorResponse {
  message: string | string[]
  errors?: Record<string, string[]>
}

// Client data types
export const ClientDataType = {
  UNSPECIFIED: 0,
  INDIVIDUAL: 1,
  CORPORATION: 2,
  SPECIAL_CORPORATION: 3,
} as const

// Client data status
export const ClientDataStatus = {
  SUSPENDED: 0,
  ACTIVE: 1,
  HIDDEN: 2,
} as const

// Sex types
export const SexType = {
  MALE: 1,
  FEMALE: 2,
  OTHER: 9,
} as const
