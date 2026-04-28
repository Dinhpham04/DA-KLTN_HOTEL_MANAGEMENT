import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import CustomSelect, { type CustomSelectOption } from '@/components/common/CustomSelect'
import { NButton } from '@/components/ui/new-button'
import { useCreateBicycleParkingReserve } from '@/hooks/mutations/useCreateBicycleParkingReserve'
import { useCreateParkingReserve } from '@/hooks/mutations/useCreateParkingReserve'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import { useReservations } from '@/hooks/queries/useReservations'
import { cn } from '@/lib/utils'
import type { Reservation, ReservationFilterParams } from '@/types/reservation'

const formSchema = z
  .object({
    roomId: z.number().nullable(),
    reserveId: z.number().nullable(),
    periodFrom: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
    periodTo: z.date().nullable().optional(),
    carType: z.string().optional(),
    licensePlate: z.string().optional(),
    bicycleTypeNote: z.string().optional(),
    note: z.string().optional(),
    confirmFlag: z.boolean().optional(),
  })
  .superRefine((data, context) => {
    if (data.roomId === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng chọn phòng',
        path: ['roomId'],
      })
    }

    // if (data.reserveId === null) {
    //   context.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'Vui lòng chọn đặt phòng',
    //     path: ['reserveId'],
    //   })
    // }

    if (data.periodTo && dayjs(data.periodTo).isBefore(dayjs(data.periodFrom), 'day')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
        path: ['periodTo'],
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

interface ParkingReserveCreateModalProps {
  parkingId?: number
  bicycleParkingId?: number
  isBicycle: boolean
  facilityId: number
  facilityName: string
  slotNumber: string
  defaultDateFrom?: string
  defaultDateTo?: string
  trigger: React.ReactNode
}

type ReservationListResponse = {
  data?: Reservation[]
  items?: Reservation[]
}

function toDay(value?: string | null) {
  return value ? dayjs(value) : undefined
}

function maxDay(left?: dayjs.Dayjs, right?: dayjs.Dayjs) {
  if (!left) return right
  if (!right) return left
  return left.isAfter(right, 'day') ? left : right
}

function minDay(left?: dayjs.Dayjs, right?: dayjs.Dayjs) {
  if (!left) return right
  if (!right) return left
  return left.isBefore(right, 'day') ? left : right
}

function isReservationOverlapped(reservation: Reservation, slotFrom?: string, slotTo?: string) {
  const reserveFrom = toDay(reservation.periodFrom)
  if (!reserveFrom) return false

  const reserveTo = toDay(reservation.periodTo)
  const gapFrom = toDay(slotFrom)
  const gapTo = toDay(slotTo)

  if (gapTo && reserveFrom.isAfter(gapTo, 'day')) {
    return false
  }

  if (reserveTo && gapFrom && reserveTo.isBefore(gapFrom, 'day')) {
    return false
  }

  return true
}

function getInitialPeriod(defaultDateFrom?: string, defaultDateTo?: string) {
  const periodFrom = defaultDateFrom ? dayjs(defaultDateFrom).toDate() : dayjs().toDate()
  const periodTo = defaultDateTo ? dayjs(defaultDateTo).toDate() : null

  if (periodTo && dayjs(periodTo).isBefore(periodFrom, 'day')) {
    return {
      periodFrom,
      periodTo: periodFrom,
    }
  }

  return {
    periodFrom,
    periodTo,
  }
}

function buildPeriodFromReservation(
  reservation: Reservation,
  slotFrom?: string,
  slotTo?: string
): { periodFrom: Date; periodTo: Date | null } {
  const reserveFrom = toDay(reservation.periodFrom)
  const reserveTo = toDay(reservation.periodTo)
  const gapFrom = toDay(slotFrom)
  const gapTo = toDay(slotTo)

  let periodFrom = reserveFrom ?? gapFrom ?? dayjs()
  const maxFrom = maxDay(periodFrom, gapFrom)
  if (maxFrom) {
    periodFrom = maxFrom
  }

  let periodTo = minDay(reserveTo, gapTo)

  if (periodTo?.isBefore(periodFrom, 'day')) {
    periodTo = periodFrom
  }

  return {
    periodFrom: periodFrom.toDate(),
    periodTo: periodTo ? periodTo.toDate() : null,
  }
}

export default function ParkingReserveCreateModal({
  parkingId,
  bicycleParkingId,
  isBicycle,
  facilityId,
  facilityName,
  slotNumber,
  defaultDateFrom,
  defaultDateTo,
  trigger,
}: ParkingReserveCreateModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const initialPeriod = useMemo(
    () => getInitialPeriod(defaultDateFrom, defaultDateTo),
    [defaultDateFrom, defaultDateTo]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: null,
      reserveId: null,
      periodFrom: initialPeriod.periodFrom,
      periodTo: initialPeriod.periodTo,
      carType: '',
      licensePlate: '',
      bicycleTypeNote: '',
      note: '',
      confirmFlag: false,
    },
  })

  const selectedRoomId = form.watch('roomId')
  const selectedReserveId = form.watch('reserveId')
  const currentPeriodFrom = form.watch('periodFrom')

  const { data: roomsData, isLoading: isRoomsLoading } = useGetRooms({
    params: {
      page: 1,
      limit: 500,
      facilityId,
      dataStatus: 1,
    },
    enabled: isOpen && facilityId > 0,
  })

  const roomOptions = useMemo<CustomSelectOption[]>(() => {
    return (roomsData?.data ?? []).map((room) => ({
      label: room.roomNumber,
      value: String(room.roomId),
    }))
  }, [roomsData])

  const reservationParams = useMemo<ReservationFilterParams>(
    () => ({
      page: 1,
      limit: 200,
      facilityId,
      roomId: selectedRoomId ?? -1,
      dataStatus: 1,
      draftFlag: false,
      orderBy: 'periodFrom',
      order: 'desc',
    }),
    [facilityId, selectedRoomId]
  )

  const { data: reservationsResponse, isLoading: isReservationsLoading } = useReservations(
    reservationParams,
    {
      enabled: isOpen && facilityId > 0 && selectedRoomId !== null,
    }
  )

  const reservations = useMemo<Reservation[]>(() => {
    const payload = (reservationsResponse ?? {}) as ReservationListResponse
    const list = payload.data ?? payload.items ?? []

    return list.filter((reservation) =>
      isReservationOverlapped(reservation, defaultDateFrom, defaultDateTo)
    )
  }, [reservationsResponse, defaultDateFrom, defaultDateTo])

  const reservationOptions = useMemo<CustomSelectOption[]>(() => {
    return reservations.map((reservation) => {
      const from = reservation.periodFrom
        ? dayjs(reservation.periodFrom).format('YYYY/MM/DD')
        : '---'
      const to = reservation.periodTo
        ? dayjs(reservation.periodTo).format('YYYY/MM/DD')
        : 'Chưa xác định'
      const customer = reservation.clientName ?? 'Khách lẻ'
      const roomNumber = reservation.roomNumber ?? '---'

      return {
        value: String(reservation.reserveId),
        label: `#${reservation.reserveId} | Phòng ${roomNumber} | ${customer} (${from} - ${to})`,
      }
    })
  }, [reservations])

  const selectedReservation = useMemo(() => {
    if (!selectedReserveId) return null
    return reservations.find((reservation) => reservation.reserveId === selectedReserveId) ?? null
  }, [reservations, selectedReserveId])

  useEffect(() => {
    if (!isOpen) return

    const shouldValidateReservation = selectedRoomId !== null

    form.setValue('reserveId', null, { shouldValidate: shouldValidateReservation })
    form.setValue('periodFrom', initialPeriod.periodFrom)
    form.setValue('periodTo', initialPeriod.periodTo)
  }, [selectedRoomId, form, initialPeriod, isOpen])

  useEffect(() => {
    if (!selectedReservation) return

    const linkedPeriod = buildPeriodFromReservation(
      selectedReservation,
      defaultDateFrom,
      defaultDateTo
    )

    form.setValue('periodFrom', linkedPeriod.periodFrom, { shouldValidate: true })
    form.setValue('periodTo', linkedPeriod.periodTo, { shouldValidate: true })
  }, [selectedReservation, defaultDateFrom, defaultDateTo, form])

  const slotMinDay = toDay(defaultDateFrom)
  const slotMaxDay = toDay(defaultDateTo)
  const reservationMinDay = toDay(selectedReservation?.periodFrom)
  const reservationMaxDay = toDay(selectedReservation?.periodTo)

  const minSelectableDay = maxDay(slotMinDay, reservationMinDay)
  const maxSelectableDay = minDay(slotMaxDay, reservationMaxDay)
  const periodToMinDay = currentPeriodFrom
    ? maxDay(minSelectableDay, dayjs(currentPeriodFrom))
    : minSelectableDay

  const createCarMutation = useCreateParkingReserve({
    onSuccess: () => {
      toast.success('Đã tạo đặt chỗ đỗ xe thành công')
      setIsOpen(false)
    },
    onError: () => toast.error('Không thể tạo đặt chỗ đỗ xe'),
  })

  const createBicycleMutation = useCreateBicycleParkingReserve({
    onSuccess: () => {
      toast.success('Đã tạo đặt chỗ xe đạp thành công')
      setIsOpen(false)
    },
    onError: () => toast.error('Không thể tạo đặt chỗ xe đạp'),
  })

  const isPending = createCarMutation.isPending || createBicycleMutation.isPending

  function resetFormValues() {
    form.reset({
      roomId: null,
      reserveId: null,
      periodFrom: initialPeriod.periodFrom,
      periodTo: initialPeriod.periodTo,
      carType: '',
      licensePlate: '',
      bicycleTypeNote: '',
      note: '',
      confirmFlag: false,
    })
  }

  function onSubmit(values: FormValues) {
    if (!selectedReservation) {
      toast.error('Vui lòng chọn đặt phòng trước khi tạo chỗ đỗ')
      return
    }

    const periodFrom = dayjs(values.periodFrom).format('YYYY-MM-DD')
    const periodTo = values.periodTo ? dayjs(values.periodTo).format('YYYY-MM-DD') : undefined

    const commonPayload = {
      reserveId: selectedReservation.reserveId,
      clientId: selectedReservation.clientId ?? undefined,
      stayTypeId: selectedReservation.stayTypeId ?? undefined,
      periodFrom,
      periodTo,
      note: values.note || undefined,
      confirmFlag: values.confirmFlag,
    }

    if (isBicycle && bicycleParkingId) {
      createBicycleMutation.mutate({
        bicycleParkingId,
        bicycleTypeNote: values.bicycleTypeNote || undefined,
        ...commonPayload,
      })
      return
    }

    if (!isBicycle && parkingId) {
      createCarMutation.mutate({
        parkingId,
        carType: values.carType || undefined,
        licensePlate: values.licensePlate || undefined,
        ...commonPayload,
      })
      return
    }

    toast.error('Không thể xác định chỗ đỗ để tạo đặt chỗ')
  }

  const content = (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-[1.5rem] [&_*]:text-[1.4rem]"
    >
      <div className="grid grid-cols-2 gap-[1rem] border border-black bg-gray-50 p-[1rem] rounded-[.4rem] max-md:grid-cols-1">
        <div className="flex items-center gap-[1rem]">
          <span className="font-bold w-[8rem]">Cơ sở:</span>
          <span className="bg-white border border-black px-4 py-2 rounded min-w-[18rem]">
            {facilityName}
          </span>
        </div>
        <div className="flex items-center gap-[1rem]">
          <span className="font-bold w-[8rem]">Chỗ đỗ:</span>
          <span className="bg-white border border-black px-4 py-2 rounded min-w-[8rem] text-center">
            {slotNumber}
          </span>
        </div>
      </div>

      <div className="border border-black rounded-[.4rem] p-[1.2rem] bg-white">
        <div className="font-bold text-[1.5rem] mb-[1rem]">Liên kết phòng đặt</div>
        <div className="grid grid-cols-2 gap-[1rem] max-md:grid-cols-1">
          <div className="flex items-center gap-[1rem]">
            <span className="font-bold w-[8rem]">Phòng:</span>
            <Controller
              control={form.control}
              name="roomId"
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  option={roomOptions}
                  selected={value ? String(value) : ''}
                  customClassMain="!w-[34rem] max-md:!w-full h-[3.5rem]"
                  disable={isRoomsLoading}
                  change={(item) => onChange(item.value ? Number(item.value) : null)}
                />
              )}
            />
          </div>
          <div className="flex items-center gap-[1rem]">
            <span className="font-bold w-[8rem]">Đặt phòng:</span>
            <Controller
              control={form.control}
              name="reserveId"
              render={({ field: { value, onChange } }) => (
                <CustomSelect
                  option={reservationOptions}
                  selected={value ? String(value) : ''}
                  customClassMain="!w-[34rem] max-md:!w-full h-[3.5rem]"
                  disable={selectedRoomId === null || isReservationsLoading}
                  change={(item) => onChange(item.value ? Number(item.value) : null)}
                />
              )}
            />
          </div>
        </div>

        {form.formState.errors.roomId?.message && (
          <p className="text-red-500 text-sm mt-[0.5rem]">{form.formState.errors.roomId.message}</p>
        )}
        {form.formState.errors.reserveId?.message && (
          <p className="text-red-500 text-sm mt-[0.5rem]">
            {form.formState.errors.reserveId.message}
          </p>
        )}

        {selectedRoomId !== null && !isReservationsLoading && reservationOptions.length === 0 && (
          <div className="mt-[1rem] text-red-500">
            Không có đặt phòng phù hợp cho phòng đã chọn.
          </div>
        )}

        {selectedReservation ? (
          <div className="mt-[1rem] grid grid-cols-3 gap-[1rem] bg-gray-50 border border-black p-[1rem] rounded-[.4rem] max-md:grid-cols-1">
            <div>
              <div className="font-bold">Mã đặt phòng</div>
              <div>#{selectedReservation.reserveId}</div>
            </div>
            <div>
              <div className="font-bold">Khách hàng</div>
              <div>{selectedReservation.clientName || 'Khách lẻ'}</div>
            </div>
            <div>
              <div className="font-bold">Thời gian ở</div>
              <div>
                {selectedReservation.periodFrom
                  ? dayjs(selectedReservation.periodFrom).format('YYYY/MM/DD')
                  : '---'}
                {' - '}
                {selectedReservation.periodTo
                  ? dayjs(selectedReservation.periodTo).format('YYYY/MM/DD')
                  : 'Chưa xác định'}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-[1rem] bg-gray-100 border border-black px-4 py-3 rounded">
            Chọn phòng và đặt phòng trước khi tạo chỗ đỗ.
          </div>
        )}
      </div>

      <div
        className={cn(
          'border border-black rounded-[.4rem] p-[1.2rem] flex flex-col gap-[1rem]',
          selectedReservation === null && 'opacity-60'
        )}
      >
        <div className="font-bold text-[1.5rem]">Thông tin đặt chỗ</div>

        <div className="grid grid-cols-2 gap-[1rem] max-md:grid-cols-1">
          <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
            <span className="font-bold w-[8rem]">Từ ngày:</span>
            <Controller
              control={form.control}
              name="periodFrom"
              render={({ field: { value, onChange } }) => (
                <CustomDatePicker
                  value={value}
                  change={(date) => onChange(date)}
                  disable={selectedReservation === null}
                  minDate={minSelectableDay?.toDate()}
                  maxDate={maxSelectableDay?.toDate()}
                  className="!w-[22rem] h-[4rem] max-md:!w-full"
                />
              )}
            />
          </div>

          <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
            <span className="font-bold w-[8rem]">Đến ngày:</span>
            <Controller
              control={form.control}
              name="periodTo"
              render={({ field: { value, onChange } }) => (
                <CustomDatePicker
                  value={value}
                  change={(date) => onChange(date)}
                  disable={selectedReservation === null}
                  minDate={periodToMinDay?.toDate()}
                  maxDate={maxSelectableDay?.toDate()}
                  className="!w-[22rem] h-[4rem] max-md:!w-full"
                />
              )}
            />
          </div>

          {form.formState.errors.periodFrom && (
            <p className="text-red-500 text-sm col-span-2 max-md:col-span-1">
              {form.formState.errors.periodFrom.message}
            </p>
          )}
          {form.formState.errors.periodTo && (
            <p className="text-red-500 text-sm col-span-2 max-md:col-span-1">
              {form.formState.errors.periodTo.message}
            </p>
          )}

          {!isBicycle && (
            <>
              <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
                <span className="font-bold w-[8rem]">Loại xe:</span>
                <input
                  {...form.register('carType')}
                  className="border border-black px-4 py-2 w-[22rem] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed max-md:w-full"
                  placeholder="VD: Toyota Vios"
                  disabled={selectedReservation === null}
                />
              </div>

              <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
                <span className="font-bold w-[8rem]">Biển số:</span>
                <input
                  {...form.register('licensePlate')}
                  className="border border-black px-4 py-2 w-[22rem] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed max-md:w-full"
                  placeholder="VD: 51G-123.45"
                  disabled={selectedReservation === null}
                />
              </div>
            </>
          )}

          {isBicycle && (
            <div className="flex items-center gap-[1rem] col-span-2 max-md:col-span-1 max-md:flex-col max-md:items-start">
              <span className="font-bold w-[8rem]">Loại xe:</span>
              <input
                {...form.register('bicycleTypeNote')}
                className="border border-black px-4 py-2 w-full outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="VD: Xe máy Honda Vision"
                disabled={selectedReservation === null}
              />
            </div>
          )}

          <div className="flex items-start gap-[1rem] col-span-2 max-md:col-span-1">
            <span className="font-bold w-[8rem] pt-2">Ghi chú:</span>
            <textarea
              {...form.register('note')}
              rows={2}
              className="border border-black px-4 py-2 flex-1 outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ghi chú..."
              disabled={selectedReservation === null}
            />
          </div>

          <div className="flex items-center gap-[1rem] col-span-2 max-md:col-span-1">
            <span className="font-bold w-[8rem]">Xác nhận:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...form.register('confirmFlag')}
                className="w-6 h-6"
                disabled={selectedReservation === null}
              />
              <span>Đã xác nhận đặt chỗ</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-[2rem] pt-[.5rem]">
        <NButton
          type="submit"
          disabled={isPending || selectedReservation === null}
          className="min-w-[12rem] py-4"
        >
          {isPending ? 'Đang lưu...' : 'Tạo đặt chỗ'}
        </NButton>
        <NButton type="button" onClick={resetFormValues} className="min-w-[10rem] py-4">
          Làm mới
        </NButton>
      </div>
    </form>
  )

  return (
    <CustomDialog
      size="medium"
      title={isBicycle ? 'Đặt chỗ xe đạp' : 'Đặt chỗ đỗ xe'}
      trigger={trigger}
      opened={isOpen}
      changeOnOpened={(open) => {
        setIsOpen(open)
        if (open) {
          resetFormValues()
        }
      }}
      content={content}
    />
  )
}
