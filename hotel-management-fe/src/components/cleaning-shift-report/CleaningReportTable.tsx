import { NoteDrawer } from '@/components/cleaning-shift/NoteDrawer'
import { Button } from '@/components/ui/button'
import { useUpdateCleaningDetail } from '@/hooks/mutations/useUpdateCleaningDetail'
import { useUpdateCleaningStatus } from '@/hooks/mutations/useUpdateCleaningStatus'
import { cn } from '@/lib/utils'
import { type CleaningDetail, CleaningStatus } from '@/types/cleaning-shift'
import { StickyNote } from 'lucide-react'
import { toast } from 'react-toastify'

type ReportKind = 'room' | 'common'

interface CleaningReportTableProps {
  title: string
  details: CleaningDetail[]
  reportDate: Date
  kind: ReportKind
  refetch: () => void
}

const statusLabel: Record<number, string> = {
  [CleaningStatus.NOT_STARTED]: 'Chưa bắt đầu',
  [CleaningStatus.IN_PROGRESS]: 'Đang dọn',
  [CleaningStatus.PAUSED]: 'Tạm dừng',
  [CleaningStatus.FINISHED]: 'Đã xong',
  [CleaningStatus.CHECKED]: 'Đã kiểm tra',
  [CleaningStatus.REOPENED]: 'Mở lại',
  [CleaningStatus.CANCELLED]: 'Đã hủy',
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatShortDate(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function buildDateTime(reportDate: Date, time: string) {
  if (!time) return null
  return `${formatDate(reportDate)}T${time}:00`
}

function getNextStatus(status: number) {
  if (
    status === CleaningStatus.NOT_STARTED ||
    status === CleaningStatus.PAUSED ||
    status === CleaningStatus.REOPENED
  ) {
    return { label: 'Bắt đầu', value: CleaningStatus.IN_PROGRESS }
  }
  if (status === CleaningStatus.IN_PROGRESS) {
    return { label: 'Kết thúc', value: CleaningStatus.FINISHED }
  }
  if (status === CleaningStatus.FINISHED) {
    return { label: 'Xác nhận', value: CleaningStatus.CHECKED }
  }
  return null
}

function rowTone(status: number) {
  if (status === CleaningStatus.CHECKED) return 'bg-neutral-200'
  if (status === CleaningStatus.CANCELLED) return 'bg-neutral-300 text-neutral-600'
  if (status === CleaningStatus.IN_PROGRESS) return 'bg-blue-50'
  if (status === CleaningStatus.FINISHED) return 'bg-emerald-50'
  return 'bg-white'
}

function staffName(detail: CleaningDetail) {
  const names = [detail.mainStaffName, detail.subStaffName, detail.checkStaffName].filter(Boolean)
  return names.length > 0 ? names.join(' / ') : '-'
}

function statusClass(status: number) {
  if (status === CleaningStatus.IN_PROGRESS) return 'bg-blue-200'
  if (status === CleaningStatus.FINISHED) return 'bg-emerald-200'
  if (status === CleaningStatus.CHECKED) return 'bg-neutral-300'
  if (status === CleaningStatus.CANCELLED) return 'bg-rose-200'
  return 'bg-[#eee]'
}

export function CleaningReportTable({
  title,
  details,
  reportDate,
  kind,
  refetch,
}: CleaningReportTableProps) {
  const updateDetail = useUpdateCleaningDetail({
    onSuccess: () => {
      toast.success('Đã cập nhật thời gian')
      refetch()
    },
    onError: () => toast.error('Không thể cập nhật thời gian'),
  })

  const updateStatus = useUpdateCleaningStatus({
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái')
      refetch()
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể cập nhật trạng thái'
      toast.error(message)
    },
  })

  const handleTimeChange = (
    detail: CleaningDetail,
    field: 'startDatetime' | 'endDatetime',
    time: string
  ) => {
    updateDetail.mutate({
      id: detail.cleaningDetailId,
      data: {
        [field]: buildDateTime(reportDate, time),
      },
    })
  }

  const handleStatus = (detail: CleaningDetail) => {
    const next = getNextStatus(detail.cleanStatus)
    if (!next) return
    updateStatus.mutate({
      id: detail.cleaningDetailId,
      data: { cleanStatus: next.value },
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
        <h2 className="ml-[1.5rem] font-bold text-[2.3rem]">■ {title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0 w-full min-w-[96rem] text-[1.6rem] [&_td]:border-black [&_td]:border-r [&_td]:border-b [&_td:first-child]:border-l [&_th]:bg-[#eee] [&_th]:border-black [&_th]:border-r [&_th]:border-b [&_th:first-child]:border-l [&_th]:h-14 [&_td]:h-14">
          <thead className="top-0 z-[9] sticky">
            <tr>
              <th className="w-[5rem] text-center">No</th>
              <th className="w-[10rem] text-center">Trạng thái</th>
              <th className="w-[13rem] text-center">Cơ sở</th>
              {kind === 'room' ? (
                <>
                  <th className="w-[10rem] text-center">Phòng</th>
                  <th className="w-[13rem] text-center">Loại phòng</th>
                  <th className="w-[14rem] text-center">Trả phòng</th>
                  <th className="w-[13rem] text-center">Đặt tiếp</th>
                </>
              ) : (
                <th className="w-[32rem] text-center">Nội dung</th>
              )}
              <th className="w-[18rem] text-center">Phụ trách</th>
              <th className="w-[16rem] text-center">Bắt đầu / Kết thúc</th>
              <th className="w-[11rem] text-center">Thao tác</th>
              <th className="w-[10rem] text-center">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {details.length > 0 ? (
              details.map((detail, index) => {
                const nextAction = getNextStatus(detail.cleanStatus)
                return (
                  <tr
                    key={detail.cleaningDetailId}
                    className={cn('hover:bg-blue-50', rowTone(detail.cleanStatus))}
                  >
                    <td className="p-2 text-center">{index + 1}</td>
                    <td
                      className={cn('p-2 text-center font-bold', statusClass(detail.cleanStatus))}
                    >
                      {statusLabel[detail.cleanStatus] ?? `#${detail.cleanStatus}`}
                    </td>
                    <td className="p-2 text-center">
                      <div className="font-semibold">{detail.facilityNo ?? detail.facilityId}</div>
                      <div className="text-[1.2rem] leading-tight">{detail.facilityName ?? ''}</div>
                    </td>
                    {kind === 'room' ? (
                      <>
                        <td className="p-2 text-center font-semibold">
                          {detail.roomNumber ?? '-'}
                        </td>
                        <td className="p-2 text-center">{detail.roomTypeName ?? '-'}</td>
                        <td className="p-2 text-center">
                          {formatShortDate(detail.reservePeriodTo ?? detail.reserveCheckoutAt)}
                        </td>
                        <td className="p-2 text-center">
                          {formatShortDate(detail.newReserveDate)}
                        </td>
                      </>
                    ) : (
                      <td className="p-2 whitespace-pre-wrap">{detail.areaName ?? '-'}</td>
                    )}
                    <td className="p-2 text-center">{staffName(detail)}</td>
                    <td className="p-2">
                      <div className="flex justify-center items-center gap-2">
                        <input
                          type="time"
                          value={formatTime(detail.startDatetime)}
                          onChange={(event) =>
                            handleTimeChange(detail, 'startDatetime', event.currentTarget.value)
                          }
                          className="border border-black px-2 h-12 text-center text-[1.4rem]"
                        />
                        <span>~</span>
                        <input
                          type="time"
                          value={formatTime(detail.endDatetime)}
                          onChange={(event) =>
                            handleTimeChange(detail, 'endDatetime', event.currentTarget.value)
                          }
                          className="border border-black px-2 h-12 text-center text-[1.4rem]"
                        />
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      {nextAction ? (
                        <Button
                          type="button"
                          disabled={updateStatus.isPending}
                          onClick={() => handleStatus(detail)}
                          className="bg-gray hover:bg-primary border border-black rounded-[.4rem] h-12 font-bold text-[1.3rem] text-black hover:text-white"
                        >
                          {nextAction.label}
                        </Button>
                      ) : (
                        <span className="text-[1.3rem]">-</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <NoteDrawer
                        detailId={detail.cleaningDetailId}
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            className="relative border-black h-12"
                          >
                            <StickyNote size={18} />
                            {detail.noteCount > 0 ? (
                              <span className="-top-2 -right-2 absolute bg-primary px-2 rounded-full text-[1rem] text-white">
                                {detail.noteCount}
                              </span>
                            ) : null}
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={kind === 'room' ? 11 : 8}
                  className="p-6 text-center text-muted-foreground"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
