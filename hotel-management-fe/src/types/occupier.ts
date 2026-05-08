export interface ReserveOccupier {
  reserveOccupierId: number
  reserveId: number
  occupierName: string
  sex: number
  tel: string | null
  orderNum: number | null
  birthday?: string | null
  address1?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateReserveOccupierBody {
  occupierName: string
  sex: number
  tel?: string
  birthday?: string | null
  address1?: string
  orderNum?: number
}

export interface CreateReserveOccupierBatchBody {
  reserveId: number
  occupiers: CreateReserveOccupierBody[]
}

export interface UpdateReserveOccupierBody {
  occupierName?: string
  sex?: number
  tel?: string
  birthday?: string | null
  address1?: string
  orderNum?: number
}

export interface ReserveOccupierFilterParams {
  reserveId?: number
}
