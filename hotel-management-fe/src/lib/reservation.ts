import dayjs from 'dayjs'

export function calculateStayTypeId(from: string, to: string): string {
  if (!from || !to) return ''

  const fromDate = dayjs(from)
  const toDate = dayjs(to)
  const dayDiff = toDate.add(1, 'day').diff(fromDate, 'day')
  const monthDiff = toDate.diff(fromDate, 'month')

  if (dayDiff >= 0 && dayDiff < 7) return '1'
  if (dayDiff >= 7 && monthDiff < 1) return '2'
  if (monthDiff >= 1 && monthDiff < 3) return '5'
  if (monthDiff >= 3 && monthDiff < 7) return '6'
  if (monthDiff >= 7) return '7'

  return '1'
}

export function calculateNights(from: string, to: string): number {
  if (!from || !to) return 0

  const diff = dayjs(to).diff(dayjs(from), 'day')
  return diff > 0 ? diff : 0
}

export function normalizeDirectcheckinType(value: number | null | undefined): string {
  if (value === 1 || value === 2 || value === 3) return String(value)
  if (value === 4) return '2'
  if (value === 5) return '3'

  return '1'
}

export function formatDateValue(date: Date | Date[] | null, format: string): string {
  if (!(date instanceof Date)) return ''
  return dayjs(date).format(format)
}

export function mergeDateAndTime(dateValue: string, timeValue?: string): string {
  if (!dateValue) return ''

  const parsedDate = dayjs(dateValue)
  if (!parsedDate.isValid()) return ''

  const normalizedDate = parsedDate.format('YYYY-MM-DD')
  if (!timeValue) return normalizedDate

  return `${normalizedDate}T${timeValue}:00`
}

export function extractTimeValue(dateTimeValue: string | null | undefined): string {
  if (!dateTimeValue) return ''

  const parsed = dayjs(dateTimeValue)
  if (!parsed.isValid()) return ''

  return parsed.format('HH:mm')
}
