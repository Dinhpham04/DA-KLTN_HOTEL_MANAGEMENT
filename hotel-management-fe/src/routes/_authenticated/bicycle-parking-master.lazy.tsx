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
  TableHeader,
  TableRow,
} from '@/components/common/CustomTableForm'
import Loading from '@/components/common/Loading'
import { DialogClose } from '@/components/ui/dialog'
import { FormField, FormMessage } from '@/components/ui/form'
import { NButton } from '@/components/ui/new-button'
import { cn, getApiErrorMessage } from '@/lib/utils'

import { useCreateBicycleParking } from '@/hooks/mutations/useCreateBicycleParking'
import { useUpdateBicycleParking } from '@/hooks/mutations/useUpdateBicycleParking'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetBicycleParkings } from '@/hooks/queries/useGetBicycleParkings'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'

import type { BicycleParking } from '@/types/bicycle-parking'

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

function buildBicycleParkingSchema(_stayTypeOptions: SelectOption[]) {
  return z
    .object({
      bicycle_parking_id: z.string(),
      parent_facility_id: z
        .object({
          value: z.string(),
          label: z.string(),
        })
        .optional(),
      number: z.string().max(32, 'Số chỗ đậu tối đa 32 ký tự'),
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
      const { parent_facility_id, number } = data

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
    })
}

type TypeFilterSchema = z.infer<typeof FilterSchema>
type TypeBicycleParkingSchema = z.infer<ReturnType<typeof buildBicycleParkingSchema>>

// --- Create Row ---

interface CreateBicycleParkingRowProps {
  facilitiesOptions: SelectOption[]
  stayTypeOptions: SelectOption[]
  facilityId?: number
  lastOrderNum: number
  onCreate: (data: TypeBicycleParkingSchema) => void
  bicycleParkingSchema: ReturnType<typeof buildBicycleParkingSchema>
}

const CreateBicycleParkingRow: React.FC<CreateBicycleParkingRowProps> = ({
  facilitiesOptions,
  stayTypeOptions,
  facilityId,
  lastOrderNum,
  onCreate,
  bicycleParkingSchema,
}) => {
  const form = useForm<TypeBicycleParkingSchema>({
    mode: 'onChange',
    resolver: zodResolver(bicycleParkingSchema),
    defaultValues: {
      bicycle_parking_id: '',
      parent_facility_id: facilitiesOptions.find((i) => i?.value === String(facilityId)),
      number: '',
      order_num: lastOrderNum + 1,
      notice: '',
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
                option={facilitiesOptions}
                selected={value?.value}
                change={onChange}
                customClassMain={cn('min-w-[18.5rem] sm:h-[3.6rem] h-[2rem]')}
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
                  'h-full border-transparent text-center focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] font-medium',
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
      {stayTypeOptions.map((opt) => (
        <TableCell
          key={opt.value}
          className="p-4 border border-black w-[15rem] h-full font-bold text-left"
        >
          <CustomInput
            disabled
            className="h-full border-transparent w-full text-[1.4rem] text-center font-medium disabled:!bg-white disabled:!opacity-100"
            value="0"
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
                  'h-full border-transparent min-w-[15rem] text-center focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] font-medium',
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
          <NButton type="submit" variant="default">
            <span className="!px-1 font-bold text-[1.4rem]">Lưu</span>
          </NButton>
        </div>
      </TableCell>
      <TableCell className="p-0 border border-black h-14 font-bold text-center" />
    </TableFormRow>
  )
}

// --- Update Row ---

interface UpdateBicycleParkingRowProps {
  bicycleParking: BicycleParking
  facilitiesOptions: SelectOption[]
  stayTypeOptions: SelectOption[]
  facilityId?: number
  onUpdate: (data: TypeBicycleParkingSchema, type: number) => void
  move: (index1: number, index2: number) => void
  createAtIndex: (index: number) => void
  index: number
  totalLength: number
  bicycleParkingSchema: ReturnType<typeof buildBicycleParkingSchema>
}

const UpdateBicycleParkingRow: React.FC<UpdateBicycleParkingRowProps> = ({
  bicycleParking,
  facilitiesOptions,
  stayTypeOptions,
  onUpdate,
  bicycleParkingSchema,
}) => {
  const isSuspended = bicycleParking.dataStatus === 0

  const form = useForm<TypeBicycleParkingSchema>({
    mode: 'onChange',
    resolver: zodResolver(bicycleParkingSchema),
    defaultValues: {
      bicycle_parking_id: String(bicycleParking.bicycleParkingId),
      parent_facility_id: {
        value: String(bicycleParking.parentFacilityId),
        label: String(bicycleParking.parentFacilityId),
      },
      number: String(bicycleParking.number),
      notice: bicycleParking.notice ?? '',
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
                customClassMain={cn('min-w-[18.5rem] sm:h-[3.6rem] h-[2rem] disabled:opacity-100', {
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
      {stayTypeOptions.map((opt) => (
        <TableCell
          key={opt.value}
          className={cn('p-4 border border-black h-full font-bold text-left w-[15rem]', {
            '!bg-gray-400': isSuspended,
          })}
        >
          <CustomInput
            disabled
            className="h-full border-transparent w-full text-[1.4rem] text-center disabled:!bg-white disabled:!opacity-100 font-medium"
            value="0"
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
                  'h-full border-transparent focus:outline min-w-[15rem] focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300 w-full text-[1.4rem] text-center disabled:!bg-white disabled:!opacity-100 font-medium',
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
        {dayjs(bicycleParking.updatedAt).format('YYYY/MM/DD')}
      </TableCell>
      <TableCell
        className={cn('p-4 border border-black text-center cursor-not-allowed font-medium', {
          '!bg-gray-400': isSuspended,
        })}
      >
        {bicycleParking.updatedStaffName}
      </TableCell>
      <TableCell
        className={cn('p-4 border border-black font-bold text-center', {
          '!bg-gray-400': isSuspended,
        })}
      >
        {!isSuspended ? (
          <div className="flex flex-col justify-center items-center gap-4 px-2 h-full">
            <NButton type="submit" variant="default">
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
                          notice: bicycleParking.notice ?? '',
                          number: String(bicycleParking.number),
                          parent_facility_id: {
                            label: String(bicycleParking.parentFacilityId),
                            value: String(bicycleParking.parentFacilityId),
                          },
                          bicycle_parking_id: String(bicycleParking.bicycleParkingId),
                          data_status: 0,
                          order_num: bicycleParking.orderNum,
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
                        notice: bicycleParking.notice ?? '',
                        number: String(bicycleParking.number),
                        parent_facility_id: {
                          label: String(bicycleParking.parentFacilityId),
                          value: String(bicycleParking.parentFacilityId),
                        },
                        bicycle_parking_id: String(bicycleParking.bicycleParkingId),
                        data_status: 1,
                        order_num: bicycleParking.orderNum,
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

    </TableFormRow>
  )
}

// --- Main Page ---

export const Route = createLazyFileRoute('/_authenticated/bicycle-parking-master')({
  component: BicycleParkingMasterPage,
})

function BicycleParkingMasterPage() {
  useDocumentTitle('Quản lý bãi đỗ xe đạp')

  const [bicycleParkingData, setBicycleParkingData] = useState<BicycleParking[]>([])
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

  const bicycleParkingSchema = useMemo(
    () => buildBicycleParkingSchema(stayTypeOptions),
    [stayTypeOptions],
  )

  // --- Filter form ---
  const filterMethods = useForm<TypeFilterSchema>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      facility_id: { value: '', label: '' },
    },
  })

  // --- Fetch facilities ---
  const { isLoading: facilityLoading, data: facilitiesResponse } = useGetFacilities()

  const facilitiesOptions = useMemo(
    () =>
      (facilitiesResponse?.data ?? [])
        .filter((f) => f.bicycleParkingFlag)
        .map((f) => ({
          value: String(f.facilityId),
          label: f.facilityName,
        })),
    [facilitiesResponse],
  )

  // Auto-select first facility on initial load
  useEffect(() => {
    if (facilitiesOptions.length > 0 && !queryParams.facilityId) {
      const first = facilitiesOptions[0]
      filterMethods.setValue('facility_id', first)
      setQueryParams({ facilityId: Number(first.value) })
    }
  }, [facilitiesOptions])

  // --- Fetch bicycle parkings ---
  const {
    refetch: refetchBicycleParkings,
    isLoading: bicycleParkingsLoading,
    data: bicycleParkingsData,
  } = useGetBicycleParkings({
    params: queryParams.facilityId ? { facilityId: queryParams.facilityId } : undefined,
    enabled: !!queryParams.facilityId,
  })

  useEffect(() => {
    if (bicycleParkingsData) {
      setBicycleParkingData(bicycleParkingsData)
    }
  }, [bicycleParkingsData])

  // --- Mutations ---
  const { mutate: createBicycleParking, isPending: isCreating } = useCreateBicycleParking({
    onSuccess() {
      setIsAdding(false)
      refetchBicycleParkings()
      toast.success('Tạo chỗ đỗ xe đạp thành công')
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Có lỗi xảy ra khi tạo chỗ đỗ xe đạp'))
    },
  })

  const { mutate: updateBicycleParking, isPending: isUpdating } = useUpdateBicycleParking({
    onSuccess() {
      refetchBicycleParkings()
    },
    onError(error) {
      toast.error(getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật chỗ đỗ xe đạp'))
    },
  })


  // --- Refetch when query params change ---
  useEffect(() => {
    if (queryParams.facilityId) {
      setIsAdding(false)
      refetchBicycleParkings()
    }
  }, [queryParams.facilityId])

  // --- Handlers ---
  const moveBicycleParkingRow = (index1: number, index2: number) => {
    setBicycleParkingData((prev) => {
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
    data: TypeBicycleParkingSchema,
    isUpdate?: boolean,
  ): {
    bicycleParkingId?: number
    parentFacilityId: number
    number: string | null
    notice?: string
    orderNum?: number
    dataStatus?: number
  } => {
    const originalBicycleParking = bicycleParkingData.find(
      (item) => item.bicycleParkingId === Number(data.bicycle_parking_id),
    )

    return {
      bicycleParkingId: isUpdate ? Number(data.bicycle_parking_id) : undefined,
      parentFacilityId: Number(data.parent_facility_id?.value),
      number:
        isUpdate && originalBicycleParking?.number === data.number ? null : data.number,
      notice: data.notice,
      orderNum: isUpdate ? data.order_num : (addAtIndex ?? 0) + 1,
      dataStatus: isUpdate ? data.data_status : undefined,
    }
  }

  const onUpdateSubmit = (data: TypeBicycleParkingSchema, type: number) => {
    const transformed = transformData(data, true)
    updateBicycleParking(transformed as any)
    if (type === 0) toast.success('Cập nhật thành công')
    if (type === 1) toast.success('Đã tạm dừng chỗ đỗ xe đạp')
    if (type === 2) toast.success('Đã kích hoạt lại chỗ đỗ xe đạp')
  }

  const onCreateSubmit = (data: TypeBicycleParkingSchema) => {
    const transformed = transformData(data)
    createBicycleParking(transformed as any)
  }

  const createBicycleParkingAtIndex = (index: number) => {
    setIsAdding(true)
    setAddAtIndex(index)
  }


  const isPageLoading =
    bicycleParkingsLoading ||
    isCreating ||
    isUpdating ||
    stayTypesLoading ||
    facilityLoading

  const lastOrderNum =
    bicycleParkingData.length > 0
      ? Math.max(...bicycleParkingData.map((p) => p.orderNum))
      : 0

  // Calculate dynamic min table width based on stay types count
  const minTableWidth = 105 + stayTypes.length * 15 // base rem + each stay type col

  return (
    <>
      {isPageLoading && <Loading />}
      <div className="py-[2rem] common-container">
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">Quản lý bãi đỗ xe đạp</div>
        </div>

        <section className="mt-[2rem]">
          <div className="flex sm:flex-row flex-col justify-between items-baseline gap-[2rem] w-full overflow-auto">
            <FormProvider {...filterMethods}>
              <div className="flex items-baseline gap-[2rem]">
                <h3 className="font-bold text-[1.6rem] min-w-[13rem] text-left">Lọc theo cơ sở:</h3>
                <div className="w-full">
                  <FormField
                    control={filterMethods.control}
                    name="facility_id"
                    render={({ field }) => (
                      <>
                        <CustomSelect
                          option={facilitiesOptions}
                          change={(value) => {
                            onSubmitFilter({ facility_id: value })
                          }}
                          selected={field.value?.value}
                          customClassMain={cn('min-w-[21rem] h-[4rem]', {
                            'focus:outline-red-500 focus-visible:outline-red-500 border-red-500':
                              filterMethods.formState.errors?.facility_id,
                          })}
                        />
                        <FormMessage className="text-[1.6rem] text-red-500 whitespace-nowrap" />
                      </>
                    )}
                  />
                </div>

              </div>
            </FormProvider>
            <div className="flex items-center gap-[2rem]">
              <div>
                <NButton
                  type="button"
                  disabled={!queryParams.facilityId}
                  onClick={() => createBicycleParkingAtIndex(0)}
                >
                  Thêm
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
                <tr>
                  <th rowSpan={2} className="border-r border-b border-black border-l min-w-[22rem] h-14 font-bold text-center align-middle px-2">
                    Cơ sở
                  </th>
                  <th rowSpan={2} className="border-r border-b border-black border-l min-w-[12rem] h-14 font-bold text-center align-middle px-2">
                    Số chỗ đậu
                  </th>
                  <th
                    colSpan={stayTypeOptions.length}
                    className="border-r border-b border-black border-l h-14 font-bold text-center align-middle px-2"
                  >
                    Loại hình lưu trú
                  </th>
                  <th rowSpan={2} className="border-r border-b border-black border-l min-w-[15rem] h-14 font-bold text-center align-middle px-2">
                    Ghi chú
                  </th>
                  <th rowSpan={2} className="border-r border-b border-black border-l min-w-[10rem] h-14 font-bold text-center align-middle px-2">
                    Ngày cập nhật
                  </th>
                  <th rowSpan={2} className="border-r border-b border-black border-l min-w-[12rem] h-14 font-bold text-center align-middle px-2">
                    Người cập nhật
                  </th>
                  <th rowSpan={2} className="border-r border-b border-black border-l w-[20rem] h-14 font-bold text-center align-middle px-2">
                    Thao tác
                  </th>
                </tr>
                <tr>
                  {stayTypeOptions.map((opt) => (
                    <th
                      key={opt.value}
                      className="border-r border-b border-black border-l min-w-[14rem] h-14 font-bold text-center align-middle px-4 whitespace-nowrap"
                    >
                      {opt.label}
                    </th>
                  ))}
                </tr>
              </TableHeader>
              <TableBody className="z-[2]">
                {!bicycleParkingData.length && !isAdding ? (
                  <TableRow>
                    <TableCell className="flex items-center border-b border-black border-solid h-[5.6rem] font-bold text-[1.4rem] text-red-500 text-left whitespace-nowrap">
                      <span className="ml-[2rem]">Không có dữ liệu</span>
                    </TableCell>
                  </TableRow>
                ) : null}
                {isAdding && !bicycleParkingData.length ? (
                  <CreateBicycleParkingRow
                    onCreate={onCreateSubmit}
                    facilitiesOptions={facilitiesOptions}
                    facilityId={queryParams.facilityId}
                    stayTypeOptions={stayTypeOptions}
                    lastOrderNum={lastOrderNum}
                    bicycleParkingSchema={bicycleParkingSchema}
                  />
                ) : null}
                {bicycleParkingData.map((item, index) => (
                  <Fragment key={item.bicycleParkingId || index}>
                    {isAdding && index === (addAtIndex ?? 0) ? (
                      <CreateBicycleParkingRow
                        onCreate={onCreateSubmit}
                        facilitiesOptions={facilitiesOptions}
                        facilityId={queryParams.facilityId}
                        stayTypeOptions={stayTypeOptions}
                        lastOrderNum={lastOrderNum}
                        bicycleParkingSchema={bicycleParkingSchema}
                      />
                    ) : null}
                    <UpdateBicycleParkingRow
                      bicycleParking={item}
                      facilitiesOptions={facilitiesOptions}
                      totalLength={bicycleParkingData.length}
                      index={index}
                      stayTypeOptions={stayTypeOptions}
                      facilityId={queryParams.facilityId}
                      move={moveBicycleParkingRow}
                      onUpdate={onUpdateSubmit}
                      createAtIndex={createBicycleParkingAtIndex}
                      bicycleParkingSchema={bicycleParkingSchema}
                    />
                  </Fragment>
                ))}
                {isAdding &&
                  bicycleParkingData.length > 0 &&
                  (addAtIndex ?? 0) >= bicycleParkingData.length ? (
                  <CreateBicycleParkingRow
                    onCreate={onCreateSubmit}
                    facilitiesOptions={facilitiesOptions}
                    facilityId={queryParams.facilityId}
                    stayTypeOptions={stayTypeOptions}
                    lastOrderNum={lastOrderNum}
                    bicycleParkingSchema={bicycleParkingSchema}
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
