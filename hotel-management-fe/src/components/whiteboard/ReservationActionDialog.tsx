import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { NButton } from '@/components/ui/new-button'
import type { WhiteboardReserveItem } from '@/types/whiteboard'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ReservationActionDialogProps {
  reserve: WhiteboardReserveItem
  canCheckIn: boolean
  canCheckOut: boolean
}

function formatDashboardDate(value: string | null) {
  return value && dayjs(value).isValid() ? dayjs(value).format('YYYY/MM/DD') : undefined
}

function getCheckoutDashboardDate(reserve: WhiteboardReserveItem) {
  const checkoutDate = reserve.earlyExitDatetime ?? reserve.periodTo
  return checkoutDate && dayjs(checkoutDate).isValid()
    ? dayjs(checkoutDate).format('YYYY/MM/DD')
    : undefined
}

export function ReservationActionDialog({
  reserve,
  canCheckIn,
  canCheckOut,
}: ReservationActionDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const checkInDate = formatDashboardDate(reserve.periodFrom)
  const checkOutDashboardDate = getCheckoutDashboardDate(reserve)
  const checkAction =
    canCheckIn && checkInDate
      ? {
          label: t('whiteboard.reservationActions.checkIn', {
            defaultValue: 'Check-in',
          }),
          search: {
            tab: 'daily-reserve',
            date1: checkInDate,
            date2: checkInDate,
            reserveId: reserve.reserveId,
          },
        }
      : canCheckOut && checkOutDashboardDate
        ? {
            label: t('whiteboard.reservationActions.checkOut', {
              defaultValue: 'Check-out',
            }),
            search: {
              tab: 'exit-management',
              date1: checkOutDashboardDate,
              date2: checkOutDashboardDate,
              reserveId: reserve.reserveId,
            },
          }
        : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t('whiteboard.reservationActions.open', {
            defaultValue: 'Mở thao tác đặt phòng',
          })}
          className="flex justify-center items-center rounded w-7 h-7 text-[#444] hover:bg-black/10"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[42rem] gap-0 p-0 overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b px-8 py-6">
          <DialogTitle className="font-bold text-center text-[2rem]">
            {t('whiteboard.reservationActions.title', {
              defaultValue: 'Thao tác đặt phòng',
            })}
          </DialogTitle>
        </div>

        <div className="grid grid-cols-2 gap-3 p-8">
          <NButton
            asChild
            className="justify-center min-h-[5.6rem] px-4 text-center text-[1.4rem] leading-snug"
          >
            <Link
              to="/reservations/$reserveId/edit"
              params={{ reserveId: String(reserve.reserveId) }}
              onClick={() => setOpen(false)}
            >
              {t('whiteboard.reservationActions.editReservation', {
                defaultValue: 'Chỉnh sửa đặt chỗ',
              })}
            </Link>
          </NButton>

          {checkAction ? (
            <NButton
              asChild
              className="justify-center min-h-[5.6rem] px-4 text-center text-[1.4rem] leading-snug"
            >
              <Link to="/dashboard" search={checkAction.search} onClick={() => setOpen(false)}>
                {checkAction.label}
              </Link>
            </NButton>
          ) : (
            <NButton
              type="button"
              disabled
              className="justify-center min-h-[5.6rem] px-4 text-center text-[1.4rem] leading-snug"
            >
              {t('whiteboard.reservationActions.checkInOut', {
                defaultValue: 'Check-in / Check-out',
              })}
            </NButton>
          )}

          <NButton
            asChild
            variant="outline"
            className="justify-center min-h-[5.6rem] px-4 text-center text-[1.4rem] leading-snug"
          >
            <Link
              to="/reservations/$reserveId/edit"
              params={{ reserveId: String(reserve.reserveId) }}
              hash="parking-car"
              onClick={() => setOpen(false)}
            >
              {t('whiteboard.reservationActions.registerParking', {
                defaultValue: 'Đăng ký bãi đỗ xe ô tô',
              })}
            </Link>
          </NButton>

          <NButton
            asChild
            variant="outline"
            className="justify-center min-h-[5.6rem] px-4 text-center text-[1.4rem] leading-snug"
          >
            <Link
              to="/reservations/$reserveId/edit"
              params={{ reserveId: String(reserve.reserveId) }}
              hash="parking-bicycle"
              onClick={() => setOpen(false)}
            >
              {t('whiteboard.reservationActions.registerMotorbikeBicycleParking', {
                defaultValue: 'Đăng ký bãi đỗ xe mô tô / xe đạp',
              })}
            </Link>
          </NButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
