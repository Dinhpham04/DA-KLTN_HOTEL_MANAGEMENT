import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import ReservationParkingSelectModal from './ReservationParkingSelectModal'

interface ReservationParkingSectionProps {
  facilityId?: string | number
  periodFrom?: string
  periodTo?: string
  reserveId?: string | number
}

function createTriggerButton() {
  return (
    <Button
      type="button"
      className={cn(
        'bg-white border border-black rounded-[.4rem] !min-h-[2.6rem] w-[7.4rem] px-4',
        'text-[1.4rem] font-bold text-black',
        'shadow-[0_2px_3px_0_rgba(0,0,0,0.2)]',
        'hover:text-white hover:bg-primary hover:border-primary'
      )}
    >
      Thiết lập
    </Button>
  )
}

function ParkingCell({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[23.4rem_1fr] min-w-0 border-black border-r last:border-r-0">
      <div className="flex items-center justify-end bg-[#EEEEEE] px-[2.6rem] border-black border-r h-[6rem] font-bold text-[1.8rem]">
        {label}
      </div>
      <div className="flex items-center px-[2.6rem] h-[6rem]">{children}</div>
    </div>
  )
}

export default function ReservationParkingSection({
  facilityId,
  periodFrom,
  periodTo,
  reserveId,
}: ReservationParkingSectionProps) {
  const facilityIdNum = facilityId ? Number(facilityId) : undefined
  const reserveIdNum = reserveId ? Number(reserveId) : undefined

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 border border-black bg-white w-full">
        <ParkingCell label="Bãi xe ô tô">
          <ReservationParkingSelectModal
            isBicycle={false}
            facilityId={facilityIdNum}
            periodFrom={periodFrom}
            periodTo={periodTo}
            reserveId={reserveIdNum}
            trigger={createTriggerButton()}
          />
        </ParkingCell>

        <ParkingCell label="Bãi xe đạp">
          <ReservationParkingSelectModal
            isBicycle
            facilityId={facilityIdNum}
            periodFrom={periodFrom}
            periodTo={periodTo}
            reserveId={reserveIdNum}
            trigger={createTriggerButton()}
          />
        </ParkingCell>
      </div>
    </div>
  )
}
