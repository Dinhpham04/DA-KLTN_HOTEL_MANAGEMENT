// ---- Auth ----
export interface LoginRequest {
  mail: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: string
  staff: User
}

// ---- User / Staff ----
export interface User {
  staffId: number
  staffName: string
  mail: string | null
  staffType: number | null
}

// ---- Pagination ----
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ---- API Response ----
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

// ---- Room ----
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved'

export interface Room {
  id: number
  roomNumber: string
  roomClass: string
  floor: number
  status: RoomStatus
  maxOccupancy: number
  basePrice: number
  description?: string
  createdAt: string
  updatedAt: string
}

// ---- Reservation ----
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export interface Reservation {
  id: number
  reservationNumber: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  roomId: number
  room?: Room
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  status: ReservationStatus
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// ---- Client ----
export interface Client {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  nationality?: string
  identityNumber?: string
  createdAt: string
  updatedAt: string
}

// ---- Billing ----
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other'

export interface Billing {
  id: number
  reservationId: number
  reservation?: Reservation
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  issuedAt?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

// ---- Cleaning ----
export type CleaningStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface CleaningTask {
  id: number
  roomId: number
  room?: Room
  assignedStaffId?: number
  assignedStaff?: User
  status: CleaningStatus
  scheduledDate: string
  completedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  todayCheckIns: number
  todayCheckOuts: number
  pendingCleanings: number
  monthlyRevenue: number
  occupancyRate: number
}
