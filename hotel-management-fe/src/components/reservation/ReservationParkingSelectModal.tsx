import CustomDialog from '@/components/common/CustomDialog'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomSelect from '@/components/common/CustomSelect'
import type { CustomSelectOption } from '@/components/common/CustomSelect'
import ParkingOverflow from '@/components/parking/ParkingOverflow'
import { NButton } from '@/components/ui/new-button'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useParkingStatus } from '@/hooks/queries/useParkingStatus'
import { cn } from '@/lib/utils'
import type {
  BicycleParkingReserveItem,
  BicycleParkingSlot,
  ParkingReserveItem,
  ParkingSlot,
} from '@/types/parking-status'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

// ─── Schemas ─────────────────────────────────────────────────────────────────

const parkingItemSchema = z.object({
  slotIndex: z.number().optional(),
  parking_id: z.number().optional(),
  facility_name: z.string().optional(),
  facility_no: z.string().optional(),
  period_from: z.string().nullable(),
  period_to: z.string().nullable(),
  stay_type_id: z.number().nullable().optional(),
  note: z.string().optional(),
  license_plate: z.string().default(''),
  car_type: z.string().default(''),
})

const bicycleItemSchema = z.object({
  slotIndex: z.number().optional(),
  bicycle_parking_id: z.number().optional(),
  facility_name: z.string().optional(),
  facility_no: z.string().optional(),
  period_from: z.string().nullable(),
  period_to: z.string().nullable(),
  bicycle_type_note: z.string().optional(),
  note: z.string().optional(),
})

const parkingFormSchema = z.object({ parking_reserve: z.array(parkingItemSchema) })
const bicycleFormSchema = z.object({ bicycle_parking_reserve: z.array(bicycleItemSchema) })

type ParkingFormType = z.infer<typeof parkingFormSchema>
type BicycleFormType = z.infer<typeof bicycleFormSchema>

// ─── Free slot computation ────────────────────────────────────────────────────

interface FreeSlot {
  from: string
  to: string | null
}

function computeFreeSlots(
  reserves: Array<ParkingReserveItem | BicycleParkingReserveItem>,
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReservationParkingSelectModalProps {
  isBicycle: boolean
  facilityId?: number
  periodFrom?: string
  periodTo?: string
  trigger: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReservationParkingSelectModal({
  isBicycle,
  facilityId,
  periodFrom: propPeriodFrom,
  periodTo: propPeriodTo,
  trigger,
}: ReservationParkingSelectModalProps) {
  const methods = useFormContext()
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | undefined>(
    facilityId,
  )

  // ── Local form for selected slots inside modal
  const parkingForm = useForm<ParkingFormType>({
    resolver: zodResolver(parkingFormSchema),
    defaultValues: { parking_reserve: [] },
  })
  const bicycleForm = useForm<BicycleFormType>({
    resolver: zodResolver(bicycleFormSchema),
    defaultValues: { bicycle_parking_reserve: [] },
  })

  const { fields: parkingFields, append: appendParking, remove: removeParking } = useFieldArray({
    control: parkingForm.control,
    name: 'parking_reserve',
  })
  const { fields: bicycleFields, append: appendBicycle, remove: removeBicycle } = useFieldArray({
    control: bicycleForm.control,
    name: 'bicycle_parking_reserve',
  })

  // ── Facilities
  const { data: facilitiesResponse } = useGetFacilities()
  const facilityOptions = useMemo<CustomSelectOption[]>(() => {
    const list = facilitiesResponse?.data ?? []
    return list
      .filter((f) => (isBicycle ? f.bicycleParkingFlag : f.parkingFlag))
      .map((f) => ({ value: String(f.facilityId), label: f.facilityName }))
  }, [facilitiesResponse, isBicycle])

  // Auto-select facility when options load
  useEffect(() => {
    if (!facilityOptions.length) return
    const match = facilityOptions.find((o) => Number(o.value) === facilityId)
    if (match) setSelectedFacilityId(Number(match.value))
    else setSelectedFacilityId(Number(facilityOptions[0].value))
  }, [facilityOptions, facilityId])

  // ── Parking status
  const { data: parkingStatusList = [], refetch: refetchStatus } = useParkingStatus({
    params: selectedFacilityId
      ? { facilityId: selectedFacilityId, type: isBicycle ? 3 : 2 }
      : undefined,
    enabled: false,
  })

  useEffect(() => {
    if (selectedFacilityId) refetchStatus()
  }, [selectedFacilityId])

  // Extract car/bicycle slots for the selected facility
  const currentFacilityStatus = useMemo(
    () => parkingStatusList.find((f) => f.facilityId === selectedFacilityId),
    [parkingStatusList, selectedFacilityId],
  )

  const carSlots: ParkingSlot[] = useMemo(
    () => currentFacilityStatus?.parkings ?? [],
    [currentFacilityStatus],
  )

  const bicycleSlots: BicycleParkingSlot[] = useMemo(
    () => currentFacilityStatus?.bicycleParkings ?? [],
    [currentFacilityStatus],
  )

  const prices: number[] = useMemo(() => {
    const p = currentFacilityStatus?.prices ?? {}
    return Object.values(p).slice(0, 5)
  }, [currentFacilityStatus])

  // ── Period from parent form (prop or watch)
  const roomPeriodFrom = propPeriodFrom ?? methods.watch('reserve.period_from') ?? ''
  const roomPeriodTo = propPeriodTo ?? methods.watch('reserve.period_to') ?? ''

  // ── Open modal: restore from parent form values
  function handleOpen() {
    refetchStatus()
    if (isBicycle) {
      const existing = methods.getValues('reserve.bicycle_parking_reserve') ?? []
      bicycleForm.setValue('bicycle_parking_reserve', existing)
    } else {
      const existing = methods.getValues('reserve.parking_reserve') ?? []
      parkingForm.setValue('parking_reserve', existing)
    }
  }

  // ── Close modal: reset local form
  function handleClose() {
    parkingForm.setValue('parking_reserve', [])
    bicycleForm.setValue('bicycle_parking_reserve', [])
  }

  // ── Check if a slot is already selected or out of room period
  function isSlotDisabled(id: number, slotFrom: string, slotTo: string | null, slotIdx: number): boolean {
    if (!roomPeriodFrom && !roomPeriodTo) return true
    const selectedList = isBicycle
      ? bicycleForm.getValues('bicycle_parking_reserve')
      : parkingForm.getValues('parking_reserve')

    const alreadySelected = selectedList.some(
      (s: any) => (isBicycle ? s.bicycle_parking_id : s.parking_id) === id && s.slotIndex === slotIdx,
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
      const noOverlap =
        slotToDay.isBefore(roomFrom ?? slotFromDay) ||
        slotFromDay.isAfter(roomTo)
      return noOverlap
    }

    return false
  }

  // ── Append selected slot to local form
  function handleAppend(
    slotIdx: number,
    slotId: number,
    slotNumber: string,
    slotFrom: string,
    slotTo: string | null,
  ) {
    const facilityLabel = facilityOptions.find((o) => Number(o.value) === selectedFacilityId)?.label ?? ''

    let periodFrom: string | null = null
    let periodTo: string | null = null

    if (slotTo) {
      periodFrom = roomPeriodFrom && dayjs(roomPeriodFrom).isBefore(dayjs(slotFrom))
        ? slotFrom
        : roomPeriodFrom ? dayjs(roomPeriodFrom).format('YYYY/MM/DD') : slotFrom
      periodTo = roomPeriodTo && dayjs(roomPeriodTo).isSameOrBefore(dayjs(slotTo))
        ? dayjs(roomPeriodTo).format('YYYY/MM/DD')
        : slotTo
    } else {
      periodFrom = roomPeriodFrom && dayjs(roomPeriodFrom).isSameOrAfter(dayjs(slotFrom))
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
        car_type: '',
        license_plate: '',
        note: '',
      })
    }
  }

  // ── Save and close
  function handleSave() {
    if (isBicycle) {
      methods.setValue('reserve.bicycle_parking_reserve', bicycleForm.getValues('bicycle_parking_reserve'))
    } else {
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

  return (
    <CustomDialog
      size="medium"
      changeOnOpened={(open) => {
        if (open) handleOpen()
        else handleClose()
      }}
      trigger={trigger}
      title={isBicycle ? 'Thiết lập bãi xe đạp' : 'Thiết lập bãi đỗ xe'}
      content={
        <div className="flex flex-col gap-[2rem] [&_thead_td]:bg-gray-50 [&_*]:text-[1.6rem]">

          {/* ── Facility selector + Prices ── */}
          <div className="flex w-full h-[4rem]">
            <div className="flex items-center h-[100%] font-bold">Cơ sở</div>
            <div className="ml-[1rem] [&>*]:h-[100%]">
              <CustomSelect
                customClassMain="h-[100%] w-[20rem]"
                option={facilityOptions}
                selected={selectedFacilityId ? String(selectedFacilityId) : ''}
                change={(e) => setSelectedFacilityId(Number(e.value))}
              />
            </div>
            {!isBicycle && prices.length > 0 && (
              <div className="relative flex-1 ml-[2.6rem]">
                <div className="top-0 right-0 bottom-0 left-0 absolute flex border border-black">
                  {prices.map((price, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex flex-shrink-0 flex-1 justify-center items-center h-[100%]',
                        'border-l border-black box-border',
                        { 'border-l-0': !idx },
                      )}
                    >
                      {price} đ
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Room period display ── */}
          <div className="flex">
            <div className="mr-[2.6rem] font-bold">Thời gian đặt phòng</div>
            {(roomPeriodFrom || roomPeriodTo) && (
              <>
                <div>{roomPeriodFrom ? dayjs(roomPeriodFrom).format('YYYY/MM/DD') : null}</div>
                <div className="mx-[.5rem]">～</div>
                <div>{roomPeriodTo ? dayjs(roomPeriodTo).format('YYYY/MM/DD') : null}</div>
              </>
            )}
          </div>

          {/* ── Available slots table ── */}
          <div className="flex flex-col">
            <div className="font-bold">Tình trạng trống</div>
            <div className="relative w-[100%] max-h-[26rem] overflow-auto">
              <table
                className={cn(
                  'relative w-[100%] [&_td]:h-[5.2rem]',
                  'border-separate border-spacing-0',
                  '[&_td]:border [&_td]:border-black',
                  '[&_td]:border-l-0 [&_td:first-child]:!border-l-[.1rem]',
                  '[&_tbody_tr_td]:border-t-transparent',
                  '[&_tbody_tr:nth-last-child(2)_td]:border-b-transparent',
                )}
              >
                <thead>
                  <tr
                    className={cn(
                      '[&_td]:font-bold [&>*]:text-center',
                      'sticky top-0 bg-white [&>td]:!border-y-[.1rem] z-[2]',
                    )}
                  >
                    <td className="w-[5.2rem]">No</td>
                    {!isBicycle && <td className="w-[10rem]">Giới hạn chiều cao</td>}
                    <td className="w-[15rem]">Ghi chú</td>
                    <td className="w-[62.4rem]">Khoảng trống</td>
                  </tr>
                </thead>
                <tbody className="z-[3] [&>tr:first-child_td]:!border-t-0 [&>tr:last-child_td]:!border-b-0">
                  {slotsToRender.map((slot, slotIdx) => {
                    const slotId = isBicycle
                      ? (slot as BicycleParkingSlot).bicycleParkingId
                      : (slot as ParkingSlot).parkingId
                    const reserves = isBicycle
                      ? (slot as BicycleParkingSlot).bicycleParkingReserves
                      : (slot as ParkingSlot).parkingReserves
                    const freeSlots = computeFreeSlots(reserves)

                    return (
                      <tr
                        key={slotIdx}
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
                                {freeSlots.map((freeSlot, freeIdx) => {
                                  const disabled = isSlotDisabled(slotId, freeSlot.from, freeSlot.to, freeIdx)
                                  return (
                                    <div
                                      key={freeIdx}
                                      className="flex last:!border-r-0 border-l-[.1rem] border-l-black first:border-l-transparent"
                                    >
                                      <div
                                        className={cn(
                                          'flex justify-center items-center w-[22rem]',
                                          { 'gap-[.5rem]': !freeSlot.to },
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
                                            '!bg-gray-200 !border-none !text-gray-400 cursor-default': disabled,
                                          })}
                                          disabled={disabled}
                                          onClick={() =>
                                            handleAppend(freeIdx, slotId, slot.number, freeSlot.from, freeSlot.to)
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
                      <td className="font-bold text-red-500 text-center" colSpan={9}>
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
                  '[&_tbody_tr>td]:border-b-transparent [&_tbody_tr:first-child>td]:!border-t-0',
                )}
              >
                <thead>
                  <tr className="[&_td]:font-bold [&>*]:text-center bg-gray-100 z-[2]">
                    <td className="w-[10.4rem]">Cơ sở</td>
                    <td className="w-[6rem]">No</td>
                    {isBicycle ? (
                      <td className="w-[20rem]">Thông tin xe đạp</td>
                    ) : (
                      <>
                        <td className="w-[15rem]">Loại xe</td>
                        <td className="w-[15rem]">Biển số</td>
                      </>
                    )}
                    <td className="w-[28rem]">Thời gian sử dụng</td>
                    <td className="w-[12rem]">Ghi chú</td>
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
                        {/* Facility name */}
                        <td className="!w-[10.4rem]">
                          <div className="text-center">{(field as any).facility_name}</div>
                        </td>
                        {/* Facility no */}
                        <td className="w-[6rem]">
                          <div className="text-center">{(field as any).facility_no}</div>
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
                                    <input
                                      className="flex-1 w-full h-[2.4rem]"
                                      value={value ?? ''}
                                      onChange={onChange}
                                    />
                                  )}
                                />
                              </div>
                            </td>
                            <td className="w-[15rem]">
                              <div className="flex flex-col items-center gap-[.5rem] py-[.5rem] [&>*]:w-[100%]">
                                <Controller
                                  control={parkingForm.control}
                                  name={`parking_reserve.${selectIdx}.license_plate`}
                                  render={({ field: { value, onChange } }) => (
                                    <textarea
                                      className="flex-1 p-2 resize-none w-full"
                                      value={value ?? ''}
                                      onChange={onChange}
                                    />
                                  )}
                                />
                              </div>
                            </td>
                          </>
                        )}

                        {/* Period from/to */}
                        <td className="w-[28rem]">
                          <div className="flex [&>*]:flex [&>*]:justify-center [&>*]:items-center gap-[.5rem] !py-0 h-full">
                            <div className="flex-1">
                              <Controller
                                control={selectedForm.control as any}
                                name={`${selectedFieldName}.${selectIdx}.period_from`}
                                render={({ field: { value, onChange, onBlur } }) => (
                                  <CustomDatePicker
                                    onBlur={onBlur}
                                    format="yyyy/MM/dd"
                                    className="flex-1 [&>div]:px-4 w-[12rem] h-[3.5rem] font-bold text-2xl cursor-pointer"
                                    change={(e) => onChange(dayjs(e as Date).format('YYYY/MM/DD'))}
                                    value={value}
                                  />
                                )}
                              />
                            </div>
                            <div className="flex justify-center items-center border-black border-x-[.1rem] w-[2.6rem] h-full">
                              ～
                            </div>
                            <div className="flex-1">
                              <Controller
                                control={selectedForm.control as any}
                                name={`${selectedFieldName}.${selectIdx}.period_to`}
                                render={({ field: { value, onChange, onBlur } }) => (
                                  <CustomDatePicker
                                    onBlur={onBlur}
                                    format="yyyy/MM/dd"
                                    className="flex-1 [&>div]:px-4 w-[12rem] h-[3.5rem] font-bold text-2xl cursor-pointer"
                                    change={(e) => onChange(dayjs(e as Date).format('YYYY/MM/DD'))}
                                    value={value}
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
                              control={selectedForm.control as any}
                              name={`${selectedFieldName}.${selectIdx}.note`}
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

                        {/* Delete */}
                        <td className="w-[8rem] p-[.5rem]">
                          <div className="p-[.5rem]">
                            <NButton
                              type="button"
                              className="bg-gray w-[100%]"
                              onClick={() => isBicycle ? removeBicycle(selectIdx) : removeParking(selectIdx)}
                            >
                              Xóa
                            </NButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="font-bold text-red-500 text-center" colSpan={9}>
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
                '[&>*]:h-[3.5rem] [&>*]:w-[7.5rem] [&>*]:bg-gray',
              )}
            >
              <NButton type="button" onClick={handleSave}>
                Thiết lập
              </NButton>
              <NButton type="button" onClick={handleClearAll}>
                Xóa tất cả
              </NButton>
            </div>
          </form>
        </div>
      }
    />
  )
}
