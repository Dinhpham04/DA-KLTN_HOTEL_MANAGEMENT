import dayjs from 'dayjs'

import { mergeDateAndTime } from '@/lib/reservation'

type ResolveSmartLockValidFromParams = {
  value?: string
  periodFrom?: string
  checkinTime?: string
}

type ResolveSmartLockValidToParams = {
  value?: string
  periodTo?: string
}

type ValidateSelfCheckinSmartLockParams = {
  isSelfCheckin: boolean
  roomId?: string
  smartLockPin: string
  smartLockValidFrom: string
  smartLockValidTo: string
  hasExistingSmartLockPin?: boolean
}

type ResolveSelfCheckinSmartLockStateParams = {
  directcheckinFlag?: boolean
  directcheckinType?: string
  roomId?: string
  smartLockPin?: string
  smartLockValidFrom?: string
  smartLockValidTo?: string
  periodFrom?: string
  periodTo?: string
  checkinTime?: string
  hasExistingSmartLockPin?: boolean
}

type ResolveSelfCheckinSmartLockStateResult = {
  isSelfCheckin: boolean
  isPinMasked: boolean
  smartLockPin: string
  smartLockValidFrom: string
  smartLockValidTo: string
  smartLockValidationError: string | null
}

const MASKED_SMART_LOCK_PIN_REGEX = /^\*{4}\d{4}$/

export function generateSmartLockPin() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function isMaskedSmartLockPin(pin?: string) {
  return MASKED_SMART_LOCK_PIN_REGEX.test(pin?.trim() ?? '')
}

export function resolveSmartLockValidFrom({
  value,
  periodFrom,
  checkinTime,
}: ResolveSmartLockValidFromParams) {
  if (value) return value
  if (!periodFrom) return ''

  return mergeDateAndTime(periodFrom, checkinTime)
}

export function resolveSmartLockValidTo({ value, periodTo }: ResolveSmartLockValidToParams) {
  if (value) return value
  if (!periodTo) return ''

  return dayjs(periodTo).endOf('day').format('YYYY-MM-DD HH:mm')
}

export function validateSelfCheckinSmartLock({
  isSelfCheckin,
  roomId,
  smartLockPin,
  smartLockValidFrom,
  smartLockValidTo,
  hasExistingSmartLockPin,
}: ValidateSelfCheckinSmartLockParams) {
  if (!isSelfCheckin) return null

  if (!roomId) {
    return 'Vui lòng chọn phòng trước khi tạo nhận phòng trực tiếp'
  }

  const isNumericPin = /^\d{4,12}$/.test(smartLockPin)
  const isMaskedPin = isMaskedSmartLockPin(smartLockPin)

  if (!isNumericPin && !(hasExistingSmartLockPin && isMaskedPin)) {
    return 'Mã PIN smart lock phải gồm từ 4 đến 12 chữ số'
  }

  if (!dayjs(smartLockValidFrom).isValid() || !dayjs(smartLockValidTo).isValid()) {
    return 'Thời gian hiệu lực PIN smart lock không hợp lệ'
  }

  if (!dayjs(smartLockValidTo).isAfter(dayjs(smartLockValidFrom))) {
    return 'Thời gian kết thúc PIN phải sau thời gian bắt đầu'
  }

  return null
}

export function resolveSelfCheckinSmartLockState({
  directcheckinFlag,
  directcheckinType,
  roomId,
  smartLockPin,
  smartLockValidFrom,
  smartLockValidTo,
  periodFrom,
  periodTo,
  checkinTime,
  hasExistingSmartLockPin,
}: ResolveSelfCheckinSmartLockStateParams): ResolveSelfCheckinSmartLockStateResult {
  const isSelfCheckin = !!directcheckinFlag && String(directcheckinType ?? '') === '2'
  const normalizedPin = smartLockPin?.trim() ?? ''
  const isPinMasked = isMaskedSmartLockPin(normalizedPin)
  const normalizedValidFrom = resolveSmartLockValidFrom({
    value: smartLockValidFrom,
    periodFrom,
    checkinTime,
  })
  const normalizedValidTo = resolveSmartLockValidTo({
    value: smartLockValidTo,
    periodTo,
  })

  return {
    isSelfCheckin,
    isPinMasked,
    smartLockPin: normalizedPin,
    smartLockValidFrom: normalizedValidFrom,
    smartLockValidTo: normalizedValidTo,
    smartLockValidationError: validateSelfCheckinSmartLock({
      isSelfCheckin,
      roomId,
      smartLockPin: normalizedPin,
      smartLockValidFrom: normalizedValidFrom,
      smartLockValidTo: normalizedValidTo,
      hasExistingSmartLockPin,
    }),
  }
}
