import dayjs from 'dayjs'

export const MAILBOX_KEYBOX_VALUE = 'mailbox'

export const DIRECTCHECKIN_KEYBOX_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: 'a', value: 'a' },
  { label: 'b', value: 'b' },
  { label: 'c', value: 'c' },
  { label: 'd', value: 'd' },
  { label: 'e', value: 'e' },
  { label: 'f', value: 'f' },
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
  { label: 'E', value: 'E' },
  { label: 'F', value: 'F' },
  { label: 'Hộp thư', value: MAILBOX_KEYBOX_VALUE },
]

export const BOX_USAGE_PERIOD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '1', label: 'Chỉ ngày nhận phòng' },
  { value: '2', label: 'Từ ngày trước đến ngày nhận phòng' },
  { value: '3', label: 'Chỉ định khoảng thời gian' },
]

const DIRECTCHECKIN_PIN_SEGMENT_BY_KEYBOX: Record<string, string> = {
  '1': '1234',
  '2': '2345',
  '3': '3456',
  '4': '4567',
  '5': '5678',
  '6': '6789',
  a: '5678',
  b: '6789',
  c: '7890',
  d: '8901',
  e: '9012',
  f: '0123',
  A: '5678',
  B: '6789',
  C: '7890',
  D: '8901',
  E: '9012',
  F: '0123',
}

export function buildFacilityCode(facilityNo: string): string {
  return facilityNo
    .split('')
    .map((char) => {
      const numericValue = Number(char)
      if (!Number.isNaN(numericValue)) {
        return String(numericValue)
      }

      const upper = char.toUpperCase()
      if (/^[A-Z]$/.test(upper)) {
        return String(upper.charCodeAt(0) - 64)
      }

      return ''
    })
    .join('')
    .slice(0, 2)
    .padStart(2, '0')
}

export function buildDirectCheckinPassword(params: {
  keyboxName: string
  facilityNo?: string
  periodFrom?: string
  mailboxPassword?: string
}): string {
  const { keyboxName, facilityNo = '', periodFrom = '', mailboxPassword = '' } = params

  if (!keyboxName) return ''

  if (keyboxName === MAILBOX_KEYBOX_VALUE) {
    return mailboxPassword
  }

  const facilityCode = buildFacilityCode(facilityNo)
  const datePart = dayjs(periodFrom).isValid() ? dayjs(periodFrom).format('DD') : ''
  const secondPart = DIRECTCHECKIN_PIN_SEGMENT_BY_KEYBOX[keyboxName]

  if (!datePart || !facilityCode || !secondPart) {
    return ''
  }

  const firstPart = `${datePart}${facilityCode}`
  return (Number.parseInt(firstPart, 10) + Number.parseInt(secondPart, 10))
    .toString()
    .padStart(4, '0')
    .slice(-4)
}
