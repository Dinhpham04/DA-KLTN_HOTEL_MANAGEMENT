export interface Identification {
  identificationId: number
  clientId: number
  identificationType: number
  identificationTypeInput: string | null
  identificationInputType: number | null
  imagePath: string | null
  identificationNumber: string | null
  expirationDate: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateIdentificationBody {
  identificationType: number
  identificationTypeInput?: string
  identificationInputType?: number
  imagePath?: string
  identificationNumber?: string
  expirationDate?: string
  active?: boolean
}

export interface UpdateIdentificationBody extends Partial<CreateIdentificationBody> {
  identificationId: number
}

// Identification types
export const IdentificationType = {
  PASSPORT: 1,
  CCCD: 2,
  CMND: 3,
  DRIVER_LICENSE: 4,
  RESIDENCE_CARD: 5,
  OTHER: 9,
} as const

// Identification input types
export const IdentificationInputType = {
  IMAGE: 1,
  MANUAL: 2,
} as const

export const getIdentificationTypeName = (type: number): string => {
  switch (type) {
    case IdentificationType.PASSPORT:
      return 'Hộ chiếu'
    case IdentificationType.CCCD:
      return 'CCCD'
    case IdentificationType.CMND:
      return 'CMND'
    case IdentificationType.DRIVER_LICENSE:
      return 'Giấy phép lái xe'
    case IdentificationType.RESIDENCE_CARD:
      return 'Thẻ cư trú'
    case IdentificationType.OTHER:
      return 'Khác'
    default:
      return 'Không xác định'
  }
}
