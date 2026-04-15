import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import ErrorTooltip from '@/components/common/ErrorTooltip'
import Loading from '@/components/common/Loading'
import {
  ADVERTISING_TYPE_OPTIONS,
  BILLING_ADVANCE_HEADERS,
  BILLING_NORMAL_HEADERS,
  CONFIRM_FLAG_OPTIONS,
  DATA_TYPE_OPTIONS,
  DELETE_STATUS_OPTIONS,
  DIRECTCHECKIN_TYPE_OPTIONS,
  NORESERVE_COUNT_OPTIONS,
  MOCK_AREA_OPTIONS,
  MOCK_KEYBOX_OPTIONS,
  OCCUPIER_HEADERS,
  RENTAL_KEYS_OPTIONS,
  SEX_OPTIONS,
  TIME_EXTENSION_OPTIONS,
  USED_MESSY_LEVEL_OPTIONS,
} from '@/constants/reservation'
import { BicycleSvg } from '@/components/svgs/BicycleSVG'
import { CarSvg } from '@/components/svgs/CarSvg'
import { DogSvg } from '@/components/svgs/DogSvg'
import { KeySVG02 } from '@/components/svgs/KeySVG02'
import { RugSVG } from '@/components/svgs/RugSVG'
import { DialogClose } from '@/components/ui/dialog'
import { NButton } from '@/components/ui/new-button'

import { useGetCountries } from '@/hooks/queries/useGetCountries'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRoomTypes } from '@/hooks/queries/useGetRoomTypes'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'
import { useReservation, useUpdateReservation } from '@/hooks/queries/useReservations'
import { calculateNights, normalizeDirectcheckinType } from '@/lib/reservation'
import { cn } from '@/lib/utils'
import type { Reservation, UpdateReservationBody } from '@/types/reservation'

export const Route = createLazyFileRoute('/_authenticated/reservations/$reserveId/edit')({
  component: ReservationEditPage,
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
  area_id: z.string().optional(),
  facility_id: z.string().optional(),
  room_type_id: z.string().optional(),
  room_id: z.string().optional(),
  stay_type_id: z.string().optional(),
  period_from: z.string().optional(),
  period_to: z.string().optional(),
  period_from_time: z.string().optional(),
  payment_due_date: z.string().optional(),
  noreserve_count_before: z.string().default('0'),
  noreserve_count_after: z.string().default('0'),
  auto_extend_flag: z.boolean().default(false),
  confirm_flag: z.string().default('0'),
  directcheckin_type: z.string().default('1'),
  advertising_type: z.string().default('0'),
  rental_keys: z.string().default('0'),
  return_keys: z.string().default('0'),
  note: z.string().max(1024).optional(),
  overdue_debt_note: z.string().max(1024).optional(),
  disable_reservation: z.boolean().default(false),
  // Direct checkin
  directcheckin_flag: z.boolean().default(false),
  keybox_name: z.string().optional(),
  keybox_password: z.string().optional(),
  di_contact_staff_id: z.string().optional(),
  contacted_flag: z.boolean().default(false),
  pre_delivery_key_flag: z.boolean().default(false),
  checkin_date: z.string().optional(),
  // Key return
  key_return_flag: z.boolean().default(false),
  key_return_contact_type: z.string().optional(),
  key_return_datetime: z.string().optional(),
  // Extension / Delete
  extension_time: z.string().optional(),
  checked_delete: z.boolean().default(false),
  delete_status: z.string().optional(),
  // Parking / Bicycle / Trunk / Pet
  amendment: z.string().optional(),
  pet_flag: z.boolean().default(false),
  dog_count: z.string().default('0'),
  cat_count: z.string().default('0'),
  other_count: z.string().default('0'),
  pet_note: z.string().optional(),
  futon_flag: z.boolean().default(false),
  deliverybox_flag: z.boolean().default(false),
  // Substitute room
  substitute_facility_id: z.string().optional(),
  substitute_room_id: z.string().optional(),
  substitute_room_from: z.string().optional(),
  substitute_room_to: z.string().optional(),
  substitute_room_note: z.string().optional(),
  // Staff
  charge_staff_id: z.string().optional(),
  charge_staff_id2: z.string().optional(),
  // Announcements
  request_announcement: z.string().max(1024).optional(),
  sale_announcement: z.string().max(1024).optional(),
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
    area_id: '',
    facility_id: '',
    room_type_id: '',
    room_id: '',
    stay_type_id: '',
    period_from: '',
    period_to: '',
    period_from_time: '',
    payment_due_date: '',
    noreserve_count_before: '0',
    noreserve_count_after: '0',
    auto_extend_flag: false,
    confirm_flag: '0',
    directcheckin_type: '1',
    advertising_type: '0',
    rental_keys: '0',
    return_keys: '0',
    note: '',
    overdue_debt_note: '',
    disable_reservation: false,
    directcheckin_flag: false,
    keybox_name: '',
    keybox_password: '',
    di_contact_staff_id: '',
    contacted_flag: false,
    pre_delivery_key_flag: false,
    checkin_date: '',
    key_return_flag: false,
    key_return_contact_type: '',
    key_return_datetime: '',
    extension_time: '',
    checked_delete: false,
    delete_status: '',
    amendment: '',
    pet_flag: false,
    dog_count: '0',
    cat_count: '0',
    other_count: '0',
    pet_note: '',
    futon_flag: false,
    deliverybox_flag: false,
    substitute_facility_id: '',
    substitute_room_id: '',
    substitute_room_from: '',
    substitute_room_to: '',
    substitute_room_note: '',
    charge_staff_id: '',
    charge_staff_id2: '',
    request_announcement: '',
    sale_announcement: '',
  },
}

// Key return contact type options
const KEY_RETURN_CONTACT_OPTIONS: Option[] = [
  { label: 'Trả trực tiếp', value: '1' },
  { label: 'Bưu điện', value: '2' },
  { label: 'Khác', value: '9' },
]

// ─── Extended Reservation type ───────────────────────────────────────
interface ReservationDetail extends Reservation {
  client?: {
    clientId: number
    clientName: string
    companyName?: string
    contactName?: string
    dataType: number
    birthday: string | null
    sex: number | null
    countryId: number | null
    countryName?: string
    zipCode?: string
    address1?: string
    address2?: string
    companyZipCode?: string
    companyAddress1?: string
    companyAddress2?: string
    email?: string
    tel?: string
    telPhone?: string
    telEmergency?: string
    emergencyRelation?: string
    companyTel?: string
    fax?: string
    useCount: number
    memo?: string
    stayDurationAutoFlag: boolean
    usedMessyLevel: number
    ugFlag: boolean
    postpaidFlag?: boolean
  }
}

// ─── Main Page Component ─────────────────────────────────────────────
function ReservationEditPage() {
  const { reserveId } = useParams({ from: '/_authenticated/reservations/$reserveId/edit' })
  const reserveIdNum = Number(reserveId)
  useDocumentTitle('Chỉnh sửa đặt phòng')
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalConfirmSubmit, setModalConfirmSubmit] = useState(false)
  const [isRedirect, setIsRedirect] = useState<'list' | 'stay'>('stay')
  const [isFormPopulated, setIsFormPopulated] = useState(false)

  // Refs for scroll
  const refBilling = useRef<HTMLDivElement>(null)
  const refInvoice = useRef<HTMLDivElement>(null)
  const refSales = useRef<HTMLDivElement>(null)
  const refOccupier = useRef<HTMLDivElement>(null)

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const dataType = form.watch('client.data_type')
  const ugFlag = form.watch('client.ug_flag')
  const directcheckinFlag = form.watch('reserve.directcheckin_flag')
  const contactedFlag = form.watch('reserve.contacted_flag')
  const checkedDelete = form.watch('reserve.checked_delete')
  const periodFrom = form.watch('reserve.period_from')
  const periodTo = form.watch('reserve.period_to')
  const facilityId = form.watch('reserve.facility_id')
  const roomTypeId = form.watch('reserve.room_type_id')

  const nights = useMemo(() => calculateNights(periodFrom ?? '', periodTo ?? ''), [periodFrom, periodTo])

  // ─── Data Hooks ──────────────────────────────────────────────────
  const { data: reserveData, isLoading: isLoadingReserve } = useReservation(reserveIdNum)
  const reserve = reserveData as ReservationDetail | undefined

  const { data: facilitiesData } = useGetFacilities()
  const { data: roomTypesData } = useGetRoomTypes()
  const { data: roomsData } = useGetRooms({
    params: facilityId ? { facilityId: Number(facilityId) } : undefined,
  })
  const { data: stayTypes } = useGetStayTypes()
  const { data: countries } = useGetCountries()
  const { data: staffsData } = useGetStaffs({})

  const { mutateAsync: updateReservation } = useUpdateReservation()

  // ─── Options ─────────────────────────────────────────────────────
  const facilityOptions: Option[] = useMemo(
    () =>
      (facilitiesData?.data ?? []).map((f) => ({
        label: f.facilityName,
        value: String(f.facilityId),
      })),
    [facilitiesData]
  )

  const roomTypeOptions: Option[] = useMemo(
    () =>
      (roomTypesData?.data ?? []).map((rt) => ({
        label: rt.roomTypeName,
        value: String(rt.roomTypeId),
      })),
    [roomTypesData]
  )

  const roomOptions: Option[] = useMemo(
    () =>
      (roomsData?.data ?? [])
        .filter((r) => !roomTypeId || String(r.roomTypeId) === roomTypeId)
        .map((r) => ({
          label: r.roomNumber,
          value: String(r.roomId),
        })),
    [roomsData, roomTypeId]
  )

  const stayTypeOptions: Option[] = useMemo(
    () =>
      (stayTypes ?? []).map((st) => ({
        label: st.stayTypeName,
        value: String(st.stayTypeId),
      })),
    [stayTypes]
  )

  const countryOptions: Option[] = useMemo(
    () =>
      (countries ?? []).map((c) => ({
        label: c.countryName,
        value: String(c.countryId),
      })),
    [countries]
  )

  const staffOptions: Option[] = useMemo(
    () =>
      (staffsData ?? []).map((s) => ({
        label: s.staffName,
        value: String(s.staffId),
      })),
    [staffsData]
  )

  // ─── Populate form from reservation data ─────────────────────────
  useEffect(() => {
    if (!reserve || isFormPopulated) return

    const client = reserve.client
    form.reset({
      client: {
        data_type: String(client?.dataType ?? 1),
        client_id: String(reserve.clientId ?? ''),
        client_name: client?.clientName ?? '',
        company_name: client?.companyName ?? '',
        contact_name: client?.contactName ?? '',
        birthday: client?.birthday ?? '',
        sex: client?.sex ? String(client.sex) : '',
        country_id: client?.countryId ? String(client.countryId) : '',
        zip_code: client?.zipCode ?? '',
        address1: client?.address1 ?? '',
        address2: client?.address2 ?? '',
        company_zip_code: client?.companyZipCode ?? '',
        company_address1: client?.companyAddress1 ?? '',
        company_address2: client?.companyAddress2 ?? '',
        email: client?.email ?? '',
        tel: client?.tel ?? '',
        tel_phone: client?.telPhone ?? '',
        tel_emergency: client?.telEmergency ?? '',
        emergency_relation: client?.emergencyRelation ?? '',
        company_tel: client?.companyTel ?? '',
        fax: client?.fax ?? '',
        use_count: String(client?.useCount ?? 0),
        memo: client?.memo ?? '',
        stay_duration_auto_flag: client?.stayDurationAutoFlag ?? false,
        used_messy_level: String(client?.usedMessyLevel ?? 0),
        ug_flag: client?.ugFlag ?? false,
        postpaid_flag: client?.postpaidFlag ?? false,
        advertising_type: false,
      },
      reserve: {
        area_id: '',
        facility_id: reserve.facilityId ? String(reserve.facilityId) : '',
        room_type_id: '',
        room_id: reserve.roomId ? String(reserve.roomId) : '',
        stay_type_id: reserve.stayTypeId ? String(reserve.stayTypeId) : '',
        period_from: reserve.periodFrom ?? '',
        period_to: reserve.periodTo ?? '',
        period_from_time: '',
        payment_due_date: reserve.paymentDueDate ?? '',
        noreserve_count_before: '0',
        noreserve_count_after: '0',
        auto_extend_flag: reserve.autoExtendFlag ?? false,
        confirm_flag: reserve.confirmFlag ? '1' : '0',
        directcheckin_type: normalizeDirectcheckinType(reserve.directcheckinType),
        advertising_type: reserve.advertisingType ? String(reserve.advertisingType) : '0',
        rental_keys: reserve.rentalKeys ? String(reserve.rentalKeys) : '0',
        return_keys: reserve.returnKeys ? String(reserve.returnKeys) : '0',
        note: reserve.note ?? '',
        overdue_debt_note: reserve.overdueDebtNote ?? '',
        disable_reservation: reserve.disableReservation ?? false,
        directcheckin_flag: reserve.directcheckinFlag ?? false,
        keybox_name: '',
        keybox_password: '',
        di_contact_staff_id: reserve.diContactStaffId ? String(reserve.diContactStaffId) : '',
        contacted_flag: reserve.contactedFlag ?? false,
        pre_delivery_key_flag: false,
        checkin_date: reserve.checkinDate ?? '',
        key_return_flag: reserve.keyReturnFlag ?? false,
        key_return_contact_type: reserve.keyReturnContactType
          ? String(reserve.keyReturnContactType)
          : '',
        key_return_datetime: '',
        extension_time: '',
        checked_delete: !!reserve.deleteStatus,
        delete_status: reserve.deleteStatus ? String(reserve.deleteStatus) : '',
        amendment: reserve.amendment ?? '',
        pet_flag: reserve.petFlag ?? false,
        dog_count: String(reserve.dogCount ?? 0),
        cat_count: String(reserve.catCount ?? 0),
        other_count: String(reserve.otherCount ?? 0),
        pet_note: reserve.petNote ?? '',
        futon_flag: reserve.futonFlag ?? false,
        deliverybox_flag: reserve.deliveryboxFlag ?? false,
        substitute_facility_id: '',
        substitute_room_id: '',
        substitute_room_from: '',
        substitute_room_to: '',
        substitute_room_note: '',
        charge_staff_id: reserve.chargeStaffId ? String(reserve.chargeStaffId) : '',
        charge_staff_id2: reserve.chargeStaffId2 ? String(reserve.chargeStaffId2) : '',
        request_announcement: reserve.requestAnnouncement ?? '',
        sale_announcement: reserve.saleAnnouncement ?? '',
      },
    })
    setIsFormPopulated(true)
  }, [reserve, isFormPopulated, form])

  // ─── Submit handler ───────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const body: UpdateReservationBody = {
        reserveId: reserveIdNum,
        facilityId: values.reserve.facility_id ? Number(values.reserve.facility_id) : undefined,
        roomId: values.reserve.room_id ? Number(values.reserve.room_id) : undefined,
        stayTypeId: values.reserve.stay_type_id ? Number(values.reserve.stay_type_id) : undefined,
        periodFrom: values.reserve.period_from || undefined,
        periodTo: values.reserve.period_to || undefined,
        advertisingType: values.reserve.advertising_type
          ? Number(values.reserve.advertising_type)
          : undefined,
        confirmFlag: values.reserve.confirm_flag === '1',
        directcheckinFlag: values.reserve.directcheckin_flag,
        directcheckinType: Number(normalizeDirectcheckinType(Number(values.reserve.directcheckin_type))),
        petFlag: values.reserve.pet_flag,
        dogCount: values.reserve.dog_count ? Number(values.reserve.dog_count) : undefined,
        catCount: values.reserve.cat_count ? Number(values.reserve.cat_count) : undefined,
        otherCount: values.reserve.other_count ? Number(values.reserve.other_count) : undefined,
        petNote: values.reserve.pet_note || undefined,
        note: values.reserve.note || undefined,
        memo: values.client.memo || undefined,
        amendment: values.reserve.amendment || undefined,
        futonFlag: values.reserve.futon_flag,
        deliveryboxFlag: values.reserve.deliverybox_flag,
        autoExtendFlag: values.reserve.auto_extend_flag,
        chargeStaffId: values.reserve.charge_staff_id
          ? Number(values.reserve.charge_staff_id)
          : undefined,
        chargeStaffId2: values.reserve.charge_staff_id2
          ? Number(values.reserve.charge_staff_id2)
          : undefined,
        diContactStaffId: values.reserve.di_contact_staff_id
          ? Number(values.reserve.di_contact_staff_id)
          : undefined,
        contactedFlag: values.reserve.contacted_flag,
        rentalKeys: values.reserve.rental_keys ? Number(values.reserve.rental_keys) : undefined,
        returnKeys: values.reserve.return_keys ? Number(values.reserve.return_keys) : undefined,
        keyReturnContactType: values.reserve.key_return_contact_type
          ? Number(values.reserve.key_return_contact_type)
          : undefined,
        keyReturnFlag: values.reserve.key_return_flag,
        overdueDebtNote: values.reserve.overdue_debt_note || undefined,
        disableReservation: values.reserve.disable_reservation,
        paymentDueDate: values.reserve.payment_due_date || undefined,
        earlyExitDatetime: undefined,
      }

      await updateReservation(body)
      if (isRedirect === 'list') {
        navigate({ to: '/reservations' })
      }
    } catch {
      // error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingReserve) {
    return <Loading />
  }

  if (!reserve) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-500">Không tìm thấy đặt phòng</p>
        <NButton onClick={() => navigate({ to: '/reservations' })} className="mt-4">
          Quay lại danh sách
        </NButton>
      </div>
    )
  }

  return (
    <>
      {isSubmitting && <Loading />}
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
                      </div>
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className={cn('pb-0')}>
                      <div
                        className={cn(
                          'px-16 pt-[3.4rem] pb-16 rounded-[0_0_0.8rem_0.8rem] w-full overflow-auto',
                          ugFlag && 'bg-orange-300'
                        )}
                      >
                        {/* Row 1: Type + Client Code + ID Card + Expiry Date */}
                        <div className="flex items-center gap-[1.4rem]">
                          {/* Type (Loại) - disabled for edit */}
                          <div className="flex items-center my-4">
                            <p className="min-w-[10rem] font-bold text-[1.6rem]">Loại</p>
                            <Controller
                              control={form.control}
                              name="client.data_type"
                              render={({ field }) => (
                                <CustomRadio
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="flex flex-row"
                                  disabled
                                >
                                  {DATA_TYPE_OPTIONS.map((opt) => (
                                    <div
                                      key={opt.id}
                                      className="flex items-center my-2 mr-[2.4rem]"
                                    >
                                      <CustomRadioItems value={opt.value} />
                                      <label className="ml-2 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                        {opt.name}
                                      </label>
                                    </div>
                                  ))}
                                </CustomRadio>
                              )}
                            />
                          </div>

                          {/* Client Code */}
                          <div className="flex items-center my-4 mr-10">
                            <p className="min-w-[10rem] font-bold text-[1.6rem]">Mã KH</p>
                            <CustomInput
                              {...form.register('client.client_id')}
                              disabled
                              className="disabled:bg-[#D9D9D9] !opacity-100 w-[12rem]"
                            />
                          </div>

                          {/* ID Card button */}
                          <div className="flex items-center my-4">
                            <p className="w-[9.2rem] font-bold text-[1.6rem]">Giấy tờ</p>
                            <NButton
                              type="button"
                              className="bg-[#fff] sm:w-[12rem] text-lg sm:text-2xl"
                              onClick={() => toast.info('Tính năng chưa được triển khai')}
                            >
                              Cài đặt
                            </NButton>
                          </div>

                          {/* Expiry Date */}
                          <div className="flex items-center my-4">
                            <p className="w-[7.7rem] font-bold text-[1.6rem]">Hạn SD</p>
                            <Controller
                              control={form.control}
                              name="client.birthday"
                              render={() => (
                                <CustomDatePicker
                                  value={null}
                                  format="yyyy/MM/dd"
                                  disabled
                                  className="flex-1 [&>div]:px-4 w-[15rem] md:w-[19rem] h-16 font-bold text-2xl"
                                  change={() => {}}
                                />
                              )}
                            />
                          </div>
                        </div>

                        {/* Row 2: English Site Reservation */}
                        <div className="flex items-center ml-[10rem]">
                          <Controller
                            control={form.control}
                            name="client.advertising_type"
                            render={({ field }) => (
                              <div className="flex items-center gap-2">
                                <CustomCheckbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <label className="font-bold text-[1.6rem] leading-7 cursor-pointer">
                                  Đặt qua trang EN
                                </label>
                              </div>
                            )}
                          />
                        </div>

                        {/* Row 3: Name fields (disabled for edit) */}
                        {dataType === '1' ? (
                          <div className="flex items-center">
                            <div className="flex items-center my-4 mr-16">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">Họ tên</p>
                              <div className="relative">
                                <CustomInput
                                  {...form.register('client.client_name')}
                                  disabled
                                  className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                                />
                                {form.formState.errors.client?.client_name && (
                                  <ErrorTooltip
                                    text={form.formState.errors.client.client_name.message ?? ''}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center my-4">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">Số lần SD</p>
                              <CustomInput
                                {...form.register('client.use_count')}
                                disabled
                                className="disabled:bg-[#D9D9D9] !opacity-100 w-[8rem]"
                              />
                              <span className="ml-2 font-bold text-[1.6rem]">lần</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <div className="flex items-center my-4 mr-16">
                                <p className="min-w-[10rem] font-bold text-[1.6rem]">Tên công ty</p>
                                <div className="relative">
                                  <CustomInput
                                    {...form.register('client.company_name')}
                                    disabled
                                    className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center my-4">
                                <p className="min-w-[10rem] font-bold text-[1.6rem]">Số lần SD</p>
                                <CustomInput
                                  {...form.register('client.use_count')}
                                  disabled
                                  className="disabled:bg-[#D9D9D9] !opacity-100 w-[8rem]"
                                />
                                <span className="ml-2 font-bold text-[1.6rem]">lần</span>
                              </div>
                            </div>
                            <div className="flex items-center my-4">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">Người liên hệ</p>
                              <div className="relative">
                                <CustomInput
                                  {...form.register('client.contact_name')}
                                  disabled
                                  className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Row 3b: Company name (for individual) + Occupier button */}
                        {dataType === '1' && (
                          <div className="flex items-center">
                            <div className="flex items-center my-4 mr-16">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">Tên công ty</p>
                              <CustomInput
                                {...form.register('client.company_name')}
                                disabled
                                className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                              />
                            </div>
                            <NButton
                              type="button"
                              className="w-[7rem]"
                              onClick={() =>
                                refOccupier.current?.scrollIntoView({ behavior: 'smooth' })
                              }
                            >
                              Người ở
                            </NButton>
                          </div>
                        )}

                        {/* Row 4: Phone numbers (disabled) */}
                        <div className="flex items-center gap-[4.2rem] flex-wrap">
                          <div className="flex items-center my-4">
                            <p className="min-w-[10rem] font-bold text-[1.6rem]">☎ Di động</p>
                            <CustomInput
                              {...form.register('client.tel_phone')}
                              disabled
                              className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                            />
                          </div>
                          {dataType === '1' ? (
                            <div className="flex items-center my-4">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">☎ Nhà</p>
                              <CustomInput
                                {...form.register('client.tel')}
                                disabled
                                className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center my-4">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">☎ Công ty</p>
                              <CustomInput
                                {...form.register('client.company_tel')}
                                disabled
                                className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                              />
                            </div>
                          )}
                          <div className="flex items-center my-4">
                            <p className="min-w-[10rem] font-bold text-[1.6rem]">Email</p>
                            <CustomInput
                              {...form.register('client.email')}
                              disabled
                              className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                            />
                          </div>
                        </div>

                        {/* Row 5: Emergency contact (disabled) */}
                        <div className="flex items-center gap-[4.3rem] flex-wrap">
                          <div className="flex items-center my-4">
                            <p className="min-w-[10rem] font-bold text-[1.6rem]">☎ Khẩn cấp</p>
                            <CustomInput
                              {...form.register('client.tel_emergency')}
                              disabled
                              className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                            />
                          </div>
                          <div className="flex items-center my-4">
                            <p className="min-w-[10rem] font-bold text-[1.6rem]">Tên LH khẩn cấp</p>
                            <CustomInput
                              {...form.register('client.emergency_relation')}
                              disabled
                              className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                            />
                          </div>
                          {(dataType === '2' || dataType === '3') && (
                            <div className="flex items-center my-4">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">FAX</p>
                              <CustomInput
                                {...form.register('client.fax')}
                                disabled
                                className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                              />
                            </div>
                          )}
                        </div>

                        {/* ─── Collapsible: Chi tiết ──────────────────────── */}
                        <CustomCollapsible className="my-8">
                          <CustomCollapsibleTrigger>
                            <h5 className="font-bold text-[2.3rem] leading-none">
                              ■ Chi tiết thông tin
                            </h5>
                          </CustomCollapsibleTrigger>
                          <CustomCollapsibleContent className="mt-8">
                            {/* Sex */}
                            <div className="flex items-center my-4">
                              <p className="min-w-[10rem] font-bold text-[1.6rem]">Giới tính</p>
                              <Controller
                                control={form.control}
                                name="client.sex"
                                render={({ field }) => (
                                  <CustomRadio
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex flex-row"
                                    disabled
                                  >
                                    {SEX_OPTIONS.map((opt) => (
                                      <div
                                        key={opt.id}
                                        className="flex items-center my-2 mr-[2.4rem]"
                                      >
                                        <CustomRadioItems value={opt.value} />
                                        <label className="ml-2 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                          {opt.name}
                                        </label>
                                      </div>
                                    ))}
                                  </CustomRadio>
                                )}
                              />
                            </div>

                            {/* Nationality + Birthday */}
                            <div className="flex items-center gap-[4rem] flex-wrap">
                              <div className="flex items-center my-4">
                                <p className="min-w-[10rem] font-bold text-[1.6rem]">Quốc tịch</p>
                                <Controller
                                  control={form.control}
                                  name="client.country_id"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      isAll
                                      option={countryOptions}
                                      selected={countryOptions.find((o) => o.value === field.value)}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-[26.2rem]"
                                      disabledSelect
                                    />
                                  )}
                                />
                              </div>
                              <div className="flex items-center my-4">
                                <p className="min-w-[10rem] font-bold text-[1.6rem]">Ngày sinh</p>
                                <Controller
                                  control={form.control}
                                  name="client.birthday"
                                  render={({ field }) => (
                                    <CustomDatePicker
                                      value={field.value ? new Date(field.value) : null}
                                      format="yyyy/MM/dd"
                                      disabled
                                      className="flex-1 [&>div]:px-4 w-[19rem] h-16 font-bold text-2xl"
                                      change={(date: Date | Date[] | null) => {
                                        if (date instanceof Date) {
                                          field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                        } else {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </div>
                            </div>

                            {/* Zip Code + Address (Individual) - disabled */}
                            {dataType === '1' && (
                              <div className="flex items-center gap-[3.2rem] flex-wrap">
                                <div className="flex items-center my-4">
                                  <p className="min-w-[10rem] font-bold text-[1.6rem]">
                                    Mã bưu chính
                                  </p>
                                  <CustomInput
                                    {...form.register('client.zip_code')}
                                    disabled
                                    className="disabled:bg-[#D9D9D9] !opacity-100 w-[15.2rem]"
                                  />
                                </div>
                                <div className="flex items-center my-4">
                                  <p className="min-w-[10rem] font-bold text-[1.6rem]">Địa chỉ</p>
                                  <CustomInput
                                    {...form.register('client.address1')}
                                    disabled
                                    className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                                    placeholder="Tỉnh/Thành phố"
                                  />
                                </div>
                                <div className="flex items-center my-4">
                                  <CustomInput
                                    {...form.register('client.address2')}
                                    disabled
                                    className="disabled:bg-[#D9D9D9] !opacity-100 w-[30.7rem]"
                                    placeholder="Quận/Huyện + Số nhà"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Company Zip + Address (Corporation) - disabled */}
                            {dataType !== '1' && (
                              <div className="flex items-center gap-[3.2rem] flex-wrap">
                                <div className="flex items-center my-4">
                                  <p className="min-w-[10rem] font-bold text-[1.6rem]">
                                    Mã BC công ty
                                  </p>
                                  <CustomInput
                                    {...form.register('client.company_zip_code')}
                                    disabled
                                    className="disabled:bg-[#D9D9D9] !opacity-100 w-[15.2rem]"
                                  />
                                </div>
                                <div className="flex items-center my-4">
                                  <p className="min-w-[10rem] font-bold text-[1.6rem]">
                                    ĐC công ty
                                  </p>
                                  <CustomInput
                                    {...form.register('client.company_address1')}
                                    disabled
                                    className="disabled:bg-[#D9D9D9] !opacity-100 w-[26.2rem]"
                                    placeholder="Tỉnh/Thành phố"
                                  />
                                </div>
                                <div className="flex items-center my-4">
                                  <CustomInput
                                    {...form.register('client.company_address2')}
                                    disabled
                                    className="disabled:bg-[#D9D9D9] !opacity-100 w-[30.7rem]"
                                    placeholder="Quận/Huyện + Số nhà"
                                  />
                                </div>
                              </div>
                            )}
                          </CustomCollapsibleContent>
                        </CustomCollapsible>

                        {/* ─── Bottom: Checkboxes + Messy Level + Memo ──── */}
                        <div className="flex flex-wrap gap-8 mt-4">
                          <div className="flex items-center gap-2">
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
                            <label className="font-bold text-[1.6rem] cursor-pointer">
                              Tự động gia hạn lưu trú
                            </label>
                          </div>

                          <div className="flex items-center">
                            <p className="w-[9.2rem] font-bold text-[1.6rem]">Mức bẩn</p>
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
                                  customClassMain="w-[14rem]"
                                />
                              )}
                            />
                          </div>

                          {/* Service used icons (read-only) */}
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[1.6rem]">Dịch vụ SD:</p>
                            <CarSvg className="w-8 h-8 opacity-30" />
                            <BicycleSvg className="w-8 h-8 opacity-30" />
                            <DogSvg className="w-8 h-8 opacity-30" />
                          </div>
                        </div>

                        {/* Memo + UG + Postpaid */}
                        <div className="flex items-start gap-8 mt-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                              <label className="font-bold text-[1.6rem]">Ghi chú KH</label>
                              <div className="flex items-center gap-2">
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
                                <label className="font-bold text-[1.6rem] cursor-pointer">UG</label>
                              </div>
                              {dataType === '3' && (
                                <div className="flex items-center gap-2">
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
                                  <label className="font-bold text-[1.6rem] cursor-pointer">
                                    Thanh toán sau
                                  </label>
                                </div>
                              )}
                            </div>
                            <CustomTextarea
                              {...form.register('client.memo')}
                              className="bg-white py-8 w-[51.7rem] min-h-[6.9rem]"
                            />
                          </div>
                        </div>
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>

                  {/* ═══════════════════════════════════════════════════════════
                      ACCORDION 2: THÔNG TIN ĐẶT PHÒNG & THANH TOÁN (BLUE #79A3E0)
                  ═══════════════════════════════════════════════════════════ */}
                  <CustomAccordionItem
                    value="reservation-0"
                    className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                  >
                    <CustomAccordionTrigger className="bg-[#79A3E0] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                      <span className="font-bold text-black text-[1.2rem] sm:text-[1.8rem] px-4">
                        Thông tin đặt phòng / Thanh toán
                      </span>
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className="pb-0">
                      <div className="px-16 pt-[3.4rem] pb-16 w-full overflow-x-auto">
                        {/* ── Section: Thông tin đặt phòng ────────────── */}
                        <h5 className="font-bold text-[2.3rem] leading-none">
                          ■ Thông tin đặt phòng
                        </h5>

                        {/* Horizontal table row of selects */}
                        <div className="flex items-center mt-[1.6rem]">
                          <SelectColumn
                            label="Khu vực"
                            width="12.4rem"
                            name="reserve.area_id"
                            options={MOCK_AREA_OPTIONS}
                            form={form}
                          />
                          <SelectColumn
                            label="Cơ sở"
                            width="12.4rem"
                            name="reserve.facility_id"
                            options={facilityOptions}
                            form={form}
                          />
                          <SelectColumn
                            label="Loại phòng"
                            width="12.4rem"
                            name="reserve.room_type_id"
                            options={roomTypeOptions}
                            form={form}
                          />
                          <SelectColumn
                            label="Số phòng"
                            width="12.4rem"
                            name="reserve.room_id"
                            options={roomOptions}
                            form={form}
                          />
                          <SelectColumn
                            label="Trước X"
                            width="7rem"
                            name="reserve.noreserve_count_before"
                            options={NORESERVE_COUNT_OPTIONS}
                            form={form}
                          />

                          {/* Period From ~ To */}
                          <div className="my-0 ml-[-0.1rem] min-w-[26.1rem] flex-1">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                Thời gian ({nights} đêm)
                              </p>
                              <div className="flex items-center border border-black">
                                <Controller
                                  control={form.control}
                                  name="reserve.period_from"
                                  render={({ field }) => (
                                    <CustomDatePicker
                                      value={field.value ? new Date(field.value) : null}
                                      format="yyyy/MM/dd"
                                      className="flex-none [&>div]:px-[0.4rem] [&>div]:border-black w-[11.3rem] h-16"
                                      change={(date: Date | Date[] | null) => {
                                        if (date instanceof Date) {
                                          field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                        } else {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                  )}
                                />
                                <span className="flex flex-1 justify-center items-center !mt-0 border-black border-y w-14 h-16 font-bold text-[1.4rem]">
                                  ~
                                </span>
                                <Controller
                                  control={form.control}
                                  name="reserve.period_to"
                                  render={({ field }) => (
                                    <CustomDatePicker
                                      value={field.value ? new Date(field.value) : null}
                                      format="yyyy/MM/dd"
                                      className="flex-none [&>div]:px-[0.4rem] [&>div]:border-black w-[11.3rem] h-16"
                                      change={(date: Date | Date[] | null) => {
                                        if (date instanceof Date) {
                                          field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                        } else {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          <SelectColumn
                            label="Sau X"
                            width="7rem"
                            name="reserve.noreserve_count_after"
                            options={NORESERVE_COUNT_OPTIONS}
                            form={form}
                          />
                          <SelectColumn
                            label="Loại lưu trú"
                            width="12.3rem"
                            name="reserve.stay_type_id"
                            options={stayTypeOptions}
                            form={form}
                          />
                          {/* Auto Extend checkbox */}
                          <div className="my-0 ml-[-0.1rem] min-w-[8rem]">
                            <div className="flex flex-col">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.2rem] text-center">
                                Không tự động gia hạn
                              </p>
                              <div className="flex justify-center items-center border border-black h-16">
                                <Controller
                                  control={form.control}
                                  name="reserve.auto_extend_flag"
                                  render={({ field }) => (
                                    <CustomCheckbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <SelectColumn
                            label="Xác nhận"
                            width="9.4rem"
                            name="reserve.confirm_flag"
                            options={CONFIRM_FLAG_OPTIONS}
                            form={form}
                          />
                        </div>

                        {/* Check-in method row */}
                        <div className="mt-8 w-[70%]">
                          <div className="flex">
                            <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.4rem] h-[4.8rem] font-bold text-[1.6rem]">
                              Phương thức nhận phòng
                            </div>
                            <div className="flex flex-1 justify-between items-center px-8 py-2 border border-black">
                              <Controller
                                control={form.control}
                                name="reserve.directcheckin_type"
                                render={({ field }) => (
                                  <CustomRadio
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex flex-wrap md:flex-nowrap gap-x-8 gap-y-4 !mt-0"
                                  >
                                    {DIRECTCHECKIN_TYPE_OPTIONS.map((opt) => (
                                      <div key={opt.id} className="flex items-center">
                                        <CustomRadioItems value={opt.value} />
                                        <label className="ml-2 font-bold text-[1.4rem] cursor-pointer">
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
                        <div className="mt-[-0.1rem] w-[70%]">
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
                                        <label className="ml-2 font-bold text-[1.4rem] cursor-pointer">
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

                        {/* Rental Keys + Return Keys + Check-in Time + Payment Due */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center mt-[1.6rem] mr-4">
                            {/* Key icon + rental keys */}
                            <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[6.5rem]">
                              <div className="flex flex-col">
                                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16">
                                  <KeySVG02 className="w-8 h-8" />
                                </p>
                                <div className="flex justify-center items-center border border-black h-16">
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
                                        customClassMain="w-full h-14"
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Return keys */}
                            <div className="my-0 ml-[-0.1rem] min-w-[6.5rem]">
                              <div className="flex flex-col">
                                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.2rem]">
                                  Trả chìa
                                </p>
                                <div className="flex justify-center items-center border border-black h-16">
                                  <Controller
                                    control={form.control}
                                    name="reserve.return_keys"
                                    render={({ field }) => (
                                      <CustomSelectClean
                                        option={RENTAL_KEYS_OPTIONS}
                                        selected={RENTAL_KEYS_OPTIONS.find(
                                          (o) => o.value === field.value
                                        )}
                                        change={(o) => field.onChange(o.value)}
                                        customClassMain="w-full h-14"
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Check-in Time */}
                            <div className="my-0 ml-[-0.1rem] min-w-[12rem]">
                              <div className="flex flex-col">
                                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                  Giờ nhận phòng
                                </p>
                                <div className="flex items-center border border-black h-16 px-2">
                                  <Controller
                                    control={form.control}
                                    name="reserve.period_from_time"
                                    render={({ field }) => (
                                      <CustomInput
                                        type="time"
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        className="w-full h-14 text-center"
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Payment Due */}
                            <div className="my-0 ml-[-0.1rem] min-w-[12rem]">
                              <div className="flex flex-col">
                                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                                  Hạn thanh toán
                                </p>
                                <div className="flex items-center border border-black h-16">
                                  <Controller
                                    control={form.control}
                                    name="reserve.payment_due_date"
                                    render={({ field }) => (
                                      <CustomDatePicker
                                        value={field.value ? new Date(field.value) : null}
                                        format="yyyy/MM/dd"
                                        className="w-full h-14 [&>div]:px-[0.4rem]"
                                        change={(date: Date | Date[] | null) => {
                                          if (date instanceof Date) {
                                            field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                          } else {
                                            field.onChange('')
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Staff selects */}
                          <div className="flex items-center mt-[1.6rem] gap-4">
                            <div className="flex items-center">
                              <p className="font-bold text-[1.4rem] mr-2">NV phụ trách</p>
                              <Controller
                                control={form.control}
                                name="reserve.charge_staff_id"
                                render={({ field }) => (
                                  <CustomSelectClean
                                    isAll
                                    option={staffOptions}
                                    selected={staffOptions.find((o) => o.value === field.value)}
                                    change={(o) => field.onChange(o.value)}
                                    customClassMain="w-[14rem]"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Reservation Memo */}
                        <div className="mt-[1.6rem] w-[51.7rem]">
                          <div className="flex">
                            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[8.6rem] min-h-[6.9rem] font-bold text-[1.4rem] text-center">
                              Ghi chú đặt phòng
                            </p>
                            <CustomTextarea
                              {...form.register('reserve.note')}
                              className="flex-1 border border-black h-[6.9rem] min-h-full font-bold text-[1.4rem]"
                            />
                          </div>
                        </div>

                        {/* Disable reservation checkbox */}
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Controller
                              control={form.control}
                              name="reserve.disable_reservation"
                              render={({ field }) => (
                                <CustomCheckbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                            <label className="font-bold text-[1.4rem] cursor-pointer">
                              Vô hiệu hóa đặt phòng tiếp theo sau đặt phòng này
                            </label>
                          </div>
                        </div>

                        {/* Overdue Debt Memo */}
                        <div className="mt-[1.6rem] w-[51.7rem]">
                          <div className="flex">
                            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[8.6rem] min-h-[6.9rem] font-bold text-[1.4rem] text-center">
                              Ghi chú quá hạn
                            </p>
                            <CustomTextarea
                              {...form.register('reserve.overdue_debt_note')}
                              className="flex-1 border border-black h-[6.9rem] min-h-full font-bold text-[1.4rem]"
                            />
                          </div>
                        </div>

                        {/* ── Collapsible: Direct Checkin ─────────────── */}
                        <CustomCollapsible className="my-8">
                          <CustomCollapsibleTrigger className="[&>svg]:hidden">
                            <div className="flex items-center gap-2">
                              <Controller
                                control={form.control}
                                name="reserve.directcheckin_flag"
                                render={({ field }) => (
                                  <CustomCheckbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                )}
                              />
                              <h5 className="font-bold text-[2.3rem] leading-none">
                                Check-in trực tiếp
                              </h5>
                            </div>
                          </CustomCollapsibleTrigger>
                          {directcheckinFlag && (
                            <CustomCollapsibleContent className="my-4">
                              <div className="flex items-center">
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
                                <div className="ml-[-0.1rem] min-w-[23.3rem]">
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
                                {/* Staff */}
                                <div className="ml-[-0.1rem] min-w-[33rem]">
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
                                            selected={staffOptions.find(
                                              (o) => o.value === field.value
                                            )}
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
                                                onCheckedChange={field.onChange}
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
                              {/* Checkin Date (when contacted) */}
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
                                          if (date instanceof Date) {
                                            field.onChange(dayjs(date).format('YYYY-MM-DD HH:mm'))
                                          } else {
                                            field.onChange('')
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </div>
                              )}
                            </CustomCollapsibleContent>
                          )}
                        </CustomCollapsible>

                        {/* ── Section: Key Return (Edit-only) ──────────── */}
                        <CustomCollapsible className="my-8">
                          <CustomCollapsibleTrigger>
                            <h5 className="font-bold text-[2.3rem] leading-none">
                              ■ Trả chìa khóa
                            </h5>
                          </CustomCollapsibleTrigger>
                          <CustomCollapsibleContent className="mt-4">
                            <div className="flex items-center gap-8 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Controller
                                  control={form.control}
                                  name="reserve.key_return_flag"
                                  render={({ field }) => (
                                    <CustomCheckbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  )}
                                />
                                <label className="font-bold text-[1.6rem] cursor-pointer">
                                  Đã trả chìa khóa
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[1.6rem]">Phương thức</p>
                                <Controller
                                  control={form.control}
                                  name="reserve.key_return_contact_type"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      isAll
                                      option={KEY_RETURN_CONTACT_OPTIONS}
                                      selected={KEY_RETURN_CONTACT_OPTIONS.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-[14rem]"
                                    />
                                  )}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[1.6rem]">Ngày trả</p>
                                <Controller
                                  control={form.control}
                                  name="reserve.key_return_datetime"
                                  render={({ field }) => (
                                    <CustomDatePicker
                                      value={field.value ? new Date(field.value) : null}
                                      format="yyyy/MM/dd HH:mm"
                                      className="w-[20rem] h-16"
                                      change={(date: Date | Date[] | null) => {
                                        if (date instanceof Date) {
                                          field.onChange(dayjs(date).format('YYYY-MM-DD HH:mm'))
                                        } else {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </CustomCollapsibleContent>
                        </CustomCollapsible>

                        {/* ── Section: Billing Normal (Mock) ─────────── */}
                        <div ref={refBilling} className="scroll-mt-[10rem]">
                          <h5 className="mt-12 font-bold text-[2.3rem]">
                            ■ Thông tin thanh toán của đặt phòng này
                          </h5>
                          <div className="mt-8 max-h-[40rem] overflow-y-auto">
                            <table className="border-black border-l w-full min-w-[120rem] font-bold text-[1.6rem] border-separate border-spacing-0">
                              <thead>
                                <tr>
                                  {BILLING_NORMAL_HEADERS.map((h) => (
                                    <th
                                      key={h}
                                      className="sticky top-0 z-10 bg-[#EEEEEE] border border-black border-l-0 px-4 h-16 text-center"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td
                                    colSpan={BILLING_NORMAL_HEADERS.length}
                                    className="text-center py-8 text-gray-400 border border-black border-l-0"
                                  >
                                    Chưa có dữ liệu
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="flex mr-14 border border-black h-[3.6rem] mt-4">
                            <div className="flex items-center justify-center bg-[#EEEEEE] px-4 w-[18.2rem] font-bold text-[1.6rem]">
                              Tổng phụ
                            </div>
                            <div className="flex items-center justify-center min-w-[18.2rem] font-bold text-[1.6rem]">
                              0₫
                            </div>
                          </div>
                          <NButton
                            type="button"
                            className="bg-[#D9D9D9] w-[18.2rem] h-[3.6rem] mt-2"
                            disabled
                          >
                            Thêm dòng
                          </NButton>
                        </div>

                        {/* ── Section: Billing Advance (Mock) ────────── */}
                        <h5 className="mt-12 font-bold text-[2.3rem]">
                          ■ Thông tin thanh toán trước
                        </h5>
                        <div className="mt-8 w-full min-w-[120rem] font-bold text-[1.6rem]">
                          <table className="border-black border-l w-full border-separate border-spacing-0">
                            <thead>
                              <tr>
                                {BILLING_ADVANCE_HEADERS.map((h) => (
                                  <th
                                    key={h}
                                    className="bg-[#EEEEEE] border border-black border-l-0 px-4 h-16 text-center"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td
                                  colSpan={BILLING_ADVANCE_HEADERS.length}
                                  className="text-center py-8 text-gray-400 border border-black border-l-0"
                                >
                                  Chưa có dữ liệu
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="flex mr-14 border border-black h-[3.6rem] mt-4">
                          <div className="flex items-center justify-center bg-[#EEEEEE] px-4 w-[18.2rem] font-bold text-[1.6rem]">
                            Tổng phụ
                          </div>
                          <div className="flex items-center justify-center min-w-[18.2rem] font-bold text-[1.6rem]">
                            0₫
                          </div>
                        </div>
                        <NButton
                          type="button"
                          className="bg-[#D9D9D9] w-[18.2rem] h-[3.6rem] mt-2"
                          disabled
                        >
                          Thêm dòng
                        </NButton>

                        {/* ── Section: Occupier Table (Mock) ─────────── */}
                        <div ref={refOccupier} className="scroll-mt-[10rem]">
                          <h5 className="mt-12 font-bold text-[2.3rem]">■ Người ở</h5>
                          <div className="mt-8">
                            <table className="border-black border-l w-full font-bold text-[1.6rem] border-separate border-spacing-0">
                              <thead>
                                <tr>
                                  {OCCUPIER_HEADERS.map((h) => (
                                    <th
                                      key={h}
                                      className="bg-[#EEEEEE] border border-black border-l-0 px-4 h-16 text-center"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td
                                    colSpan={OCCUPIER_HEADERS.length}
                                    className="text-center py-8 text-gray-400 border border-black border-l-0"
                                  >
                                    Chưa có dữ liệu
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <NButton
                            type="button"
                            className="bg-[#D9D9D9] w-[18.2rem] h-[3.6rem] mt-2"
                            disabled
                          >
                            Thêm người ở
                          </NButton>
                        </div>

                        {/* ── Collapsible: Time Extension / Delete ──── */}
                        <CustomCollapsible className="my-8">
                          <CustomCollapsibleTrigger>
                            <h5 className="font-bold text-[2.3rem] leading-none">
                              Gia hạn, Xóa đặt phòng (Đăng ký nhầm / Hủy / No-Show)
                            </h5>
                          </CustomCollapsibleTrigger>
                          <CustomCollapsibleContent className="mt-4">
                            <div className="flex items-center gap-8">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[1.6rem]">Gia hạn thời gian</p>
                                <Controller
                                  control={form.control}
                                  name="reserve.extension_time"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      isAll
                                      option={TIME_EXTENSION_OPTIONS}
                                      selected={TIME_EXTENSION_OPTIONS.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-[8rem]"
                                    />
                                  )}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Controller
                                  control={form.control}
                                  name="reserve.checked_delete"
                                  render={({ field }) => (
                                    <CustomCheckbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  )}
                                />
                                <label className="font-bold text-[1.6rem] cursor-pointer">
                                  Đăng ký nhầm / Hủy / No-Show
                                </label>
                              </div>
                              {checkedDelete && (
                                <Controller
                                  control={form.control}
                                  name="reserve.delete_status"
                                  render={({ field }) => (
                                    <CustomSelectClean
                                      option={DELETE_STATUS_OPTIONS}
                                      selected={DELETE_STATUS_OPTIONS.find(
                                        (o) => o.value === field.value
                                      )}
                                      change={(o) => field.onChange(o.value)}
                                      customClassMain="w-[14rem]"
                                    />
                                  )}
                                />
                              )}
                            </div>
                          </CustomCollapsibleContent>
                        </CustomCollapsible>

                        {/* ── Collapsible: Parking / Bicycle / Trunk / Pet ── */}
                        <CustomCollapsible className="my-8">
                          <CustomCollapsibleTrigger>
                            <h5 className="font-bold text-[2.3rem] leading-none">
                              Bãi đỗ xe, Xe đạp, Kho, Thú cưng, RC/Tel
                            </h5>
                          </CustomCollapsibleTrigger>
                          <CustomCollapsibleContent className="mt-4">
                            <div className="md:flex md:flex-wrap md:items-center grid grid-cols-1 w-full md:max-w-[92.4rem]">
                              {/* Row 1 */}
                              <div className="flex w-[calc(50%+0.05rem)]">
                                <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.6rem] h-[4.8rem] font-bold text-[1.6rem]">
                                  <CarSvg className="w-6 h-6 mr-2" /> Bãi đỗ xe
                                </div>
                                <div className="flex flex-1 items-center px-4 border border-black h-[4.8rem]">
                                  <span className="text-gray-400 text-[1.4rem]">Chưa cài đặt</span>
                                  <NButton
                                    type="button"
                                    className="bg-[#EEEEEE] ml-8 w-[4.9rem] h-[1.8rem] !min-h-[1.8rem] text-[1.1rem]"
                                    onClick={() => toast.info('Tính năng chưa được triển khai')}
                                  >
                                    Cài đặt
                                  </NButton>
                                </div>
                              </div>
                              <div className="flex w-[calc(50%+0.05rem)]">
                                <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.6rem] h-[4.8rem] font-bold text-[1.6rem]">
                                  <BicycleSvg className="w-6 h-6 mr-2" /> Xe đạp
                                </div>
                                <div className="flex flex-1 items-center px-4 border border-black h-[4.8rem]">
                                  <span className="text-gray-400 text-[1.4rem]">Chưa cài đặt</span>
                                  <NButton
                                    type="button"
                                    className="bg-[#EEEEEE] ml-8 w-[4.9rem] h-[1.8rem] !min-h-[1.8rem] text-[1.1rem]"
                                    onClick={() => toast.info('Tính năng chưa được triển khai')}
                                  >
                                    Cài đặt
                                  </NButton>
                                </div>
                              </div>
                              {/* Row 2 */}
                              <div className="flex w-[calc(50%+0.05rem)] md:mt-[-0.1rem]">
                                <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.6rem] h-[4.8rem] font-bold text-[1.6rem]">
                                  <RugSVG className="w-6 h-6 mr-2" /> Phòng kho
                                </div>
                                <div className="flex flex-1 items-center px-4 border border-black h-[4.8rem]">
                                  <span className="text-gray-400 text-[1.4rem]">Chưa cài đặt</span>
                                  <NButton
                                    type="button"
                                    className="bg-[#EEEEEE] ml-8 w-[4.9rem] h-[1.8rem] !min-h-[1.8rem] text-[1.1rem]"
                                    onClick={() => toast.info('Tính năng chưa được triển khai')}
                                  >
                                    Cài đặt
                                  </NButton>
                                </div>
                              </div>
                              <div className="flex w-[calc(50%+0.05rem)] md:mt-[-0.1rem]">
                                <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.6rem] h-[4.8rem] font-bold text-[1.6rem]">
                                  <DogSvg className="w-6 h-6 mr-2" /> Thú cưng/Chăn/Hộp
                                </div>
                                <div className="flex flex-1 items-center px-4 border border-black h-[4.8rem]">
                                  <span className="text-gray-400 text-[1.4rem]">Chưa cài đặt</span>
                                  <NButton
                                    type="button"
                                    className="bg-[#EEEEEE] ml-8 w-[4.9rem] h-[1.8rem] !min-h-[1.8rem] text-[1.1rem]"
                                    onClick={() => toast.info('Tính năng chưa được triển khai')}
                                  >
                                    Cài đặt
                                  </NButton>
                                </div>
                              </div>
                              {/* RC/Tel row */}
                              <div className="flex w-full md:mt-[-0.1rem]">
                                <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.6rem] h-[4.8rem] font-bold text-[1.6rem]">
                                  RC/Tel
                                </div>
                                <div className="flex flex-1 items-center border border-black h-[4.8rem]">
                                  <CustomInput
                                    {...form.register('reserve.amendment')}
                                    className="!border-none !w-full h-16"
                                  />
                                </div>
                              </div>
                            </div>
                          </CustomCollapsibleContent>
                        </CustomCollapsible>

                        {/* ── Collapsible: Substitute Room ───────────── */}
                        <CustomCollapsible className="my-8">
                          <CustomCollapsibleTrigger>
                            <h5 className="font-bold text-[2.3rem] leading-none">Phòng thay thế</h5>
                          </CustomCollapsibleTrigger>
                          <CustomCollapsibleContent className="mt-4">
                            <div className="flex items-center">
                              <div className="ml-[-0.1rem] first:ml-0">
                                <div className="flex">
                                  <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[12.4rem] h-[7.5rem] font-bold text-[1.6rem]">
                                    Cơ sở
                                  </p>
                                  <div className="flex items-center border border-black w-[16.1rem] h-[7.5rem] px-2">
                                    <Controller
                                      control={form.control}
                                      name="reserve.substitute_facility_id"
                                      render={({ field }) => (
                                        <CustomSelectClean
                                          isAll
                                          option={facilityOptions}
                                          selected={facilityOptions.find(
                                            (o) => o.value === field.value
                                          )}
                                          change={(o) => field.onChange(o.value)}
                                          customClassMain="w-full"
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="ml-[-0.1rem]">
                                <div className="flex">
                                  <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[12.4rem] h-[7.5rem] font-bold text-[1.6rem]">
                                    Số phòng
                                  </p>
                                  <div className="flex items-center border border-black w-[16.1rem] h-[7.5rem] px-2">
                                    <Controller
                                      control={form.control}
                                      name="reserve.substitute_room_id"
                                      render={({ field }) => (
                                        <CustomSelectClean
                                          isAll
                                          option={roomOptions}
                                          selected={roomOptions.find(
                                            (o) => o.value === field.value
                                          )}
                                          change={(o) => field.onChange(o.value)}
                                          customClassMain="w-full"
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="ml-[-0.1rem]">
                                <div className="flex">
                                  <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[12.4rem] h-[7.5rem] font-bold text-[1.6rem]">
                                    Thời gian
                                  </p>
                                  <div className="flex flex-col justify-between border border-black w-[22.6rem] h-[7.5rem] px-2 py-1">
                                    <Controller
                                      control={form.control}
                                      name="reserve.substitute_room_from"
                                      render={({ field }) => (
                                        <CustomDatePicker
                                          value={field.value ? new Date(field.value) : null}
                                          format="yyyy/MM/dd"
                                          className="w-full h-[3rem]"
                                          change={(date: Date | Date[] | null) => {
                                            if (date instanceof Date) {
                                              field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                            } else {
                                              field.onChange('')
                                            }
                                          }}
                                        />
                                      )}
                                    />
                                    <Controller
                                      control={form.control}
                                      name="reserve.substitute_room_to"
                                      render={({ field }) => (
                                        <CustomDatePicker
                                          value={field.value ? new Date(field.value) : null}
                                          format="yyyy/MM/dd"
                                          className="w-full h-[3rem]"
                                          change={(date: Date | Date[] | null) => {
                                            if (date instanceof Date) {
                                              field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                            } else {
                                              field.onChange('')
                                            }
                                          }}
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                              <NButton
                                type="button"
                                className="ml-4 h-[3.6rem]"
                                onClick={() => {
                                  form.setValue('reserve.substitute_facility_id', '')
                                  form.setValue('reserve.substitute_room_id', '')
                                  form.setValue('reserve.substitute_room_from', '')
                                  form.setValue('reserve.substitute_room_to', '')
                                  form.setValue('reserve.substitute_room_note', '')
                                }}
                              >
                                Xóa
                              </NButton>
                            </div>
                            <div className="flex mt-4">
                              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[12.4rem] min-h-[6.9rem] font-bold text-[1.4rem]">
                                Nội dung
                              </p>
                              <CustomTextarea
                                {...form.register('reserve.substitute_room_note')}
                                className="flex-1 border border-black h-[6.9rem]"
                              />
                            </div>
                          </CustomCollapsibleContent>
                        </CustomCollapsible>

                        {/* ── Announcement Memos ────────────────────── */}
                        <div className="mt-[1.6rem] w-[51.7rem]">
                          <div className="flex">
                            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[8.6rem] min-h-[6.9rem] font-bold text-[1.4rem] text-center">
                              Ghi chú yêu cầu
                            </p>
                            <CustomTextarea
                              {...form.register('reserve.request_announcement')}
                              className="flex-1 border border-black h-[6.9rem] min-h-full font-bold text-[1.4rem]"
                            />
                          </div>
                        </div>
                        <div className="mt-[-0.1rem] w-[51.7rem]">
                          <div className="flex">
                            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 w-[8.6rem] min-h-[6.9rem] font-bold text-[1.4rem] text-center">
                              Ghi chú doanh thu
                            </p>
                            <CustomTextarea
                              {...form.register('reserve.sale_announcement')}
                              className="flex-1 border border-black h-[6.9rem] min-h-full font-bold text-[1.4rem]"
                            />
                          </div>
                        </div>
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>

                  {/* ═══════════════════════════════════════════════════════════
                      ACCORDION 3: HÓA ĐƠN (TEAL #D0E0E3)
                  ═══════════════════════════════════════════════════════════ */}
                  <div ref={refInvoice} className="mt-[2rem] scroll-mt-[10rem]">
                    <CustomAccordionItem
                      value="invoice"
                      className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                    >
                      <CustomAccordionTrigger className="bg-[#D0E0E3] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                        <span className="font-bold text-xl sm:text-3xl px-4">Hóa đơn</span>
                      </CustomAccordionTrigger>
                      <CustomAccordionContent>
                        <div className="p-[2rem] overflow-auto">
                          <div className="flex items-center justify-center py-12 text-gray-400 text-[1.6rem]">
                            Tính năng hóa đơn chưa được triển khai
                          </div>
                        </div>
                      </CustomAccordionContent>
                    </CustomAccordionItem>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════
                      ACCORDION 4: CHỈNH SỬA DOANH THU (PINK)
                  ═══════════════════════════════════════════════════════════ */}
                  <div ref={refSales} className="scroll-mt-[10rem]">
                    <CustomAccordionItem
                      value="sales"
                      className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                    >
                      <CustomAccordionTrigger className="bg-pink-200 py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                        <span className="font-bold text-xl sm:text-3xl px-4">
                          Chỉnh sửa doanh thu / Biên lai
                        </span>
                      </CustomAccordionTrigger>
                      <CustomAccordionContent>
                        <div className="p-[2rem] overflow-auto">
                          <div className="flex items-center justify-center py-12 text-gray-400 text-[1.6rem]">
                            Tính năng chỉnh sửa doanh thu chưa được triển khai
                          </div>
                        </div>
                      </CustomAccordionContent>
                    </CustomAccordionItem>
                  </div>
                </CustomAccordion>

                {/* ── Registration metadata ──────────────────── */}
                <div className="flex items-center gap-8 mt-8 px-4 text-[1.4rem] text-gray-500">
                  <span>
                    Tạo:{' '}
                    {reserve.createdAt
                      ? dayjs(reserve.createdAt).format('YYYY/MM/DD HH:mm')
                      : '---'}
                  </span>
                  <span>
                    Cập nhật:{' '}
                    {reserve.updatedAt
                      ? dayjs(reserve.updatedAt).format('YYYY/MM/DD HH:mm')
                      : '---'}
                  </span>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    FLOATING BOTTOM BAR
                ═══════════════════════════════════════════════════════════ */}
                <div className="bottom-4 left-1/2 z-50 fixed bg-gray-300 shadow-lg px-6 py-3 rounded-2xl transition-all -translate-x-1/2 duration-300 transform">
                  <div className="flex flex-row justify-center items-center gap-10 mb-4">
                    <button
                      type="button"
                      className="font-bold text-[1.6rem] text-primary underline"
                      onClick={() => refBilling.current?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Đăng ký thanh toán
                    </button>
                    <button
                      type="button"
                      className="font-bold text-[1.6rem] text-primary underline"
                      onClick={() => refInvoice.current?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Xuất hóa đơn
                    </button>
                    <button
                      type="button"
                      className="font-bold text-[1.6rem] text-primary underline"
                      onClick={() => refSales.current?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Chỉnh sửa doanh thu
                    </button>
                  </div>
                  <div className="flex flex-row justify-center items-center gap-4">
                    <NButton
                      type="submit"
                      className="bg-white mx-8 px-2 w-fit"
                      onClick={() => setIsRedirect('list')}
                    >
                      Cập nhật và chuyển danh sách
                    </NButton>
                    <NButton
                      type="submit"
                      className="bg-white mx-8 px-2 w-fit"
                      onClick={() => setIsRedirect('stay')}
                    >
                      Cập nhật và tiếp tục chỉnh sửa
                    </NButton>
                  </div>
                </div>
              </form>
            </FormProvider>
          </section>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CONFIRMATION MODAL
      ═══════════════════════════════════════════════════════════ */}
      <CustomDialog
        opened={modalConfirmSubmit}
        changeOnOpened={(open) => !open && setModalConfirmSubmit(false)}
        title="Thông tin thanh toán chưa được nhập, bạn có chắc không?"
        size="medium"
        trigger={<span />}
        content={
          <div className="flex justify-center gap-4 py-4">
            <NButton
              type="button"
              className="bg-green-600 mx-4 w-[12.4rem] text-white"
              onClick={() => {
                setModalConfirmSubmit(false)
                form.handleSubmit(handleSubmit)()
              }}
            >
              Cập nhật
            </NButton>
            <DialogClose asChild>
              <NButton
                type="button"
                className="bg-[#eee] mx-4 w-[12.4rem]"
                onClick={() => setModalConfirmSubmit(false)}
              >
                Hủy
              </NButton>
            </DialogClose>
          </div>
        }
      />
    </>
  )
}

// ─── SelectColumn helper component ───────────────────────────────────
interface SelectColumnProps {
  label: string
  width: string
  name: string
  options: Option[]
  form: ReturnType<typeof useForm<FormValues>>
}

function SelectColumn({ label, width, name, options, form }: SelectColumnProps) {
  return (
    <div className="my-0 ml-[-0.1rem] first:ml-0" style={{ minWidth: width }}>
      <div className="flex flex-col">
        <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
          {label}
        </p>
        <div className="relative w-full">
          <Controller
            control={form.control}
            name={name as keyof FormValues}
            render={({ field }) => (
              <CustomSelectClean
                isAll
                option={options}
                selected={options.find((o) => o.value === String(field.value ?? ''))}
                change={(o) => field.onChange(o.value)}
                customClassMain="w-full h-16"
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
