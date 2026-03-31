import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useDocumentTitle } from 'usehooks-ts'

import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import CustomSelect from '@/components/common/CustomSelect'
import {
  Table,
  TableBody,
  TableCell,
  TableFormRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/CustomTableForm'
import Loading from '@/components/common/Loading'
import { SelectDownSVG } from '@/components/svgs/SelectDownSVG'
import { DialogClose } from '@/components/ui/dialog'
import { FormField, FormMessage } from '@/components/ui/form'
import { NButton } from '@/components/ui/new-button'
import { cn, formatValue, getApiErrorMessage } from '@/lib/utils'

import { useCreateParking } from '@/hooks/mutations/useCreateParking'
import { useUpdateParking } from '@/hooks/mutations/useUpdateParking'
import { useUpdateParkingOrder } from '@/hooks/mutations/useUpdateParkingOrder'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetParkings } from '@/hooks/queries/useGetParkings'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'

import type { Parking, ParkingRentInput } from '@/types/parking'
import type { StayType } from '@/types/stay-type'

// --- Types ---

interface SelectOption {
  label: string
  value: string
}

// --- Zod Schemas ---

const FilterSchema = z.object({
  facility_id: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .refine((val) => val.value !== '', {
      message: 'Vui lòng chọn cửa hàng',
    }),
})

function buildParkingSchema(stayTypeOptions: SelectOption[]) {
  return z
    .object({
      parking_id: z.string(),
      parent_facility_id: z
        .object({
          value: z.string(),
          label: z.string(),
        })
        .optional(),
      rents: z.array(
        z
          .string()
          .refine((value) => !value || /^\d+$/.test(value), {
            message: 'Giá thuê phải là số hợp lệ',
          })
          .refine((val) => Number(val) >= 0 && Number(val) <= 999999, {
            message: 'Giá thuê phải từ 0 đến 999,999',
          }),
      ),
      number: z.string().max(32, 'Số chỗ đậu tối đa 32 ký tự'),
      height_limit: z.string().optional(),
      notice: z.string().max(512, 'Ghi chú tối đa 512 ký tự').optional(),
      order_num: z
        .number()
        .nonnegative('Số thứ tự không được âm')
        .min(1, 'Số thứ tự tối thiểu là 1')
        .max(999999, 'Số thứ tự tối đa là 999,999')
        .optional(),
      data_status: z.number().optional(),
    })
    .superRefine((data, ctx) => {
      const { parent_facility_id, number, height_limit, rents } = data

      rents?.forEach((x, index) => {
        if (!x) {
          const stayType = stayTypeOptions[index]
          ctx.addIssue({
            code: 'custom',
            path: [`rents.${index}`],
            message: `${stayType?.label || 'Giá thuê'} là bắt buộc`,
          })
        }
      })

      if (!parent_facility_id?.value) {
        ctx.addIssue({
          code: 'custom',
          path: ['parent_facility_id'],
          message: 'Cửa hàng là bắt buộc',
        })
      }

      if (!number) {
        ctx.addIssue({
          code: 'custom',
          path: ['number'],
          message: 'Số chỗ đậu là bắt buộc',
        })
      }

      if (!height_limit) {
        ctx.addIssue({
          code: 'custom',
          path: ['height_limit'],
          message: 'Giới hạn chiều cao là bắt buộc',
        })
      }

      if (height_limit && Number(height_limit) < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['height_limit'],
          message: 'Giới hạn chiều cao tối thiểu là 1',
        })
      }

      if (height_limit && !/^[+-]?\d+(\.\d+)?$/.test(height_limit)) {
        ctx.addIssue({
          code: 'custom',
          path: ['height_limit'],
          message: 'Giới hạn chiều cao phải là số hợp lệ',
        })
      }
    })
}

type TypeFilterSchema = z.infer<typeof FilterSchema>
type TypeParkingSchema = z.infer<ReturnType<typeof buildParkingSchema>>

// --- Create Row ---

interface CreateParkingRowProps {
  facilitiesOptions: SelectOption[]
  stayTypeOptions: SelectOption[]
  stayTypes: StayType[]
  facilityId?: number
  lastOrderNum: number
  onCreate: (data: TypeParkingSchema) => void
  parkingSchema: ReturnType<typeof buildParkingSchema>
}

const CreateParkingRow: React.FC<CreateParkingRowProps> = ({
  facilitiesOptions,
  stayTypeOptions,
  facilityId,
  lastOrderNum,
  onCreate,
  parkingSchema,
}) => {
  const form = useForm<TypeParkingSchema>({
    mode: 'onChange',
    resolver: zodResolver(parkingSchema),
    defaultValues: {
      parking_id: '',
      parent_facility_id: facilitiesOptions.find((i) => i?.value === String(facilityId)),
      number: '',
      height_limit: '',
      order_num: lastOrderNum + 1,
      notice: '',
      rents: stayTypeOptions.map(() => '0'),
    },
  })

  return (
    <TableFormRow methods={form} onSubmit={form.handleSubmit(onCreate)}>
      <TableCell className="p-4 border border-black h-[5.6rem] font-bold text-left">
        <FormField
          control={form.control}
          name="parent_facility_id"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomSelect
                // customClassMain={cn('w-full h-14', {
                //   'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                //     form.formState.errors?.parent_facility_id,
                // })}
                // customClassArrow="w-[2.6rem]"
                option={facilitiesOptions}
                selected={value?.label}
                change={onChange}
              />
              <FormMessage className="text-[1.4rem] text-red-500 whitespace-nowrap" />
            </>
          )}
        />
      </TableCell>
      <TableCell className="text-left">
        <FormField
          control={form.control}
          name="number"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomInput
                className={cn(
                  'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] font-medium',
                  {
                    'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                      form.formState.errors.number,
                  },
                )}
                placeholder="Số chỗ đậu"
                value={value}
                onChange={onChange}
              />
              <FormMessage className="text-[1.4rem] text-red-500 whitespace-nowrap" />
            </>
          )}
        />
      </TableCell>
      <TableCell className="p-4 border border-black font-bold text-left">
        <FormField
          control={form.control}
          name="height_limit"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomInput
                className={cn(
                  'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] font-medium',
                  {
                    'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                      form.formState.errors.height_limit,
                  },
                )}
                placeholder="Giới hạn chiều cao"
                value={value == null ? '' : formatValue(value)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '')
                  onChange(rawValue)
                }}
              />
              <FormMessage className="text-[1.4rem] text-red-500" />
            </>
          )}
        />
      </TableCell>
      {stayTypeOptions.map((opt, stayTypeIndex) => (
        <TableCell
          key={opt.value}
          className="p-4 border border-black w-[15rem] h-full font-bold text-left"
        >
          <FormField
            control={form.control}
            name={`rents.${stayTypeIndex}`}
            render={({ field: { value, onChange } }) => (
              <>
                <CustomInput
                  className={cn(
                    'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] text-center font-medium',
                    {
                      'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                        form.formState.errors.rents?.[stayTypeIndex],
                    },
                  )}
                  placeholder={opt.label}
                  value={formatValue(value)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '')
                    onChange(rawValue)
                  }}
                />
                <FormMessage className="text-[1.4rem] text-red-500" />
              </>
            )}
          />
        </TableCell>
      ))}
      <TableCell className="p-4 border border-black font-bold text-left">
        <FormField
          control={form.control}
          name="notice"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomInput
                className={cn(
                  'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] font-medium',
                  {
                    'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                      form.formState.errors.notice,
                  },
                )}
                placeholder="Ghi chú"
                value={value == null ? '' : value}
                onChange={onChange}
              />
              <FormMessage className="text-[1.4rem] text-red-500" />
            </>
          )}
        />
      </TableCell>
      <TableCell className="px-3 py-2 border border-black h-14 font-bold text-center" />
      <TableCell className="px-3 py-2 border border-black h-14 font-bold text-center" />
      <TableCell className="p-0 border border-black h-14 font-bold text-center">
        <div className="flex justify-center items-center gap-4 px-2 h-full">
          <NButton type="submit" className="bg-gray w-[4.5rem] h-[3rem]" variant="default">
            <span className="!px-1 font-bold text-[1.4rem]">Lưu</span>
          </NButton>
        </div>
      </TableCell>
      <TableCell className="p-0 border border-black h-14 font-bold text-center" />
    </TableFormRow>
  )
}

// --- Update Row ---

interface UpdateParkingRowProps {
  parking: Parking
  facilitiesOptions: SelectOption[]
  stayTypeOptions: SelectOption[]
  stayTypes: StayType[]
  facilityId?: number
  onUpdate: (data: TypeParkingSchema, type: number) => void
  move: (index1: number, index2: number) => void
  createAtIndex: (index: number) => void
  index: number
  totalLength: number
  parkingSchema: ReturnType<typeof buildParkingSchema>
}

const UpdateParkingRow: React.FC<UpdateParkingRowProps> = ({
  parking,
  facilitiesOptions,
  stayTypeOptions,
  stayTypes,
  onUpdate,
  move,
  createAtIndex,
  index,
  totalLength,
  parkingSchema,
}) => {
  const isSuspended = parking.dataStatus === 0

  const form = useForm<TypeParkingSchema>({
    mode: 'onChange',
    resolver: zodResolver(parkingSchema),
    defaultValues: {
      parking_id: String(parking.parkingId),
      parent_facility_id: {
        value: String(parking.parentFacilityId),
        label: String(parking.parentFacilityId),
      },
      number: String(parking.number),
      height_limit: String(parking.heightLimit),
      notice: parking.notice ?? '',
      rents: stayTypes.map((st) => {
        const rent = parking.parkingRents?.find((r) => r.stayTypeId === st.stayTypeId)
        return rent ? String(rent.rent) : '0'
      }),
    },
  })

  return (
    <TableFormRow methods={form} onSubmit={form.handleSubmit((data) => onUpdate(data, 0))}>
      <TableCell
        className={cn('p-4 border border-black h-[5.6rem] font-bold text-left', {
          '!bg-gray-400': isSuspended,
        })}
      >
        <FormField
          control={form.control}
          name="parent_facility_id"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomSelect
                disable={isSuspended}
                customClassMain={cn('w-[18.5rem] sm:h-[3.6rem] h-[2rem] disabled:opacity-100', {
                  'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                    form.formState.errors.parent_facility_id,
                  '!bg-gray-400': isSuspended,
                })}
                customClassArrow={cn('', {
                  '!bg-gray-400': isSuspended,
                })}
                option={facilitiesOptions}
                selected={value?.label}
                change={onChange}
              />
              <FormMessage className="text-[1.4rem] text-red-500 whitespace-nowrap" />
            </>
          )}
        />
      </TableCell>
      <TableCell className={cn('text-left', { '!bg-gray-400': isSuspended })}>
        <FormField
          control={form.control}
          name="number"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomInput
                disabled={isSuspended}
                className={cn(
                  'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] text-center disabled:!bg-white disabled:!opacity-100 font-medium',
                  {
                    'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                      form.formState.errors.number,
                  },
                )}
                placeholder="Số chỗ đậu"
                value={value}
                onChange={onChange}
              />
              <FormMessage className="text-[1.4rem] text-red-500 whitespace-nowrap" />
            </>
          )}
        />
      </TableCell>
      <TableCell
        className={cn('p-4 border border-black font-bold text-left', {
          '!bg-gray-400': isSuspended,
        })}
      >
        <FormField
          control={form.control}
          name="height_limit"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomInput
                disabled={isSuspended}
                className={cn(
                  'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] text-center disabled:!bg-white disabled:!opacity-100 font-medium',
                  {
                    'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                      form.formState.errors.height_limit,
                  },
                )}
                placeholder="Giới hạn chiều cao"
                value={formatValue(value)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '')
                  onChange(rawValue)
                }}
              />
              <FormMessage className="text-[1.4rem] text-red-500" />
            </>
          )}
        />
      </TableCell>
      {stayTypeOptions.map((opt, stayTypeIndex) => (
        <TableCell
          key={opt.value}
          className={cn('p-4 border border-black h-full font-bold text-left w-[15rem]', {
            '!bg-gray-400': isSuspended,
          })}
        >
          <FormField
            control={form.control}
            name={`rents.${stayTypeIndex}`}
            render={({ field: { value, onChange } }) => (
              <>
                <CustomInput
                  disabled={isSuspended}
                  className={cn(
                    'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] text-center disabled:!bg-white disabled:!opacity-100 font-medium',
                    {
                      'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                        form.formState.errors.rents?.[stayTypeIndex],
                    },
                  )}
                  placeholder={opt.label}
                  value={formatValue(value)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '')
                    onChange(rawValue)
                  }}
                />
                <FormMessage className="text-[1.4rem] text-red-500" />
              </>
            )}
          />
        </TableCell>
      ))}
      <TableCell
        className={cn('p-4 border border-black font-bold text-left', {
          '!bg-gray-400': isSuspended,
        })}
      >
        <FormField
          control={form.control}
          name="notice"
          render={({ field: { value, onChange } }) => (
            <>
              <CustomInput
                disabled={isSuspended}
                className={cn(
                  'h-full border-transparent focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] text-center disabled:!bg-white disabled:!opacity-100 font-medium',
                  {
                    'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                      form.formState.errors.notice,
                  },
                )}
                placeholder="Ghi chú"
                value={value == null ? '' : value}
                onChange={onChange}
              />
              <FormMessage className="text-[1.4rem] text-red-500" />
            </>
          )}
        />
      </TableCell>
      <TableCell
        className={cn('p-4 border border-black text-center cursor-not-allowed font-medium', {
          '!bg-gray-400': isSuspended,
        })}
      >
        {dayjs(parking.updatedAt).format('YYYY/MM/DD')}
      </TableCell>
      <TableCell
        className={cn('p-4 border border-black text-center cursor-not-allowed font-medium', {
          '!bg-gray-400': isSuspended,
        })}
      >
        {parking.updatedStaffName}
      </TableCell>
      <TableCell
        className={cn('p-4 border border-black font-bold text-center', {
          '!bg-gray-400': isSuspended,
        })}
      >
        {!isSuspended ? (
          <div className="flex flex-col justify-start gap-4 px-2 h-full">
            <NButton type="submit" className="bg-gray w-[4.5rem] h-[3rem]" variant="default">
              <span className="!px-1 font-bold text-[1.4rem]">Cập nhật</span>
            </NButton>
            <CustomDialog
              customClass="text-center [&_svg]:hidden z-[99999]"
              size="medium"
              customClassContent="max-w-[50rem]"
              trigger={
                <NButton
                  type="button"
                  variant="default"
                  className="bg-gray w-[8rem] h-[3rem]"
                >
                  <span className="!px-1 font-bold text-[1.4rem]">Tạm dừng</span>
                </NButton>
              }
              title="Bạn có muốn tạm dừng sử dụng?"
              content={
                <div className="flex justify-center p-5">
                  <DialogClose
                    onClick={() =>
                      onUpdate(
                        {
                          height_limit: String(parking.heightLimit),
                          notice: parking.notice ?? '',
                          number: String(parking.number),
                          parent_facility_id: {
                            label: String(parking.parentFacilityId),
                            value: String(parking.parentFacilityId),
                          },
                          parking_id: String(parking.parkingId),
                          rents: parking.parkingRents.map((r) => String(r.rent)),
                          data_status: 0,
                          order_num: parking.orderNum,
                        },
                        1,
                      )
                    }
                  >
                    <div className="bg-[#8bd08e] mx-4 w-[14.4rem] border border-black btn btn-default">
                      <span>Thực hiện</span>
                    </div>
                  </DialogClose>
                  <DialogClose>
                    <div className="bg-[#eee] mx-4 w-[14.4rem] border border-black btn btn-default">
                      <span>Hủy</span>
                    </div>
                  </DialogClose>
                </div>
              }
            />
          </div>
        ) : null}
        {isSuspended && (
          <CustomDialog
            customClass="text-center [&_svg]:hidden z-[99999]"
            size="medium"
            customClassContent="max-w-[50rem]"
            trigger={
              <NButton
                type="button"
                className="bg-gray px-0 w-auto min-w-fit h-auto btn btn-default"
                variant="default"
              >
                <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                  Kích hoạt lại
                </span>
              </NButton>
            }
            title="Bạn có muốn kích hoạt lại?"
            content={
              <div className="flex justify-center p-5">
                <DialogClose
                  onClick={() =>
                    onUpdate(
                      {
                        height_limit: String(parking.heightLimit),
                        notice: parking.notice ?? '',
                        number: String(parking.number),
                        parent_facility_id: {
                          label: String(parking.parentFacilityId),
                          value: String(parking.parentFacilityId),
                        },
                        parking_id: String(parking.parkingId),
                        rents: parking.parkingRents.map((r) => String(r.rent)),
                        data_status: 1,
                        order_num: parking.orderNum,
                      },
                      2,
                    )
                  }
                >
                  <div className="bg-[#8bd08e] mx-4 w-[14.4rem] border border-black btn btn-default">
                    <span>Thực hiện</span>
                  </div>
                </DialogClose>
                <DialogClose>
                  <div className="bg-[#eee] mx-4 w-[14.4rem] border border-black btn btn-default">
                    <span>Hủy</span>
                  </div>
                </DialogClose>
              </div>
            }
          />
        )}
      </TableCell>
      <TableCell
        className={cn('p-4 border border-black font-bold text-center', {
          '!bg-gray-400': isSuspended,
        })}
      >
        <div className="flex justify-between items-center gap-4 h-full">
          <div className="flex gap-[.5rem]">
            <NButton
              className="bg-gray w-auto h-auto aspect-square"
              type="button"
              disabled={totalLength - 1 === index}
              onClick={() => move(index, index + 1)}
            >
              <SelectDownSVG fill="currentColor" />
            </NButton>
            <NButton
              className="bg-gray w-auto h-auto aspect-square"
              type="button"
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <SelectDownSVG fill="currentColor" className="rotate-180" />
            </NButton>
          </div>
          <NButton
            type="button"
            className="bg-gray w-[8rem] h-[3rem]"
            variant="default"
            onClick={() => createAtIndex(index + 1)}
          >
            <span className="!px-1 font-bold text-[1.4rem]">Thêm hàng</span>
          </NButton>
        </div>
      </TableCell>
    </TableFormRow>
  )
}

// --- Main Page ---

export const Route = createLazyFileRoute('/_authenticated/parking-master')({
  component: ParkingMasterPage,
})

function ParkingMasterPage() {
  useDocumentTitle('Quản lý bãi đỗ xe')

  const [parkingData, setParkingData] = useState<Parking[]>([])
  const [facilitiesOptions, setFacilitiesOptions] = useState<SelectOption[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [addAtIndex, setAddAtIndex] = useState<number>()

  const [queryParams, setQueryParams] = useState<{ facilityId?: number }>({})

  // --- Fetch stay types dynamically ---
  const { data: stayTypes = [], isLoading: stayTypesLoading } = useGetStayTypes()

  const stayTypeOptions: SelectOption[] = useMemo(
    () =>
      stayTypes.map((st) => ({
        value: String(st.stayTypeId),
        label: st.stayTypeName,
      })),
    [stayTypes],
  )

  const parkingSchema = useMemo(() => buildParkingSchema(stayTypeOptions), [stayTypeOptions])

  // --- Filter form ---
  const filterMethods = useForm<TypeFilterSchema>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      facility_id: { value: '', label: '' },
    },
  })

  // --- Fetch facilities ---
  const { isLoading: facilityLoading } = useGetFacilities({
    onSuccess(facilities) {
      const opts = facilities
        .filter((f) => f.parkingFlag)
        .map((f) => ({
          value: String(f.facilityId),
          label: f.facilityName,
        }))
      setFacilitiesOptions(opts)
    },
  })

  // --- Fetch parkings ---
  const {
    refetch: refetchParkings,
    isLoading: parkingsLoading,
    data: parkingsData,
  } = useGetParkings({
    params: queryParams.facilityId ? { facilityId: queryParams.facilityId } : undefined,
    enabled: !!queryParams.facilityId,
    onSuccess(parkings) {
      setParkingData(parkings)
    },
  })

  // --- Mutations ---
  const { mutate: createParking, isPending: isCreating } = useCreateParking({
    onSuccess() {
      setIsAdding(false)
      refetchParkings()
      toast.success('Tạo chỗ đỗ xe thành công')
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Có lỗi xảy ra khi tạo chỗ đỗ xe'))
    },
  })

  const { mutate: updateParking, isPending: isUpdating } = useUpdateParking({
    onSuccess() {
      refetchParkings()
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật chỗ đỗ xe'))
    },
  })

  const { mutate: updateOrder, isPending: isOrderUpdating } = useUpdateParkingOrder({
    onSuccess() {
      refetchParkings()
      toast.success('Cập nhật thứ tự thành công')
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật thứ tự'))
    },
  })

  // --- Refetch when query params change ---
  useEffect(() => {
    if (queryParams.facilityId) {
      setIsAdding(false)
      refetchParkings()
    }
  }, [queryParams.facilityId])

  // --- Handlers ---
  const moveParkingRow = (index1: number, index2: number) => {
    setParkingData((prev) => {
      const updated = [...prev]
        ;[updated[index1], updated[index2]] = [updated[index2], updated[index1]]
      return updated
    })
  }

  const onSubmitFilter = (data: TypeFilterSchema) => {
    const facilityId = data.facility_id?.value ? Number(data.facility_id.value) : undefined
    setQueryParams({ facilityId })
  }

  const transformData = (
    data: TypeParkingSchema,
    isUpdate?: boolean,
  ): {
    parkingId?: number
    parentFacilityId: number
    number: string | null
    heightLimit: number
    notice?: string
    parkingRents: ParkingRentInput[]
    orderNum?: number
    dataStatus?: number
  } => {
    const originalParking = parkingData.find(
      (item) => item.parkingId === Number(data.parking_id),
    )

    return {
      parkingId: isUpdate ? Number(data.parking_id) : undefined,
      parentFacilityId: Number(data.parent_facility_id?.value),
      number:
        isUpdate && originalParking?.number === data.number ? null : data.number,
      heightLimit: Number(data.height_limit),
      notice: data.notice,
      parkingRents: stayTypes.map((st, index) => ({
        stayTypeId: st.stayTypeId,
        rent: Number(data.rents[index]),
      })),
      orderNum: isUpdate ? data.order_num : (addAtIndex ?? 0) + 1,
      dataStatus: isUpdate ? data.data_status : undefined,
    }
  }

  const onUpdateSubmit = (data: TypeParkingSchema, type: number) => {
    const transformed = transformData(data, true)
    updateParking(transformed as any)
    if (type === 0) toast.success('Cập nhật thành công')
    if (type === 1) toast.success('Đã tạm dừng chỗ đỗ xe')
    if (type === 2) toast.success('Đã kích hoạt lại chỗ đỗ xe')
  }

  const onCreateSubmit = (data: TypeParkingSchema) => {
    const transformed = transformData(data)
    createParking(transformed as any)
  }

  const createParkingAtIndex = (index: number) => {
    setIsAdding(true)
    setAddAtIndex(index)
  }

  const handleUpdateOrder = () => {
    const ids = parkingData.map((p) => p.parkingId)
    updateOrder({ ids })
  }

  const isPageLoading =
    parkingsLoading || isCreating || isUpdating || isOrderUpdating || stayTypesLoading || facilityLoading

  const lastOrderNum = parkingData.length > 0
    ? Math.max(...parkingData.map((p) => p.orderNum))
    : 0

  // Calculate dynamic min table width based on stay types count
  const minTableWidth = 120 + stayTypes.length * 15 // base rem + each stay type col

  return (
    <>
      {isPageLoading && <Loading />}
      <div className="py-[2rem] common-container">
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">Quản lý bãi đỗ xe</div>
        </div>

        <section className="mt-[2rem]">
          <div className="flex sm:flex-row flex-col justify-between items-baseline gap-[2rem] w-full overflow-auto">
            <FormProvider {...filterMethods}>
              <div className="flex items-baseline gap-[2rem]">
                <h3 className="font-bold text-[1.6rem] text-center">Lọc theo cửa hàng:</h3>
                <form
                  onSubmit={filterMethods.handleSubmit(onSubmitFilter)}
                  className="flex items-start gap-[2rem]"
                >
                  <div className="w-full">
                    <FormField
                      control={filterMethods.control}
                      name="facility_id"
                      render={({ field }) => (
                        <>
                          <CustomSelect
                            option={facilitiesOptions}
                            change={field.onChange}
                            selected={field.value?.value}
                            customClassMain={cn('w-[19rem] h-[4rem]', {
                              'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                                filterMethods.formState.errors?.facility_id,
                            })}
                          />
                          <FormMessage className="text-[1.6rem] text-red-500 whitespace-nowrap" />
                        </>
                      )}
                    />
                  </div>
                  <div>
                    <NButton
                      type="submit"
                      className="bg-gray w-[5rem] h-[4rem] font-bold text-[1.6rem] text-black hover:text-white"
                    >
                      Tìm
                    </NButton>
                  </div>
                </form>
              </div>
            </FormProvider>
            <div className="flex items-center gap-[2rem]">
              <div>
                <NButton
                  type="button"
                  disabled={!queryParams.facilityId}
                  onClick={() => createParkingAtIndex(0)}
                  className={cn(
                    'bg-gray h-[4rem] w-[16rem] font-bold !text-[1.4rem]',
                    !queryParams.facilityId ? 'opacity-[0.5] cursor-not-allowed' : '',
                  )}
                >
                  Thêm hàng đầu tiên
                </NButton>
              </div>
              <div>
                <NButton
                  type="button"
                  onClick={handleUpdateOrder}
                  className={cn(
                    'bg-gray h-[4rem] w-[16rem] font-bold !text-[1.4rem]',
                    !parkingsData?.length ? 'opacity-[0.5] cursor-not-allowed' : '',
                  )}
                  disabled={!parkingsData?.length}
                >
                  Cập nhật thứ tự
                </NButton>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-[2rem]">
          <div className="store-table relative flex mt-[2.4rem] border border-black max-h-[56.4rem] overflow-auto">
            <Table
              className={cn(
                'text-[1.4rem] text-center flex-grow',
                'border-separate border-spacing-0',
                '[&>div>div>div]:border-l-0 [&>div>div>div]:border-t-0',
                '[&_form>div]:border-l-0 [&_form>div]:border-t-0',
                '[&>div>div>div:last-child]:border-r-0',
                '[&>div>form>div:last-child]:border-r-0',
                '[&_th]:shadow-none [&_th]:border-b-[.1rem]',
                '[&_th]:border-l-0',
              )}
              style={{ minWidth: `${minTableWidth}rem` }}
            >
              <TableHeader className="top-0 z-[3] sticky bg-gray text-[1.6rem]">
                <TableRow>
                  <TableHead className="border-r border-black border-l w-[20rem] h-14 font-bold text-center">
                    Cửa hàng
                  </TableHead>
                  <TableHead className="border-r border-black border-l min-w-[12rem] h-14 font-bold text-center">
                    Số chỗ đậu
                  </TableHead>
                  <TableHead className="border-r border-black border-l min-w-[12rem] h-14 font-bold text-center">
                    Giới hạn chiều cao (m)
                  </TableHead>
                  {stayTypeOptions.map((opt) => (
                    <TableHead
                      key={opt.value}
                      className="border-r border-black border-l min-w-[14rem] h-14 font-bold text-center whitespace-nowrap"
                    >
                      {opt.label}
                    </TableHead>
                  ))}
                  <TableHead className="border-r border-black border-l min-w-[15rem] h-14 font-bold text-center">
                    Ghi chú
                  </TableHead>
                  <TableHead className="border-r border-black border-l min-w-[10rem] h-14 font-bold text-center">
                    Ngày cập nhật
                  </TableHead>
                  <TableHead className="border-r border-black border-l min-w-[12rem] h-14 font-bold text-center">
                    Người cập nhật
                  </TableHead>
                  <TableHead className="border-r border-black border-l w-[20rem] h-14 font-bold text-center">
                    Thao tác
                  </TableHead>
                  <TableHead className="border-r border-black border-l w-[20rem] h-14 font-bold text-center">
                    Sắp xếp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="z-[2]">
                {!parkingData.length && !isAdding ? (
                  <TableRow>
                    <TableCell className="flex items-center border-b border-black border-solid h-[5.6rem] font-bold text-[1.4rem] text-red-500 text-left whitespace-nowrap">
                      <span className="ml-[2rem]">Không có dữ liệu</span>
                    </TableCell>
                  </TableRow>
                ) : null}
                {isAdding && !parkingData.length ? (
                  <CreateParkingRow
                    onCreate={onCreateSubmit}
                    facilitiesOptions={facilitiesOptions}
                    facilityId={queryParams.facilityId}
                    stayTypeOptions={stayTypeOptions}
                    stayTypes={stayTypes}
                    lastOrderNum={lastOrderNum}
                    parkingSchema={parkingSchema}
                  />
                ) : null}
                {parkingData.map((item, index) => (
                  <Fragment key={item.parkingId || index}>
                    {isAdding && index === (addAtIndex ?? 0) ? (
                      <CreateParkingRow
                        onCreate={onCreateSubmit}
                        facilitiesOptions={facilitiesOptions}
                        facilityId={queryParams.facilityId}
                        stayTypeOptions={stayTypeOptions}
                        stayTypes={stayTypes}
                        lastOrderNum={lastOrderNum}
                        parkingSchema={parkingSchema}
                      />
                    ) : null}
                    <UpdateParkingRow
                      parking={item}
                      facilitiesOptions={facilitiesOptions}
                      totalLength={parkingData.length}
                      index={index}
                      stayTypeOptions={stayTypeOptions}
                      stayTypes={stayTypes}
                      facilityId={queryParams.facilityId}
                      move={moveParkingRow}
                      onUpdate={onUpdateSubmit}
                      createAtIndex={createParkingAtIndex}
                      parkingSchema={parkingSchema}
                    />
                  </Fragment>
                ))}
                {isAdding && parkingData.length > 0 && (addAtIndex ?? 0) >= parkingData.length ? (
                  <CreateParkingRow
                    onCreate={onCreateSubmit}
                    facilitiesOptions={facilitiesOptions}
                    facilityId={queryParams.facilityId}
                    stayTypeOptions={stayTypeOptions}
                    stayTypes={stayTypes}
                    lastOrderNum={lastOrderNum}
                    parkingSchema={parkingSchema}
                  />
                ) : null}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </>
  )
}
