import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import ParkingOverflow from '@/components/parking/ParkingOverflow'
import { NButton } from '@/components/ui/new-button'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import { useParkingStatus } from '@/hooks/queries/useParkingStatus'
import { cn } from '@/lib/utils'
import type {
  BicycleParkingReserveItem,
  BicycleParkingSlot,
  ParkingReserveItem,
  ParkingSlot,
} from '@/types/parking-status'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type Control,
  Controller,
  type FieldPath,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { z } from 'zod'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

// ─── Schemas ─────────────────────────────────────────────────────────────────

const parkingItemSchema = z.object({
  parking_reserve_id: z.number().optional(),
  slotIndex: z.number().optional(),
  parking_id: z.number().optional(),
  facility_name: z.string().optional(),
  facility_no: z.string().optional(),
  period_from: z.string().nullable(),
  period_to: z.string().nullable(),
  stay_type_id: z.number().nullable().optional(),
  confirm_flag: z.boolean().optional(),
  note: z.string().optional(),
  license_plate: z.string().trim().min(1, 'Vui lòng nhập biển số').default(''),
  car_type: z.string().trim().min(1, 'Vui lòng nhập loại xe').default(''),
})

const bicycleItemSchema = z.object({
  bicycle_parking_reserve_id: z.number().optional(),
  slotIndex: z.number().optional(),
  bicycle_parking_id: z.number().optional(),
  facility_name: z.string().optional(),
  facility_no: z.string().optional(),
  period_from: z.string().nullable(),
  period_to: z.string().nullable(),
  confirm_flag: z.boolean().optional(),
  bicycle_type_note: z.string().optional(),
  note: z.string().optional(),
})

const parkingFormSchema = z.object({ parking_reserve: z.array(parkingItemSchema) })
const bicycleFormSchema = z.object({ bicycle_parking_reserve: z.array(bicycleItemSchema) })

type ParkingFormType = z.infer<typeof parkingFormSchema>
type BicycleFormType = z.infer<typeof bicycleFormSchema>
type ParkingReserveRow = ParkingFormType['parking_reserve'][number]
type BicycleParkingReserveRow = BicycleFormType['bicycle_parking_reserve'][number]

// ─── Free slot computation ────────────────────────────────────────────────────

interface FreeSlot {
  from: string
  to: string | null
}

function computeFreeSlots(
  reserves: Array<ParkingReserveItem | BicycleParkingReserveItem>
): FreeSlot[] {
  const today = dayjs().startOf('day')

  const active = [...reserves]
    .filter((r) => r.dataStatus === 1)
    .filter((r) => !r.periodTo || dayjs(r.periodTo).isSameOrAfter(today))
    .sort((a, b) => dayjs(a.periodFrom).diff(dayjs(b.periodFrom)))

  if (!active.length) return [{ from: today.format('YYYY/MM/DD'), to: null }]

  const result: FreeSlot[] = []

  // Gap before first reservation
  const firstFrom = dayjs(active[0].periodFrom)
  if (firstFrom.isAfter(today)) {
    result.push({
      from: today.format('YYYY/MM/DD'),
      to: firstFrom.subtract(1, 'day').format('YYYY/MM/DD'),
    })
  }

  // Gaps between reservations
  for (let i = 0; i < active.length - 1; i++) {
    const currentTo = active[i].periodTo
    if (!currentTo) continue
    const gapStart = dayjs(currentTo).add(1, 'day')
    const nextFrom = dayjs(active[i + 1].periodFrom)
    if (gapStart.isBefore(nextFrom)) {
      result.push({
        from: gapStart.format('YYYY/MM/DD'),
        to: nextFrom.subtract(1, 'day').format('YYYY/MM/DD'),
      })
    }
  }

  // After last reservation
  const last = active[active.length - 1]
  if (last.periodTo) {
    result.push({
      from: dayjs(last.periodTo).add(1, 'day').format('YYYY/MM/DD'),
      to: null,
    })
  }

  return result.filter((slot) => {
    if (slot.to && dayjs(slot.to).isBefore(today)) return false
    if (dayjs(slot.from).isBefore(today)) slot.from = today.format('YYYY/MM/DD')
    return true
  })
}

function calcStayTypeId(from: string, to?: string | null): number {
  if (!to) return 7
  const diffDay = dayjs(to).diff(dayjs(from), 'day')
  const diffMonth = dayjs(to).diff(dayjs(from), 'month')
  if (diffMonth >= 7) return 7
  if (diffMonth >= 3) return 6
  if (diffMonth >= 1) return 5
  if (diffDay >= 7) return 2
  if (diffDay >= 1) return 1
  return 7
}

function formatModalDate(value?: string | null): string | null {
  if (!value) return null
  const date = dayjs(value)
  return date.isValid() ? date.format('YYYY/MM/DD') : null
}

function rangesOverlap(
  firstFrom: string,
  firstTo: string | null,
  secondFrom?: string | null,
  secondTo?: string | null
) {
  if (!secondFrom) return false

  const startA = dayjs(firstFrom).startOf('day')
  const endA = firstTo ? dayjs(firstTo).startOf('day') : null
  const startB = dayjs(secondFrom).startOf('day')
  const endB = secondTo ? dayjs(secondTo).startOf('day') : null

  return (!endB || !startA.isAfter(endB)) && (!endA || !startB.isAfter(endA))
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReservationParkingSelectModalProps {
  isBicycle: boolean
  facilityId?: number
  periodFrom?: string
  periodTo?: string
  reserveId?: number
  openOnReady?: boolean
  trigger: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReservationParkingSelectModal({
  isBicycle,
  facilityId,
  periodFrom: propPeriodFrom,
  periodTo: propPeriodTo,
  reserveId,
  openOnReady = false,
  trigger,
}: ReservationParkingSelectModalProps) {
  const methods = useFormContext()
  const [open, setOpen] = useState(false)
  const hasAutoOpenedRef = useRef(false)
  const selectedFacilityId = facilityId
  const selectedRoomId = methods.watch('reserve.room_id')
  const reservationConfirmFlag = methods.watch('reserve.confirm_flag') === '1'

  // ── Local form for selected slots inside modal
  const parkingForm = useForm<ParkingFormType>({
    resolver: zodResolver(parkingFormSchema),
    defaultValues: { parking_reserve: [] },
  })
  const bicycleForm = useForm<BicycleFormType>({
    resolver: zodResolver(bicycleFormSchema),
    defaultValues: { bicycle_parking_reserve: [] },
  })

  const {
    fields: parkingFields,
    append: appendParking,
    remove: removeParking,
    replace: replaceParking,
  } = useFieldArray({
    control: parkingForm.control,
    name: 'parking_reserve',
  })
  const {
    fields: bicycleFields,
    append: appendBicycle,
    remove: removeBicycle,
    replace: replaceBicycle,
  } = useFieldArray({
    control: bicycleForm.control,
    name: 'bicycle_parking_reserve',
  })

  // ── Room/facility display
  const { data: facilitiesResponse } = useGetFacilities()
  const { data: roomsResponse } = useGetRooms({
    params: selectedFacilityId ? { facilityId: selectedFacilityId, dataStatus: 1 } : undefined,
    enabled: !!selectedFacilityId,
  })

  const selectedFacility = useMemo(
    () => facilitiesResponse?.data?.find((facility) => facility.facilityId === selectedFacilityId),
    [facilitiesResponse, selectedFacilityId]
  )

  const selectedRoom = useMemo(
    () => roomsResponse?.data?.find((room) => String(room.roomId) === String(selectedRoomId)),
    [roomsResponse, selectedRoomId]
  )

  const roomDisplay = useMemo(() => {
    const facilityNo = selectedRoom?.facilityNo ?? selectedFacility?.facilityNo ?? ''
    const roomNumber = selectedRoom?.roomNumber ?? ''
    if (!facilityNo && !roomNumber) return 'Chưa chọn phòng'

    const roomCode = [facilityNo, roomNumber].filter(Boolean).join('-')
    return roomCode
  }, [selectedFacility, selectedRoom])

  // ── Parking status
  const { data: parkingStatusList = [], refetch: refetchStatus } = useParkingStatus({
    params: selectedFacilityId
      ? { facilityId: selectedFacilityId, type: isBicycle ? 3 : 2 }
      : undefined,
    enabled: false,
  })

  useEffect(() => {
    if (selectedFacilityId) refetchStatus()
  }, [selectedFacilityId, refetchStatus])

  // Extract car/bicycle slots for the selected facility
  const currentFacilityStatus = useMemo(
    () => parkingStatusList.find((f) => f.facilityId === selectedFacilityId),
    [parkingStatusList, selectedFacilityId]
  )

  const carSlots: ParkingSlot[] = useMemo(
    () => currentFacilityStatus?.parkings ?? [],
    [currentFacilityStatus]
  )

  const bicycleSlots: BicycleParkingSlot[] = useMemo(
    () => currentFacilityStatus?.bicycleParkings ?? [],
    [currentFacilityStatus]
  )

  // ── Period from parent form (prop or watch)
  const roomPeriodFrom = propPeriodFrom ?? methods.watch('reserve.period_from') ?? ''
  const roomPeriodTo = propPeriodTo ?? methods.watch('reserve.period_to') ?? ''

  // ── Open modal: restore from parent form values
  const handleOpen = useCallback(async () => {
    const statusResult = selectedFacilityId ? await refetchStatus() : undefined
    const statusList = statusResult?.data ?? parkingStatusList

    if (isBicycle) {
      const existing = methods.getValues('reserve.bicycle_parking_reserve') ?? []
      const savedRows: BicycleParkingReserveRow[] = reserveId
        ? (statusList
            .find((facility) => facility.facilityId === selectedFacilityId)
            ?.bicycleParkings.flatMap((parking) =>
              parking.bicycleParkingReserves
                .filter((reserve) => reserve.reserveId === reserveId && reserve.dataStatus === 1)
                .map((reserve) => ({
                  bicycle_parking_reserve_id: reserve.bicycleParkingReserveId,
                  bicycle_parking_id: reserve.bicycleParkingId,
                  facility_name: parking.facilityName,
                  facility_no: parking.number,
                  period_from: formatModalDate(reserve.periodFrom),
                  period_to: formatModalDate(reserve.periodTo),
                  confirm_flag: reserve.confirmFlag,
                  bicycle_type_note: reserve.bicycleTypeNote ?? '',
                  note: reserve.note ?? '',
                }))
            ) ?? [])
        : []
      const nextRows = existing.length > 0 ? existing : savedRows
      replaceBicycle(nextRows)
      if (existing.length === 0 && savedRows.length > 0) {
        methods.setValue('reserve.bicycle_parking_reserve', savedRows, { shouldDirty: false })
      }
    } else {
      const existing = methods.getValues('reserve.parking_reserve') ?? []
      const savedRows: ParkingReserveRow[] = reserveId
        ? (statusList
            .find((facility) => facility.facilityId === selectedFacilityId)
            ?.parkings.flatMap((parking) =>
              parking.parkingReserves
                .filter((reserve) => reserve.reserveId === reserveId && reserve.dataStatus === 1)
                .map((reserve) => ({
                  parking_reserve_id: reserve.parkingReserveId,
                  parking_id: reserve.parkingId,
                  facility_name: parking.facilityName,
                  facility_no: parking.number,
                  period_from: formatModalDate(reserve.periodFrom),
                  period_to: formatModalDate(reserve.periodTo),
                  confirm_flag: reserve.confirmFlag,
                  car_type: reserve.carType ?? '',
                  license_plate: reserve.licensePlate ?? '',
                  note: reserve.note ?? '',
                }))
            ) ?? [])
        : []
      const nextRows = existing.length > 0 ? existing : savedRows
      replaceParking(nextRows)
      if (existing.length === 0 && savedRows.length > 0) {
        methods.setValue('reserve.parking_reserve', savedRows, { shouldDirty: false })
      }
    }
  }, [
    isBicycle,
    methods,
    parkingStatusList,
    refetchStatus,
    replaceBicycle,
    replaceParking,
    reserveId,
    selectedFacilityId,
  ])

  // ── Close modal: reset local form
  function handleClose() {
    replaceParking([])
    replaceBicycle([])
  }

  useEffect(() => {
    if (
      !openOnReady ||
      hasAutoOpenedRef.current ||
      !selectedFacilityId ||
      !selectedRoomId ||
      !roomPeriodFrom
    ) {
      return
    }

    hasAutoOpenedRef.current = true
    void handleOpen()
    setOpen(true)
  }, [handleOpen, openOnReady, roomPeriodFrom, selectedFacilityId, selectedRoomId])

  // ── Check if a slot is already selected or out of room period
  function isSlotDisabled(
    id: number,
    slotFrom: string,
    slotTo: string | null,
    slotIdx: number
  ): boolean {
    if (!roomPeriodFrom && !roomPeriodTo) return true
    const alreadySelected = isBicycle
      ? bicycleForm
          .getValues('bicycle_parking_reserve')
          .some(
            (selectedSlot) =>
              selectedSlot.bicycle_parking_id === id &&
              (selectedSlot.slotIndex === slotIdx ||
                rangesOverlap(slotFrom, slotTo, selectedSlot.period_from, selectedSlot.period_to))
          )
      : parkingForm
          .getValues('parking_reserve')
          .some(
            (selectedSlot) =>
              selectedSlot.parking_id === id &&
              (selectedSlot.slotIndex === slotIdx ||
                rangesOverlap(slotFrom, slotTo, selectedSlot.period_from, selectedSlot.period_to))
          )
    if (alreadySelected) return true

    // Check date overlap with room period
    const roomTo = roomPeriodTo ? dayjs(roomPeriodTo) : null
    const roomFrom = roomPeriodFrom ? dayjs(roomPeriodFrom) : null
    const slotFromDay = dayjs(slotFrom)
    const slotToDay = slotTo ? dayjs(slotTo) : null

    if (roomTo && !slotToDay) {
      // Open-ended slot: disabled if room_to < slot_from
      return roomTo.isBefore(slotFromDay)
    }

    if (roomTo && slotToDay) {
      // Finite slot: disabled if slot doesn't overlap room period
      const noOverlap = slotToDay.isBefore(roomFrom ?? slotFromDay) || slotFromDay.isAfter(roomTo)
      return noOverlap
    }

    return false
  }

  function getBookableFreeSlots(freeSlots: FreeSlot[]): FreeSlot[] {
    if (!roomPeriodFrom || !roomPeriodTo) return []

    const roomFrom = dayjs(roomPeriodFrom).startOf('day')
    const roomTo = dayjs(roomPeriodTo).startOf('day')

    return freeSlots
      .map((freeSlot): FreeSlot | null => {
        const freeFrom = dayjs(freeSlot.from).startOf('day')
        const freeTo = freeSlot.to ? dayjs(freeSlot.to).startOf('day') : null
        const from = freeFrom.isAfter(roomFrom) ? freeFrom : roomFrom
        const to = freeTo?.isBefore(roomTo) ? freeTo : roomTo

        if (to.isBefore(from)) return null

        return {
          from: from.format('YYYY/MM/DD'),
          to: to.format('YYYY/MM/DD'),
        }
      })
      .filter((slot): slot is FreeSlot => slot !== null)
  }

  // ── Append selected slot to local form
  function handleAppend(
    slotIdx: number,
    slotId: number,
    slotNumber: string,
    slotFrom: string,
    slotTo: string | null
  ) {
    const facilityLabel = selectedFacility?.facilityName ?? ''

    let periodFrom: string | null = null
    let periodTo: string | null = null

    if (slotTo) {
      periodFrom =
        roomPeriodFrom && dayjs(roomPeriodFrom).isBefore(dayjs(slotFrom))
          ? slotFrom
          : roomPeriodFrom
            ? dayjs(roomPeriodFrom).format('YYYY/MM/DD')
            : slotFrom
      periodTo =
        roomPeriodTo && dayjs(roomPeriodTo).isSameOrBefore(dayjs(slotTo))
          ? dayjs(roomPeriodTo).format('YYYY/MM/DD')
          : slotTo
    } else {
      periodFrom =
        roomPeriodFrom && dayjs(roomPeriodFrom).isSameOrAfter(dayjs(slotFrom))
          ? dayjs(roomPeriodFrom).format('YYYY/MM/DD')
          : slotFrom
      periodTo = roomPeriodTo ? dayjs(roomPeriodTo).format('YYYY/MM/DD') : null
    }

    if (isBicycle) {
      appendBicycle({
        slotIndex: slotIdx,
        bicycle_parking_id: slotId,
        facility_name: facilityLabel,
        facility_no: slotNumber,
        period_from: periodFrom,
        period_to: periodTo,
        confirm_flag: reservationConfirmFlag,
        bicycle_type_note: '',
        note: '',
      })
    } else {
      const stayTypeId = calcStayTypeId(periodFrom ?? '', periodTo)
      appendParking({
        slotIndex: slotIdx,
        parking_id: slotId,
        facility_name: facilityLabel,
        facility_no: slotNumber,
        period_from: periodFrom,
        period_to: periodTo,
        stay_type_id: stayTypeId,
        confirm_flag: reservationConfirmFlag,
        car_type: '',
        license_plate: '',
        note: '',
      })
    }
  }

  // ── Save and close
  async function handleSave() {
    if (isBicycle) {
      methods.setValue(
        'reserve.bicycle_parking_reserve',
        bicycleForm.getValues('bicycle_parking_reserve')
      )
    } else {
      const isValid = await parkingForm.trigger('parking_reserve')
      if (!isValid) return
      methods.setValue('reserve.parking_reserve', parkingForm.getValues('parking_reserve'))
    }
    const closeBtn = document.querySelector('.close-btn') as HTMLButtonElement
    closeBtn?.click()
  }

  // ── Clear all
  function handleClearAll() {
    if (isBicycle) bicycleForm.setValue('bicycle_parking_reserve', [])
    else parkingForm.setValue('parking_reserve', [])
  }

  // ─── Render slot availability table ────────────────────────────────────────

  const slotsToRender = isBicycle ? bicycleSlots : carSlots
  const selectedFields = isBicycle ? bicycleFields : parkingFields
  const selectedForm = isBicycle ? bicycleForm : parkingForm
  const selectedFieldName = isBicycle ? 'bicycle_parking_reserve' : 'parking_reserve'
  const selectedControl = selectedForm.control as unknown as Control<
    ParkingFormType | BicycleFormType
  >
  const availableTableColSpan = isBicycle ? 3 : 4
  const selectedTableColSpan = isBicycle ? 6 : 7

  return (
    <CustomDialog
      size="medium"
      opened={open}
      changeOnOpened={(open) => {
        setOpen(open)
        if (open) {
          void handleOpen()
          return
        }
        handleClose()
      }}
      trigger={trigger}
      title={isBicycle ? 'Thiết lập bãi xe đạp' : 'Thiết lập bãi đỗ xe'}
      content={
        <div className="flex flex-col gap-[1rem] [&_thead_td]:bg-gray-50 [&_*]:text-[1.6rem]">
          {/* ── Room display ── */}
          <div className="grid grid-cols-2">
            <div className="flex items-center w-[20rem] h-[4rem]">
              <div className="mr-[1rem] font-bold">Phòng:</div>
              <div className="font-bold">{roomDisplay}</div>
            </div>

            {/* ── Room period display ── */}
            <div className="flex w-[45rem]">
              <div className="mr-[1rem] font-bold">Thời gian đặt phòng:</div>
              {(roomPeriodFrom || roomPeriodTo) && (
                <>
                  <div>{roomPeriodFrom ? dayjs(roomPeriodFrom).format('YYYY/MM/DD') : null}</div>
                  <div className="mx-[.5rem]">～</div>
                  <div>{roomPeriodTo ? dayjs(roomPeriodTo).format('YYYY/MM/DD') : null}</div>
                </>
              )}
            </div>
          </div>

          {/* ── Available slots table ── */}
          <div className="flex flex-col">
            <div className="font-bold text-[1.6rem] mb-4">Tình trạng trống</div>
            <div className="relative w-[100%] max-h-[26rem] overflow-auto">
              <table
                className={cn(
                  'relative w-[100%] [&_td]:h-[5.2rem]',
                  'border-separate border-spacing-0',
                  '[&_td]:border [&_td]:border-black',
                  '[&_td]:border-l-0 [&_td:first-child]:!border-l-[.1rem]',
                  // '[&_tbody_tr_td]:border-t-transparent',
                  '[&_tbody_tr:nth-last-child(2)_td]:border-b-transparent'
                )}
              >
                <thead>
                  <tr
                    className={cn(
                      '[&_td]:font-bold [&>*]:text-center',
                      'sticky top-0 bg-white [&>td]:!border-y-[.1rem] z-[2]'
                    )}
                  >
                    <td className="w-[5.2rem]">No</td>
                    {!isBicycle && <td className="w-[10rem]">Giới hạn chiều cao</td>}
                    <td className="w-[15rem]">Ghi chú</td>
                    <td className="w-[62.4rem]">Khoảng trống</td>
                  </tr>
                </thead>
                <tbody className="z-[3] [&>tr:first-child_td]:!border-t-0 [&>tr:last-child_td]:!border-b-0">
                  {slotsToRender.map((slot) => {
                    const slotId = isBicycle
                      ? (slot as BicycleParkingSlot).bicycleParkingId
                      : (slot as ParkingSlot).parkingId
                    const reserves = isBicycle
                      ? (slot as BicycleParkingSlot).bicycleParkingReserves
                      : (slot as ParkingSlot).parkingReserves
                    const freeSlots = getBookableFreeSlots(computeFreeSlots(reserves))

                    return (
                      <tr
                        key={`${isBicycle ? 'bicycle' : 'parking'}-${slotId}`}
                        className={cn('[&>td]:relative [&>td]:text-center', {
                          '!bg-gray-400': !slot.dataStatus,
                        })}
                      >
                        <td>{slot.number}</td>
                        {!isBicycle && (
                          <td>
                            {(slot as ParkingSlot).heightLimit
                              ? `${(slot as ParkingSlot).heightLimit}m`
                              : ''}
                          </td>
                        )}
                        <td className="box-border !text-start">
                          <div
                            className="top-0 right-0 bottom-0 left-0 absolute p-[1rem] overflow-auto"
                            style={{ scrollbarWidth: 'thin' }}
                          >
                            {slot.notice}
                          </div>
                        </td>
                        <td>
                          <div
                            className="top-0 right-0 bottom-0 left-0 absolute p-[1rem] overflow-auto"
                            style={{ scrollbarWidth: 'thin' }}
                          >
                            {slot.dataStatus ? (
                              <ParkingOverflow customEndBorder="!border-l-black border-l-[.1rem]">
                                {freeSlots.length === 0 && (
                                  <div className="flex justify-center items-center w-full min-h-[3.2rem]">
                                    Không có khoảng trống
                                  </div>
                                )}
                                {freeSlots.map((freeSlot, freeIdx) => {
                                  const disabled = isSlotDisabled(
                                    slotId,
                                    freeSlot.from,
                                    freeSlot.to,
                                    freeIdx
                                  )
                                  return (
                                    <div
                                      key={`${slotId}-${freeSlot.from}-${freeSlot.to ?? 'open'}`}
                                      className="flex last:!border-r-0 border-l-[.1rem] border-l-black first:border-l-transparent"
                                    >
                                      <div
                                        className={cn(
                                          'flex justify-center items-center w-[22rem]',
                                          { 'gap-[.5rem]': !freeSlot.to }
                                        )}
                                      >
                                        <div>{dayjs(freeSlot.from).format('YYYY/MM/DD')}</div>
                                        <div>～</div>
                                        {freeSlot.to && (
                                          <Fragment>
                                            <div>{dayjs(freeSlot.to).format('YYYY/MM/DD')}</div>
                                          </Fragment>
                                        )}
                                      </div>
                                      <div className="flex justify-center items-center p-[1rem] border-gray border-l-[.1rem] w-[7.8rem]">
                                        <NButton
                                          type="button"
                                          className={cn('bg-gray w-[100%]', {
                                            '!bg-gray-200 !border-none !text-gray-400 cursor-default':
                                              disabled,
                                          })}
                                          disabled={disabled}
                                          onClick={() =>
                                            handleAppend(
                                              freeIdx,
                                              slotId,
                                              slot.number,
                                              freeSlot.from,
                                              freeSlot.to
                                            )
                                          }
                                        >
                                          Chọn
                                        </NButton>
                                      </div>
                                    </div>
                                  )
                                })}
                              </ParkingOverflow>
                            ) : (
                              <div className="flex justify-center items-center w-[100%] h-[100%]">
                                Ngừng sử dụng
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {slotsToRender.length === 0 && (
                    <tr>
                      <td
                        className="font-bold text-red-500 text-center"
                        colSpan={availableTableColSpan}
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="bottom-0 sticky bg-black w-[100%] h-[.1rem]" />
            </div>
          </div>

          {/* ── Selected slots table ── */}
          <form>
            <div className="flex flex-col">
              <div className="font-bold">・Đang chọn</div>
              <table
                className={cn(
                  'relative w-[100%] [&_td]:h-[4.2rem]',
                  '!border-separate !border-spacing-0 [&_td]:!p-0',
                  '[&_td]:!border-[.001px] [&_td]:!border-black [&_td]:!box-border',
                  '[&_td>div]:p-[.5rem] [&_tr_td]:!border-l-0 [&_tr_td:first-child]:!border-l-[.001px]',
                  '[&_tbody_tr>td]:border-b-transparent [&_tbody_tr:first-child>td]:!border-t-0'
                )}
              >
                <thead>
                  <tr className="[&_td]:font-bold [&>*]:text-center bg-gray-100 z-[2]">
                    <td className="w-[6rem]">No</td>
                    {isBicycle ? (
                      <td className="w-[20rem]">Thông tin xe đạp</td>
                    ) : (
                      <>
                        <td className="w-[15rem]">Loại xe</td>
                        <td className="w-[15rem]">Biển số</td>
                      </>
                    )}
                    <td className="w-[34rem]">Thời gian sử dụng</td>
                    <td className="w-[12rem]">Ghi chú</td>
                    <td className="w-[14rem]">Trạng thái</td>
                    <td className="w-[8rem]">Thao tác</td>
                  </tr>
                </thead>
                <tbody className="z-[3]">
                  {selectedFields.length > 0 ? (
                    selectedFields.map((field, selectIdx) => (
                      <tr
                        key={field.id}
                        className="[&_td]:px-[.5rem] [&_input]:outline-gray [&_input]:text-center"
                      >
                        {/* Facility no */}
                        <td className="w-[6rem]">
                          <div className="text-center">{field.facility_no}</div>
                        </td>

                        {/* Bicycle type / Car type + License plate */}
                        {isBicycle ? (
                          <td className="w-[20rem]">
                            <div className="flex flex-col items-center gap-[.5rem] py-[.5rem] [&>*]:w-[100%]">
                              <Controller
                                control={bicycleForm.control}
                                name={`bicycle_parking_reserve.${selectIdx}.bicycle_type_note`}
                                render={({ field: { value, onChange } }) => (
                                  <input
                                    className="flex-shrink-0 flex-1 w-[100%] h-[2.4rem]"
                                    value={value ?? ''}
                                    onChange={onChange}
                                  />
                                )}
                              />
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="w-[15rem]">
                              <div className="flex flex-col items-center gap-[.5rem] py-[.5rem] [&>*]:w-[100%]">
                                <Controller
                                  control={parkingForm.control}
                                  name={`parking_reserve.${selectIdx}.car_type`}
                                  render={({ field: { value, onChange } }) => (
                                    <CustomInput
                                      className={cn(
                                        'flex-1 rounded-none border-black w-full h-[2.8rem] text-center',
                                        {
                                          'border-red-500':
                                            parkingForm.formState.errors.parking_reserve?.[
                                              selectIdx
                                            ]?.car_type,
                                        }
                                      )}
                                      placeholder="Nhập loại xe"
                                      value={value ?? ''}
                                      onChange={onChange}
                                    />
                                  )}
                                />
                                {parkingForm.formState.errors.parking_reserve?.[selectIdx]
                                  ?.car_type && (
                                  <p className="font-bold text-[1.2rem] text-red-500">
                                    {
                                      parkingForm.formState.errors.parking_reserve[selectIdx]
                                        ?.car_type?.message
                                    }
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="w-[15rem]">
                              <div className="flex flex-col items-center gap-[.5rem] py-[.5rem] [&>*]:w-[100%]">
                                <Controller
                                  control={parkingForm.control}
                                  name={`parking_reserve.${selectIdx}.license_plate`}
                                  render={({ field: { value, onChange } }) => (
                                    <CustomInput
                                      className={cn(
                                        'flex-1 rounded-none border-black w-full h-[2.8rem] text-center',
                                        {
                                          'border-red-500':
                                            parkingForm.formState.errors.parking_reserve?.[
                                              selectIdx
                                            ]?.license_plate,
                                        }
                                      )}
                                      placeholder="Nhập biển số"
                                      value={value ?? ''}
                                      onChange={onChange}
                                    />
                                  )}
                                />
                                {parkingForm.formState.errors.parking_reserve?.[selectIdx]
                                  ?.license_plate && (
                                  <p className="font-bold text-[1.2rem] text-red-500">
                                    {
                                      parkingForm.formState.errors.parking_reserve[selectIdx]
                                        ?.license_plate?.message
                                    }
                                  </p>
                                )}
                              </div>
                            </td>
                          </>
                        )}

                        {/* Period from/to */}
                        <td className="w-[34rem]">
                          <div className="flex [&>*]:flex [&>*]:justify-center [&>*]:items-center gap-[.5rem] !py-0 h-full">
                            <div className="flex-1">
                              <Controller
                                control={selectedControl}
                                name={
                                  `${selectedFieldName}.${selectIdx}.period_from` as FieldPath<
                                    ParkingFormType | BicycleFormType
                                  >
                                }
                                render={({ field: { value, onChange, onBlur } }) => (
                                  <CustomDatePicker
                                    onBlur={onBlur}
                                    format="yyyy/MM/dd"
                                    className="flex-1 [&>div]:px-4 w-[14rem] h-[3.5rem] font-bold text-2xl cursor-pointer"
                                    change={(e) => onChange(dayjs(e as Date).format('YYYY/MM/DD'))}
                                    value={typeof value === 'string' ? value : null}
                                  />
                                )}
                              />
                            </div>
                            <div className="flex justify-center items-center border-black border-x-[.1rem] w-[2.6rem] h-full">
                              ～
                            </div>
                            <div className="flex-1">
                              <Controller
                                control={selectedControl}
                                name={
                                  `${selectedFieldName}.${selectIdx}.period_to` as FieldPath<
                                    ParkingFormType | BicycleFormType
                                  >
                                }
                                render={({ field: { value, onChange, onBlur } }) => (
                                  <CustomDatePicker
                                    onBlur={onBlur}
                                    format="yyyy/MM/dd"
                                    className="flex-1 [&>div]:px-4 w-[14rem] h-[3.5rem] font-bold text-2xl cursor-pointer"
                                    change={(e) => onChange(dayjs(e as Date).format('YYYY/MM/DD'))}
                                    value={typeof value === 'string' ? value : null}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Note */}
                        <td className="w-[12rem]">
                          <div className="flex flex-col items-center gap-[.5rem] py-[.5rem] [&>*]:w-[100%]">
                            <Controller
                              control={selectedControl}
                              name={
                                `${selectedFieldName}.${selectIdx}.note` as FieldPath<
                                  ParkingFormType | BicycleFormType
                                >
                              }
                              render={({ field: { value, onChange } }) => (
                                <input
                                  className="flex-shrink-0 flex-1 w-[100%] h-[2.4rem]"
                                  value={
                                    typeof value === 'string' || typeof value === 'number'
                                      ? value
                                      : ''
                                  }
                                  onChange={onChange}
                                />
                              )}
                            />
                          </div>
                        </td>

                        {/* Confirm status */}
                        <td className="w-[14rem]">
                          <div className="text-center">
                            {field.confirm_flag ? 'Đã xác nhận đặt chỗ' : 'Chưa xác nhận đặt chỗ'}
                          </div>
                        </td>

                        {/* Delete */}
                        <td className="w-[8rem] p-[.5rem]">
                          <div className="p-[.5rem]">
                            <NButton
                              type="button"
                              className="bg-gray w-[100%]"
                              onClick={() =>
                                isBicycle ? removeBicycle(selectIdx) : removeParking(selectIdx)
                              }
                            >
                              Xóa
                            </NButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="font-bold text-red-500 text-center"
                        colSpan={selectedTableColSpan}
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Action buttons ── */}
            <div
              className={cn(
                'flex justify-center gap-[1rem] mt-[2rem]',
                '[&>*]:h-[3.5rem] [&>*]:w-[12.5rem] [&>*]:bg-gray'
              )}
            >
              <NButton type="button" onClick={handleSave}>
                Thiết lập
              </NButton>
              <NButton type="button" onClick={handleClearAll}>
                Xóa
              </NButton>
            </div>
          </form>
        </div>
      }
    />
  )
}
