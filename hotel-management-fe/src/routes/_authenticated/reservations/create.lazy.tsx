import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDocumentTitle } from 'usehooks-ts'
import { z } from 'zod'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import CustomSelect from '@/components/common/CustomSelect'
import type { Option } from '@/components/common/CustomSelectClean'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { NButton } from '@/components/ui/new-button'

import { useGetClients } from '@/hooks/queries/useGetClients'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'
import { useCreateReservation } from '@/hooks/queries/useReservations'
import { cn } from '@/lib/utils'
import type { CreateReservationBody } from '@/types/reservation'

export const Route = createLazyFileRoute('/_authenticated/reservations/create')({
  component: ReservationCreatePage,
})

// ─── Constants ────────────────────────────────────────────────────────
const ConfirmFlagOptions = [
  { label: 'Chưa xác nhận', value: '0' },
  { label: 'Đã xác nhận', value: '1' },
]

const DirectCheckinTypeOptions: Option[] = [
  { label: 'Đến trực tiếp', value: '1' },
  { label: 'Tòa nhà 6', value: '2' },
  { label: 'D/I', value: '3' },
  { label: 'YCAT', value: '4' },
  { label: 'Giao phòng', value: '5' },
]

const AdvertisingTypeOptions: Option[] = [
  { label: 'Không', value: '' },
  { label: 'Khách quen', value: '1' },
  { label: 'Walk-in', value: '2' },
  { label: 'Trang chủ', value: '3' },
  { label: 'Rakuten', value: '4' },
  { label: 'English Site', value: '5' },
  { label: 'Khác', value: '9' },
]

const RentalKeysOptions: Option[] = Array.from({ length: 7 }, (_, i) => ({
  label: String(i),
  value: String(i),
}))

// ─── Form Schema ──────────────────────────────────────────────────────
const ReservationFormSchema = z
  .object({
    // Client
    client_id: z.string().min(1, 'Vui lòng chọn khách hàng'),

    // Location
    facility_id: z.object({ label: z.string(), value: z.string() }),
    room_id: z.object({ label: z.string(), value: z.string() }),
    stay_type_id: z.object({ label: z.string(), value: z.string() }),

    // Period
    period_from: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
    period_to: z.date({ required_error: 'Vui lòng chọn ngày kết thúc' }),

    // Pricing
    booking_unit_price: z.string().optional(),
    adjustment_unit_price: z.string().optional(),
    deposit: z.string().optional(),

    // Flags
    confirm_flag: z.string(),
    auto_extend_flag: z.boolean(),
    campaign_price_flag: z.boolean(),
    futon_flag: z.boolean(),
    deliverybox_flag: z.boolean(),
    deliverybox_card_number: z.string().max(16).optional(),

    // Direct checkin
    directcheckin_flag: z.boolean(),
    directcheckin_type: z.object({ label: z.string(), value: z.string() }).optional(),
    directcheckin_note: z.string().max(256).optional(),

    // Pet
    pet_flag: z.boolean(),
    dog_count: z.string().optional(),
    cat_count: z.string().optional(),
    other_count: z.string().optional(),
    pet_note: z.string().max(256).optional(),

    // Notes
    note: z.string().max(1024).optional(),
    memo: z.string().optional(),
    amendment: z.string().max(128).optional(),
    announcement: z.string().max(1024).optional(),
    request_announcement: z.string().max(1024).optional(),
    sale_announcement: z.string().max(1024).optional(),

    // Staff
    charge_staff_id: z.object({ label: z.string(), value: z.string() }),
    charge_staff_id_2: z.object({ label: z.string(), value: z.string() }),
    di_contact_staff_id: z.object({ label: z.string(), value: z.string() }),

    // Advertising
    advertising_type: z.object({ label: z.string(), value: z.string() }),

    // Reserve type
    reserve_type: z.string().optional(),

    // Rental keys
    rental_keys: z.object({ label: z.string(), value: z.string() }),
  })
  .superRefine((data, ctx) => {
    if (data.period_from && data.period_to && data.period_from >= data.period_to) {
      ctx.addIssue({
        code: 'custom',
        path: ['period_to'],
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
      })
    }
    if (data.deposit && !/^\d*$/.test(data.deposit)) {
      ctx.addIssue({
        code: 'custom',
        path: ['deposit'],
        message: 'Tiền đặt cọc phải là số',
      })
    }
    if (data.booking_unit_price && !/^\d*$/.test(data.booking_unit_price)) {
      ctx.addIssue({
        code: 'custom',
        path: ['booking_unit_price'],
        message: 'Đơn giá phải là số',
      })
    }
    if (data.adjustment_unit_price && !/^\d*$/.test(data.adjustment_unit_price)) {
      ctx.addIssue({
        code: 'custom',
        path: ['adjustment_unit_price'],
        message: 'Giá điều chỉnh phải là số',
      })
    }
  })

type ReservationFormType = z.infer<typeof ReservationFormSchema>

const defaultValues: ReservationFormType = {
  client_id: '',
  facility_id: { label: '', value: '' },
  room_id: { label: '', value: '' },
  stay_type_id: { label: '', value: '' },
  period_from: undefined as unknown as Date,
  period_to: undefined as unknown as Date,
  booking_unit_price: '',
  adjustment_unit_price: '',
  deposit: '0',
  confirm_flag: '0',
  auto_extend_flag: false,
  campaign_price_flag: false,
  futon_flag: false,
  deliverybox_flag: false,
  deliverybox_card_number: '',
  directcheckin_flag: false,
  directcheckin_type: { label: '', value: '' },
  directcheckin_note: '',
  pet_flag: false,
  dog_count: '',
  cat_count: '',
  other_count: '',
  pet_note: '',
  note: '',
  memo: '',
  amendment: '',
  announcement: '',
  request_announcement: '',
  sale_announcement: '',
  charge_staff_id: { label: '', value: '' },
  charge_staff_id_2: { label: '', value: '' },
  di_contact_staff_id: { label: '', value: '' },
  advertising_type: { label: '', value: '' },
  reserve_type: '',
  rental_keys: { label: '0', value: '0' },
}

// ─── Helper: Auto-detect stay type from period ────────────────────────
function calcStayTypeId(from: Date | null, to: Date | null): string {
  if (!from || !to) return ''
  const diffDays = dayjs(to).diff(dayjs(from), 'day')
  const diffMonths = dayjs(to).diff(dayjs(from), 'month')
  if (diffDays <= 7) return '1' // Short stay
  if (diffMonths < 1) return '2' // Weekly
  if (diffMonths < 3) return '5' // 1-3 months
  if (diffMonths < 7) return '6' // 3-7 months
  return '7' // 7+ months
}

// ─── Main Component ───────────────────────────────────────────────────
function ReservationCreatePage() {
  useDocumentTitle('Tạo đặt phòng mới')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [clientSearchText, setClientSearchText] = useState('')
  const [selectedClientName, setSelectedClientName] = useState('')

  // ─── Data Queries ─────────────────────────────────────
  const { data: facilitiesData } = useGetFacilities()
  const { data: stayTypesData } = useGetStayTypes()
  const { data: staffsData } = useGetStaffs({})
  const { data: clientsData } = useGetClients({
    params: clientSearchText ? { search: clientSearchText } : undefined,
  })

  // Options for selects
  const facilityOptions = useMemo(() => {
    const items = facilitiesData?.data ?? []
    return items.map((f) => ({
      label: f.facilityName || `Cơ sở ${f.facilityId}`,
      value: String(f.facilityId),
    }))
  }, [facilitiesData])

  const stayTypeOptions = useMemo(() => {
    const items = (stayTypesData as unknown as { stayTypeId: number; stayTypeName: string }[]) ?? []
    return items.map((s) => ({
      label: s.stayTypeName || `Loại ${s.stayTypeId}`,
      value: String(s.stayTypeId),
    }))
  }, [stayTypesData])

  const staffOptions = useMemo(() => {
    const items = staffsData ?? []
    return items.map((s) => ({
      label: s.staffName || `NV ${s.staffId}`,
      value: String(s.staffId),
    }))
  }, [staffsData])

  const clientOptions = useMemo(() => {
    const items = clientsData?.items ?? []
    return items.map((c) => ({
      label: c.clientName || `KH ${c.clientId}`,
      value: String(c.clientId),
    }))
  }, [clientsData])

  // ─── Form ─────────────────────────────────────────────
  const form = useForm<ReservationFormType>({
    mode: 'all',
    resolver: zodResolver(ReservationFormSchema),
    defaultValues,
  })

  const watchFacilityId = form.watch('facility_id')
  const watchDirectCheckin = form.watch('directcheckin_flag')
  const watchPetFlag = form.watch('pet_flag')
  const watchDeliveryboxFlag = form.watch('deliverybox_flag')
  const watchPeriodFrom = form.watch('period_from')
  const watchPeriodTo = form.watch('period_to')

  // Room options depend on selected facility
  const { data: roomsData } = useGetRooms({
    params: watchFacilityId?.value ? { facilityId: Number(watchFacilityId.value) } : undefined,
  })

  const roomOptions = useMemo(() => {
    const items = roomsData?.data ?? []
    return items.map((r) => ({
      label: r.roomNumber || `Phòng ${r.roomId}`,
      value: String(r.roomId),
    }))
  }, [roomsData])

  // Auto-detect stay type when period changes
  useEffect(() => {
    if (watchPeriodFrom && watchPeriodTo) {
      const autoStayType = calcStayTypeId(watchPeriodFrom, watchPeriodTo)
      if (autoStayType) {
        const match = stayTypeOptions.find((o) => o.value === autoStayType)
        if (match) {
          form.setValue('stay_type_id', match)
        }
      }
    }
  }, [watchPeriodFrom, watchPeriodTo, stayTypeOptions, form])

  // Reset room when facility changes
  useEffect(() => {
    if (watchFacilityId) {
      form.setValue('room_id', { label: '', value: '' })
    }
  }, [watchFacilityId, form])

  // ─── Mutation ─────────────────────────────────────────
  const createMutation = useCreateReservation()

  // ─── Submit Handler ───────────────────────────────────
  const onSubmit = (data: ReservationFormType) => {
    setLoadingSubmit(true)
    setIsConfirmDialogOpen(false)

    const body: CreateReservationBody = {
      clientId: Number(data.client_id),
      facilityId: data.facility_id.value ? Number(data.facility_id.value) : undefined,
      roomId: data.room_id.value ? Number(data.room_id.value) : undefined,
      stayTypeId: data.stay_type_id.value ? Number(data.stay_type_id.value) : undefined,
      periodFrom: dayjs(data.period_from).toISOString(),
      periodTo: dayjs(data.period_to).toISOString(),
      bookingUnitPrice: data.booking_unit_price ? Number(data.booking_unit_price) : undefined,
      adjustmentUnitPrice: data.adjustment_unit_price
        ? Number(data.adjustment_unit_price)
        : undefined,
      deposit: data.deposit ? Number(data.deposit) : undefined,
      confirmFlag: data.confirm_flag === '1',
      autoExtendFlag: data.auto_extend_flag,
      campaignPriceFlag: data.campaign_price_flag,
      futonFlag: data.futon_flag,
      deliveryboxFlag: data.deliverybox_flag,
      deliveryboxCardNumber: data.deliverybox_card_number || undefined,
      directcheckinFlag: data.directcheckin_flag,
      directcheckinType: data.directcheckin_type?.value
        ? Number(data.directcheckin_type.value)
        : undefined,
      directcheckinNote: data.directcheckin_note || undefined,
      petFlag: data.pet_flag,
      dogCount: data.dog_count ? Number(data.dog_count) : undefined,
      catCount: data.cat_count ? Number(data.cat_count) : undefined,
      otherCount: data.other_count ? Number(data.other_count) : undefined,
      petNote: data.pet_note || undefined,
      note: data.note || undefined,
      memo: data.memo || undefined,
      amendment: data.amendment || undefined,
      announcement: data.announcement || undefined,
      requestAnnouncement: data.request_announcement || undefined,
      saleAnnouncement: data.sale_announcement || undefined,
      chargeStaffId: data.charge_staff_id.value ? Number(data.charge_staff_id.value) : undefined,
      chargeStaffId2: data.charge_staff_id_2.value
        ? Number(data.charge_staff_id_2.value)
        : undefined,
      diContactStaffId: data.di_contact_staff_id.value
        ? Number(data.di_contact_staff_id.value)
        : undefined,
      advertisingType: data.advertising_type.value
        ? Number(data.advertising_type.value)
        : undefined,
      reserveType: data.reserve_type ? Number(data.reserve_type) : undefined,
    }

    createMutation.mutate(body, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reservations'] })
        navigate({ to: '/reservations' })
      },
      onError: () => {
        setLoadingSubmit(false)
      },
    })
  }

  const handleOpenConfirmDialog = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      setIsConfirmDialogOpen(true)
    }
  }

  return (
    <div className="common-container">
      <div className="pt-16 pb-52">
        {/* ─── Header ──────────────────────────────────── */}
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">Tạo đặt phòng mới</div>
        </div>

        <section className="mt-[2.2rem]">
          <Form {...form}>
            <form
              id="reservationCreateForm"
              className={cn('transition-all duration-300', {
                'opacity-60': loadingSubmit,
                'pointer-events-none': loadingSubmit,
              })}
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <CustomAccordion
                type="multiple"
                defaultValue={['client-info', 'reserve-info', 'notes-info']}
                className="w-full"
              >
                {/* ═══════════════════════════════════════════════
                    SECTION 1: Thông tin khách hàng
                    ═══════════════════════════════════════════════ */}
                <CustomAccordionItem
                  className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                  value="client-info"
                >
                  <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                    <div className="flex justify-between">
                      <div className="flex sm:flex-row flex-col items-center text-[1.2rem] sm:text-[1.8rem]">
                        <div className="font-bold text-black">Thông tin khách hàng</div>
                      </div>
                    </div>
                  </CustomAccordionTrigger>
                  <CustomAccordionContent className="pb-0">
                    <div className="px-16 pt-[3.4rem] pb-16 rounded-[0_0_0.8rem_0.8rem] w-full">
                      {/* Client ID */}
                      <div className="flex flex-wrap items-center gap-[1rem] mb-8">
                        <FormField
                          control={form.control}
                          name="client_id"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="min-w-[15rem] font-bold text-[1.6rem]">
                                Mã khách hàng <span className="text-red-500">*</span>
                              </FormLabel>
                              <div className="flex items-center gap-4">
                                <FormControl>
                                  <CustomInput
                                    {...field}
                                    className="w-[16rem]"
                                    placeholder="Nhập mã KH"
                                    onChange={(e) => {
                                      field.onChange(e.target.value)
                                      setClientSearchText(e.target.value)
                                    }}
                                  />
                                </FormControl>
                                {selectedClientName && (
                                  <span className="text-[1.4rem] text-gray-600">
                                    {selectedClientName}
                                  </span>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Client search results */}
                      {clientSearchText && clientOptions.length > 0 && (
                        <div className="mb-8 ml-[19rem] border rounded-md max-h-[20rem] overflow-y-auto w-[40rem]">
                          {clientOptions.map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[1.4rem] border-b last:border-b-0"
                              onClick={() => {
                                form.setValue('client_id', opt.value)
                                setSelectedClientName(opt.label)
                                setClientSearchText('')
                              }}
                            >
                              <span className="font-medium">{opt.value}</span> - {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Advertising Type */}
                      <div className="flex flex-wrap items-center gap-[1rem] mb-8">
                        <FormField
                          control={form.control}
                          name="advertising_type"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="min-w-[15rem] font-bold text-[1.6rem]">
                                Nguồn quảng cáo
                              </FormLabel>
                              <FormControl>
                                <CustomSelectClean
                                  option={AdvertisingTypeOptions}
                                  selected={field.value}
                                  change={(val) => field.onChange(val)}
                                  customClassMain="min-w-[20rem]"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CustomAccordionContent>
                </CustomAccordionItem>

                {/* ═══════════════════════════════════════════════
                    SECTION 2: Thông tin đặt phòng
                    ═══════════════════════════════════════════════ */}
                <CustomAccordionItem
                  className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                  value="reserve-info"
                >
                  <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                    <div className="flex justify-between">
                      <div className="flex sm:flex-row flex-col items-center text-[1.2rem] sm:text-[1.8rem]">
                        <div className="font-bold text-black">
                          Thông tin đặt phòng &amp; thanh toán
                        </div>
                      </div>
                    </div>
                  </CustomAccordionTrigger>
                  <CustomAccordionContent className="pb-0">
                    <div className="px-16 pt-[3.4rem] pb-16 rounded-[0_0_0.8rem_0.8rem] w-full">
                      {/* ── Location Selects (Table-style) ── */}
                      <div className="border rounded-md mb-8">
                        <table className="w-full text-[1.4rem]">
                          <tbody>
                            {/* Facility */}
                            <tr className="border-b">
                              <td className="px-4 py-3 font-bold bg-gray-50 w-[15rem]">Cơ sở</td>
                              <td className="px-4 py-3">
                                <Controller
                                  control={form.control}
                                  name="facility_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={facilityOptions}
                                      selected={field.value}
                                      change={(val) => field.onChange(val)}
                                      customClassMain="min-w-[25rem]"
                                    />
                                  )}
                                />
                              </td>
                            </tr>
                            {/* Room */}
                            <tr className="border-b">
                              <td className="px-4 py-3 font-bold bg-gray-50 w-[15rem]">Số phòng</td>
                              <td className="px-4 py-3">
                                <Controller
                                  control={form.control}
                                  name="room_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={roomOptions}
                                      selected={field.value}
                                      change={(val) => field.onChange(val)}
                                      customClassMain="min-w-[25rem]"
                                      disabledSelect={!watchFacilityId?.value}
                                    />
                                  )}
                                />
                              </td>
                            </tr>
                            {/* Stay Type */}
                            <tr>
                              <td className="px-4 py-3 font-bold bg-gray-50 w-[15rem]">
                                Loại lưu trú
                              </td>
                              <td className="px-4 py-3">
                                <Controller
                                  control={form.control}
                                  name="stay_type_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={stayTypeOptions}
                                      selected={field.value}
                                      change={(val) => field.onChange(val)}
                                      customClassMain="min-w-[25rem]"
                                    />
                                  )}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* ── Period ── */}
                      <div className="flex flex-wrap items-center gap-[2rem] mb-8">
                        <FormField
                          control={form.control}
                          name="period_from"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="min-w-[15rem] font-bold text-[1.6rem]">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <CustomDatePicker
                                  value={field.value ?? null}
                                  change={(date) => {
                                    if (date instanceof Date) {
                                      field.onChange(date)
                                    } else {
                                      field.onChange(null)
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <span className="text-[1.6rem]">〜</span>
                        <FormField
                          control={form.control}
                          name="period_to"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="font-bold text-[1.6rem]">
                                Ngày kết thúc <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <CustomDatePicker
                                  value={field.value ?? null}
                                  change={(date) => {
                                    if (date instanceof Date) {
                                      field.onChange(date)
                                    } else {
                                      field.onChange(null)
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* ── Confirm & Staff ── */}
                      <div className="flex flex-wrap items-center gap-[2rem] mb-8">
                        <FormField
                          control={form.control}
                          name="confirm_flag"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="min-w-[15rem] font-bold text-[1.6rem]">
                                Xác nhận
                              </FormLabel>
                              <FormControl>
                                <CustomSelect
                                  option={ConfirmFlagOptions.map((o) => ({
                                    value: o.value,
                                    label: o.label,
                                  }))}
                                  selected={field.value}
                                  change={(val) => field.onChange(val.value)}
                                  customClassMain="min-w-[18rem]"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name="charge_staff_id"
                          render={({ field }) => (
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-[1.6rem]">NV phụ trách</span>
                              <CustomSelectClean
                                option={staffOptions}
                                selected={field.value}
                                change={(val) => field.onChange(val)}
                                customClassMain="min-w-[20rem]"
                              />
                            </div>
                          )}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-[2rem] mb-8">
                        <Controller
                          control={form.control}
                          name="charge_staff_id_2"
                          render={({ field }) => (
                            <div className="flex items-center gap-4">
                              <span className="min-w-[15rem] font-bold text-[1.6rem]">
                                NV phụ trách 2
                              </span>
                              <CustomSelectClean
                                option={staffOptions}
                                selected={field.value}
                                change={(val) => field.onChange(val)}
                                customClassMain="min-w-[20rem]"
                              />
                            </div>
                          )}
                        />
                      </div>

                      {/* ── Rental Keys ── */}
                      <div className="flex flex-wrap items-center gap-[2rem] mb-8">
                        <Controller
                          control={form.control}
                          name="rental_keys"
                          render={({ field }) => (
                            <div className="flex items-center gap-4">
                              <span className="min-w-[15rem] font-bold text-[1.6rem]">
                                Số chìa khóa
                              </span>
                              <CustomSelectClean
                                option={RentalKeysOptions}
                                selected={field.value}
                                change={(val) => field.onChange(val)}
                                customClassMain="min-w-[10rem]"
                              />
                            </div>
                          )}
                        />
                      </div>

                      {/* ── Pricing ── */}
                      <div className="flex flex-wrap items-start gap-[2rem] mb-8">
                        <FormField
                          control={form.control}
                          name="booking_unit_price"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="min-w-[15rem] font-bold text-[1.6rem]">
                                Đơn giá đặt phòng
                              </FormLabel>
                              <FormControl>
                                <CustomInput {...field} className="w-[16rem]" placeholder="0" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="adjustment_unit_price"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="font-bold text-[1.6rem]">
                                Giá điều chỉnh
                              </FormLabel>
                              <FormControl>
                                <CustomInput {...field} className="w-[16rem]" placeholder="0" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deposit"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="font-bold text-[1.6rem]">
                                Tiền đặt cọc
                              </FormLabel>
                              <FormControl>
                                <CustomInput {...field} className="w-[16rem]" placeholder="0" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* ── Flags ── */}
                      <div className="flex flex-wrap items-center gap-[3rem] mb-8">
                        <Controller
                          control={form.control}
                          name="auto_extend_flag"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <CustomCheckbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className="font-bold text-[1.4rem] cursor-pointer">
                                Không tự động gia hạn
                              </span>
                            </div>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name="campaign_price_flag"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <CustomCheckbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className="font-bold text-[1.4rem] cursor-pointer">
                                Giá khuyến mãi
                              </span>
                            </div>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name="futon_flag"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <CustomCheckbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className="font-bold text-[1.4rem] cursor-pointer">
                                Nệm futon
                              </span>
                            </div>
                          )}
                        />
                      </div>

                      {/* Deliverybox */}
                      <div className="flex flex-wrap items-center gap-[3rem] mb-8">
                        <Controller
                          control={form.control}
                          name="deliverybox_flag"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <CustomCheckbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className="font-bold text-[1.4rem] cursor-pointer">
                                Hộp giao hàng
                              </span>
                            </div>
                          )}
                        />
                        {watchDeliveryboxFlag && (
                          <FormField
                            control={form.control}
                            name="deliverybox_card_number"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-4">
                                <FormLabel className="font-bold text-[1.4rem]">
                                  Số thẻ hộp giao hàng
                                </FormLabel>
                                <FormControl>
                                  <CustomInput
                                    {...field}
                                    className="w-[16rem]"
                                    placeholder="Nhập số thẻ"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* ── Direct Checkin ── */}
                      <div className="mb-8">
                        <Controller
                          control={form.control}
                          name="directcheckin_flag"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <CustomCheckbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className="font-bold text-[1.4rem] cursor-pointer">
                                Nhận phòng trực tiếp (Direct Check-in)
                              </span>
                            </div>
                          )}
                        />
                        {watchDirectCheckin && (
                          <div className="mt-4 ml-8 p-6 border rounded-md bg-gray-50 space-y-4">
                            <Controller
                              control={form.control}
                              name="directcheckin_type"
                              render={({ field }) => (
                                <div className="flex items-center gap-4">
                                  <span className="min-w-[12rem] font-bold text-[1.4rem]">
                                    Loại check-in
                                  </span>
                                  <CustomSelectClean
                                    option={DirectCheckinTypeOptions}
                                    selected={field.value}
                                    change={(val) => field.onChange(val)}
                                    customClassMain="min-w-[20rem]"
                                  />
                                </div>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name="di_contact_staff_id"
                              render={({ field }) => (
                                <div className="flex items-center gap-4">
                                  <span className="min-w-[12rem] font-bold text-[1.4rem]">
                                    NV liên hệ D/I
                                  </span>
                                  <CustomSelectClean
                                    option={staffOptions}
                                    selected={field.value}
                                    change={(val) => field.onChange(val)}
                                    customClassMain="min-w-[20rem]"
                                  />
                                </div>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="directcheckin_note"
                              render={({ field }) => (
                                <FormItem className="flex items-start gap-4">
                                  <FormLabel className="min-w-[12rem] font-bold text-[1.4rem] mt-2">
                                    Ghi chú D/I
                                  </FormLabel>
                                  <FormControl>
                                    <CustomTextarea
                                      {...field}
                                      className="min-w-[30rem]"
                                      placeholder="Ghi chú nhận phòng trực tiếp..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      {/* ── Pet ── */}
                      <div className="mb-8">
                        <Controller
                          control={form.control}
                          name="pet_flag"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <CustomCheckbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className="font-bold text-[1.4rem] cursor-pointer">
                                Có thú cưng
                              </span>
                            </div>
                          )}
                        />
                        {watchPetFlag && (
                          <div className="mt-4 ml-8 p-6 border rounded-md bg-gray-50">
                            <div className="flex flex-wrap items-center gap-[2rem] mb-4">
                              <FormField
                                control={form.control}
                                name="dog_count"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2">
                                    <FormLabel className="font-bold text-[1.4rem]">Chó</FormLabel>
                                    <FormControl>
                                      <CustomInput
                                        {...field}
                                        className="w-[8rem]"
                                        placeholder="0"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="cat_count"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2">
                                    <FormLabel className="font-bold text-[1.4rem]">Mèo</FormLabel>
                                    <FormControl>
                                      <CustomInput
                                        {...field}
                                        className="w-[8rem]"
                                        placeholder="0"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="other_count"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2">
                                    <FormLabel className="font-bold text-[1.4rem]">Khác</FormLabel>
                                    <FormControl>
                                      <CustomInput
                                        {...field}
                                        className="w-[8rem]"
                                        placeholder="0"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="pet_note"
                              render={({ field }) => (
                                <FormItem className="flex items-start gap-4">
                                  <FormLabel className="min-w-[12rem] font-bold text-[1.4rem] mt-2">
                                    Ghi chú thú cưng
                                  </FormLabel>
                                  <FormControl>
                                    <CustomTextarea
                                      {...field}
                                      className="min-w-[30rem]"
                                      placeholder="Thông tin thú cưng..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CustomAccordionContent>
                </CustomAccordionItem>

                {/* ═══════════════════════════════════════════════
                    SECTION 3: Ghi chú & Thông báo
                    ═══════════════════════════════════════════════ */}
                <CustomAccordionItem
                  className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                  value="notes-info"
                >
                  <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                    <div className="flex justify-between">
                      <div className="flex sm:flex-row flex-col items-center text-[1.2rem] sm:text-[1.8rem]">
                        <div className="font-bold text-black">Ghi chú &amp; Thông báo</div>
                      </div>
                    </div>
                  </CustomAccordionTrigger>
                  <CustomAccordionContent className="pb-0">
                    <div className="px-16 pt-[3.4rem] pb-16 rounded-[0_0_0.8rem_0.8rem] w-full space-y-6">
                      {/* Note */}
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-4">
                            <FormLabel className="min-w-[15rem] font-bold text-[1.6rem] mt-2">
                              Ghi chú đặt phòng
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <CustomTextarea
                                  {...field}
                                  className="w-full"
                                  placeholder="Ghi chú đặt phòng..."
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Memo */}
                      <FormField
                        control={form.control}
                        name="memo"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-4">
                            <FormLabel className="min-w-[15rem] font-bold text-[1.6rem] mt-2">
                              Bản ghi nhớ
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <CustomTextarea
                                  {...field}
                                  className="w-full"
                                  placeholder="Bản ghi nhớ..."
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Amendment */}
                      <FormField
                        control={form.control}
                        name="amendment"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-4">
                            <FormLabel className="min-w-[15rem] font-bold text-[1.6rem] mt-2">
                              Sửa đổi
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <CustomTextarea
                                  {...field}
                                  className="w-full"
                                  placeholder="Nội dung sửa đổi..."
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Announcement */}
                      <FormField
                        control={form.control}
                        name="announcement"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-4">
                            <FormLabel className="min-w-[15rem] font-bold text-[1.6rem] mt-2">
                              Thông báo
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <CustomTextarea
                                  {...field}
                                  className="w-full"
                                  placeholder="Thông báo..."
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Request Announcement */}
                      <FormField
                        control={form.control}
                        name="request_announcement"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-4">
                            <FormLabel className="min-w-[15rem] font-bold text-[1.6rem] mt-2">
                              Thông báo yêu cầu
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <CustomTextarea
                                  {...field}
                                  className="w-full"
                                  placeholder="Thông báo yêu cầu..."
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Sale Announcement */}
                      <FormField
                        control={form.control}
                        name="sale_announcement"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-4">
                            <FormLabel className="min-w-[15rem] font-bold text-[1.6rem] mt-2">
                              Thông báo bán hàng
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <CustomTextarea
                                  {...field}
                                  className="w-full"
                                  placeholder="Thông báo bán hàng..."
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CustomAccordionContent>
                </CustomAccordionItem>
              </CustomAccordion>

              {/* ─── Bottom Action Buttons ─────────────────── */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 px-8 py-4">
                <div className="flex items-center justify-end gap-4">
                  <NButton type="button" onClick={() => navigate({ to: '/reservations' })}>
                    Hủy bỏ
                  </NButton>
                  <NButton type="button" onClick={handleOpenConfirmDialog} disabled={loadingSubmit}>
                    {loadingSubmit ? 'Đang xử lý...' : 'Tạo đặt phòng'}
                  </NButton>
                </div>
              </div>
            </form>
          </Form>

          {/* ─── Confirm Dialog ───────────────────────────── */}
          <CustomDialog
            title="Xác nhận tạo đặt phòng"
            size="max"
            opened={isConfirmDialogOpen}
            changeOnOpened={setIsConfirmDialogOpen}
            trigger={<span />}
            content={
              <div className="space-y-4">
                <p className="text-[1.4rem]">
                  Bạn có chắc chắn muốn tạo đặt phòng mới cho khách hàng{' '}
                  <strong>{selectedClientName || form.getValues('client_id')}</strong>?
                </p>
                <div className="flex justify-end gap-3">
                  <NButton onClick={() => setIsConfirmDialogOpen(false)}>Hủy</NButton>
                  <NButton onClick={form.handleSubmit(onSubmit)}>Xác nhận tạo</NButton>
                </div>
              </div>
            }
          />
        </section>
      </div>
    </div>
  )
}
