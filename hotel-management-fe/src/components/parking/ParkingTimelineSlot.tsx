import { cn } from '@/lib/utils'
import type { UnifiedReserveItem } from '@/types/parking-status'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import ParkingReserveEditModal from './ParkingReserveEditModal'

interface ParkingTimelineSlotProps {
  reserve: UnifiedReserveItem
  isBicycle: boolean
}

function getReserveBgClass(reserve: UnifiedReserveItem): string {
  if (reserve.clientDataType === 2 || reserve.clientDataType === 3) return 'bg-[#F86F6F]'
  if (!reserve.confirmFlag || reserve.periodTo === null) return 'bg-[#8BD08E]'
  if (reserve.reserveId === null) return 'bg-[#ff990075]'
  return 'bg-[#FCFF61]'
}

export default function ParkingTimelineSlot({ reserve, isBicycle }: ParkingTimelineSlotProps) {
  const navigate = useNavigate()
  const bgClass = getReserveBgClass(reserve)
  const canNavigateReservation = reserve.reserveId !== null

  const goToReservationEdit = () => {
    if (!canNavigateReservation) return

    navigate({
      to: '/reservations/$reserveId/edit',
      params: { reserveId: String(reserve.reserveId) },
    })
  }

  const displayName =
    reserve.reserveId === null && reserve.clientId === null
      ? reserve.note
      : `【${reserve.facilityNo ?? ''}−${reserve.roomNumber ?? ''}】${reserve.clientName ?? ''}`

  const vehicleDisplay = isBicycle
    ? (reserve.vehicleInfo ?? '')
    : [reserve.vehicleInfo, reserve.licensePlate].filter(Boolean).join(' | ')

  const editTrigger = (
    <button
      type="button"
      className={cn(
        'bg-gray border border-black rounded-[.4rem] !min-h-[2.5rem]',
        'text-[1.2rem] font-bold text-black',
        'shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]',
        'hover:text-white hover:bg-primary hover:border-primary',
        'px-4'
      )}
    >
      Sửa
    </button>
  )

  return (
    <div
      className={cn(
        'flex border-black border-l-[1px] border-r-[1px] first:border-none h-full !text-[1.2rem] [&_*]:!text-[1.2rem]',
        '[&>*]:flex [&>*]:flex-col [&>*]:gap-[.5rem]',
        'flex-shrink-0 box-border'
      )}
    >
      {/* Main info area */}
      <div
        className={cn(
          'box-border p-[1rem] w-[23rem]',
          '[&>*]:h-[50%] [&>*]:flex [&>*]:justify-center [&>*]:items-center',
          'flex-shrink-0 [&>*]:min-w-[100%]',
          bgClass
        )}
      >
        {/* Client name + vehicle info */}
        <div className="flex-shrink-0 w-fit text-nowrap">
          <button
            type="button"
            onClick={goToReservationEdit}
            disabled={!canNavigateReservation}
            className={cn(
              'flex flex-col justify-center items-center w-full',
              canNavigateReservation
                ? 'cursor-pointer hover:underline underline-offset-2'
                : 'cursor-not-allowed opacity-70'
            )}
          >
            <span
              className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[21rem] mb-2"
              title={displayName ?? ''}
            >
              {displayName}
            </span>
            {vehicleDisplay && (
              <span
                className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[21rem]"
                title={vehicleDisplay}
              >
                {vehicleDisplay}
              </span>
            )}
          </button>
        </div>

        {/* Period */}
        <div>
          {dayjs(reserve.periodFrom).format('YYYY/MM/DD')}～
          <span className={cn(reserve.confirmFlag ? 'text-red-600' : '')}>
            {reserve.periodTo ? dayjs(reserve.periodTo).format('YYYY/MM/DD') : ''}
          </span>
        </div>
      </div>

      {/* Action area */}
      <div
        className={cn(
          'items-center justify-center p-[.5rem] border-black border-x w-[7rem] flex flex-col',
          bgClass
        )}
      >
        <ParkingReserveEditModal reserve={reserve} isBicycle={isBicycle} trigger={editTrigger} />
      </div>
    </div>
  )
}
