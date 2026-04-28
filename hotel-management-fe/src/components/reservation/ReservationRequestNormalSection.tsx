import dayjs from 'dayjs'
import { useMemo } from 'react'
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

interface ReservationRequestNormalSectionProps {
  control: Control<FieldValues>
  periodFrom?: string
  periodTo?: string
  staffOptions: Option[]
}

type RequestNormalRow = {
  is_checked?: boolean
  request_type_id?: string
  request_from?: string
  request_to?: string
  count?: string
  count_unit?: string
  unit_price?: string
  charge_staff_id?: string
}

const REQUEST_TYPE_OPTIONS: Option[] = [
  { value: '1', label: 'Tiền thuê phòng' },
  { value: '6', label: 'Điện nước' },
  { value: '7', label: 'Phí quản lý' },
  { value: '9', label: 'Phí dọn dẹp' },
  { value: '16', label: 'Bãi đỗ xe' },
  { value: '17', label: 'Xe đạp' },
  { value: '99', label: 'Khác' },
]

const COUNT_UNIT_OPTIONS: Option[] = [
  { value: '1', label: 'Lần' },
  { value: '2', label: 'Ngày' },
  { value: '3', label: 'Tháng' },
]

const EMPTY_STAFF_VALUE = '__empty_staff__'

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

const createDefaultRow = (periodFrom?: string, periodTo?: string): RequestNormalRow => ({
  is_checked: false,
  request_type_id: REQUEST_TYPE_OPTIONS[0]?.value ?? '1',
  request_from: periodFrom ?? '',
  request_to: periodTo ?? '',
  count: '1',
  count_unit: COUNT_UNIT_OPTIONS[0]?.value ?? '1',
  unit_price: '0',
  charge_staff_id: '',
})

function ReservationRequestNormalSection({
  control,
  periodFrom,
  periodTo,
  staffOptions,
}: ReservationRequestNormalSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'reserve.request_normal' as never,
  })

  const rows =
    (useWatch({
      control,
      name: 'reserve.request_normal' as never,
    }) as RequestNormalRow[] | undefined) ?? []

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

  return (
    <div className="mt-12 w-full scroll-mt-[10rem]">
      <h5 className="font-bold text-[2.3rem] leading-none">
        ■ Thông tin thanh toán của đặt phòng này
      </h5>

      <div className="mt-8 max-h-[40rem] overflow-y-auto">
        <Table className="border-black border-l w-full min-w-[120rem] font-bold text-[1.6rem] border-separate border-spacing-0">
          <TableHeader className="z-10 bg-[#EEEEEE] [&_tr]:border-0">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="top-0 z-10 sticky bg-[#EEEEEE] border-black border-t border-r border-b w-[7rem] h-16 text-center"></TableHead>
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

                    <TableCell className="p-0 border-black border-r border-b w-[20rem] h-14 font-bold text-center">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.request_type_id` as never}
                        render={({ field: requestTypeField }) => (
                          <Select
                            value={requestTypeField.value ?? REQUEST_TYPE_OPTIONS[0]?.value ?? '1'}
                            onValueChange={requestTypeField.onChange}
                          >
                            <SelectTrigger className="border-0 w-full h-full" id="request-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white" option={REQUEST_TYPE_OPTIONS} />
                          </Select>
                        )}
                      />
                    </TableCell>

                    <TableCell className="p-0 border-black border-r border-b h-14 font-bold text-center">
                      <div className="flex items-center">
                        <Controller
                          control={control}
                          name={`reserve.request_normal.${index}.request_from` as never}
                          render={({ field: fromField }) => (
                            <CustomDatePicker
                              format="yyyy/MM/dd"
                              className="flex-none [&>div]:px-[0.4rem] border-none  h-16 font-bold"
                              value={fromField.value}
                              change={fromField.onChange}
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
                              change={toField.onChange}
                            />
                          )}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="p-0 border-black border-r border-b w-[9.2rem] h-14 font-bold text-center overflow-hidden">
                      <CustomInput
                        disabled
                        value={String(calculateDays(row.request_from, row.request_to))}
                        className="disabled:bg-[#D6D6D6] !opacity-100 !border-0 !rounded-none !h-full !min-h-0 !py-0 px-3 w-full text-left focus-visible:!ring-0 focus-visible:!ring-offset-0"
                      />
                    </TableCell>

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
                            className="!border-0 !rounded-none !h-full !min-h-0 !py-0 px-3 w-full text-left "
                            placeholder="0"
                          />
                        )}
                      />
                    </TableCell>

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
                            className="!border-0 !rounded-none !h-full !min-h-0 !py-0 px-3 w-full text-left "
                            placeholder="0"
                          />
                        )}
                      />
                    </TableCell>

                    <TableCell className="p-0 border-black border-r border-b w-[10rem] h-14 font-bold text-center">
                      <Controller
                        control={control}
                        name={`reserve.request_normal.${index}.count_unit` as never}
                        render={({ field: countUnitField }) => (
                          <Select
                            value={countUnitField.value ?? COUNT_UNIT_OPTIONS[0]?.value ?? '1'}
                            onValueChange={countUnitField.onChange}
                          >
                            <SelectTrigger className="border-0 w-full h-full" id="count-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white" option={COUNT_UNIT_OPTIONS} />
                          </Select>
                        )}
                      />
                    </TableCell>

                    <TableCell className="p-0 border-black border-r border-b w-[10rem] h-14 font-bold text-center">
                      <CustomInput
                        disabled
                        value={Math.round(rowTotal).toLocaleString('en-US')}
                        className="disabled:bg-[#D6D6D6] !opacity-100 border-none w-full h-full text-right"
                      />
                    </TableCell>

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
            Tổng phụ
          </div>
          <div className="flex justify-center items-center px-4 min-w-[18.2rem] h-full leading-8">
            {formatMoney(subTotal)}
          </div>
        </div>
        <NButton
          type="button"
          className="bg-[#D9D9D9] w-[18.2rem] h-[3.6rem]"
          onClick={() => append(createDefaultRow(periodFrom, periodTo))}
        >
          Thêm dòng
        </NButton>
      </div>
    </div>
  )
}

export default ReservationRequestNormalSection
