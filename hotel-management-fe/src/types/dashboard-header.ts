export interface RoomClassCounts {
  roomClassId: number
  roomClassName: string
  orderNum: number
  countRoomClassEmptyBefore: number
  countRoomClassEmptyToday: number
  selectedCheckinDate: number
  selectedCheckoutDate: number
  countTypeRoom: number
}

export interface TargetResidualRoom {
  id: string | null
  number: number
}

export interface DailyBusinessRoomCounts {
  roomClasses: RoomClassCounts[]
  totalReserves: number
  arrivingRooms: number
  departingRooms: number
  totalRoomEmptyToday: number
  totalRoom: number
  emptyRoom: number
  formattedCurrentTime: string
}

export interface DailyBusiness {
  roomCounts: DailyBusinessRoomCounts
  targetResidualRoom: TargetResidualRoom
}

export interface DailyBusinessResponse {
  businesses: DailyBusiness
}

export interface AnnouncementItem {
  announcementId: number
  detail: string | null
  orderNum: number
  dataStatus: number | null
  createdAt: string
  updatedAt: string
}

export interface AnnouncementPagination {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export interface AnnouncementListResponse {
  announcements: AnnouncementItem[]
  pagination: AnnouncementPagination
}

export interface AnnouncementFilterParams {
  date?: string
  page?: number
  perPage?: number
}

export interface SaleSetting {
  settingId: number
  defaultSaleDate: string
}

export interface SaleSettingResponse {
  setting: SaleSetting
}

export interface UpsertResidualRoomBody {
  date: string
  number: number
}

export type SaleDateUpdateType = 1 | 2

export interface UpdateSaleDateBody {
  type: SaleDateUpdateType
}
