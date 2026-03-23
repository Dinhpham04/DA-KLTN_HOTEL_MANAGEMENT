// Room response from API (matches backend RoomResponseDto)
export interface Room {
  roomId: number
  facilityId: number
  roomTypeId: number
  dataStatus: number
  roomNumber: string
  keyType: number | null
  roomStatus: number
  reservedCleanDay: number
  deliveryboxFlag: boolean
  petFlag: boolean
  mailboxPassword: string
  orderNum: number
  externalFlag: boolean
  externalDateFrom: string | null
  externalDateTo: string | null
  createdAt: string
  updatedAt: string
  // Relations
  facilityName?: string
  facilityNo?: string
  roomTypeName?: string
  roomClassName?: string
  updatedByName?: string
}

// Room list data (wraps array for useFieldArray)
export interface RoomListData {
  rooms: Room[]
}

// Paginated response from API
export interface PaginatedRoomResponse {
  data: Room[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Create room request body (matches backend CreateRoomDto)
export interface CreateRoomBody {
  facilityId: number | string
  roomTypeId: number | string
  roomNumber: string
  keyType?: number
  roomStatus: number | string
  reservedCleanDay?: number
  deliveryboxFlag?: boolean
  petFlag?: boolean
  mailboxPassword: string
  orderNum?: number
  externalFlag?: boolean
  externalDateFrom?: string
  externalDateTo?: string
  dataStatus?: number
}

// Update room request body (matches backend UpdateRoomDto)
export interface UpdateRoomBody {
  roomId: number
  facilityId?: number
  roomTypeId?: number
  dataStatus?: number
  roomNumber?: string
  keyType?: number
  roomStatus?: number
  reservedCleanDay?: number
  deliveryboxFlag?: boolean
  petFlag?: boolean
  mailboxPassword?: string
  orderNum?: number
  externalFlag?: boolean
  externalDateFrom?: string
  externalDateTo?: string
}

// Room filter params
export interface RoomFilterParams {
  page?: number
  limit?: number
  search?: string
  facilityId?: number
  roomTypeId?: number
  roomClassId?: number
  roomStatus?: number
  dataStatus?: number
}

// Error response structure
export interface RoomErrorResponse {
  message: string | string[]
  errors?: Record<string, string[]>
}

// Room status options (1=Full Cleaning, 2=Partial, 3=Finishing)
export const ROOM_STATUS_OPTIONS = [
  { value: '', label: '---' },
  { value: '1', label: 'Dọn toàn bộ' },
  { value: '2', label: 'Dọn một phần' },
  { value: '3', label: 'Hoàn thiện' },
]

// Key type options (0=Room, 1=Cleaning)
export const KEY_TYPE_OPTIONS = [
  { value: '', label: '---' },
  { value: '0', label: 'Phòng' },
  { value: '1', label: 'Dọn dẹp' },
]

// Data status options
export const DATA_STATUS_OPTIONS = [
  { value: '', label: '---' },
  { value: '0', label: 'Không khả dụng' },
  { value: '1', label: 'Khả dụng' },
  { value: '2', label: 'Ẩn' },
]

// Boolean flag options
export const BOOLEAN_FLAG_OPTIONS = [
  { value: 'false', label: 'Không' },
  { value: 'true', label: 'Có' },
]
