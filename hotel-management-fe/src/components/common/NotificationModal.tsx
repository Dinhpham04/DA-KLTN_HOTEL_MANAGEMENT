import { dashboardHeaderApi } from '@/api/dashboard-header.api'
import {
  formatAnnouncementCreatedAt,
  getAnnouncementDetailClassName,
  getAnnouncementTitleMeta,
} from '@/constants/announcement'
import type { AnnouncementItem, AnnouncementPagination } from '@/types/dashboard-header'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface NotificationModalProps {
  date?: string
}

const PER_PAGE = 20

export default function NotificationModal({ date }: NotificationModalProps) {
  const { t } = useTranslation()
  const targetDate = date ?? dayjs().format('YYYY/MM/DD')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AnnouncementItem[]>([])
  const [pagination, setPagination] = useState<AnnouncementPagination>()
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const response = await dashboardHeaderApi.getAnnouncements({
          date: targetDate,
          page,
          perPage: PER_PAGE,
        })
        if (cancelled) return
        const next = response.data.announcements
        setItems((prev) => (page === 1 ? next : [...prev, ...next]))
        setPagination(response.data.pagination)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [targetDate, page])

  useEffect(() => {
    if (!observerRef.current) return
    const target = observerRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (pagination && page < pagination.lastPage) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(target)
    return () => observer.unobserve(target)
  }, [pagination, page])

  return (
    <div className="grid w-full !border-none">
      <div className="h-full">
        <table className="w-full text-[1.6rem] !border-none">
          <tbody className="!border-none [&_td]:p-2">
            {items.map((item, index) => {
              const titleMeta = getAnnouncementTitleMeta(item.detail)
              const createdAt = formatAnnouncementCreatedAt(item.createdAt)
              const detail = item.detail ?? ''
              const detailClassName = getAnnouncementDetailClassName(item.dataStatus)
              return (
                <tr key={`${item.announcementId}-${index}`}>
                  <td className="w-[12rem] py-1 !pr-2 align-top">
                    <span
                      className={`${titleMeta.className} inline-flex h-[2.2rem] min-w-[8rem] items-center justify-center px-2 text-[1.4rem] font-bold`}
                    >
                      {titleMeta.label}
                    </span>
                  </td>
                  <td className="w-[10rem] py-1 !px-1 align-top text-[1.4rem] font-bold whitespace-nowrap">
                    {createdAt.date}
                    <span className="ml-2">{createdAt.time}</span>
                  </td>
                  <td className={`py-1 !pl-2 align-top text-[1.6rem] ${detailClassName}`}>
                    {detail}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && items.length === 0 && (
          <div className="!mt-0 !border-none py-2 text-[1.6rem] font-bold">
            {t('dashboard.header.noData')}
          </div>
        )}
        {loading && (
          <div className="py-2 text-center text-[1.4rem]">{t('dashboard.header.loading')}</div>
        )}
        <div className="z-50" ref={observerRef} style={{ height: 1 }} />
      </div>
    </div>
  )
}
