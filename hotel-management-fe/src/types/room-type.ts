// Room Type response from API
export interface RoomType {
  roomTypeId: number
  dataStatus: number
  roomClassId: number
  roomTypeName: string
  roomTypeNameShort: string
  acreage: number | null
  orderNum: number
  orderNumDeposit: number | null
  createdAt: string
  updatedAt: string
  roomClassName?: string
}

// Paginated response from API
export interface PaginatedRoomTypeResponse {
  data: RoomType[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Room Type filter params
export interface RoomTypeFilterParams {
  page?: number
  limit?: number
  search?: string
  roomClassId?: number
  facilityId?: number
  dataStatus?: number
}
