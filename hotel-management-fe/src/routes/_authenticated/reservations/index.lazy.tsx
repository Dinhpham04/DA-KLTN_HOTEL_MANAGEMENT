import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import { CustomInput } from '@/components/common/CustomInput'
import CustomPagination from '@/components/common/CustomPagination'
import type { PaginationData } from '@/components/common/CustomPagination'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import type { Option } from '@/components/common/CustomSelectClean'
import {
  CustomTable,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableHeader,
  CustomTableRow,
} from '@/components/common/CustomTable'
import { CustomTooltip } from '@/components/common/CustomToolTip'
import Loading from '@/components/common/Loading'
import { FormLabel, FormMessage } from '@/components/ui/form'
import { NButton } from '@/components/ui/new-button'
import { Skeleton } from '@/components/ui/skeleton'

import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRoomTypes } from '@/hooks/queries/useGetRoomTypes'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useReservations } from '@/hooks/queries/useReservations'
import type { Reservation, ReservationFilterParams } from '@/types/reservation'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

export const Route = createLazyFileRoute('/_authenticated/reservations/')({
  component: ReservationsPage,
})

// ─── Types ────────────────────────────────────────────────────────────
interface SearchFormType {
  clientName?: string
  occupierName?: string
  chargeStaffName?: string
  facilityInput?: string
  telPhone?: string
  type: {
    personal?: boolean
    corporate?: boolean
    special?: boolean
    preview?: boolean
  }
  typeDecide: {
    undecided?: boolean
    confirmed?: boolean
  }
  typeDelete: {
    deleted?: boolean
    cancelled?: boolean
    noShow?: boolean
  }
  typeSale: {
    noRequest?: boolean
    noSale?: boolean
    mismatch?: boolean
  }
  typeQuit?: Option
  selectRoomType?: Option
  selectRegister?: Option
  selectUpdater?: Option
  ugFlag?: boolean
  moreThanOneWeek?: boolean
}

interface SortParam {
  sort: string
  direction: 'asc' | 'desc'
}

// ─── Constants ────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20

const typeQuitOptions: Option[] = [
  { label: '---', value: '' },
  { label: 'Trước nhận phòng', value: 'before' },
  { label: 'Đang ở', value: 'staying' },
  { label: 'Đã trả phòng', value: 'left' },
]

const sortOptions: Option[] = [
  { label: 'Ngày tạo (Cũ nhất)', value: 'asc' },
  { label: 'Ngày tạo (Mới nhất)', value: 'desc' },
  { label: 'Ngày trả phòng (Giảm)', value: 'period_to' },
  { label: 'Số cơ sở/phòng', value: 'facility_no' },
  { label: 'Ngày nhận phòng', value: 'period_from' },
]

const defaultFormValues: SearchFormType = {
  clientName: undefined,
  occupierName: undefined,
  chargeStaffName: undefined,
  facilityInput: undefined,
  telPhone: '',
  type: {
    personal: false,
    corporate: false,
    special: false,
    preview: false,
  },
  typeDecide: {
    undecided: false,
    confirmed: false,
  },
  typeDelete: {
    deleted: false,
    cancelled: false,
    noShow: false,
  },
  typeSale: {
    noRequest: false,
    noSale: false,
    mismatch: false,
  },
  typeQuit: { value: '', label: '' },
  selectRoomType: { value: '', label: '' },
  selectRegister: { value: '', label: '' },
  selectUpdater: { value: '', label: '' },
  ugFlag: undefined,
  moreThanOneWeek: undefined,
}

// ─── Main Page Component ──────────────────────────────────────────────
function ReservationsPage() {
  const navigate = useNavigate()

  // State
  const [page, setPage] = useState(1)
  const [sortParam, setSortParam] = useState<SortParam>({
    sort: 'createdAt',
    direction: 'desc',
  })
  const [currentFilters, setCurrentFilters] = useState<ReservationFilterParams>({})

  const facilityNameInputRef = useRef<HTMLInputElement>(null)

  // Focus facility input on mount
  useEffect(() => {
    if (facilityNameInputRef.current) {
      facilityNameInputRef.current.focus()
    }
  }, [])

  // ─── Form Schema ──────────────────────────────────────────
  const formSchema = z.object({
    clientName: z.string().max(20, 'Không nhập quá 20 ký tự').optional(),
    occupierName: z.string().max(20, 'Không nhập quá 20 ký tự').optional(),
    chargeStaffName: z.string().max(20, 'Không nhập quá 20 ký tự').optional(),
    facilityInput: z.string().optional(),
    telPhone: z.string().optional(),
    type: z.object({
      personal: z.boolean(),
      corporate: z.boolean(),
      special: z.boolean(),
      preview: z.boolean(),
    }),
    typeDecide: z.object({
      undecided: z.boolean(),
      confirmed: z.boolean(),
    }),
    typeDelete: z.object({
      deleted: z.boolean(),
      cancelled: z.boolean(),
      noShow: z.boolean(),
    }),
    typeSale: z.object({
      noRequest: z.boolean(),
      noSale: z.boolean(),
      mismatch: z.boolean(),
    }),
    typeQuit: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .optional(),
    selectRoomType: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .optional(),
    selectRegister: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .optional(),
    selectUpdater: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .optional(),
    ugFlag: z.boolean().optional(),
    moreThanOneWeek: z.boolean().optional(),
  })

  const form = useForm<SearchFormType>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  })

  // ─── Data Fetching ────────────────────────────────────────
  const { data, isLoading } = useReservations({
    page,
    limit: ITEMS_PER_PAGE,
    orderBy: sortParam.sort,
    order: sortParam.direction,
    ...currentFilters,
  })

  const items: Reservation[] = (data as { items?: Reservation[] })?.items ?? []
  const meta: PaginationData = (data as { meta?: PaginationData })?.meta ?? {
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 0,
  }

  // ─── Dropdown Options ─────────────────────────────────────
  const { isLoading: facilitiesLoading } = useGetFacilities({})
  const { data: roomTypesData, isLoading: roomTypesLoading } = useGetRoomTypes({})
  const { data: staffsData, isLoading: staffsLoading } = useGetStaffs({})

  const roomTypeOptions = useMemo<Option[]>(() => {
    const types = (roomTypesData as { items?: { roomTypeId: number; roomTypeName: string }[] })?.items ?? []
    return [
      { value: '', label: '---' },
      ...types.map((t) => ({ value: String(t.roomTypeId), label: t.roomTypeName })),
    ]
  }, [roomTypesData])

  const staffOptions = useMemo<Option[]>(() => {
    const staffs = (staffsData as { staffId: number; staffName: string; staffNameShort?: string }[]) ?? []
    return [
      { value: '', label: '---' },
      ...staffs.map((s) => ({
        value: String(s.staffId),
        label: s.staffNameShort || s.staffName,
      })),
    ]
  }, [staffsData])

  // ─── Handlers ─────────────────────────────────────────────
  function onSubmit(formData: SearchFormType) {
    const filters: ReservationFilterParams = {}
    if (formData.clientName) filters.search = formData.clientName
    if (formData.telPhone) filters.search = formData.telPhone
    if (formData.occupierName) filters.search = formData.occupierName
    setCurrentFilters(filters)
    setPage(1)
  }

  function handleClear() {
    form.reset(defaultFormValues)
    setCurrentFilters({})
    setPage(1)
    setTimeout(() => {
      if (facilityNameInputRef.current) {
        facilityNameInputRef.current.focus()
      }
    }, 0)
  }

  function handleSortChange(option: Option) {
    if (option.value === 'period_to') {
      setSortParam({ sort: 'periodTo', direction: 'desc' })
    } else if (option.value === 'facility_no') {
      setSortParam({ sort: 'facilityId', direction: 'desc' })
    } else if (option.value === 'period_from') {
      setSortParam({ sort: 'periodFrom', direction: 'desc' })
    } else {
      setSortParam({
        sort: 'createdAt',
        direction: option.value as 'asc' | 'desc',
      })
    }
    setPage(1)
  }

  function getSelectedSortOption() {
    if (sortParam.sort === 'createdAt') {
      return sortOptions.find((o) => o.value === sortParam.direction)
    }
    if (sortParam.sort === 'periodTo') return sortOptions.find((o) => o.value === 'period_to')
    if (sortParam.sort === 'facilityId') return sortOptions.find((o) => o.value === 'facility_no')
    if (sortParam.sort === 'periodFrom') return sortOptions.find((o) => o.value === 'period_from')
    return sortOptions[1]
  }

  const optionsLoading = facilitiesLoading || roomTypesLoading || staffsLoading

  return (
    <main className="common-container">
      {optionsLoading && <Loading />}

      {/* ─── Title Bar ──────────────────────────────────── */}
      <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
        <div className="ml-[1.5rem] font-bold text-[2.3rem]">Tìm kiếm đặt phòng</div>
      </div>

      {/* ─── Search Form ────────────────────────────────── */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-[2rem]">
            <CustomAccordion type="multiple" className="w-full" defaultValue={['item-1']}>
              <CustomAccordionItem
                className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                value="item-1"
              >
                <CustomAccordionTrigger className="bg-[#79A3E0] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                  <div className="font-bold text-black text-xl sm:text-3xl">Điều kiện tìm kiếm</div>
                </CustomAccordionTrigger>
                <CustomAccordionContent>
                  <div>
                    {/* ── Row 1: Type checkboxes + UG | Confirm checkboxes ── */}
                    <div className="flex lg:flex-row flex-col lg:items-center gap-[1rem] lg:gap-0 px-[1rem] pt-[2rem] pl-[1rem] sm:pl-[2rem]">
                      <div className="flex items-center lg:w-[60%]">
                        <p className="w-[9rem] sm:w-[9rem] xl:w-[12rem] font-bold text-lg sm:text-2xl">
                          Loại
                        </p>
                        <div className="flex items-center gap-4 sm:gap-12">
                          <CheckboxField control={form.control} name="type.personal" id="cb-personal" label="Cá nhân" />
                          <CheckboxField control={form.control} name="type.corporate" id="cb-corporate" label="Doanh nghiệp" />
                          <CheckboxField control={form.control} name="type.special" id="cb-special" label="DN đặc biệt" />
                          <CheckboxField control={form.control} name="type.preview" id="cb-preview" label="Xem phòng" />
                          <div className="flex items-center gap-4 ml-[6rem]">
                            <Controller
                              control={form.control}
                              name="ugFlag"
                              render={({ field: { onChange, value } }) => (
                                <CustomCheckbox
                                  checked={!!value}
                                  onCheckedChange={onChange}
                                  id="cb-ug"
                                />
                              )}
                            />
                            <div className="gap-1 grid leading-none">
                              <label
                                htmlFor="cb-ug"
                                className="peer-disabled:opacity-70 font-bold text-2xl leading-none peer-disabled:cursor-not-allowed"
                              >
                                UG
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center lg:w-[40%]">
                        <p className="w-[9rem] sm:w-[9rem] lg:w-[9rem] font-bold text-lg sm:text-2xl">
                          Xác nhận
                        </p>
                        <div className="flex gap-4 sm:gap-12 lg:gap-0 w-[80%]">
                          <CheckboxField control={form.control} name="typeDecide.undecided" id="cb-undecided" label="Chưa xác định" className="lg:w-[33%]" />
                          <CheckboxField control={form.control} name="typeDecide.confirmed" id="cb-confirmed" label="Đã xác nhận" className="lg:w-[33%]" />
                        </div>
                      </div>
                    </div>

                    {/* ── Row 2: Name/Company + Occupier | Delete reason ── */}
                    <div className="flex sm:flex-row flex-col flex-wrap gap-[1rem] sm:gap-0 mt-[2rem] sm:mt-[2rem] px-[1rem] sm:pl-[2rem]">
                      <div className="flex sm:flex-row flex-col sm:justify-start lg:justify-between gap-4 sm:gap-0 sm:w-full lg:w-[60%]">
                        <div className="flex items-center sm:mr-[5.2rem] lg:mr-0 w-full sm:w-auto lg:w-[45%]">
                          <p className="w-[16rem] sm:min-w-[9rem] lg:min-w-[9rem] xl:min-w-[9rem] font-bold text-lg sm:text-2xl">
                            Tên/Công ty
                          </p>
                          <div className="flex flex-col">
                            <Controller
                              control={form.control}
                              name="clientName"
                              render={({ field: { onChange, value } }) => (
                                <CustomInput
                                  onChange={onChange}
                                  ref={facilityNameInputRef}
                                  onBlur={(e) => {
                                    const trimmed = e.target.value.trim()
                                    onChange(trimmed === '' ? undefined : trimmed)
                                  }}
                                  value={value ?? ''}
                                  className="w-[100%] sm:w-[15rem] xl:w-[18rem]"
                                />
                              )}
                            />
                            <FormMessage className="mt-[0.5rem] font-bold text-[1rem] text-red">
                              {form.formState.errors.clientName?.message}
                            </FormMessage>
                          </div>
                        </div>
                        <div className="flex items-center sm:mr-[5.2rem] lg:mr-0 w-full sm:w-auto lg:w-[45%]">
                          <p className="w-[9rem] sm:w-[9rem] lg:w-[9rem] font-bold text-lg sm:text-2xl">
                            Người ở
                          </p>
                          <div className="flex flex-col">
                            <Controller
                              control={form.control}
                              name="occupierName"
                              render={({ field: { onChange, value } }) => (
                                <CustomInput
                                  onChange={onChange}
                                  onBlur={(e) => {
                                    const trimmed = e.target.value.trim()
                                    onChange(trimmed === '' ? undefined : trimmed)
                                  }}
                                  value={value ?? ''}
                                  className="w-[75%] sm:w-[15rem] xl:w-[18rem]"
                                />
                              )}
                            />
                            <FormMessage className="mt-[0.5rem] font-bold text-[1rem] text-red">
                              {form.formState.errors.occupierName?.message}
                            </FormMessage>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mt-4 sm:w-[100%] lg:w-[40%]">
                        <p className="w-[9rem] sm:w-[9rem] lg:w-[9rem] font-bold text-lg sm:text-2xl">
                          Lý do xóa
                        </p>
                        <div className="flex sm:gap-12 lg:gap-0 w-[80%]">
                          <CheckboxField control={form.control} name="typeDelete.deleted" id="cb-deleted" label="Xóa" className="lg:w-[33%]" />
                          <CheckboxField control={form.control} name="typeDelete.cancelled" id="cb-cancelled" label="Hủy" className="lg:w-[33%]" />
                          <CheckboxField control={form.control} name="typeDelete.noShow" id="cb-no-show" label="No-Show" className="lg:w-[33%]" />
                        </div>
                      </div>
                    </div>

                    {/* ── Row 3: Facility/Room + Room Type | Checkin/out status ── */}
                    <div className="flex sm:flex-row flex-col flex-wrap gap-[1rem] sm:gap-0 mt-[2rem] sm:mt-[2rem] px-[1rem] sm:pl-[2rem]">
                      <div className="flex sm:flex-row flex-col sm:justify-start lg:justify-between gap-4 sm:gap-0 sm:w-full lg:w-[60%]">
                        <div className="flex items-center sm:mr-8 lg:mr-0 w-full sm:w-auto lg:w-[45%]">
                          <FormLabel
                            className={cn(
                              'w-[16rem] sm:min-w-[9rem] lg:min-w-[9rem] xl:min-w-[9rem] font-bold text-black sm:text-[1.6rem] text-lg leading-[5%]'
                            )}
                          >
                            Cơ sở / Số phòng
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="facilityInput"
                            render={({ field: { onChange, value } }) => (
                              <CustomInput
                                inputMode="numeric"
                                lang="en"
                                onChange={(e) => {
                                  const val = e.target.value
                                  onChange(val === '' ? undefined : val)
                                }}
                                onBlur={(e) => {
                                  const trimmed = e.target.value.trim()
                                  onChange(trimmed === '' ? undefined : trimmed)
                                }}
                                value={value ?? ''}
                                className="w-[75%] sm:w-[15rem] xl:w-[18rem]"
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-center sm:mr-[5.2rem] lg:mr-0 w-full sm:w-auto lg:w-[45%]">
                          <FormLabel
                            className={cn(
                              'w-[9rem] sm:min-w-[9rem] lg:min-w-[9rem] xl:min-w-[9rem] font-bold text-black sm:text-[1.6rem] text-lg leading-[5%]'
                            )}
                          >
                            Loại phòng
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="selectRoomType"
                            render={({ field: { onChange, value } }) => (
                              <CustomSelectClean
                                customClassMain="xl:w-[21.2rem] sm:w-[18.2rem] h-[4rem] w-[75%]"
                                change={onChange}
                                selected={value}
                                option={roomTypeOptions}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex items-center mt-4 sm:w-[100%] lg:w-[40%]">
                        <p className="w-[9rem] sm:w-[9rem] lg:w-[9rem] font-bold text-lg sm:text-2xl">
                          Trạng thái
                        </p>
                        <div className="flex sm:gap-12 lg:gap-0 w-[80%]">
                          <Controller
                            control={form.control}
                            name="typeQuit"
                            render={({ field: { onChange, value } }) => (
                              <CustomSelectClean
                                customClassMain="xl:w-[21.2rem] sm:w-[18.2rem] h-[4rem] w-[75%] flex-shrink-0"
                                change={onChange}
                                selected={value}
                                option={typeQuitOptions}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Row 4: Register + Updater | Billing/Sale ── */}
                    <div className="flex sm:flex-row flex-col flex-wrap gap-[1rem] sm:gap-0 mt-[2rem] sm:mt-[2rem] px-[1rem] sm:pl-[2rem]">
                      <div className="flex sm:flex-row flex-col sm:justify-start lg:justify-between gap-4 sm:gap-0 sm:w-full lg:w-[60%]">
                        <div className="flex items-center sm:mr-8 lg:mr-0 w-full sm:w-auto lg:w-[45%]">
                          <FormLabel
                            className={cn(
                              'flex-shrink-0 w-[16rem] sm:min-w-[9rem] lg:min-w-[9rem] xl:min-w-[9rem] font-bold text-black sm:text-[1.6rem] text-lg leading-[5%]'
                            )}
                          >
                            Người tạo
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="selectRegister"
                            render={({ field: { onChange, value } }) => (
                              <CustomSelectClean
                                customClassMain="xl:w-[21.2rem] sm:w-[18.2rem] h-[4rem] w-[75%] flex-shrink-0"
                                change={onChange}
                                selected={value}
                                option={staffOptions}
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-center w-full lg:w-[47%] xl:w-[45%]">
                          <FormLabel
                            className={cn(
                              'w-[9rem] sm:w-[25%] sm:min-w-[9rem] font-bold text-[1.6rem] text-black'
                            )}
                          >
                            Người cập nhật
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="selectUpdater"
                            render={({ field: { onChange, value } }) => (
                              <CustomSelectClean
                                customClassMain="xl:w-[21.2rem] sm:w-[18.2rem] h-[4rem] w-[75%]"
                                change={onChange}
                                selected={value}
                                option={staffOptions}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex items-center mt-4 sm:w-[100%] lg:w-[40%]">
                        <p className="w-[9rem] sm:w-[9rem] lg:w-[9rem] font-bold text-lg sm:text-2xl">
                          Hóa đơn/Doanh thu
                        </p>
                        <div className="flex sm:gap-12 lg:gap-0 w-[80%]">
                          <CheckboxField control={form.control} name="typeSale.noRequest" id="cb-no-request" label="Chưa lập HĐ" className="lg:w-[33%]" />
                          <CheckboxField control={form.control} name="typeSale.noSale" id="cb-no-sale" label="Chưa doanh thu" className="lg:w-[33%]" />
                          <CheckboxField control={form.control} name="typeSale.mismatch" id="cb-mismatch" label="HĐ≠DT" className="lg:w-[33%]" />
                        </div>
                      </div>
                    </div>

                    {/* ── Row 5: Phone + Staff name | Stay duration ── */}
                    <div className="flex sm:flex-row flex-col flex-wrap gap-[1rem] sm:gap-0 mt-[2rem] sm:mt-[2rem] px-[1rem] sm:pl-[2rem]">
                      <div className="flex sm:flex-row flex-col sm:justify-start lg:justify-between gap-4 sm:gap-0 sm:w-full lg:w-[60%]">
                        <div className="flex items-center sm:mr-8 lg:mr-0 w-full sm:w-auto lg:w-[45%]">
                          <FormLabel
                            className={cn(
                              'w-[16rem] sm:min-w-[9rem] lg:min-w-[9rem] xl:min-w-[9rem] font-bold text-black sm:text-[1.6rem] text-lg leading-[5%]'
                            )}
                          >
                            Số điện thoại
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="telPhone"
                            render={({ field: { onChange, value } }) => (
                              <CustomInput
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (/^[0-9 +\-]*$/.test(val)) {
                                    onChange(val)
                                  }
                                }}
                                onBlur={(e) => {
                                  onChange(e.target.value.trim())
                                }}
                                inputMode="numeric"
                                lang="en"
                                value={value ?? ''}
                                className="w-[75%] sm:w-[15rem] xl:w-[18rem]"
                              />
                            )}
                          />
                        </div>
                        <div className="flex items-center sm:mr-[5.2rem] lg:mr-0 w-full sm:w-auto lg:w-[45%]">
                          <p className="w-[9rem] sm:w-[9rem] lg:w-[9rem] font-bold text-lg sm:text-2xl">
                            NV phụ trách
                          </p>
                          <div className="flex flex-col">
                            <Controller
                              control={form.control}
                              name="chargeStaffName"
                              render={({ field: { onChange, value } }) => (
                                <CustomInput
                                  onChange={onChange}
                                  onBlur={(e) => {
                                    const trimmed = e.target.value.trim()
                                    onChange(trimmed === '' ? undefined : trimmed)
                                  }}
                                  value={value ?? ''}
                                  className="w-[75%] sm:w-[15rem] xl:w-[18rem]"
                                />
                              )}
                            />
                            <FormMessage className="mt-[0.5rem] font-bold text-[1rem] text-red">
                              {form.formState.errors.chargeStaffName?.message}
                            </FormMessage>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mt-4 sm:w-[100%] lg:w-[40%]">
                        <p className="w-[9rem] sm:w-[9rem] lg:w-[9rem] font-bold text-lg sm:text-2xl">
                          Thời gian lưu trú
                        </p>
                        <div className="flex sm:gap-12 lg:gap-0 w-[80%]">
                          <CheckboxField control={form.control} name="moreThanOneWeek" id="cb-one-week" label="7+ đêm" className="lg:w-[33%]" />
                        </div>
                      </div>
                    </div>

                    {/* ── Search/Clear Buttons ── */}
                    <div className="flex justify-center items-center gap-[1.5rem] sm:gap-[2rem] mt-[2rem] mb-[3.2rem]">
                      <NButton className="bg-[#efefef] w-[6.6rem] sm:w-[8rem]">
                        <span className="text-lg sm:text-2xl">Tìm kiếm</span>
                      </NButton>
                      <NButton
                        type="button"
                        onClick={handleClear}
                        className="bg-[#efefef] w-[6.6rem] sm:w-[8rem]"
                      >
                        <span className="text-lg sm:text-2xl">Xóa</span>
                      </NButton>
                    </div>
                  </div>
                </CustomAccordionContent>
              </CustomAccordionItem>
            </CustomAccordion>
          </div>
        </form>
      </FormProvider>

      {/* ─── Result Table Section ─────────────────────── */}
      <section className="mt-[2rem]">
        <BookingTable
          data={items}
          page={page}
          setPage={setPage}
          dataPagination={meta}
          isLoading={isLoading}
          sort={sortParam.sort}
          direction={sortParam.direction}
          sortParam={handleSortChange}
          selectedSortOption={getSelectedSortOption()}
          onNavigateEdit={(id) => navigate({ to: `/reservations/${id}/edit` })}
          onNavigateCreate={() =>
            navigate({
              to: '/reservations/create',
            })
          }
        />
      </section>
    </main>
  )
}

// ─── Checkbox Field Helper ──────────────────────────────────────────
function CheckboxField({
  control,
  name,
  id,
  label,
  className,
}: {
  control: ReturnType<typeof useForm<SearchFormType>>['control']
  name: string
  id: string
  label: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Controller
        control={control}
        name={name as keyof SearchFormType}
        render={({ field: { onChange, value } }) => (
          <CustomCheckbox checked={!!value} onCheckedChange={onChange} id={id} />
        )}
      />
      <div className="gap-1 grid leading-none">
        <label
          htmlFor={id}
          className="peer-disabled:opacity-70 max-sm:w-[4rem] font-bold max-sm:text-sm text-xl leading-none peer-disabled:cursor-not-allowed"
        >
          {label}
        </label>
      </div>
    </div>
  )
}

// ─── Booking Table Component ────────────────────────────────────────
interface BookingTableProps {
  data: Reservation[]
  page: number
  setPage: (page: number) => void
  dataPagination: PaginationData
  isLoading: boolean
  sort: string
  direction: string
  sortParam: (option: Option) => void
  selectedSortOption?: Option
  onNavigateEdit: (id: number) => void
  onNavigateCreate: () => void
}

function BookingTable({
  data,
  page,
  setPage,
  dataPagination,
  isLoading,
  sortParam,
  selectedSortOption,
  onNavigateEdit,
  onNavigateCreate,
}: BookingTableProps) {
  return (
    <div className="relative flex flex-col gap-[2.3rem]">
      {/* ── Top pagination + sort ── */}
      <div className="flex items-center w-[100%]">
        <CustomPagination
          totalPage={dataPagination.totalPages}
          disabled={isLoading}
          page={page}
          setPage={setPage}
          dataPagination={dataPagination}
        />
        <div className="inline-flex justify-end items-center gap-9 w-full">
          <div className="text-[1.6rem] whitespace-nowrap">Thứ tự hiển thị</div>
          <div className="w-[19rem] max-sm:w-[12rem]">
            <CustomSelectClean
              option={sortOptions}
              customClassMain="h-14 w-[19rem]"
              selected={selectedSortOption}
              change={(e: Option) => sortParam(e)}
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="relative grid w-full overflow-y-auto">
        <CustomTable
          scrollClass=" max-h-[80rem] h-full min-w-[90rem] "
          className="[&_thead_th]:top-0 [&_thead_th]:sticky [&_th]:bg-[#eee] [&_td]:border-black [&_th]:!border-t [&_td]:border-r [&_th]:border-r [&_td]:border-b [&_th]:border-b [&_td:first-child]:border-l [&_th:not(:first-child)]:!border-l-0 w-full [&_td]:h-14 [&_th]:h-14 text-[1.6rem] [&_th]:text-center border-separate border-spacing-0"
        >
          <CustomTableHeader>
            <CustomTableRow>
              {/* Col 1: Cơ sở / Số phòng */}
              <CustomTableHead className="flex-1 shadow-none p-0 w-[8rem] font-bold whitespace-nowrap">
                <div>
                  <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                    <div className="min-h-14 leading-none center-all">Cơ sở</div>
                  </div>
                  <div>
                    <div className="min-h-14 leading-none center-all">
                      Số <br /> phòng
                    </div>
                  </div>
                </div>
              </CustomTableHead>
              {/* Col 2: Tên KH / Người liên hệ */}
              <CustomTableHead className="flex-1 shadow-none p-0 w-[20rem] font-bold whitespace-nowrap">
                <div>
                  <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                    <div className="min-h-14 leading-none center-all">Tên công ty/Khách</div>
                  </div>
                  <div>
                    <div className="min-h-14 leading-none center-all">Người liên hệ</div>
                  </div>
                </div>
              </CustomTableHead>
              {/* Col 3: Người ở / SĐT */}
              <CustomTableHead className="flex-1 shadow-none p-0 w-[13rem] font-bold whitespace-nowrap">
                <div>
                  <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                    <div className="min-h-14 leading-none center-all">Người ở</div>
                  </div>
                  <div>
                    <div className="min-h-14 leading-none center-all">Số điện thoại</div>
                  </div>
                </div>
              </CustomTableHead>
              {/* Col 4: Thời gian sử dụng / Trả phòng | Tự động gia hạn | Xác nhận */}
              <CustomTableHead className="flex-1 shadow-none p-0 w-[22rem] font-bold whitespace-nowrap">
                <div className="flex flex-col h-full text-center">
                  <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                    Thời gian sử dụng
                  </div>
                  <div className="flex flex-1">
                    <div className="border-black border-r border-dotted w-2/5 min-h-14 leading-none center-all">
                      Trả phòng
                    </div>
                    <div className="border-black border-r border-dotted w-2/5 min-h-14 leading-none center-all">
                      Tự động GH
                    </div>
                    <div className="w-1/5 min-h-14 leading-none center-all">Xác nhận</div>
                  </div>
                </div>
              </CustomTableHead>
              {/* Col 5: Giờ nhận phòng / Số chìa khóa */}
              <CustomTableHead className="flex-1 shadow-none p-0 font-bold whitespace-nowrap">
                <div>
                  <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                    <div className="min-h-14 leading-none whitespace-nowrap center-all">Giờ nhận phòng</div>
                  </div>
                  <div>
                    <div className="min-h-14 leading-none whitespace-nowrap center-all">Số chìa khóa</div>
                  </div>
                </div>
              </CustomTableHead>
              {/* Col 6: Số HĐ */}
              <CustomTableHead className="flex-1 shadow-none w-[10rem] font-bold whitespace-nowrap">
                Số HĐ
              </CustomTableHead>
              {/* Col 7: Số DT */}
              <CustomTableHead className="flex-1 shadow-none w-[5rem] font-bold whitespace-nowrap">
                Số DT
              </CustomTableHead>
              {/* Col 8: Ngày tạo / Ngày cập nhật */}
              <CustomTableHead className="flex-1 shadow-none p-0 w-[11rem] font-bold whitespace-nowrap">
                <div>
                  <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                    <div className="min-h-14 leading-none center-all">Ngày tạo</div>
                  </div>
                  <div>
                    <div className="min-h-14 leading-none center-all">Ngày cập nhật</div>
                  </div>
                </div>
              </CustomTableHead>
              {/* Col 9: Người tạo / Người cập nhật */}
              <CustomTableHead className="flex-1 shadow-none p-0 w-[11rem] font-bold whitespace-nowrap">
                <div>
                  <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                    <div className="min-h-14 leading-none center-all">Người tạo</div>
                  </div>
                  <div>
                    <div className="min-h-14 leading-none center-all">Người cập nhật</div>
                  </div>
                </div>
              </CustomTableHead>
              {/* Col 10: Thao tác */}
              <CustomTableHead className="flex-1 shadow-none w-[11rem] font-bold whitespace-nowrap">
                Thao tác
              </CustomTableHead>
            </CustomTableRow>
          </CustomTableHeader>
          <CustomTableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <CustomTableRow key={`skeleton-${index}`} className="h-[7rem]">
                    <CustomTableCell
                      colSpan={10}
                      className="font-bold text-[1.6rem] text-red-500 text-center"
                    >
                      <Skeleton className="bg-[rgba(0,0,0,.2)] rounded-[.5rem] w-full h-full" />
                    </CustomTableCell>
                  </CustomTableRow>
                ))
            ) : data && data.length > 0 ? (
              data.map((row, index) => {
                const isDeleted = row.cancelledAt !== null
                const isCountMismatch = false // placeholder for request_details_count !== sale_details_count
                const isDateMismatch = false // placeholder for staff_created_at !== staff_update_at

                return (
                  <CustomTableRow
                    key={row.reserveId ?? index}
                    className={cn('border-b border-black', {
                      '!bg-[#999999] hover:!bg-[#999999]': isDeleted,
                    })}
                  >
                    {/* Col 1: Facility / Room */}
                    <CustomTableCell className="p-0">
                      <div>
                        <div className="border-b border-dotted border-black center-all min-h-14 flex-1">
                          <div className="min-h-14 leading-none center-all">
                            <CustomTooltip text={`${row.facilityName ?? ''}`} />
                          </div>
                        </div>
                        <div>
                          <div className="min-h-14 leading-none center-all">
                            <CustomTooltip text={`${row.roomNumber ?? ''}`} />
                          </div>
                        </div>
                      </div>
                    </CustomTableCell>
                    {/* Col 2: Client name / Contact */}
                    <CustomTableCell className="p-0">
                      <div>
                        <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                          <div className="min-h-14 leading-none center-all">
                            <CustomTooltip text={`${row.clientName ?? ''}`} />
                          </div>
                        </div>
                        <div>
                          <div className="min-h-14 leading-none center-all">
                            <CustomTooltip text={`${row.chargeStaffName ?? ''}`} />
                          </div>
                        </div>
                      </div>
                    </CustomTableCell>
                    {/* Col 3: Occupier / Phone */}
                    <CustomTableCell className="p-0">
                      <div>
                        <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                          <div className="flex flex-col justify-center items-start m-[auto] min-h-14 max-h-[10.5rem] overflow-hidden text-ellipsis leading-none center-all">
                            <CustomTooltip
                              triggerClass="h-[3.5rem] flex-shrink-0 flex items-center"
                              text={`${row.clientNameEn ?? row.clientName ?? ''}`}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="min-h-14 leading-none center-all">
                            <CustomTooltip text="-" />
                          </div>
                        </div>
                      </div>
                    </CustomTableCell>
                    {/* Col 4: Period / Exit | Auto extend | Confirm */}
                    <CustomTableCell className="p-0">
                      <div className="flex flex-col h-full text-center">
                        <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                          {row.periodFrom ? `${dayjs(row.periodFrom).format('YYYY/MM/DD')} ~ ` : ''}
                          {row.periodTo ? dayjs(row.periodTo).format('YYYY/MM/DD') : ''}
                        </div>
                        <div className="flex flex-1">
                          <div
                            className={cn(
                              'w-2/5 center-all leading-none min-h-14 border-r border-black border-dotted',
                              { '!bg-[#999999]': isDeleted }
                            )}
                          >
                            {row.earlyExitDatetime
                              ? dayjs(row.earlyExitDatetime).format('YYYY/MM/DD')
                              : row.periodTo && row.keyReturnFlag
                                ? dayjs(row.periodTo).format('YYYY/MM/DD')
                                : null}
                          </div>
                          <div className="border-black border-r border-dotted w-2/5 min-h-14 leading-none center-all">
                            {row.autoExtendFlag ? 'Có' : 'Không'}
                          </div>
                          <div className="w-1/5 min-h-14 leading-none center-all">
                            {row.confirmFlag ? 'Đã XN' : 'Chưa'}
                          </div>
                        </div>
                      </div>
                    </CustomTableCell>
                    {/* Col 5: Checkin time / Keys */}
                    <CustomTableCell className="!bg-white p-0">
                      <div>
                        <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                          <div className="min-h-14 leading-none center-all">
                            {row.periodFrom
                              ? new Date(row.periodFrom).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="min-h-14 leading-none center-all">
                            {row.rentalKeys ?? 0} chìa
                          </div>
                        </div>
                      </div>
                    </CustomTableCell>
                    {/* Col 6: Request count */}
                    <CustomTableCell
                      className={cn('text-center', {
                        'bg-red-300': isCountMismatch,
                        '!bg-[#999999]': isDeleted,
                      })}
                    >
                      0
                    </CustomTableCell>
                    {/* Col 7: Sale count */}
                    <CustomTableCell
                      className={cn('text-center', {
                        'bg-red-300': isCountMismatch,
                        '!bg-[#999999]': isDeleted,
                      })}
                    >
                      0
                    </CustomTableCell>
                    {/* Col 8: Created at / Updated at */}
                    <CustomTableCell className="p-0 h-full">
                      <div
                        className={cn(
                          'border-b border-black border-dotted center-all h-1/2 flex-1',
                          { 'bg-[#f1f38b]': isDateMismatch, '!bg-[#999999]': isDeleted }
                        )}
                      >
                        <div className="min-h-14 text-center leading-none center-all">
                          {dayjs(row.createdAt).format('YYYY/MM/DD HH:mm')}
                        </div>
                      </div>
                      <div
                        className={cn('center-all leading-none h-1/2', {
                          'bg-[#f1f38b]': isDateMismatch,
                          '!bg-[#999999]': isDeleted,
                        })}
                      >
                        <div className="min-h-14 text-center leading-none center-all">
                          {dayjs(row.updatedAt).format('YYYY/MM/DD HH:mm')}
                        </div>
                      </div>
                    </CustomTableCell>
                    {/* Col 9: Created by / Updated by */}
                    <CustomTableCell className="p-0">
                      <div>
                        <div className="flex-1 border-black border-b border-dotted min-h-14 center-all">
                          <div className="min-h-14 leading-none center-all">
                            <CustomTooltip text={`${row.chargeStaffName ?? '-'}`} />
                          </div>
                        </div>
                        <div>
                          <div className="max-w-full min-h-14 leading-none center-all">
                            <CustomTooltip text={`${row.confirmStaffName ?? '-'}`} />
                          </div>
                        </div>
                      </div>
                    </CustomTableCell>
                    {/* Col 10: Actions */}
                    <CustomTableCell className="px-0">
                      {row.cancelledAt === null && row.reserveId && !row.draftFlag && (
                        <div className="flex flex-col items-center gap-2">
                          <NButton
                            onClick={() => onNavigateEdit(row.reserveId)}
                            className="bg-[#efefef] w-[6rem]"
                          >
                            <span className="text-sm sm:text-xl">Sửa</span>
                          </NButton>
                        </div>
                      )}
                      {row.draftFlag && (
                        <div className="flex flex-col items-center gap-2">
                          <NButton
                            type="button"
                            onClick={() => onNavigateCreate()}
                            className="bg-[#efefef] w-[6rem]"
                          >
                            <span className="text-sm sm:text-xl whitespace-nowrap">Đặt chính</span>
                          </NButton>
                        </div>
                      )}
                      {row.cancelledAt !== null && (
                        <div className="text-center">
                          <p className="text-3xl">Đã xóa</p>
                        </div>
                      )}
                    </CustomTableCell>
                  </CustomTableRow>
                )
              })
            ) : (
              <CustomTableRow>
                <CustomTableCell
                  colSpan={10}
                  className="font-bold text-[1.6rem] text-red-500 text-center"
                >
                  Không có dữ liệu phù hợp
                </CustomTableCell>
              </CustomTableRow>
            )}
          </CustomTableBody>
        </CustomTable>
      </div>

      {/* ── Bottom pagination ── */}
      <div className="flex items-center mb-[2rem] w-[100%]">
        <CustomPagination
          totalPage={dataPagination.totalPages}
          page={page}
          setPage={setPage}
          dataPagination={dataPagination}
          disabled={isLoading}
        />
      </div>

      {/* ── Loading overlay ── */}
      {isLoading && (
        <div className="top-[6.3rem] right-0 bottom-[8.3rem] left-0 absolute flex justify-center items-center bg-[rgba(0,0,0,.2)]">
          <div className="animate-spin gradient-circle" />
        </div>
      )}
    </div>
  )
}
