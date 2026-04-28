import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import ParkingReserveCreateModal from './ParkingReserveCreateModal'

interface ParkingAvailableSlotProps {
  dateFrom?: string | null
  dateTo?: string | null
  isConfirmed?: boolean
  showBookingLink?: boolean
  /** Required when showBookingLink=true: facility ID */
  facilityId?: number
  /** Required when showBookingLink=true: parking slot ID for car */
  parkingId?: number
  /** Required when showBookingLink=true: bicycle parking slot ID */
  bicycleParkingId?: number
  /** Whether this is a bicycle parking slot */
  isBicycle?: boolean
  /** Facility name for the create modal */
  facilityName?: string
  /** Slot number for the create modal */
  slotNumber?: string
}

/**
 * Renders a "gap" cell between two parking reservations,
 * showing the available date range and booking possibility.
 */
export default function ParkingAvailableSlot({
  dateFrom,
  dateTo,
  isConfirmed = true,
  showBookingLink = false,
  facilityId,
  parkingId,
  bicycleParkingId,
  isBicycle = false,
  facilityName = '',
  slotNumber = '',
}: ParkingAvailableSlotProps) {
  const bookingTrigger = (
    <span className="font-bold text-red-500 cursor-pointer hover:underline">Đặt chỗ: 〇</span>
  )

  return (
    <div
      className={cn(
        'flex flex-col justify-center p-4 border-black min-w-[23rem] !text-[1.2rem] [&_*]:!text-[1.2rem]',
        'box-border'
      )}
    >
      {/* Date range display */}
      <div className="flex flex-row justify-between items-center mb-4">
        {isConfirmed ? (
          <>
            {dateFrom && <span>{dayjs(dateFrom).format('MM/DD')}→</span>}
            {dateTo && <span>←{dayjs(dateTo).format('MM/DD')}</span>}
            {!dateFrom && !dateTo && <span>Chưa xác định</span>}
          </>
        ) : (
          <span>Chưa xác định</span>
        )}
      </div>

      {/* Booking status */}
      <div className="flex flex-row justify-between">
        {showBookingLink ? (
          <ParkingReserveCreateModal
            parkingId={parkingId}
            bicycleParkingId={bicycleParkingId}
            isBicycle={isBicycle}
            facilityId={facilityId ?? -1}
            facilityName={facilityName}
            slotNumber={slotNumber}
            defaultDateFrom={dateFrom ?? undefined}
            defaultDateTo={dateTo ?? undefined}
            trigger={bookingTrigger}
          />
        ) : (
          <div className="font-bold text-green-500 pointer-events-none">Đặt chỗ: ×</div>
        )}
        {isConfirmed && dateFrom && dateTo && (
          <span>
            {dayjs(dateFrom).format('MM/DD')}～{dayjs(dateTo).format('MM/DD')}
          </span>
        )}
      </div>
    </div>
  )
}
