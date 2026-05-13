import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo } from 'react'
import {
  type Control,
  Controller,
  type FieldValues,
  useFieldArray,
  useWatch,
} from 'react-hook-form'

import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomInput } from '@/components/common/CustomInput'
import type { Option } from '@/components/common/CustomSelectClean'
import { NButton } from '@/components/ui/new-button'
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCalculateFees } from '@/hooks/mutations/useCalculateFees'
import { useGetRequestTypes } from '@/hooks/queries/useGetRequestTypes'

interface ReservationRequestNormalSectionProps {
  control: Control<FieldValues>
  periodFrom?: string
  periodTo?: string
  staffOptions: Option[]
  roomTypeId?: string
  stayTypeId?: string
  facilityId?: string
}

type RequestNormalRow = {
  request_detail_id?: number
  sale_detail_id?: number
  payment_method_id?: string
  sale_date?: string
  is_confirmed?: boolean
  summary?: string
  is_checked?: boolean
  request_type_id?: string
  request_from?: string
  request_to?: string
  count?: string
  count_unit?: string
  unit_price?: string
  charge_staff_id?: string
  source_type?: string
  source_id?: string
  source_key?: string
}

type ParkingReserveRow = {
  slotIndex?: number
  parking_id?: number
  facility_no?: string
  period_from?: string | null
  period_to?: string | null
}

type BicycleParkingReserveRow = {
  slotIndex?: number
  bicycle_parking_id?: number
  facility_no?: string
  period_from?: string | null
  period_to?: string | null
}

const COUNT_UNIT_OPTIONS: Option[] = [
  { value: '1', label: 'Tháng' },
  { value: '2', label: 'Ngày' },
  { value: '3', label: 'Lần' },
]

const EMPTY_STAFF_VALUE = '__empty_staff__'
const RENT_REQUEST_TYPE_ID = '1'
const PARKING_REQUEST_TYPE_ID = '40'
const BICYCLE_PARKING_REQUEST_TYPE_ID = '17'
const RENT_SOURCE_TYPE = 'rent'
const RENT_EXTRA_SOURCE_TYPE = 'rent_extra'
const PARKING_SOURCE_TYPE = 'parking'
const BICYCLE_PARKING_SOURCE_TYPE = 'bicycle_parking'

const toNumber = (value?: string) => {
  if (!value) return 0
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatMoney = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}₫`

const calculateDays = (from?: string, to?: string) => {
  if (!from || !to) return 0
  const fromDate = dayjs(from)
  const toDate = dayjs(to)
  if (!fromDate.isValid() || !toDate.isValid()) return 0
  const diff = toDate.diff(fromDate, 'day') + 1
  return diff > 0 ? diff : 0
}

const formatApiDate = (value?: string | null) => {
  if (!value) return ''
  const date = dayjs(value)
  return date.isValid() ? date.format('YYYY-MM-DD') : ''
}

const resolveDefaultCountUnit = (from?: string | null, to?: string | null) =>
  calculateDays(from ?? undefined, to ?? undefined) >= 28 ? '1' : '2'

const isSyncedFeeRow = (row: RequestNormalRow) =>
  row.source_type === RENT_SOURCE_TYPE ||
  row.source_type === RENT_EXTRA_SOURCE_TYPE ||
  row.source_type === PARKING_SOURCE_TYPE ||
  row.source_type === BICYCLE_PARKING_SOURCE_TYPE

const createSourceKey = (
  sourceType: string,
  sourceId: number,
  slotIndex: number | undefined,
  periodFrom?: string | null,
  periodTo?: string | null
) => [sourceType, sourceId, slotIndex ?? 0, periodFrom ?? '', periodTo ?? ''].join(':')

const normalizeRows = (rows: RequestNormalRow[]) =>
  rows.map((row) => ({
    is_checked: !!row.is_checked,
    request_type_id: row.request_type_id ?? '',
    request_from: row.request_from ?? '',
    request_to: row.request_to ?? '',
    count: row.count ?? '',
    count_unit: row.count_unit ?? '',
    unit_price: row.unit_price ?? '',
    charge_staff_id: row.charge_staff_id ?? '',
    source_type: row.source_type ?? '',
    source_id: row.source_id ?? '',
    source_key: row.source_key ?? '',
  }))

const areRowsEqual = (currentRows: RequestNormalRow[], nextRows: RequestNormalRow[]) =>
  JSON.stringify(normalizeRows(currentRows)) === JSON.stringify(normalizeRows(nextRows))

const createDefaultRow = (
  periodFrom?: string,
  periodTo?: string,
  defaultRequestTypeId?: string
): RequestNormalRow => ({
  is_checked: false,
  request_type_id: defaultRequestTypeId ?? '1',
  request_from: periodFrom ?? '',
  request_to: periodTo ?? '',
  count: '1',
  count_unit: '2',
  unit_price: '0',
  charge_staff_id: '',
})

function ReservationRequestNormalSection({
  control,
  periodFrom,
  periodTo,
  staffOptions,
  roomTypeId,
  stayTypeId,
  facilityId,
}: ReservationRequestNormalSectionProps) {
  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: 'reserve.request_normal' as never,
  })

  const rows =
    (useWatch({
      control,
      name: 'reserve.request_normal' as never,
    }) as RequestNormalRow[] | undefined) ?? []

  const parkingReserveRows =
    (useWatch({
      control,
      name: 'reserve.parking_reserve' as never,
    }) as ParkingReserveRow[] | undefined) ?? []

  const bicycleParkingReserveRows =
    (useWatch({
      control,
      name: 'reserve.bicycle_parking_reserve' as never,
    }) as BicycleParkingReserveRow[] | undefined) ?? []

  // ── Fetch request types from backend (dynamic, not hardcoded) ──────
  const { data: requestTypes = [] } = useGetRequestTypes()
  const { mutateAsync: calculateFees } = useCalculateFees()

  const requestTypeOptions: Option[] = useMemo(
    () =>
      requestTypes.map((rt) => ({
        value: String(rt.requestTypeId),
        label: rt.requestTypeName,
      })),
    [requestTypes]
  )

  const parkingRequestTypeId = useMemo(
    () =>
      String(
        requestTypes.find((rt) => rt.category === 'parking' && !rt.isRefund)?.requestTypeId ??
          PARKING_REQUEST_TYPE_ID
      ),
    [requestTypes]
  )

  const bicycleParkingRequestTypeId = useMemo(
    () =>
      String(
        requestTypes.find((rt) => rt.requestTypeId === Number(BICYCLE_PARKING_REQUEST_TYPE_ID))
          ?.requestTypeId ?? BICYCLE_PARKING_REQUEST_TYPE_ID
      ),
    [requestTypes]
  )

  const requestTypesById = useMemo(
    () => new Map(requestTypes.map((requestType) => [requestType.requestTypeId, requestType])),
    [requestTypes]
  )

  // ── Auto-calculate unit_price when request type / dates change ─────
  const calculateRentRow = useCallback(
    async (row: RequestNormalRow) => {
      if (!roomTypeId || !stayTypeId || !row.request_from || !row.request_to) return row

      try {
        const result = await calculateFees({
          roomTypeId: Number(roomTypeId),
          stayTypeId: Number(stayTypeId),
          periodFrom: formatApiDate(row.request_from),
          periodTo: formatApiDate(row.request_to),
          countUnit: Number(row.count_unit ?? '2') as 1 | 2 | 3,
          facilityId: facilityId ? Number(facilityId) : undefined,
        })

        if (!result.data?.rentFee) return row

        return {
          ...row,
          unit_price: String(result.data.rentFee.unitPrice),
          count: String(result.data.rentFee.count),
        }
      } catch {
        return row
      }
    },
    [roomTypeId, stayTypeId, facilityId, calculateFees]
  )

  const calculateRentRows = useCallback(
    async (
      row: RequestNormalRow,
      existingAutoRowsByKey: Map<string | undefined, RequestNormalRow>
    ) => {
      if (!roomTypeId || !stayTypeId || !row.request_from || !row.request_to) return [row]

      try {
        const result = await calculateFees({
          roomTypeId: Number(roomTypeId),
          stayTypeId: Number(stayTypeId),
          periodFrom: formatApiDate(row.request_from),
          periodTo: formatApiDate(row.request_to),
          countUnit: Number(row.count_unit ?? '2') as 1 | 2 | 3,
          facilityId: facilityId ? Number(facilityId) : undefined,
        })

        const rentRow = {
          ...row,
          unit_price: String(result.data.rentFee.unitPrice),
          count: String(result.data.rentFee.count),
        }

        const extraRows =
          result.data.rentExtraFees?.map((fee) => {
            const sourceKey = createSourceKey(
              RENT_EXTRA_SOURCE_TYPE,
              fee.requestTypeId,
              0,
              row.request_from,
              row.request_to
            )
            const existingRow = existingAutoRowsByKey.get(sourceKey)

            return {
              // Preserve payment fields from existing row if present
              ...(existingRow
                ? {
                    request_detail_id: existingRow.request_detail_id,
                    sale_detail_id: existingRow.sale_detail_id,
                    payment_method_id: existingRow.payment_method_id,
                    sale_date: existingRow.sale_date,
                    is_confirmed: existingRow.is_confirmed,
                    summary: existingRow.summary,
                  }
                : {}),
              is_checked: true,
              request_type_id: String(fee.requestTypeId),
              request_from: row.request_from,
              request_to: row.request_to,
              count: String(fee.count),
              count_unit: String(fee.countUnit),
              unit_price: String(fee.unitPrice),
              charge_staff_id: existingRow?.charge_staff_id ?? '',
              source_type: RENT_EXTRA_SOURCE_TYPE,
              source_id: String(fee.requestTypeId),
              source_key: sourceKey,
            }
          }) ?? []

        return [rentRow, ...extraRows]
      } catch {
        return [row]
      }
    },
    [roomTypeId, stayTypeId, facilityId, calculateFees]
  )

  const calculateParkingRow = useCallback(
    async (row: RequestNormalRow, parkingId: number) => {
      if (!roomTypeId || !stayTypeId || !row.request_from || !row.request_to) return row

      try {
        const result = await calculateFees({
          roomTypeId: Number(roomTypeId),
          stayTypeId: Number(stayTypeId),
          periodFrom: formatApiDate(row.request_from),
          periodTo: formatApiDate(row.request_to),
          countUnit: Number(row.count_unit ?? '2') as 1 | 2 | 3,
          parkingId,
          facilityId: facilityId ? Number(facilityId) : undefined,
        })

        if (!result.data?.parkingFee) return row

        return {
          ...row,
          unit_price: String(result.data.parkingFee.unitPrice),
          count: String(result.data.parkingFee.count),
        }
      } catch {
        return row
      }
    },
    [roomTypeId, stayTypeId, facilityId, calculateFees]
  )

  const calculateServiceRow = useCallback(
    async (row: RequestNormalRow, requestTypeId: number) => {
      if (!roomTypeId || !stayTypeId || !row.request_from || !row.request_to) return row

      try {
        const result = await calculateFees({
          roomTypeId: Number(roomTypeId),
          stayTypeId: Number(stayTypeId),
          periodFrom: formatApiDate(row.request_from),
          periodTo: formatApiDate(row.request_to),
          countUnit: Number(row.count_unit ?? '2') as 1 | 2 | 3,
          serviceTypeIds: [requestTypeId],
          facilityId: facilityId ? Number(facilityId) : undefined,
        })

        const serviceFee = result.data?.serviceFees.find(
          (fee) => fee.requestTypeId === requestTypeId
        )
        if (!serviceFee) return row

        return {
          ...row,
          unit_price: String(serviceFee.unitPrice),
          count: String(serviceFee.count),
        }
      } catch {
        return row
      }
    },
    [roomTypeId, stayTypeId, facilityId, calculateFees]
  )

  const handleAutoCalculate = useCallback(
    async (index: number, row: RequestNormalRow) => {
      if (!roomTypeId || !stayTypeId || !row.request_from || !row.request_to) return

      const requestTypeId = Number(row.request_type_id ?? '0')
      const requestType = requestTypesById.get(requestTypeId)

      try {
        if (row.source_type === PARKING_SOURCE_TYPE && row.source_id) {
          const calculatedRow = await calculateParkingRow(row, Number(row.source_id))
          update(index, calculatedRow as never)
          return
        }

        if (requestTypeId !== 1) {
          if (requestType?.category === 'service') {
            const calculatedRow = await calculateServiceRow(row, requestTypeId)
            update(index, calculatedRow as never)
          }
          return
        }

        const calculatedRow = await calculateRentRow(row)
        update(index, calculatedRow as never)
      } catch {
        // silently ignore — user can adjust manually
      }
    },
    [
      roomTypeId,
      stayTypeId,
      calculateRentRow,
      calculateParkingRow,
      calculateServiceRow,
      requestTypesById,
      update,
    ]
  )

  useEffect(() => {
    let cancelled = false

    async function syncAutoFees() {
      const existingAutoRowsByKey = new Map(
        rows.filter(isSyncedFeeRow).map((row) => [row.source_key, row])
      )
      const manualRows = rows.filter((row) => !isSyncedFeeRow(row))
      const nextAutoRows: RequestNormalRow[] = []

      if (roomTypeId && stayTypeId && periodFrom && periodTo) {
        const sourceKey = createSourceKey(
          RENT_SOURCE_TYPE,
          Number(roomTypeId),
          Number(stayTypeId),
          periodFrom,
          periodTo
        )
        const existingRow = existingAutoRowsByKey.get(sourceKey)
        const baseRow: RequestNormalRow = {
          is_checked: true,
          request_type_id: RENT_REQUEST_TYPE_ID,
          request_from: periodFrom,
          request_to: periodTo,
          count: existingRow?.count ?? '1',
          count_unit: existingRow?.count_unit ?? '2',
          unit_price: existingRow?.unit_price ?? '0',
          charge_staff_id: existingRow?.charge_staff_id ?? '',
          source_type: RENT_SOURCE_TYPE,
          source_id: String(roomTypeId),
          source_key: sourceKey,
        }

        nextAutoRows.push(...(await calculateRentRows(baseRow, existingAutoRowsByKey)))
      }

      for (const [index, parkingReserve] of parkingReserveRows.entries()) {
        if (
          !parkingReserve.parking_id ||
          !parkingReserve.period_from ||
          !parkingReserve.period_to
        ) {
          continue
        }

        const sourceKey = createSourceKey(
          PARKING_SOURCE_TYPE,
          parkingReserve.parking_id,
          parkingReserve.slotIndex ?? index,
          parkingReserve.period_from,
          parkingReserve.period_to
        )
        const existingRow = existingAutoRowsByKey.get(sourceKey)
        const baseRow: RequestNormalRow = {
          is_checked: true,
          request_type_id: parkingRequestTypeId,
          request_from: parkingReserve.period_from,
          request_to: parkingReserve.period_to,
          count: existingRow?.count ?? '1',
          count_unit:
            existingRow?.count_unit ??
            resolveDefaultCountUnit(parkingReserve.period_from, parkingReserve.period_to),
          unit_price: existingRow?.unit_price ?? '0',
          charge_staff_id: existingRow?.charge_staff_id ?? '',
          source_type: PARKING_SOURCE_TYPE,
          source_id: String(parkingReserve.parking_id),
          source_key: sourceKey,
        }

        nextAutoRows.push(await calculateParkingRow(baseRow, parkingReserve.parking_id))
      }

      for (const [index, bicycleReserve] of bicycleParkingReserveRows.entries()) {
        if (
          !bicycleReserve.bicycle_parking_id ||
          !bicycleReserve.period_from ||
          !bicycleReserve.period_to
        ) {
          continue
        }

        const sourceKey = createSourceKey(
          BICYCLE_PARKING_SOURCE_TYPE,
          bicycleReserve.bicycle_parking_id,
          bicycleReserve.slotIndex ?? index,
          bicycleReserve.period_from,
          bicycleReserve.period_to
        )
        const existingRow = existingAutoRowsByKey.get(sourceKey)
        const baseRow: RequestNormalRow = {
          is_checked: true,
          request_type_id: bicycleParkingRequestTypeId,
          request_from: bicycleReserve.period_from,
          request_to: bicycleReserve.period_to,
          count: existingRow?.count ?? '1',
          count_unit:
            existingRow?.count_unit ??
            resolveDefaultCountUnit(bicycleReserve.period_from, bicycleReserve.period_to),
          unit_price: existingRow?.unit_price ?? '0',
          charge_staff_id: existingRow?.charge_staff_id ?? '',
          source_type: BICYCLE_PARKING_SOURCE_TYPE,
          source_id: String(bicycleReserve.bicycle_parking_id),
          source_key: sourceKey,
        }

        nextAutoRows.push(await calculateServiceRow(baseRow, Number(bicycleParkingRequestTypeId)))
      }

      const nextRows = [...manualRows, ...nextAutoRows]
      if (!cancelled && !areRowsEqual(rows, nextRows)) {
        replace(nextRows as never[])
      }
    }

    syncAutoFees()

    return () => {
      cancelled = true
    }
  }, [
    rows,
    periodFrom,
    periodTo,
    roomTypeId,
    stayTypeId,
    parkingReserveRows,
    bicycleParkingReserveRows,
    parkingRequestTypeId,
    bicycleParkingRequestTypeId,
    calculateRentRows,
    calculateParkingRow,
    calculateServiceRow,
    replace,
  ])

  const subTotal = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const quantity = toNumber(row.count)
        const unitPrice = toNumber(row.unit_price)
        return sum + quantity * unitPrice
      }, 0),
    [rows]
  )

  const staffSelectOptions = useMemo(
    () => staffOptions.filter((item) => item.value !== ''),
    [staffOptions]
  )

  const defaultRequestTypeId = requestTypeOptions[0]?.value ?? '1'

  return (
    <div className="mt-12 w-full scroll-mt-[10rem]">
      <h5 className="font-bold text-[2.3rem] leading-none">
        ■ Thông tin thanh toán của đặt phòng này
      </h5>

      <div className="mt-8 max-h-[40rem] overflow-y-auto">
        <Table className="border-black border-l w-full min-w-[120rem] font-bold text-[1.6rem] border-separate border-spacing-0">
          <TableHeader className="z-10 bg-[#EEEEEE] [&_tr]:border-0">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b w-[7rem] h-16 text-center" />
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b min-w-[20rem] h-16 text-center">
                Hạng mục
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b min-w-[18rem] h-16 text-center">
                Thời gian thanh toán
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b min-w-[9.2rem] h-16 text-center">
                (Số ngày)
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b min-w-[9.2rem] h-16 text-center">
                Đơn giá
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b min-w-[9.2rem] h-16 text-center">
                Số lượng
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-16 min-w-[8rem] text-center">
                Đơn vị
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-16 min-w-[10rem] text-center">
                Số tiền
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b h-16 min-w-[10rem] text-center">
                Nhân viên
              </TableHead>
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b w-[16.6rem] h-16 text-center">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length > 0 ? (
              fields.map((field, index) => {
                const row = rows[index] ?? {}
                const rowTotal = toNumber(row.unit_price) * toNumber(row.count)

                return (
                  <TableRow
                    key={field.id}
                    className="border-t max-h-[20rem] overflow-auto hover:bg-transparent"
                  >
                    {/* Checkbox */}
                    <TableCell className="p-0 border-black border-r border-b w-[7rem] h-14 font-bold text-center">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.is_checked` as never}
                        render={({ field: checkboxField }) => (
                          <div className="flex justify-center">
                            <CustomCheckbox
                              checked={!!checkboxField.value}
                              onCheckedChange={checkboxField.onChange}
                            />
                          </div>
                        )}
                      />
                    </TableCell>

                    {/* Hạng mục (Request Type) — từ backend */}
                    <TableCell className="p-0 border-black border-r border-b w-[20rem] h-14 font-bold text-center">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.request_type_id` as never}
                        render={({ field: requestTypeField }) => (
                          <Select
                            value={requestTypeField.value ?? defaultRequestTypeId}
                            onValueChange={(value) => {
                              requestTypeField.onChange(value)
                              // Auto-calculate if type is rent
                              handleAutoCalculate(index, { ...row, request_type_id: value })
                            }}
                          >
                            <SelectTrigger className="border-0 w-full h-full" id="request-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className="bg-white"
                              option={
                                requestTypeOptions.length > 0
                                  ? requestTypeOptions
                                  : [{ value: '1', label: 'Tiền thuê phòng' }]
                              }
                            />
                          </Select>
                        )}
                      />
                    </TableCell>

                    {/* Thời gian thanh toán */}
                    <TableCell className="p-0 border-black border-r border-b h-14 font-bold text-center">
                      <div className="flex items-center">
                        <Controller
                          control={control}
                          name={`reserve.request_normal.${index}.request_from` as never}
                          render={({ field: fromField }) => (
                            <CustomDatePicker
                              format="yyyy/MM/dd"
                              className="flex-none [&>div]:px-[0.4rem] border-none h-16 font-bold"
                              value={fromField.value}
                              change={(date) => {
                                fromField.onChange(date)
                                handleAutoCalculate(index, {
                                  ...row,
                                  request_from: date
                                    ? dayjs(date as Date).format('YYYY-MM-DD')
                                    : undefined,
                                })
                              }}
                            />
                          )}
                        />
                        <span className="flex justify-center items-center !mt-0 border-black border-x border-y-none w-14 h-16 text-[1.4rem]">
                          ~
                        </span>
                        <Controller
                          control={control}
                          name={`reserve.request_normal.${index}.request_to` as never}
                          render={({ field: toField }) => (
                            <CustomDatePicker
                              format="yyyy/MM/dd"
                              className="flex-none !mt-0 [&>div]:px-[0.4rem] border-none h-16 font-bold"
                              value={toField.value}
                              change={(date) => {
                                toField.onChange(date)
                                handleAutoCalculate(index, {
                                  ...row,
                                  request_to: date
                                    ? dayjs(date as Date).format('YYYY-MM-DD')
                                    : undefined,
                                })
                              }}
                            />
                          )}
                        />
                      </div>
                    </TableCell>

                    {/* Số ngày (read-only) */}
                    <TableCell className="p-0 border-black border-r border-b w-[9.2rem] h-14 font-bold text-center overflow-hidden">
                      <CustomInput
                        disabled
                        value={String(calculateDays(row.request_from, row.request_to))}
                        className="disabled:bg-[#D6D6D6] !opacity-100 !border-0 !rounded-none !h-full !min-h-0 !py-0 px-3 w-full text-left focus-visible:!ring-0 focus-visible:!ring-offset-0"
                      />
                    </TableCell>

                    {/* Đơn giá */}
                    <TableCell className="p-0 border-black border-r border-b w-[9.2rem] h-14 font-bold text-center overflow-hidden">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.unit_price` as never}
                        render={({ field: unitPriceField }) => (
                          <CustomInput
                            value={unitPriceField.value ?? ''}
                            onChange={(event) =>
                              unitPriceField.onChange(event.target.value.replace(/[^0-9]/g, ''))
                            }
                            className="!border-0 !rounded-none !h-full !min-h-0 !py-0 px-3 w-full text-left"
                            placeholder="0"
                          />
                        )}
                      />
                    </TableCell>

                    {/* Số lượng */}
                    <TableCell className="p-0 border-black border-r border-b w-[9.2rem] h-14 font-bold text-center overflow-hidden">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.count` as never}
                        render={({ field: countField }) => (
                          <CustomInput
                            value={countField.value ?? ''}
                            onChange={(event) =>
                              countField.onChange(event.target.value.replace(/[^0-9]/g, ''))
                            }
                            className="!border-0 !rounded-none !h-full !min-h-0 !py-0 px-3 w-full text-left"
                            placeholder="0"
                          />
                        )}
                      />
                    </TableCell>

                    {/* Đơn vị */}
                    <TableCell className="p-0 border-black border-r border-b w-[10rem] h-14 font-bold text-center">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.count_unit` as never}
                        render={({ field: countUnitField }) => (
                          <Select
                            value={countUnitField.value ?? COUNT_UNIT_OPTIONS[1]?.value ?? '2'}
                            onValueChange={(value) => {
                              countUnitField.onChange(value)
                              handleAutoCalculate(index, { ...row, count_unit: value })
                            }}
                          >
                            <SelectTrigger className="border-0 w-full h-full" id="count-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white" option={COUNT_UNIT_OPTIONS} />
                          </Select>
                        )}
                      />
                    </TableCell>

                    {/* Số tiền (read-only computed) */}
                    <TableCell className="p-0 border-black border-r border-b w-[10rem] h-14 font-bold text-center">
                      <CustomInput
                        disabled
                        value={Math.round(rowTotal).toLocaleString('en-US')}
                        className="disabled:bg-[#D6D6D6] !opacity-100 border-none w-full h-full text-right"
                      />
                    </TableCell>

                    {/* Nhân viên */}
                    <TableCell className="p-0 border-black border-r border-b w-[15rem] h-14 font-bold text-center">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.charge_staff_id` as never}
                        render={({ field: staffField }) => (
                          <Select
                            value={staffField.value || EMPTY_STAFF_VALUE}
                            onValueChange={(value) =>
                              staffField.onChange(value === EMPTY_STAFF_VALUE ? '' : value)
                            }
                          >
                            <SelectTrigger className="border-0 w-full h-full" id="charge-staff">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className="bg-white"
                              option={[
                                { value: EMPTY_STAFF_VALUE, label: '---' },
                                ...staffSelectOptions,
                              ]}
                            />
                          </Select>
                        )}
                      />
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="p-0 border-black border-r border-b w-[16.6rem] h-14 font-bold text-center">
                      <div className="flex justify-center items-center gap-2 px-2 h-full">
                        <NButton
                          type="button"
                          className="bg-[#EEEEEE] w-[4.9rem] h-[1.8rem] !min-h-[1.8rem]"
                          onClick={() => remove(index)}
                        >
                          <span className="!px-1 font-bold text-[1.1rem]">Xóa</span>
                        </NButton>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  colSpan={10}
                  className="py-8 border-black border-r border-b text-gray-400 text-center"
                >
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex mt-8 ml-auto w-fit">
        <div className="flex mr-14 border border-black h-[3.6rem] font-bold text-[1.6rem]">
          <div className="flex justify-center items-center bg-[#EEEEEE] px-4 border-black border-r w-[18.2rem] h-full leading-8">
            Tổng
          </div>
          <div className="flex justify-center items-center px-4 min-w-[18.2rem] h-full leading-8">
            {formatMoney(subTotal)}
          </div>
        </div>
        <NButton
          type="button"
          className="bg-[#D9D9D9] w-[18.2rem] h-[3.6rem]"
          onClick={() =>
            append(createDefaultRow(periodFrom, periodTo, defaultRequestTypeId) as never)
          }
        >
          Thêm dòng
        </NButton>
      </div>
    </div>
  )
}

export default ReservationRequestNormalSection
