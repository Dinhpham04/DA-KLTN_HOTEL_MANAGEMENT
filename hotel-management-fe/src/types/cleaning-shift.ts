export const CleaningDataType = {
  ROOM: 1,
  COMMON_AREA: 2,
  KEY_SAFETY: 3,
} as const
export type CleaningDataType = (typeof CleaningDataType)[keyof typeof CleaningDataType]

export const CleaningStatus = {
  NOT_STARTED: 1,
  IN_PROGRESS: 2,
  PAUSED: 3,
  FINISHED: 4,
  CHECKED: 5,
  REOPENED: 6,
  CANCELLED: 7,
} as const
export type CleaningStatus = (typeof CleaningStatus)[keyof typeof CleaningStatus]

export const PinStatus = {
  ACTIVE: 1,
  REVOKED: 2,
  EXPIRED: 3,
} as const
export type PinStatus = (typeof PinStatus)[keyof typeof PinStatus]

export interface PinInfo {
  roomPinCredentialId: number
  maskedPin: string
  status: number
  validFrom: string
  validTo: string
  revokedAt: string | null
  expiredAt: string | null
  revokedOk: boolean
}

export interface CleaningDetail {
  cleaningDetailId: number
  cleanId: number
  facilityId: number
  facilityName: string | null
  facilityNo: string | null
  roomId: number | null
  roomNumber: string | null
  roomMailboxPassword: string | null
  roomTypeId: number | null
  roomTypeName: string | null
  reserveId: number | null
  reserveClientName: string | null
  reserveCheckoutAt: string | null
  reservePeriodFrom: string | null
  reservePeriodTo: string | null
  reserveNoreserveCountAfter: number | null
  reserveDisableReservation: boolean
  reserveRentalKeys: number | null
  reserveReturnKeys: number | null
  reserveKeyReturnDatetime: string | null
  reserveCheckoutReceptionistId: number | null
  newReserveDate: string | null
  roomDirtyLevel: number | null
  dataType: number
  areaName: string | null
  mainStaffId: number | null
  subStaffId: number | null
  checkStaffId: number | null
  mainStaffName: string | null
  subStaffName: string | null
  checkStaffName: string | null
  mainStaffExternalFlag: boolean
  subStaffExternalFlag: boolean
  checkStaffExternalFlag: boolean
  scheduledDate: string | null
  startDatetime: string | null
  endDatetime: string | null
  finishDatetime: string | null
  cleanStatus: number
  checkSafetyFlag: boolean
  pinRevokedConfirmedAt: string | null
  pinInfo: PinInfo | null
  comment: string | null
  reportImg1: string | null
  reportImg2: string | null
  reportImg3: string | null
  reportImg4: string | null
  noteCount: number
  orderNum: number | null
  createdAt: string
  updatedAt: string
}

export interface Cleans {
  cleanId: number
  facilityId: number
  cleaningDate: string
  note: string | null
  restTimeFrom: string | null
  restTimeTo: string | null
  details: CleaningDetail[]
  createdAt: string
  updatedAt: string
}

export interface CleanDetailNote {
  cleanDetailNoteId: number
  cleaningDetailId: number
  noteContent: string
  createdStaffId: number
  createdStaffName: string | null
  createdAt: string
  updatedAt: string
}

export interface CleaningShiftFilterParams {
  cleaningDate: string
  facilityId: number
  dataType?: CleaningDataType
  roomTypeIds?: number[]
  newReserveFlag?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export interface UpsertCleansBody {
  facilityId: number
  cleaningDate: string
  note?: string
  restTimeFrom?: string
  restTimeTo?: string
}

export interface UpdateCleansBody {
  note?: string
  restTimeFrom?: string
  restTimeTo?: string
}

export interface CreateCleaningDetailBody {
  facilityId: number
  dataType: CleaningDataType
  roomId?: number
  reserveId?: number
  areaName?: string
  mainStaffId?: number
  subStaffId?: number
  checkStaffId?: number
  mainStaffExternalFlag?: boolean
  subStaffExternalFlag?: boolean
  checkStaffExternalFlag?: boolean
  scheduledDate?: string
  comment?: string
  orderNum?: number
}

export interface UpdateCleaningDetailBody {
  mainStaffId?: number | null
  subStaffId?: number | null
  checkStaffId?: number | null
  mainStaffExternalFlag?: boolean
  subStaffExternalFlag?: boolean
  checkStaffExternalFlag?: boolean
  scheduledDate?: string
  startDatetime?: string | null
  endDatetime?: string | null
  finishDatetime?: string | null
  comment?: string
  areaName?: string
  reportImg1?: string | null
  reportImg2?: string | null
  reportImg3?: string | null
  reportImg4?: string | null
  orderNum?: number
}

export type UpdateCleaningDetailType1Body = Pick<
  UpdateCleaningDetailBody,
  | 'mainStaffId'
  | 'subStaffId'
  | 'checkStaffId'
  | 'mainStaffExternalFlag'
  | 'subStaffExternalFlag'
  | 'checkStaffExternalFlag'
  | 'startDatetime'
  | 'endDatetime'
  | 'finishDatetime'
  | 'comment'
>

export type UpdateCleaningDetailType2Body = Pick<
  UpdateCleaningDetailBody,
  | 'areaName'
  | 'mainStaffId'
  | 'checkStaffId'
  | 'mainStaffExternalFlag'
  | 'checkStaffExternalFlag'
  | 'comment'
>

export interface UpdateCleaningDetailType3Body {
  checkSafetyFlag?: boolean
  roomPinCredentialId?: number | null
  pinRevokedConfirmedAt?: string | null
  checkStaffId?: number | null
  checkStaffExternalFlag?: boolean
  comment?: string
}

export interface UpdateCleaningStatusBody {
  cleanStatus: CleaningStatus
}

export interface UpdateMainStaffBody {
  mainStaffId: number | null
  mainStaffExternalFlag?: boolean
}

export interface CopyCleaningDetailBody {
  targetDate: string
}

export interface CreateCleanDetailNoteBody {
  noteContent: string
}

export interface UpdateCleanDetailNoteBody {
  noteContent: string
}
