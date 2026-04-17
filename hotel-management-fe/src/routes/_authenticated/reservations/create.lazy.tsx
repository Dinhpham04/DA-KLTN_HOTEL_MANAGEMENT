import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useDocumentTitle } from 'usehooks-ts'
import { z } from 'zod'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import {
  CustomCollapsible,
  CustomCollapsibleContent,
  CustomCollapsibleTrigger,
} from '@/components/common/CustomCollapsible'

import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import type { Option } from '@/components/common/CustomSelectClean'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import Loading from '@/components/common/Loading'
import {
  ADVERTISING_TYPE_OPTIONS,
  CONFIRM_FLAG_OPTIONS,
  DATA_TYPE_OPTIONS,
  DIRECTCHECKIN_TYPE_OPTIONS,
  MOCK_KEYBOX_OPTIONS,
  NORESERVE_COUNT_OPTIONS,
  RENTAL_KEYS_OPTIONS,
  SEX_OPTIONS,
  USED_MESSY_LEVEL_OPTIONS,
} from '@/constants/reservation'
import { DialogClose } from '@/components/ui/dialog'
import { NButton } from '@/components/ui/new-button'

import IdentificationSettingModal from '@/components/dialogs/IdentificationSettingModal'
import SearchClientModal from '@/components/dialogs/SearchClientModal'
import { useGetCountries } from '@/hooks/queries/useGetCountries'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRoomTypes } from '@/hooks/queries/useGetRoomTypes'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'
import { useCreateReservation } from '@/hooks/queries/useReservations'
import { calculateStayTypeId, formatDateValue } from '@/lib/reservation'
import { cn } from '@/lib/utils'

export const Route = createLazyFileRoute('/_authenticated/reservations/create')({
  component: ReservationCreatePage,
})

// ─── Schema ──────────────────────────────────────────────────────────
const clientSchema = z.object({
  data_type: z.string().default('1'),
  client_id: z.string().optional(),
  client_name: z.string().max(128).optional(),
  company_name: z.string().max(128).optional(),
  contact_name: z.string().max(128).optional(),
  birthday: z.string().optional(),
  sex: z.string().optional(),
  country_id: z.string().optional(),
  zip_code: z.string().optional(),
  address1: z.string().max(256).optional(),
  address2: z.string().max(256).optional(),
  company_zip_code: z.string().optional(),
  company_address1: z.string().max(256).optional(),
  company_address2: z.string().max(256).optional(),
  email: z.string().optional(),
  tel: z.string().optional(),
  tel_phone: z.string().optional(),
  tel_emergency: z.string().optional(),
  emergency_relation: z.string().optional(),
  company_tel: z.string().optional(),
  fax: z.string().optional(),
  use_count: z.string().optional(),
  memo: z.string().max(1024).optional(),
  stay_duration_auto_flag: z.boolean().default(false),
  used_messy_level: z.string().default('0'),
  ug_flag: z.boolean().default(false),
  postpaid_flag: z.boolean().default(false),
  advertising_type: z.boolean().default(false),
})

const reserveSchema = z.object({
  facility_id: z.string().optional(),
  room_type_id: z.string().optional(),
  room_id: z.string().optional(),
  directcheckin_type: z.string().default('1'),
  directcheckin_flag: z.boolean().default(false),
  keybox_name: z.string().optional(),
  keybox_password: z.string().optional(),
  di_contact_staff_id: z.string().optional(),
  contacted_flag: z.boolean().default(false),
  pre_delivery_key_flag: z.boolean().default(false),
  checkin_date: z.string().optional(),
  advertising_type: z.string().default('0'),
  noreserve_count_before: z.string().default('0'),
  period_from: z.string().optional(),
  period_to: z.string().optional(),
  noreserve_count_after: z.string().default('0'),
  stay_type_id: z.string().optional(),
  auto_extend_flag: z.boolean().default(true),
  confirm_flag: z.string().default('0'),
  rental_keys: z.string().default('0'),
  checkin_time: z.string().optional(),
  payment_due_date: z.string().optional(),
  note: z.string().max(1024).optional(),
  overdue_debt_note: z.string().max(1024).optional(),
  disable_reservation: z.boolean().default(false),
})

const formSchema = z.object({
  client: clientSchema,
  reserve: reserveSchema,
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: FormValues = {
  client: {
    data_type: '1',
    client_id: '',
    client_name: '',
    company_name: '',
    contact_name: '',
    birthday: '',
    sex: '',
    country_id: '',
    zip_code: '',
    address1: '',
    address2: '',
    company_zip_code: '',
    company_address1: '',
    company_address2: '',
    email: '',
    tel: '',
    tel_phone: '',
    tel_emergency: '',
    emergency_relation: '',
    company_tel: '',
    fax: '',
    use_count: '0',
    memo: '',
    stay_duration_auto_flag: false,
    used_messy_level: '0',
    ug_flag: false,
    postpaid_flag: false,
    advertising_type: false,
  },
  reserve: {
    facility_id: '',
    room_type_id: '',
    room_id: '',
    directcheckin_type: '1',
    directcheckin_flag: false,
    keybox_name: '',
    keybox_password: '',
    di_contact_staff_id: '',
    contacted_flag: false,
    pre_delivery_key_flag: false,
    checkin_date: '',
    advertising_type: '0',
    noreserve_count_before: '0',
    period_from: '',
    period_to: '',
    noreserve_count_after: '0',
    stay_type_id: '',
    auto_extend_flag: true,
    confirm_flag: '0',
    rental_keys: '0',
    checkin_time: '',
    payment_due_date: '',
    note: '',
    overdue_debt_note: '',
    disable_reservation: false,
  },
}

// ─── Main Page Component ─────────────────────────────────────────────
function ReservationCreatePage() {
  useDocumentTitle('Tạo đặt phòng mới')
  const [isLoading, setIsLoading] = useState(false)
  const [modalConfirmClear, setModalConfirmClear] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [isIdentificationOpen, setIsIdentificationOpen] = useState(false)

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const dataType = form.watch('client.data_type')
  const ugFlag = form.watch('client.ug_flag')
  const directcheckinFlag = form.watch('reserve.directcheckin_flag')
  const contactedFlag = form.watch('reserve.contacted_flag')

  // ─── Data Hooks ──────────────────────────────────────────────────
  const { data: countries } = useGetCountries()
  const { data: facilitiesData } = useGetFacilities()
  const { data: stayTypes } = useGetStayTypes()
  const { data: staffsData } = useGetStaffs({})

  // Cascade state: selected facilityId → fetch room types, selected roomTypeId → fetch rooms
  const selectedFacilityId = form.watch('reserve.facility_id')
  const selectedRoomTypeId = form.watch('reserve.room_type_id')

  const { data: roomTypesData } = useGetRoomTypes({
    params: selectedFacilityId
      ? {
          facilityId: Number(selectedFacilityId),
          dataStatus: 1,
        }
      : undefined,
  })
  const { data: roomsData } = useGetRooms({
    params: {
      ...(selectedFacilityId ? { facilityId: Number(selectedFacilityId) } : {}),
      ...(selectedRoomTypeId ? { roomTypeId: Number(selectedRoomTypeId) } : {}),
      dataStatus: 1,
    },
  })

  const { mutateAsync: createReservation, isPending: isCreating } = useCreateReservation()
  const navigate = useNavigate()

  // ─── Options ─────────────────────────────────────────────────────
  const countryOptions: Option[] = (countries ?? []).map((c) => ({
    label: c.countryName,
    value: String(c.countryId),
  }))

  const facilityOptions: Option[] = useMemo(
    () =>
      (facilitiesData?.data ?? []).map((f) => ({
        label: f.facilityName,
        value: String(f.facilityId),
      })),
    [facilitiesData]
  )

  const selectedFacilityShortLabel = useMemo(() => {
    const selectedFacility = (facilitiesData?.data ?? []).find(
      (f) => String(f.facilityId) === selectedFacilityId
    )
    return selectedFacility ? `Cơ sở ${selectedFacility?.facilityNo}` : '---'
  }, [facilitiesData, selectedFacilityId])

  const selectedRoomTypeShortLabel = useMemo(() => {
    const selected = (roomTypesData?.data ?? []).find(
      (rt) => String(rt.roomTypeId) === selectedRoomTypeId
    )
    return selected ? selected.roomTypeNameShort : '---'
  }, [roomTypesData, selectedRoomTypeId])

  const roomTypeOptions: Option[] = useMemo(() => {
    const allTypes = roomTypesData?.data ?? []
    // If a facility is selected, we could filter further but room types don't have facilityId
    // So we show all available room types
    return allTypes.map((rt) => ({
      label: rt.roomTypeName,
      value: String(rt.roomTypeId),
    }))
  }, [roomTypesData])

  const roomOptions: Option[] = useMemo(
    () =>
      (roomsData?.data ?? []).map((r) => ({
        label: r.roomNumber,
        value: String(r.roomId),
      })),
    [roomsData]
  )

  const stayTypeOptions: Option[] = useMemo(
    () =>
      (stayTypes ?? []).map((st: import('@/types/stay-type').StayType) => ({
        label: st.stayTypeName,
        value: String(st.stayTypeId),
      })),
    [stayTypes]
  )

  const staffOptions: Option[] = useMemo(
    () =>
      (staffsData ?? []).map((staff) => ({
        label: staff.staffName,
        value: String(staff.staffId),
      })),
    [staffsData]
  )

  // Night count calculation
  const periodFrom = form.watch('reserve.period_from')
  const periodTo = form.watch('reserve.period_to')
  const nightCount = useMemo(() => {
    if (!periodFrom || !periodTo) return 0
    return dayjs(periodTo).add(1, 'day').diff(dayjs(periodFrom), 'day')
  }, [periodFrom, periodTo])

  const clearDirectcheckinDetails = () => {
    form.setValue('reserve.keybox_name', '')
    form.setValue('reserve.keybox_password', '')
    form.setValue('reserve.di_contact_staff_id', '')
    form.setValue('reserve.contacted_flag', false)
    form.setValue('reserve.pre_delivery_key_flag', false)
    form.setValue('reserve.checkin_date', '')
  }

  const syncDirectcheckinFlagByType = (type: string) => {
    const isSelfCheckin = type === '2'
    form.setValue('reserve.directcheckin_flag', isSelfCheckin)

    if (!isSelfCheckin) {
      clearDirectcheckinDetails()
    }
  }

  const toggleDirectcheckinFlag = (checked: boolean) => {
    form.setValue('reserve.directcheckin_flag', checked)

    if (checked) {
      form.setValue('reserve.directcheckin_type', '2')
      return
    }

    form.setValue('reserve.directcheckin_type', '1')
    clearDirectcheckinDetails()
  }

  const handleContactedFlagChange = (checked: boolean, onChange: (value: boolean) => void) => {
    onChange(checked)

    if (checked) {
      if (!form.getValues('reserve.checkin_date')) {
        form.setValue('reserve.checkin_date', dayjs().format('YYYY-MM-DD HH:mm'))
      }
      return
    }

    form.setValue('reserve.checkin_date', '')
  }

  useEffect(() => {
    if (!periodFrom || !periodTo) return
    form.setValue('reserve.stay_type_id', calculateStayTypeId(periodFrom, periodTo))
  }, [periodFrom, periodTo, form])

  // ─── Client select handler ────────────────────────────────────────
  const handleClientSelect = (client: import('@/types/client').Client) => {
    form.setValue('client.client_id', String(client.clientId))
    form.setValue('client.client_name', client.clientName ?? '')
    form.setValue('client.company_name', client.companyName ?? '')
    form.setValue('client.contact_name', client.contactName ?? '')
    form.setValue('client.email', client.email ?? '')
    form.setValue('client.tel', client.tel ?? '')
    form.setValue('client.tel_phone', client.telPhone ?? '')
    form.setValue('client.tel_emergency', client.telEmergency ?? '')
    form.setValue('client.emergency_relation', client.emergencyRelation ?? '')
    form.setValue('client.company_tel', client.companyTel ?? '')
    form.setValue('client.fax', client.fax ?? '')
    form.setValue('client.sex', client.sex ? String(client.sex) : '')
    form.setValue('client.country_id', client.countryId ? String(client.countryId) : '')
    form.setValue('client.zip_code', client.zipCode ?? '')
    form.setValue('client.address1', client.address1 ?? '')
    form.setValue('client.address2', client.address2 ?? '')
    form.setValue('client.company_zip_code', client.companyZipCode ?? '')
    form.setValue('client.company_address1', client.companyAddress1 ?? '')
    form.setValue('client.company_address2', client.companyAddress2 ?? '')
    form.setValue('client.memo', client.memo ?? '')
    form.setValue('client.use_count', String(client.useCount ?? 0))
    form.setValue('client.data_type', String(client.dataType ?? 1))
    form.setValue('client.ug_flag', client.ugFlag ?? false)
    form.setValue('client.postpaid_flag', client.postpaidFlag ?? false)
    form.setValue('client.stay_duration_auto_flag', client.stayDurationAutoFlag ?? false)
    form.setValue('client.used_messy_level', String(client.usedMessyLevel ?? 0))
    if (client.birthday) {
      form.setValue('client.birthday', client.birthday)
    }
    setShowClientModal(false)
  }

  // ─── Cascade handlers ─────────────────────────────────────────────
  const handleFacilityChange = (val: string) => {
    form.setValue('reserve.facility_id', val)
    form.setValue('reserve.room_type_id', '')
    form.setValue('reserve.room_id', '')
  }

  const handleRoomTypeChange = (val: string) => {
    form.setValue('reserve.room_type_id', val)
    form.setValue('reserve.room_id', '')
  }

  const handleRoomChange = (val: string) => {
    form.setValue('reserve.room_id', val)
    // Auto-set noreserve_count_after from room's reservedCleanDay
    const room = roomsData?.data?.find((r) => String(r.roomId) === val)
    if (room) {
      form.setValue('reserve.noreserve_count_after', String(room.reservedCleanDay || 1))
    }
  }

  // ─── Submit handler ───────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    if (!values.client.client_id) {
      toast.error('Vui lòng chọn khách hàng')
      return
    }
    if (!values.reserve.period_from || !values.reserve.period_to) {
      toast.error('Vui lòng chọn thời gian lưu trú')
      return
    }

    setIsLoading(true)
    try {
      await createReservation({
        clientId: Number(values.client.client_id),
        facilityId: values.reserve.facility_id ? Number(values.reserve.facility_id) : undefined,
        roomId: values.reserve.room_id ? Number(values.reserve.room_id) : undefined,
        stayTypeId: values.reserve.stay_type_id ? Number(values.reserve.stay_type_id) : undefined,
        periodFrom: values.reserve.period_from,
        periodTo: values.reserve.period_to,
        advertisingType: values.reserve.advertising_type
          ? Number(values.reserve.advertising_type)
          : undefined,
        directcheckinType: values.reserve.directcheckin_type
          ? Number(values.reserve.directcheckin_type)
          : undefined,
        directcheckinFlag: values.reserve.directcheckin_flag,
        diContactStaffId: values.reserve.di_contact_staff_id
          ? Number(values.reserve.di_contact_staff_id)
          : undefined,
        confirmFlag: values.reserve.confirm_flag === '1',
        autoExtendFlag: values.reserve.auto_extend_flag,
        note: values.reserve.note,
        memo: values.client.memo,
      })
      navigate({ to: '/reservations' })
    } catch {
      // Error is handled by the mutation hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    form.reset(defaultValues)
    setModalConfirmClear(false)
  }

  return (
    <>
      {(isLoading || isCreating) && <Loading />}
      <div className="common-container">
        <div className="pt-16 pb-52">
          <section>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CustomAccordion
                  type="multiple"
                  className="w-full"
                  defaultValue={['customer', 'reservation-0']}
                >
                  {/* ═══════════════════════════════════════════════════════════
                      ACCORDION 1: THÔNG TIN KHÁCH HÀNG (GREEN #8BD08E)
                  ═══════════════════════════════════════════════════════════ */}
                  <CustomAccordionItem
                    value="customer"
                    className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                  >
                    <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                      <div className="flex items-center justify-between w-full px-4">
                        <span className="font-bold text-black text-[1.2rem] sm:text-[1.8rem]">
                          Thông tin khách hàng
                        </span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <NButton type="button" onClick={() => setShowClientModal(true)}>
                            Tìm kiếm
                          </NButton>
                        </div>
                      </div>
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className={cn('pb-0')}>
                      <div
                        className={cn(
                          'px-16 pt-[3.4rem] pb-16 rounded-[0_0_0.8rem_0.8rem] w-full',
                          ugFlag && 'bg-orange-300'
                        )}
                      >
                        {/* Row 1: Type, Client ID, Giấy tờ tùy thân */}
                        <div className="flex flex-wrap items-center gap-[1rem]">
                          <div className="flex items-center my-4">
                            <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                              Loại
                            </p>
                            <Controller
                              control={form.control}
                              name="client.data_type"
                              render={({ field }) => (
                                <CustomRadio
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="flex"
                                >
                                  {DATA_TYPE_OPTIONS.map((opt) => (
                                    <div
                                      key={opt.id}
                                      className="flex items-center my-2 mr-[2.4rem]"
                                    >
                                      <CustomRadioItems value={opt.value} />
                                      <label className="flex items-center !mt-0 ml-3 text-[1.6rem] cursor-pointer">
                                        {opt.name}
                                      </label>
                                    </div>
                                  ))}
                                </CustomRadio>
                              )}
                            />
                          </div>

                          <div className="flex items-center my-4 mr-10">
                            <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                              Mã KH
                            </p>
                            <CustomInput
                              {...form.register('client.client_id')}
                              disabled
                              className="disabled:bg-[#D9D9D9] !opacity-100 w-[12rem]"
                            />
                          </div>

                          <div className="flex items-center my-4">
                            <span className="flex items-center min-w-[15rem] font-bold text-[1.6rem] mr-[7.5rem]">
                              Giấy tờ tùy thân
                            </span>
                            <CustomDialog
                              size="medium"
                              opened={isIdentificationOpen}
                              changeOnOpened={setIsIdentificationOpen}
                              trigger={
                                <NButton
                                  type="button"
                                  className="bg-[#efefef] w-[14rem] text-[1.6rem]"
                                >
                                  <span>Thiết lập</span>
                                </NButton>
                              }
                              title="Thiết lập giấy tờ tùy thân"
                              content={
                                <IdentificationSettingModal
                                  closeModal={() => setIsIdentificationOpen(false)}
                                />
                              }
                            />
                          </div>
                        </div>

                        {/* Advertising checkbox */}
                        <div className="flex items-center ml-[15rem]">
                          <div className="flex items-center">
                            <Controller
                              control={form.control}
                              name="client.advertising_type"
                              render={({ field }) => (
                                <div className="flex items-center">
                                  <CustomCheckbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                  <label className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                    Đặt phòng trực tuyến
                                  </label>
                                </div>
                              )}
                            />
                          </div>
                        </div>

                        {/* Individual: Name + Sex */}
                        {dataType === '1' && (
                          <div className="flex flex-wrap items-center">
                            <div className="flex items-center my-4 mr-16">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                Họ tên
                              </p>
                              <CustomInput
                                {...form.register('client.client_name')}
                                className={cn('bg-white w-[26.2rem]', {
                                  'border-red-500': form.formState.errors.client?.client_name,
                                })}
                              />
                            </div>
                            <div className="flex items-center my-4">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                Giới tính
                              </p>
                              <Controller
                                control={form.control}
                                name="client.sex"
                                render={({ field }) => (
                                  <CustomRadio
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex"
                                  >
                                    {SEX_OPTIONS.map((opt) => (
                                      <div
                                        key={opt.id}
                                        className="flex items-center my-2 mr-[2.4rem]"
                                      >
                                        <CustomRadioItems value={opt.value} />
                                        <label className="flex items-center !mt-0 ml-3 text-[1.6rem] cursor-pointer">
                                          {opt.name}
                                        </label>
                                      </div>
                                    ))}
                                  </CustomRadio>
                                )}
                              />
                            </div>
                          </div>
                        )}

                        {/* Corporation: Company Name + Sex */}
                        {dataType !== '1' && (
                          <div className="flex flex-wrap items-center">
                            <div className="flex items-center my-4 mr-16">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                Tên công ty
                              </p>
                              <CustomInput
                                {...form.register('client.company_name')}
                                className={cn('bg-white w-[26.2rem]', {
                                  'border-red-500': form.formState.errors.client?.company_name,
                                })}
                                onChange={(e) => {
                                  form.setValue('client.company_name', e.target.value)
                                  form.setValue('client.client_name', e.target.value)
                                }}
                              />
                            </div>
                            <div className="flex items-center my-4">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                Giới tính
                              </p>
                              <Controller
                                control={form.control}
                                name="client.sex"
                                render={({ field }) => (
                                  <CustomRadio
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex"
                                  >
                                    {SEX_OPTIONS.map((opt) => (
                                      <div
                                        key={opt.id}
                                        className="flex items-center my-2 mr-[2.4rem]"
                                      >
                                        <CustomRadioItems value={opt.value} />
                                        <label className="flex items-center !mt-0 ml-3 text-[1.6rem] cursor-pointer">
                                          {opt.name}
                                        </label>
                                      </div>
                                    ))}
                                  </CustomRadio>
                                )}
                              />
                            </div>
                          </div>
                        )}

                        {/* Corporation: Contact Name */}
                        {dataType !== '1' && (
                          <div className="flex flex-wrap items-center">
                            <div className="flex items-center my-4 mr-16">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                Người liên hệ
                              </p>
                              <CustomInput
                                {...form.register('client.contact_name')}
                                className={cn('bg-white w-[26.2rem]', {
                                  'border-red-500': form.formState.errors.client?.contact_name,
                                })}
                              />
                            </div>
                          </div>
                        )}

                        {/* Country + Birthday */}
                        <div className="flex flex-wrap items-center gap-[5rem]">
                          <div className="flex items-center my-4 md:w-[40rem]">
                            <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                              Quốc tịch
                            </p>
                            <Controller
                              control={form.control}
                              name="client.country_id"
                              render={({ field }) => (
                                <CustomSelectClean
                                  isAll
                                  option={countryOptions}
                                  selected={countryOptions.find((o) => o.value === field.value)}
                                  change={(o) => field.onChange(o.value)}
                                  customClassMain="min-w-[26.2rem] h-[3.6rem]"
                                />
                              )}
                            />
                          </div>

                          <div className="flex items-center my-4 md:w-[40.6rem]">
                            <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                              Ngày sinh
                            </p>
                            <Controller
                              control={form.control}
                              name="client.birthday"
                              render={({ field }) => (
                                <CustomDatePicker
                                  value={field.value ? new Date(field.value) : null}
                                  format="yyyy/MM/dd"
                                  change={(date: Date | Date[] | null) => {
                                    field.onChange(formatDateValue(date, 'YYYY-MM-DD'))
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>

                        {/* Individual: Address */}
                        {dataType === '1' && (
                          <div className="flex flex-wrap items-center">
                            <div className="flex items-center my-4 mr-[3.8rem]">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                Mã bưu điện
                              </p>
                              <CustomInput
                                {...form.register('client.zip_code')}
                                className="bg-white w-[26.2rem]"
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-[2.6rem]">
                              <div className="flex items-center my-4 mr-8">
                                <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                  Địa chỉ
                                </p>
                                <CustomInput
                                  {...form.register('client.address1')}
                                  placeholder="Tỉnh/Thành phố"
                                  className={cn('bg-white w-[26.2rem]', {
                                    'border-red-500': form.formState.errors.client?.address1,
                                  })}
                                />
                              </div>
                              <div className="flex items-center my-4">
                                <CustomInput
                                  {...form.register('client.address2')}
                                  className={cn('bg-white w-[35.7rem]', {
                                    'border-red-500': form.formState.errors.client?.address2,
                                  })}
                                  placeholder="Số nhà, Phường/Xã, Quận/Huyện"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Corporation: Company Address */}
                        {dataType !== '1' && (
                          <div className="flex flex-wrap items-center">
                            <div className="flex items-center my-4 mr-[3.8rem]">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                Mã bưu điện (CT)
                              </p>
                              <CustomInput
                                {...form.register('client.company_zip_code')}
                                className="bg-white w-[26.2rem]"
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-[2.6rem]">
                              <div className="flex items-center my-4 mr-8">
                                <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                  Địa chỉ (CT)
                                </p>
                                <CustomInput
                                  {...form.register('client.company_address1')}
                                  placeholder="Tỉnh/Thành phố"
                                  className={cn('bg-white w-[26.2rem]', {
                                    'border-red-500':
                                      form.formState.errors.client?.company_address1,
                                  })}
                                />
                              </div>
                              <div className="flex items-center my-4">
                                <CustomInput
                                  {...form.register('client.company_address2')}
                                  className={cn('bg-white w-[35.7rem]', {
                                    'border-red-500':
                                      form.formState.errors.client?.company_address2,
                                  })}
                                  placeholder="Quận/Huyện, Phường/Xã, Số nhà"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Phone numbers */}
                        <div className="flex flex-wrap items-center gap-[3.8rem]">
                          {dataType === '1' && (
                            <div className="flex items-center my-4">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                ☎ (Nhà)
                              </p>
                              <CustomInput
                                {...form.register('client.tel')}
                                className="bg-white w-[26.2rem]"
                              />
                            </div>
                          )}
                          {dataType !== '1' && (
                            <div className="flex items-center my-4">
                              <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                ☎ (Công ty)
                              </p>
                              <CustomInput
                                {...form.register('client.company_tel')}
                                className="bg-white w-[26.2rem]"
                              />
                            </div>
                          )}
                          <div className="flex items-center my-4">
                            <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                              ☎ (Di động)
                            </p>
                            <CustomInput
                              {...form.register('client.tel_phone')}
                              className="bg-white w-[26.2rem]"
                            />
                          </div>

                          <div className="flex items-center my-4 ml-2">
                            <p className="flex items-center min-w-[9.8rem] font-bold text-[1.6rem] leading-7">
                              Email
                            </p>
                            <CustomInput
                              {...form.register('client.email')}
                              className="bg-white w-[26.2rem]"
                            />
                          </div>
                        </div>

                        {/* Emergency contact */}
                        <div className="flex flex-wrap items-center">
                          <div className="flex items-center my-4 mr-[3.8rem]">
                            <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                              ☎ (Khẩn cấp)
                            </p>
                            <CustomInput
                              {...form.register('client.tel_emergency')}
                              className="bg-white w-[26.2rem]"
                            />
                          </div>

                          <div className="flex items-center my-4 mr-[4.3rem]">
                            <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                              Quan hệ
                            </p>
                            <CustomInput
                              {...form.register('client.emergency_relation')}
                              className="bg-white w-[26.2rem]"
                            />
                          </div>

                          {(dataType === '2' || dataType === '3') && (
                            <div className="flex items-center my-4">
                              <p className="flex items-center min-w-[9.8rem] font-bold text-[1.6rem] leading-7">
                                FAX
                              </p>
                              <CustomInput
                                {...form.register('client.fax')}
                                className="bg-white w-[26.2rem]"
                              />
                            </div>
                          )}
                        </div>

                        {/* Individual: Company info section */}
                        {dataType === '1' && (
                          <>
                            <div className="flex flex-wrap items-center">
                              <div className="flex items-center my-4 mr-16">
                                <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                  Tên công ty
                                </p>
                                <CustomInput
                                  {...form.register('client.company_name')}
                                  className={cn('bg-white w-[26.2rem]', {
                                    'border-red-500': form.formState.errors.client?.company_name,
                                  })}
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-[4rem]">
                              <div className="flex items-center my-4">
                                <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                  Mã bưu điện (CT)
                                </p>
                                <CustomInput
                                  {...form.register('client.company_zip_code')}
                                  className="bg-white w-[26.2rem]"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-[2.6rem]">
                                <div className="flex items-center my-4 mr-8">
                                  <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Địa chỉ (CT)
                                  </p>
                                  <CustomInput
                                    {...form.register('client.company_address1')}
                                    placeholder="Tỉnh/Thành phố"
                                    className={cn('bg-white w-[26.2rem]', {
                                      'border-red-500':
                                        form.formState.errors.client?.company_address1,
                                    })}
                                  />
                                </div>
                                <div className="flex items-center my-4">
                                  <CustomInput
                                    {...form.register('client.company_address2')}
                                    className={cn('bg-white w-[35.7rem]', {
                                      'border-red-500':
                                        form.formState.errors.client?.company_address2,
                                    })}
                                    placeholder="Quận/Huyện, Phường/Xã, Số nhà"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-[4.2rem]">
                              <div className="flex items-center my-4">
                                <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                  ☎ (Công ty)
                                </p>
                                <CustomInput
                                  {...form.register('client.company_tel')}
                                  className="bg-white w-[26.2rem]"
                                />
                              </div>
                              <div className="flex items-center my-4">
                                <p className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                  FAX (CT)
                                </p>
                                <CustomInput
                                  {...form.register('client.fax')}
                                  className="bg-white w-[26.2rem]"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Flags row + Memo */}
                        <div className="flex flex-wrap">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center">
                              <div className="w-96">
                                <div className="flex items-center !my-[1.6rem]">
                                  <Controller
                                    control={form.control}
                                    name="client.stay_duration_auto_flag"
                                    render={({ field }) => (
                                      <CustomCheckbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    )}
                                  />
                                  <label className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                    Tự động gia hạn
                                  </label>
                                </div>
                              </div>
                              <div className="flex !my-[1.2rem] w-[25rem] mr-[4rem]">
                                <p className="flex items-center w-[15rem] font-bold text-[1.6rem]">
                                  Vệ sinh phòng
                                </p>
                                <Controller
                                  control={form.control}
                                  name="client.used_messy_level"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={USED_MESSY_LEVEL_OPTIONS}
                                      selected={USED_MESSY_LEVEL_OPTIONS.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-[10.4rem] h-[3.6rem]"
                                    />
                                  )}
                                />
                              </div>
                              <div className="flex items-center w-[20.6rem]">
                                <span className="mr-4 font-bold text-[1.6rem]">Lần sử dụng</span>
                                <CustomInput
                                  {...form.register('client.use_count')}
                                  disabled
                                  className="bg-white disabled:bg-[#D9D9D9] !opacity-100 w-[5.6rem]"
                                />
                                <span className="ml-5 font-bold text-[1.6rem]">lần</span>
                              </div>
                            </div>

                            <div className="flex items-start">
                              <div className="flex flex-col w-[10rem]">
                                <p className="flex items-center !my-[1.6rem] w-[9.2rem] h-fit font-bold text-[1.6rem]">
                                  Ghi chú
                                </p>
                                <div>
                                  {dataType === '3' && (
                                    <div className="flex items-center !my-[1.6rem]">
                                      <Controller
                                        control={form.control}
                                        name="client.postpaid_flag"
                                        render={({ field }) => (
                                          <CustomCheckbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        )}
                                      />
                                      <label className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                        Trả sau
                                      </label>
                                    </div>
                                  )}
                                  <div className="flex items-center !my-[0.9rem] w-36 h-fit">
                                    <Controller
                                      control={form.control}
                                      name="client.ug_flag"
                                      render={({ field }) => (
                                        <CustomCheckbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      )}
                                    />
                                    <label className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                      UG
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-1">
                                <CustomTextarea
                                  {...form.register('client.memo')}
                                  className="bg-white py-8 flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                </CustomAccordion>

                {/* ═══════════════════════════════════════════════════════════
                    ACCORDION 2: THÔNG TIN ĐẶT PHÒNG (BLUE #79A3E0)
                ═══════════════════════════════════════════════════════════ */}
                <CustomAccordion
                  type="multiple"
                  className="w-full"
                  defaultValue={['reservation-0']}
                >
                  <CustomAccordionItem
                    value="reservation-0"
                    className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                  >
                    <CustomAccordionTrigger className="bg-[#79A3E0] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                      <div className="flex justify-between">
                        <div className="flex md:flex-row flex-col flex-1 justify-center md:justify-between items-center gap-2 text-[1.2rem] sm:text-[1.8rem]">
                          <div className="font-bold text-black px-4">Thông tin đặt phòng</div>
                        </div>
                      </div>
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className="pb-0">
                      <div className="px-16 pt-[3.4rem] pb-16 w-full overflow-x-auto">
                        <h5 className="font-bold text-[2.3rem] leading-none">
                          ■ Thông tin đặt phòng
                        </h5>

                        {/* ─── Row 1: Main grid (Facility → RoomType → Room → Dates → StayType → Flags) ─── */}
                        <div className="flex items-center mt-[1.6rem]">
                          {/* Cơ sở (Facility) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[12.4rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Cơ sở
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.facility_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      isAll
                                      option={facilityOptions}
                                      selected={facilityOptions.find(
                                        (o) => o.value === field.value
                                      )}
                                      selectedLabel={selectedFacilityShortLabel}
                                      change={(o) => handleFacilityChange(o.value)}
                                      customClassMain="w-full h-16 rounded-none border-black"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Loại phòng (Room Type) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[12.4rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Loại phòng
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.room_type_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      isAll
                                      option={roomTypeOptions}
                                      selected={roomTypeOptions.find(
                                        (o) => o.value === field.value
                                      )}
                                      selectedLabel={selectedRoomTypeShortLabel}
                                      change={(o) => handleRoomTypeChange(o.value)}
                                      disabledSelect={!selectedFacilityId}
                                      customClassMain="w-full h-16 rounded-none border-black"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Số phòng (Room) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[12.4rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Số phòng
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.room_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      isAll
                                      option={roomOptions}
                                      selected={roomOptions.find((o) => o.value === field.value)}
                                      change={(o) => handleRoomChange(o.value)}
                                      disabledSelect={!selectedFacilityId}
                                      customClassMain="w-full h-16 rounded-none border-black"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Trước × (noreserve_count_before) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[7rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Trước
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.noreserve_count_before"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={NORESERVE_COUNT_OPTIONS}
                                      selected={NORESERVE_COUNT_OPTIONS.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-full h-16 rounded-none border-black"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Thời gian lưu trú (Period) */}
                          <div className="flex-1 my-0 ml-[-0.1rem] first:ml-0 min-w-[28.6rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Thời gian lưu trú ({nightCount} đêm)
                              </p>
                              <div className="flex items-center">
                                <div className="relative flex-2 !m-0">
                                  <Controller
                                    control={form.control}
                                    name="reserve.period_from"
                                    render={({ field }) => (
                                      <CustomDatePicker
                                        format="yyyy/MM/dd"
                                        className={cn(
                                          'flex-none [&>div]:px-[0.4rem] [&>div]:border-black w-[12.3rem] h-16 font-bold [&_input::placeholder]:text-[#999] lowercase cursor-pointer'
                                        )}
                                        change={(e) => {
                                          field.onChange(formatDateValue(e, 'YYYY-MM-DD'))
                                        }}
                                        value={field.value ? new Date(field.value) : null}
                                      />
                                    )}
                                  />
                                </div>
                                <div className="flex flex-1 justify-center items-center !mt-0 border-black border-y min-w-[4rem] h-16 font-bold text-[1.4rem]">
                                  ~
                                </div>
                                <div className="relative flex-2 !m-0">
                                  <Controller
                                    control={form.control}
                                    name="reserve.period_to"
                                    render={({ field }) => (
                                      <CustomDatePicker
                                        format="yyyy/MM/dd"
                                        className={cn(
                                          'flex-none !mt-0 [&>div]:px-[0.4rem] [&>div]:border-black w-[12.3rem] h-16 font-bold [&_input::placeholder]:text-[#999] lowercase cursor-pointer'
                                        )}
                                        change={(e) => {
                                          field.onChange(formatDateValue(e, 'YYYY-MM-DD'))
                                        }}
                                        value={field.value ? new Date(field.value) : null}
                                        defaultActiveStartDate={
                                          periodFrom ? new Date(periodFrom) : undefined
                                        }
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Sau × (noreserve_count_after) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[7rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Sau
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.noreserve_count_after"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={NORESERVE_COUNT_OPTIONS}
                                      selected={NORESERVE_COUNT_OPTIONS.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-full h-16 rounded-none border-black"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Loại lưu trú (Stay Type) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[20.3rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Loại lưu trú
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.stay_type_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      isAll
                                      option={stayTypeOptions}
                                      selected={stayTypeOptions.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-full h-16 rounded-none border-black"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Tự động gia hạn (Auto Extend Flag) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[14rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem] leading-8">
                                Tự động gia hạn
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.auto_extend_flag"
                                  render={({ field }) => (
                                    <div className="flex justify-center items-center border border-black h-16">
                                      <CustomCheckbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Xác nhận (Confirm Flag) */}
                          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[16.4rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Xác nhận
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.confirm_flag"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={CONFIRM_FLAG_OPTIONS}
                                      selected={CONFIRM_FLAG_OPTIONS.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-full h-16 rounded-none border-black"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Check-in method row */}
                        <div className="my-8 w-full">
                          <div className="flex">
                            <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.4rem] h-[4.8rem] font-bold text-[1.6rem]">
                              Cách nhận phòng
                            </div>
                            <div className="flex flex-1 justify-between items-center px-8 py-2 border border-black">
                              <Controller
                                control={form.control}
                                name="reserve.directcheckin_type"
                                render={({ field }) => (
                                  <CustomRadio
                                    value={field.value}
                                    onValueChange={(value) => {
                                      field.onChange(value)
                                      syncDirectcheckinFlagByType(value)
                                    }}
                                    className="flex flex-wrap md:flex-nowrap gap-x-8 gap-y-4 !mt-0"
                                  >
                                    {DIRECTCHECKIN_TYPE_OPTIONS.map((opt) => (
                                      <div key={opt.id} className="flex items-center">
                                        <CustomRadioItems value={opt.value} />
                                        <label className="ml-2 font-medium text-[1.4rem] cursor-pointer">
                                          {opt.name}
                                        </label>
                                      </div>
                                    ))}
                                  </CustomRadio>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Advertising type row */}
                        <div className="mt-[-0.1rem] w-full">
                          <div className="flex">
                            <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.4rem] h-[4.8rem] font-bold text-[1.6rem]">
                              Kênh quảng cáo
                            </div>
                            <div className="flex flex-1 justify-between items-center px-8 py-2 border border-black">
                              <Controller
                                control={form.control}
                                name="reserve.advertising_type"
                                render={({ field }) => (
                                  <CustomRadio
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex flex-wrap md:flex-nowrap gap-x-8 gap-y-4 !mt-0"
                                  >
                                    {ADVERTISING_TYPE_OPTIONS.map((opt) => (
                                      <div key={opt.id} className="flex items-center">
                                        <CustomRadioItems value={opt.value} />
                                        <label className="ml-2 font-medium text-[1.4rem] cursor-pointer">
                                          {opt.name}
                                        </label>
                                      </div>
                                    ))}
                                  </CustomRadio>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ─── Row 2: Keys + Checkin Time + Payment Due Date ─── */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center mt-[1.6rem] mr-4">
                            {/* Số chìa khóa (Rental Keys) */}
                            <div className="my-0 ml-[-0.1rem] first:ml-0 w-[6.5rem]">
                              <div className="flex flex-col">
                                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                  🔑
                                </p>
                                <div className="relative w-full">
                                  <Controller
                                    control={form.control}
                                    name="reserve.rental_keys"
                                    render={({ field }) => (
                                      <CustomSelectClean
                                        option={RENTAL_KEYS_OPTIONS}
                                        selected={RENTAL_KEYS_OPTIONS.find(
                                          (o) => o.value === field.value
                                        )}
                                        change={(o) => field.onChange(o.value)}
                                        disabledSelect
                                        customClassMain="w-full h-16 rounded-none border-black"
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Giờ nhận phòng dự kiến */}
                            <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[14rem]">
                              <div className="flex flex-col">
                                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                  Giờ nhận phòng
                                </p>
                                <div className={cn('relative w-full')}>
                                  <Controller
                                    control={form.control}
                                    name="reserve.checkin_time"
                                    render={({ field }) => (
                                      <CustomInput
                                        type="time"
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        className="h-16 border border-black rounded-none text-center font-medium text-[1.4rem]"
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Hạn thanh toán */}
                            <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[14rem]">
                              <div className="flex flex-col">
                                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                  Hạn thanh toán
                                </p>
                                <div className={cn('relative w-full')}>
                                  <Controller
                                    control={form.control}
                                    name="reserve.payment_due_date"
                                    render={({ field }) => (
                                      <CustomDatePicker
                                        format="yyyy/MM/dd"
                                        className={cn(
                                          'flex-none [&>div]:px-[0.4rem] [&>div]:border-black w-full h-16 font-medium [&_input::placeholder]:text-black lowercase cursor-pointer'
                                        )}
                                        change={(e) => {
                                          field.onChange(formatDateValue(e, 'YYYY-MM-DD'))
                                        }}
                                        value={field.value ? new Date(field.value) : null}
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ghi chú đặt phòng (Note) */}
                          <div className="mt-[1.6rem] w-[51.7rem]">
                            <div className="flex">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[10.6rem] min-h-[6.9rem] font-bold text-[1.6rem]">
                                Ghi chú
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.note"
                                  render={({ field }) => (
                                    <CustomTextarea
                                      {...field}
                                      className="flex-1 !mt-0 py-4 border border-black border-solid rounded-none h-[6.9rem] min-h-full font-bold text-[1.4rem]"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ─── Row 3: Disable reservation checkbox + Overdue debt note ─── */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Controller
                              control={form.control}
                              name="reserve.disable_reservation"
                              render={({ field }) => (
                                <div className="flex justify-center items-center h-16">
                                  <CustomCheckbox
                                    id="disable_reservation"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </div>
                              )}
                            />
                            <label
                              className="font-bold text-[1.6rem] leading-none cursor-pointer"
                              htmlFor="disable_reservation"
                            >
                              Không cho phép đặt phòng tiếp theo sau đặt phòng này
                            </label>
                          </div>

                          <div className="mt-[1.6rem] w-[51.7rem]">
                            <div className="flex">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[10.6rem] min-h-[6.9rem] font-bold text-[1.6rem]">
                                Nợ quá hạn
                              </p>
                              <div className="relative w-full">
                                <Controller
                                  control={form.control}
                                  name="reserve.overdue_debt_note"
                                  render={({ field }) => (
                                    <CustomTextarea
                                      {...field}
                                      className="flex-1 !mt-0 py-4 border border-black border-solid h-[6.9rem] rounded-none min-h-full font-bold text-[1.4rem]"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Direct check-in setting (show when self check-in is selected) */}
                        <CustomCollapsible className="my-8">
                          <CustomCollapsibleTrigger className="[&>svg]:hidden">
                            <div className="flex items-center gap-2">
                              <Controller
                                control={form.control}
                                name="reserve.directcheckin_flag"
                                render={({ field }) => (
                                  <CustomCheckbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      toggleDirectcheckinFlag(checked === true)
                                    }}
                                  />
                                )}
                              />
                              <h5 className="font-bold text-[1.6rem] leading-none">
                                Cài đặt nhận phòng trực tiếp
                              </h5>
                            </div>
                          </CustomCollapsibleTrigger>

                          {directcheckinFlag && (
                            <CustomCollapsibleContent className="my-4">
                              <div className="flex items-center flex-wrap gap-y-4">
                                {/* Box */}
                                <div className="ml-[-0.1rem] first:ml-0 min-w-[23.3rem]">
                                  <div className="flex">
                                    <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[12.4rem] h-[7.5rem] font-bold text-[1.6rem]">
                                      Box
                                    </p>
                                    <div className="flex items-center border border-black w-[10.9rem] h-[7.5rem] px-2">
                                      <Controller
                                        control={form.control}
                                        name="reserve.keybox_name"
                                        render={({ field }) => (
                                          <CustomSelectClean
                                            isAll
                                            option={MOCK_KEYBOX_OPTIONS}
                                            selected={MOCK_KEYBOX_OPTIONS.find(
                                              (o) => o.value === field.value
                                            )}
                                            change={(o) => field.onChange(o.value)}
                                            customClassMain="w-[8rem] h-14"
                                          />
                                        )}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* PIN */}
                                <div className="ml-[-0.1rem] first:ml-0 min-w-[23.3rem]">
                                  <div className="flex">
                                    <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[12.4rem] h-[7.5rem] font-bold text-[1.6rem]">
                                      Mật khẩu
                                    </p>
                                    <div className="flex items-center border border-black h-[7.5rem] px-2">
                                      <CustomInput
                                        {...form.register('reserve.keybox_password')}
                                        className="w-[16rem] h-[2.5rem] text-center"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* DI Contact staff + flags */}
                                <div className="ml-[-0.1rem] first:ml-0 min-w-[33rem]">
                                  <div className="flex">
                                    <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[12.4rem] h-[7.5rem] font-bold text-[1.6rem]">
                                      NV đặt phòng
                                    </p>
                                    <div className="flex flex-col justify-center border border-black h-[7.5rem] px-2 gap-2">
                                      <Controller
                                        control={form.control}
                                        name="reserve.di_contact_staff_id"
                                        render={({ field }) => (
                                          <CustomSelectClean
                                            isAll
                                            option={staffOptions}
                                            selected={staffOptions.find((o) => o.value === field.value)}
                                            change={(o) => field.onChange(o.value)}
                                            customClassMain="w-[16rem]"
                                          />
                                        )}
                                      />

                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                          <Controller
                                            control={form.control}
                                            name="reserve.contacted_flag"
                                            render={({ field }) => (
                                              <CustomCheckbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                  handleContactedFlagChange(checked === true, field.onChange)
                                                }}
                                              />
                                            )}
                                          />
                                          <label className="text-[1.2rem] font-bold cursor-pointer">
                                            Đã liên hệ
                                          </label>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <Controller
                                            control={form.control}
                                            name="reserve.pre_delivery_key_flag"
                                            render={({ field }) => (
                                              <CustomCheckbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                              />
                                            )}
                                          />
                                          <label className="text-[1.2rem] font-bold cursor-pointer">
                                            Giao chìa khóa trước
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {contactedFlag && (
                                <div className="flex items-center mt-4">
                                  <p className="min-w-[10rem] font-bold text-[1.6rem]">Ngày giờ</p>
                                  <Controller
                                    control={form.control}
                                    name="reserve.checkin_date"
                                    render={({ field }) => (
                                      <CustomDatePicker
                                        value={field.value ? new Date(field.value) : null}
                                        format="yyyy/MM/dd HH:mm"
                                        className="w-[20rem] h-16"
                                        change={(date: Date | Date[] | null) => {
                                          field.onChange(formatDateValue(date, 'YYYY-MM-DD HH:mm'))
                                        }}
                                      />
                                    )}
                                  />
                                </div>
                              )}
                            </CustomCollapsibleContent>
                          )}
                        </CustomCollapsible>
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                </CustomAccordion>

                {/* ═══════════════════════════════════════════════════════════
                    BOTTOM ACTION BAR
                ═══════════════════════════════════════════════════════════ */}
                <div className="bottom-4 left-1/2 z-50 fixed bg-gray-300 shadow-lg px-6 py-3 rounded-2xl transition-all -translate-x-1/2 duration-300 transform">
                  <div className="flex flex-row justify-center items-center gap-4">
                    <NButton type="submit" className="bg-white mx-8 px-2 w-fit">
                      Đăng ký
                    </NButton>
                    <NButton
                      type="button"
                      className="bg-white mx-8 px-2 w-fit"
                      onClick={() => setModalConfirmClear(true)}
                    >
                      Xóa
                    </NButton>
                  </div>
                </div>
              </form>
            </FormProvider>
          </section>
        </div>
      </div>

      {/* Clear confirmation */}
      <CustomDialog
        opened={modalConfirmClear}
        changeOnOpened={(open) => !open && setModalConfirmClear(false)}
        title="Bạn có muốn xóa?"
        size="medium"
        trigger={<span />}
        content={
          <div className="flex justify-center gap-4 py-4">
            <NButton
              type="button"
              className="bg-green-600 mx-4 w-[12.4rem] text-white"
              onClick={handleClear}
            >
              Thực hiện
            </NButton>
            <DialogClose asChild>
              <NButton
                type="button"
                className="bg-[#eee] mx-4 w-[12.4rem]"
                onClick={() => setModalConfirmClear(false)}
              >
                Hủy
              </NButton>
            </DialogClose>
          </div>
        }
      />

      {/* Client Search Modal */}
      <CustomDialog
        opened={showClientModal}
        changeOnOpened={() => setShowClientModal(!showClientModal)}
        size="large"
        trigger={<span />}
        title="Tìm kiếm khách hàng"
        content={<SearchClientModal onSelectClient={handleClientSelect} />}
      />
    </>
  )
}
