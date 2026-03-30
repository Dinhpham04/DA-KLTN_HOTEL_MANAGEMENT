// FacilityRoomType matrix types (matches BE response)

export interface RoomTypeCellResponse {
  roomTypeId: number
  roomTypeNameShort: string
  roomTypeName?: string
  acreage: string | null
  isExists: boolean
}

export interface FacilityRowResponse {
  facilityId: number
  facilityName: string
  colorOption: string | null
  roomTypes: RoomTypeCellResponse[]
}

export interface FacilityRoomTypeMatrixResponse {
  facilities: FacilityRowResponse[]
}

// Upsert request body
export interface UpsertFacilityRoomTypeBody {
  facilities: {
    facilityId: number
    roomTypes: { roomTypeId: number; acreage: string | null }[]
  }[]
}
