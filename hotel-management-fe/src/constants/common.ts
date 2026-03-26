export const ONE_MONTH_EXPIRATION = 60 * 60 * 24 * 30

export const USER_NAME_GEONAMES = 'commudevietnam'

// Data Type for Client
export const DataType = {
  0: 'Không xác định',
  1: 'Cá nhân',
  2: 'Doanh nghiệp',
  3: 'DN đặc biệt',
} as const

// Sex enum
export enum Sex {
  Nam = 1,
  Nữ = 2,
  Khác = 9,
}

// Calendar type (for birthday)
export const TypeCalendal = {
  0: 'Dương lịch',
  1: 'Âm lịch',
} as const

// Used messy level
export enum UsedMessyLevel {
  Không = 0,
  Có = 1,
}

// UG Flag
export enum UgFlag {
  Không = 0,
  Có = 1,
}

// Identifications type
export interface IdentificationsType {
  label: string
  value: string
}

export const IdentificationsConst: Record<'license' | 'passport' | 'other', IdentificationsType> = {
  license: {
    label: 'CMND/CCCD',
    value: '1',
  },
  passport: {
    label: 'Hộ chiếu',
    value: '2',
  },
  other: {
    label: 'Khác',
    value: '9',
  },
} as const

// Regex patterns for validation
export const regexHtml = /<[^>]*>/
export const regexSQL = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|ALTER|CREATE|TRUNCATE)\b/i
export const regexUrl = /https?:\/\/[^\s]+/
export const regexIcon = /[\p{So}]/u

export const phoneNumberRegex =
  /^(0(\d-\d{4}-\d{4}))|(0(\d{3}-\d{2}-\d{4}))|((070|080|090|050)(-\d{4}-\d{4}))|(0(\d{2}-\d{3}-\d{4}))|(0(\d{9,10})$)|(\+84\d{9,10}$)|(\d{10,11}$)/
