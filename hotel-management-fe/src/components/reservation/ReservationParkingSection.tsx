import { useFormContext, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ReservationParkingSelectModal from './ReservationParkingSelectModal'

interface ReservationParkingSectionProps {
  facilityId?: string | number
  periodFrom?: string
  periodTo?: string
}

export default function ReservationParkingSection({
  facilityId,
  periodFrom,
  periodTo,
}: ReservationParkingSectionProps) {
  const { control, watch } = useFormContext()

  const parkingReserves = watch('reserve.parking_reserve') || []
  const bicycleParkingReserves = watch('reserve.bicycle_parking_reserve') || []

  const { remove: removeParkingReserve } = useFieldArray({
    control,
    name: 'reserve.parking_reserve',
  })

  const { remove: removeBicycleParkingReserve } = useFieldArray({
    control,
    name: 'reserve.bicycle_parking_reserve',
  })

  const facilityIdNum = facilityId ? Number(facilityId) : undefined

  const triggerButton = (
    <Button
      type="button"
      className={cn(
        'bg-gray border border-black rounded-[.4rem] !min-h-[2.5rem]',
        'text-[1.4rem] font-bold text-black',
        'shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]',
        'hover:text-white hover:bg-primary hover:border-primary',
      )}
    >
      Thiết lập
    </Button>
  )

  return (
    <div className="space-y-6 border-t pt-6 mt-6">
      <h3 className="font-bold text-[1.8rem]">Bãi xe, Bãi xe đạp</h3>

      {/* ── Car Parking ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-[1.5rem]">
          <span className="font-bold text-[1.6rem] min-w-[12rem]">Bãi xe ô tô</span>
          <ReservationParkingSelectModal
            isBicycle={false}
            facilityId={facilityIdNum}
            periodFrom={periodFrom}
            periodTo={periodTo}
            trigger={triggerButton}
          />
        </div>

        {parkingReserves.length > 0 ? (
          <div className="space-y-2 ml-[12rem]">
            {parkingReserves.map((parking: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-black p-[.8rem] bg-gray-50"
              >
                <div className="text-[1.4rem]">
                  <span className="font-bold">{parking.facility_name || parking.facility_no}</span>
                  {parking.facility_no && parking.facility_name && (
                    <span className="ml-2 text-gray-600">No.{parking.facility_no}</span>
                  )}
                  {parking.period_from && (
                    <span className="ml-3 text-gray-600">
                      {parking.period_from} ～ {parking.period_to || '---'}
                    </span>
                  )}
                  {parking.license_plate && (
                    <span className="ml-3">Biển số: {parking.license_plate}</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 text-[1.3rem]"
                  onClick={() => removeParkingReserve(idx)}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="ml-[12rem] text-[1.4rem] text-gray-500">Chưa chọn</p>
        )}
      </div>

      {/* ── Bicycle Parking ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-[1.5rem]">
          <span className="font-bold text-[1.6rem] min-w-[12rem]">Bãi xe đạp</span>
          <ReservationParkingSelectModal
            isBicycle
            facilityId={facilityIdNum}
            periodFrom={periodFrom}
            periodTo={periodTo}
            trigger={triggerButton}
          />
        </div>

        {bicycleParkingReserves.length > 0 ? (
          <div className="space-y-2 ml-[12rem]">
            {bicycleParkingReserves.map((bicycle: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-black p-[.8rem] bg-gray-50"
              >
                <div className="text-[1.4rem]">
                  <span className="font-bold">{bicycle.facility_name || bicycle.facility_no}</span>
                  {bicycle.facility_no && bicycle.facility_name && (
                    <span className="ml-2 text-gray-600">No.{bicycle.facility_no}</span>
                  )}
                  {bicycle.period_from && (
                    <span className="ml-3 text-gray-600">
                      {bicycle.period_from} ～ {bicycle.period_to || '---'}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 text-[1.3rem]"
                  onClick={() => removeBicycleParkingReserve(idx)}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="ml-[12rem] text-[1.4rem] text-gray-500">Chưa chọn</p>
        )}
      </div>
    </div>
  )
}
