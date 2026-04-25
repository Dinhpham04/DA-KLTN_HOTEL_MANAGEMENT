export interface CreateSmartLockPinBody {
  roomId: number
  reserveId?: number
  pin: string
  validFrom: string
  validTo: string
  status?: number
  dataStatus?: number
}

export interface UpdateSmartLockPinBody extends Partial<CreateSmartLockPinBody> {
  roomPinCredentialId: number
}

export interface SmartLockPin {
  roomPinCredentialId: number
  roomId: number
  reserveId: number | null
  dataStatus: number
  maskedPin: string
  validFrom: string
  validTo: string
  status: number
  issuedAt: string | null
  revokedAt: string | null
  expiredAt: string | null
  providerCredentialId: string | null
  providerPayload: unknown
  lastSyncAt: string | null
  syncError: string | null
  createdAt: string
  updatedAt: string
}

export interface SmartLockPinFilterParams {
  page?: number
  limit?: number
  roomId?: number
  reserveId?: number
  status?: number
  dataStatus?: number
  roomNumber?: string
  providerCredentialId?: string
  activeAt?: string
  orderBy?: 'roomPinCredentialId' | 'validFrom' | 'validTo' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

export interface PaginatedSmartLockPinResponse {
  data: SmartLockPin[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
