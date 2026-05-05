import dayjs from 'dayjs'

interface AnnouncementTitleMeta {
  label: string
  className: string
}

const DEFAULT_TITLE_META: AnnouncementTitleMeta = {
  label: 'Thông báo',
  className: 'bg-[#9CA3AF] text-white',
}

const ANNOUNCEMENT_TITLE_CLASSNAME: Record<string, string> = {
  'Chưa hoàn thành': 'bg-[#E60012] text-white',
  'Khảo sát': 'bg-[#DCEBFF] text-[#1E3A8A]',
  Rakuten: 'bg-[#EC5CA8] text-white',
  'Đặt tạm': 'bg-[#111827] text-white',
  Master: 'bg-[#9BC46E] text-[#1F2937]',
}

export function getAnnouncementTitleMeta(title?: string | null): AnnouncementTitleMeta {
  const normalized = title?.trim() ?? ''
  if (!normalized) return DEFAULT_TITLE_META

  return {
    label: normalized,
    className: ANNOUNCEMENT_TITLE_CLASSNAME[normalized] ?? DEFAULT_TITLE_META.className,
  }
}

export function formatAnnouncementCreatedAt(createdAt?: string | null): {
  date: string
  time: string
} {
  if (!createdAt) return { date: '', time: '' }

  const parsed = dayjs(createdAt)
  if (!parsed.isValid()) return { date: '', time: '' }

  return {
    date: parsed.format('D/M'),
    time: parsed.format('H:mm'),
  }
}

export function getAnnouncementDetailClassName(status?: number | null): string {
  if (status === 1) return 'text-black'
  if (status == null) return 'text-red-600'
  return 'text-black'
}
