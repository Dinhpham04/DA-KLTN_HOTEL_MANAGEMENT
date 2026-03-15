// Staff response from API (matches backend StaffResponseDto)
export interface Staff {
  staffId: number
  dataStatus: number
  staffType: number
  staffName: string
  staffNameEn: string | null
  staffNameShort: string | null
  sex: number
  zipCode: string | null
  address: string | null
  mail: string
  tel: string | null
  businessTel: string | null
  emergencyTel: string | null
  orderNum: number | null
  displayInAttendance: boolean
  createdAt: string
  updatedAt: string
  updatedByName: string | null
}

// Staff list data (wraps array for useFieldArray)
export interface StaffListData {
  staffs: Staff[]
}

// Paginated response from API
export interface PaginatedStaffResponse {
  data: Staff[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Create staff request body (matches backend CreateStaffDto)
export interface CreateStaffBody {
  staffType: string | number
  staffName: string
  staffNameEn?: string
  staffNameShort?: string
  mail: string
  password: string
  displayInAttendance?: boolean
  orderNum?: number
  dataStatus?: number
}

// Update staff request body (matches backend UpdateStaffDto)
export interface UpdateStaffBody {
  staffId: number
  staffType?: number | string
  staffName?: string
  staffNameEn?: string | null
  staffNameShort?: string | null
  mail?: string
  password?: string
  displayInAttendance?: boolean
  dataStatus?: number
  orderNum?: number | null
}

export interface StaffErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

export const STAFF_TYPE_OPTIONS = [
  { value: '', label: '---' },
  { value: '1', label: 'Quản trị' },
  { value: '2', label: 'Quản lý' },
  { value: '3', label: 'Lễ tân' },
  { value: '4', label: 'Dọn phòng' },
  { value: '5', label: 'Bảo vệ' },
  { value: '6', label: 'Kỹ thuật' },
]

export const ATTENDANCE_OPTIONS = [
  { value: 'false', label: 'Không' },
  { value: 'true', label: 'Có' },
]
