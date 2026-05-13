import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type Control, Controller, type FieldValues, FormProvider, useForm } from 'react-hook-form'
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
import IdentificationSettingModal from '@/components/dialogs/IdentificationSettingModal'
import ReservationBillingSection from '@/components/reservation/ReservationBillingSection'
import ReservationInfoCommonSection from '@/components/reservation/ReservationInfoCommonSection'
import { ReservationOccupierTable } from '@/components/reservation/ReservationOccupierTable'
import ReservationParkingSection from '@/components/reservation/ReservationParkingSection'
import ReservationRequestNormalSection from '@/components/reservation/ReservationRequestNormalSection'
import { DialogClose } from '@/components/ui/dialog'
import { NButton } from '@/components/ui/new-button'
import {
  DATA_TYPE_OPTIONS,
  DELETE_STATUS_OPTIONS,
  SEX_OPTIONS,
  TIME_EXTENSION_OPTIONS,
  USED_MESSY_LEVEL_OPTIONS,
} from '@/constants/reservation'

import { useCreateReserveOccupier } from '@/hooks/mutations/useCreateReserveOccupier'
import { useCreateSmartLockPin } from '@/hooks/mutations/useCreateSmartLockPin'
import { useDeleteReserveOccupier } from '@/hooks/mutations/useDeleteReserveOccupier'
import { useSyncRequestDetails } from '@/hooks/mutations/useSyncRequestDetails'
import { useUpdateSmartLockPin } from '@/hooks/mutations/useUpdateSmartLockPin'
import { useGetClientById } from '@/hooks/queries/useGetClientById'
import { useGetCountries } from '@/hooks/queries/useGetCountries'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRequestDetails } from '@/hooks/queries/useGetRequestDetails'
import { useGetRequestTypes } from '@/hooks/queries/useGetRequestTypes'
import { useGetReserveOccupiers } from '@/hooks/queries/useGetReserveOccupiers'
import { useGetRoomTypes } from '@/hooks/queries/useGetRoomTypes'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import { useGetSmartLockPins } from '@/hooks/queries/useGetSmartLockPins'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'
import { useReservation, useUpdateReservation } from '@/hooks/queries/useReservations'
import { useDirectCheckinSmartLock } from '@/hooks/useDirectCheckinSmartLock'
import {
  calculateNights,
  extractTimeValue,
  formatDateValue,
  mergeDateAndTime,
  normalizeDirectcheckinType,
} from '@/lib/reservation'
import {
  getReservationClientDefaultValues,
  getReservationEditReserveDefaultValues,
  reservationClientSchema,
  reservationEditReserveSchema,
} from '@/lib/reservation-form'
import {
  generateSmartLockPin,
  resolveSelfCheckinSmartLockState,
} from '@/lib/smart-lock-directcheckin'
import { cn } from '@/lib/utils'
import type { ReserveOccupier } from '@/types/occupier'
import type { Reservation, UpdateReservationBody } from '@/types/reservation'

export const Route = createLazyFileRoute('/_authenticated/reservations/$reserveId/edit')({
  component: ReservationEditPage,
})

// ─── Schema ──────────────────────────────────────────────────────────
const formSchema = z.object({
  client: reservationClientSchema,
  reserve: reservationEditReserveSchema.extend({
    directcheckin_note: z.string().max(256).optional(),
    smart_lock_pin: z.string().optional(),
    smart_lock_valid_from: z.string().optional(),
    smart_lock_valid_to: z.string().optional(),
  }),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: FormValues = {
  client: getReservationClientDefaultValues(),
  reserve: {
    ...getReservationEditReserveDefaultValues(),
    directcheckin_note: '',
    smart_lock_pin: '',
    smart_lock_valid_from: '',
    smart_lock_valid_to: '',
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
  const [isIdentificationOpen, setIsIdentificationOpen] = useState(false)

  // Refs for scroll
  const refInvoice = useRef<HTMLDivElement>(null)
  const refOccupier = useRef<HTMLDivElement>(null)
  const formPopulateKeyRef = useRef('')
  const submittingRef = useRef(false)
  const queryClient = useQueryClient()

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const dataType = form.watch('client.data_type')
  const ugFlag = form.watch('client.ug_flag')
  const directcheckinFlag = form.watch('reserve.directcheckin_flag')
  const directcheckinType = form.watch('reserve.directcheckin_type')
  const contactedFlag = form.watch('reserve.contacted_flag')
  const checkedDelete = form.watch('reserve.checked_delete')
  const periodFrom = form.watch('reserve.period_from')
  const periodTo = form.watch('reserve.period_to')
  const periodFromTime = form.watch('reserve.period_from_time')
  const facilityId = form.watch('reserve.facility_id')
  const roomTypeId = form.watch('reserve.room_type_id')

  const nights = useMemo(
    () => calculateNights(periodFrom ?? '', periodTo ?? ''),
    [periodFrom, periodTo]
  )

  // ─── Data Hooks ──────────────────────────────────────────────────
  const { data: reserveData, isLoading: isLoadingReserve } = useReservation(reserveIdNum)
  const reserve = reserveData as ReservationDetail | undefined
  const { data: clientDetail } = useGetClientById({
    clientId: reserve?.clientId ?? 0,
    enabled: !!reserve?.clientId,
  })

  const { data: facilitiesData } = useGetFacilities()
  const { data: roomTypesData } = useGetRoomTypes({
    params: facilityId
      ? {
          facilityId: Number(facilityId),
          dataStatus: 1,
          limit: 1000,
        }
      : {
          dataStatus: 1,
          limit: 1000,
        },
  })
  const { data: roomsData } = useGetRooms({
    params: facilityId
      ? {
          facilityId: Number(facilityId),
          limit: 1000,
          dataStatus: 1,
        }
      : undefined,
  })
  const { data: stayTypes } = useGetStayTypes()
  const { data: countries } = useGetCountries()
  const { data: staffsData } = useGetStaffs({})
  const { data: smartLockPinsData } = useGetSmartLockPins({
    params: {
      reserveId: reserveIdNum,
      status: 1,
      dataStatus: 1,
      page: 1,
      limit: 1,
      orderBy: 'roomPinCredentialId',
      order: 'desc',
    },
    enabled: Number.isFinite(reserveIdNum) && reserveIdNum > 0,
  })
  const latestSmartLockCredential = smartLockPinsData?.data?.[0]

  const { data: requestTypesData } = useGetRequestTypes()
  const requestTypes = requestTypesData ?? []

  const { data: requestDetailsData } = useGetRequestDetails(reserveIdNum)
  const { sync: syncRequestDetails } = useSyncRequestDetails()

  const { data: occupiersData } = useGetReserveOccupiers({
    reserveId: reserveIdNum && Number.isFinite(reserveIdNum) ? reserveIdNum : undefined,
  })

  const { mutateAsync: updateReservation } = useUpdateReservation()
  const { mutateAsync: createSmartLockPin } = useCreateSmartLockPin()
  const { mutateAsync: updateSmartLockPin } = useUpdateSmartLockPin()
  const { mutateAsync: createReserveOccupier } = useCreateReserveOccupier()
  const { mutateAsync: deleteReserveOccupier } = useDeleteReserveOccupier()

  // ─── Options ─────────────────────────────────────────────────────
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
      (f) => String(f.facilityId) === facilityId
    )
    return selectedFacility ? `Cơ sở ${selectedFacility.facilityNo}` : '---'
  }, [facilitiesData, facilityId])

  const roomTypeOptions: Option[] = useMemo(
    () =>
      (roomTypesData?.data ?? []).map((rt) => ({
        label: rt.roomTypeName,
        value: String(rt.roomTypeId),
      })),
    [roomTypesData]
  )

  const selectedRoomTypeShortLabel = useMemo(() => {
    const selected = (roomTypesData?.data ?? []).find((rt) => String(rt.roomTypeId) === roomTypeId)
    return selected ? selected.roomTypeNameShort : '---'
  }, [roomTypesData, roomTypeId])

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

  const resolvedFacilityShortLabel = useMemo(() => {
    if (selectedFacilityShortLabel !== '---') return selectedFacilityShortLabel
    if (reserve?.facilityNo) return `Cơ sở ${reserve.facilityNo}`
    return '---'
  }, [selectedFacilityShortLabel, reserve?.facilityNo])

  const resolvedRoomTypeOptions: Option[] = useMemo(() => {
    if (
      reserve?.roomTypeId &&
      reserve.roomTypeName &&
      !roomTypeOptions.some((option) => option.value === String(reserve.roomTypeId))
    ) {
      return [
        {
          label: reserve.roomTypeName,
          value: String(reserve.roomTypeId),
        },
        ...roomTypeOptions,
      ]
    }

    return roomTypeOptions
  }, [roomTypeOptions, reserve?.roomTypeId, reserve?.roomTypeName])

  const resolvedRoomTypeShortLabel = useMemo(() => {
    if (selectedRoomTypeShortLabel !== '---') return selectedRoomTypeShortLabel
    return reserve?.roomTypeName ?? '---'
  }, [selectedRoomTypeShortLabel, reserve?.roomTypeName])

  const resolvedRoomOptions: Option[] = useMemo(() => {
    if (
      reserve?.roomId &&
      reserve.roomNumber &&
      !roomOptions.some((option) => option.value === String(reserve.roomId))
    ) {
      return [
        {
          label: reserve.roomNumber,
          value: String(reserve.roomId),
        },
        ...roomOptions,
      ]
    }

    return roomOptions
  }, [roomOptions, reserve?.roomId, reserve?.roomNumber])

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
  }

  const { syncDirectcheckinFlagByType, toggleDirectcheckinFlag, handleContactedFlagChange } =
    useDirectCheckinSmartLock({
      getValues: form.getValues,
      setValue: form.setValue,
      periodFrom,
      periodTo,
      checkinTime: periodFromTime,
      directcheckinFlag,
      directcheckinType,
    })

  // ─── Populate form from reservation data ─────────────────────────
  useEffect(() => {
    if (!reserve) return
    if (!occupiersData) return
    if (submittingRef.current) return

    const client = clientDetail ?? reserve.client
    const populateKey = [
      reserve.reserveId,
      reserve.updatedAt ?? 'no-reserve-updated-at',
      clientDetail?.updatedAt ?? 'no-client-detail',
      latestSmartLockCredential?.updatedAt ?? 'no-smart-lock-pin',
      requestDetailsData ? 'rd-loaded' : 'rd-pending',
    ].join('-')
    if (formPopulateKeyRef.current === populateKey) return

    formPopulateKeyRef.current = populateKey

    form.reset({
      client: {
        data_type: String(client?.dataType ?? 1),
        client_id: String(reserve.clientId ?? ''),
        client_name: client?.clientName ?? reserve.clientName ?? '',
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
        tel: client?.tel ?? reserve.clientTel ?? '',
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
        room_type_id: reserve.roomTypeId != null ? String(reserve.roomTypeId) : '',
        room_id: reserve.roomId ? String(reserve.roomId) : '',
        stay_type_id: reserve.stayTypeId ? String(reserve.stayTypeId) : '',
        period_from: reserve.periodFrom ? dayjs(reserve.periodFrom).format('YYYY-MM-DD') : '',
        period_to: reserve.periodTo ? dayjs(reserve.periodTo).format('YYYY-MM-DD') : '',
        period_from_time: extractTimeValue(reserve.periodFrom) || '14:00',
        payment_due_date: reserve.paymentDueDate ?? '',
        noreserve_count_before: String(reserve.noreserveCountBefore ?? 0),
        noreserve_count_after: String(reserve.noreserveCountAfter ?? 0),
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
        directcheckin_note: reserve.directcheckinNote ?? '',
        smart_lock_pin: latestSmartLockCredential?.maskedPin ?? '',
        smart_lock_valid_from: latestSmartLockCredential?.validFrom
          ? dayjs(latestSmartLockCredential.validFrom).format('YYYY-MM-DD HH:mm')
          : '',
        smart_lock_valid_to: latestSmartLockCredential?.validTo
          ? dayjs(latestSmartLockCredential.validTo).format('YYYY-MM-DD HH:mm')
          : '',
        keybox_name: '',
        keybox_password: '',
        di_contact_staff_id: reserve.diContactStaffId ? String(reserve.diContactStaffId) : '',
        contacted_flag: reserve.contactedFlag ?? false,
        checkin_date: reserve.checkinDate
          ? dayjs(reserve.checkinDate).format('YYYY-MM-DD HH:mm')
          : '',
        box_usage_period_type: '',
        box_usage_start_date: '',
        box_usage_end_date: '',
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
        charge_staff_id: reserve.chargeStaffId ? String(reserve.chargeStaffId) : '',
        charge_staff_id2: reserve.chargeStaffId2 ? String(reserve.chargeStaffId2) : '',
        request_announcement: reserve.requestAnnouncement ?? '',
        sale_announcement: reserve.saleAnnouncement ?? '',
        request_normal: (requestDetailsData?.data ?? []).map((rd) => {
          const rdFrom = rd.requestFrom ? dayjs(rd.requestFrom).format('YYYY-MM-DD') : ''
          const rdTo = rd.requestTo ? dayjs(rd.requestTo).format('YYYY-MM-DD') : ''
          const rt = requestTypes.find((r) => r.requestTypeId === rd.requestTypeId)
          // Reconstruct source_type + source_key so isSyncedFeeRow()
          // recognises auto-generated rows and avoids duplicates with syncAutoFees.
          let source_type = ''
          let source_id = ''
          let source_key = ''

          if (rd.requestTypeId === 1) {
            // Rent — must match createSourceKey(RENT_SOURCE_TYPE, roomTypeId, stayTypeId, from, to)
            source_type = 'rent'
            source_id = String(reserve.roomTypeId ?? '')
            source_key = [
              'rent',
              reserve.roomTypeId ?? 0,
              reserve.stayTypeId ?? 0,
              rdFrom,
              rdTo,
            ].join(':')
          } else if (rt?.category === 'service') {
            // Rent-extra fees (management, utility, cleaning…)
            source_type = 'rent_extra'
            source_id = String(rd.requestTypeId)
            source_key = ['rent_extra', rd.requestTypeId, 0, rdFrom, rdTo].join(':')
          } else if (rt?.category === 'parking') {
            source_type = 'parking'
            source_id = String(rd.requestTypeId)
            source_key = ['parking', rd.requestTypeId, 0, rdFrom, rdTo].join(':')
          }

          return {
            request_detail_id: rd.requestDetailId,
            is_checked: true,
            request_type_id: String(rd.requestTypeId),
            request_from: rdFrom,
            request_to: rdTo,
            count: String(rd.count),
            count_unit: String(rd.countUnit),
            unit_price: String(rd.unitPrice ?? 0),
            charge_staff_id: rd.chargeStaffId ? String(rd.chargeStaffId) : '',
            source_type,
            source_id,
            source_key,
          }
        }),
        occupiers: (occupiersData?.data ?? []).map((occ) => ({
          reserve_occupier_id: occ.reserveOccupierId,
          occupier_name: occ.occupierName,
          sex: String(occ.sex ?? ''),
          tel: occ.tel ?? '',
          birthday: occ.birthday ?? null,
          address1: occ.address1 ?? '',
          order_num: occ.orderNum ?? 0,
        })),
        parking_reserve: [],
        bicycle_parking_reserve: [],
      },
    })
  }, [reserve, clientDetail, form, latestSmartLockCredential, occupiersData, requestDetailsData])

  // ─── Submit handler ───────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    const existingSmartLockCredentialId = latestSmartLockCredential?.roomPinCredentialId

    const {
      isSelfCheckin,
      isPinMasked,
      smartLockPin,
      smartLockValidFrom,
      smartLockValidTo,
      smartLockValidationError,
    } = resolveSelfCheckinSmartLockState({
      directcheckinFlag: values.reserve.directcheckin_flag,
      directcheckinType: values.reserve.directcheckin_type,
      roomId: values.reserve.room_id,
      smartLockPin: values.reserve.smart_lock_pin,
      smartLockValidFrom: values.reserve.smart_lock_valid_from,
      smartLockValidTo: values.reserve.smart_lock_valid_to,
      periodFrom: values.reserve.period_from,
      periodTo: values.reserve.period_to,
      checkinTime: values.reserve.period_from_time,
      hasExistingSmartLockPin: !!existingSmartLockCredentialId,
    })

    if (smartLockValidationError) {
      toast.error(smartLockValidationError)
      return
    }

    setIsSubmitting(true)
    submittingRef.current = true
    try {
      const body: UpdateReservationBody = {
        reserveId: reserveIdNum,
        facilityId: values.reserve.facility_id ? Number(values.reserve.facility_id) : undefined,
        roomId: values.reserve.room_id ? Number(values.reserve.room_id) : undefined,
        stayTypeId: values.reserve.stay_type_id ? Number(values.reserve.stay_type_id) : undefined,
        periodFrom: values.reserve.period_from
          ? mergeDateAndTime(values.reserve.period_from, values.reserve.period_from_time || '14:00')
          : undefined,
        periodTo: values.reserve.period_to || undefined,
        noreserveCountBefore: values.reserve.noreserve_count_before
          ? Number(values.reserve.noreserve_count_before)
          : 0,
        noreserveCountAfter: values.reserve.noreserve_count_after
          ? Number(values.reserve.noreserve_count_after)
          : 0,
        advertisingType: values.reserve.advertising_type
          ? Number(values.reserve.advertising_type)
          : undefined,
        confirmFlag: values.reserve.confirm_flag === '1',
        directcheckinFlag: values.reserve.directcheckin_flag,
        directcheckinType: Number(
          normalizeDirectcheckinType(Number(values.reserve.directcheckin_type))
        ),
        directcheckinNote: values.reserve.directcheckin_note || undefined,
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
        checkinDate: values.reserve.checkin_date
          ? dayjs(values.reserve.checkin_date).format('YYYY-MM-DDTHH:mm:ss')
          : null,
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

      // Sync request_normal rows → RequestDetail + SaleDetail APIs
      try {
        await syncRequestDetails(
          reserveIdNum,
          values.reserve.request_normal ?? [],
          requestDetailsData?.data ?? []
        )
      } catch {
        toast.warning('Lưu đặt phòng thành công nhưng đồng bộ khoản mục thất bại.')
      }

      // Handle occupier changes
      const originalOccupiers = occupiersData?.data ?? []
      const newOccupiers = values.reserve.occupiers || []

      // Create new occupiers (those without reserve_occupier_id)
      const toCreate = newOccupiers.filter((occ) => !occ.reserve_occupier_id)
      for (const occ of toCreate) {
        try {
          await createReserveOccupier({
            data: {
              occupierName: occ.occupier_name,
              sex: Number(occ.sex) || 9,
              tel: occ.tel || undefined,
              birthday: occ.birthday || undefined,
              address1: occ.address1 || undefined,
              orderNum: occ.order_num,
            },
            reserveId: reserveIdNum,
          })
        } catch {
          toast.warning('Cập nhật đặt phòng thành công nhưng lưu người ở thất bại.')
        }
      }

      // Delete removed occupiers
      const toDelete = originalOccupiers.filter(
        (orig) => !newOccupiers.find((n) => n.reserve_occupier_id === orig.reserveOccupierId)
      )
      for (const occ of toDelete) {
        try {
          await deleteReserveOccupier(occ.reserveOccupierId)
        } catch {
          toast.warning('Cập nhật đặt phòng thành công nhưng xóa người ở thất bại.')
        }
      }

      // Fetch fresh occupiers and update form directly before releasing the submit guard
      await queryClient.refetchQueries({ queryKey: ['reserve-occupiers', reserveIdNum] })
      const freshOccupiers = queryClient.getQueryData<{ data: ReserveOccupier[] }>([
        'reserve-occupiers',
        reserveIdNum,
      ])
      form.setValue(
        'reserve.occupiers',
        (freshOccupiers?.data ?? []).map((occ) => ({
          reserve_occupier_id: occ.reserveOccupierId,
          occupier_name: occ.occupierName,
          sex: String(occ.sex ?? ''),
          tel: occ.tel ?? '',
          birthday: occ.birthday ?? null,
          address1: occ.address1 ?? '',
          order_num: occ.orderNum ?? 0,
        })),
        { shouldDirty: false }
      )
      submittingRef.current = false

      if (isSelfCheckin && values.reserve.room_id) {
        try {
          const smartLockValidFromIso = dayjs(smartLockValidFrom).toISOString()
          const smartLockValidToIso = dayjs(smartLockValidTo).toISOString()

          if (existingSmartLockCredentialId) {
            await updateSmartLockPin({
              roomPinCredentialId: existingSmartLockCredentialId,
              reserveId: reserveIdNum,
              roomId: Number(values.reserve.room_id),
              validFrom: smartLockValidFromIso,
              validTo: smartLockValidToIso,
              status: 1,
              dataStatus: 1,
              ...(isPinMasked ? {} : { pin: smartLockPin }),
            })
          } else if (smartLockPin) {
            await createSmartLockPin({
              reserveId: reserveIdNum,
              roomId: Number(values.reserve.room_id),
              pin: smartLockPin,
              validFrom: smartLockValidFromIso,
              validTo: smartLockValidToIso,
              status: 1,
              dataStatus: 1,
            })
          }
        } catch {
          toast.warning('Cập nhật đặt phòng thành công nhưng lưu Smart Lock thất bại.')
        }
      }

      if (isRedirect === 'list') {
        navigate({ to: '/reservations' })
      }
    } catch {
      // error handled by mutation
    } finally {
      submittingRef.current = false
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

  const handleConvertDraftToFull = async () => {
    if (!reserve) return
    try {
      await updateReservation({ reserveId: reserve.reserveId, draftFlag: false })
    } catch {
      // toast already shown by mutation onError
    }
  }

  return (
    <>
      {isSubmitting && <Loading />}
      <div className="common-container">
        <div className="pt-16 pb-52">
          {reserve.draftFlag && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFF8E1] border border-[#E0B900] rounded-[0.8rem] px-6 py-4 mb-8">
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-bold text-[1.6rem] text-black">Đây là đặt tạm</p>
                  <p className="text-[1.3rem]">
                    Đặt phòng đang ở trạng thái giữ chỗ tạm thời. Chuyển thành đặt phòng chính thức
                    để xác nhận.
                  </p>
                </div>
              </div>
              <NButton
                type="button"
                variant="default"
                className="!px-4 whitespace-nowrap"
                onClick={handleConvertDraftToFull}
              >
                Chuyển thành đặt phòng chính thức
              </NButton>
            </div>
          )}
          <section>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CustomAccordion
                  type="multiple"
                  className="w-full"
                  defaultValue={['reservation-0']}
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
                        <ReservationInfoCommonSection
                          control={form.control as unknown as Control<FieldValues>}
                          periodFrom={periodFrom}
                          nightCount={nights}
                          facilityOptions={facilityOptions}
                          selectedFacilityShortLabel={resolvedFacilityShortLabel}
                          onFacilityChange={handleFacilityChange}
                          roomTypeOptions={resolvedRoomTypeOptions}
                          selectedRoomTypeShortLabel={resolvedRoomTypeShortLabel}
                          onRoomTypeChange={handleRoomTypeChange}
                          roomOptions={resolvedRoomOptions}
                          onRoomChange={handleRoomChange}
                          isFacilitySelected={!!facilityId}
                          stayTypeOptions={stayTypeOptions}
                          checkinTimeFieldName="reserve.period_from_time"
                          directcheckinFlag={directcheckinFlag}
                          contactedFlag={contactedFlag}
                          staffOptions={staffOptions}
                          onSyncDirectcheckinFlagByType={syncDirectcheckinFlagByType}
                          onToggleDirectcheckinFlag={toggleDirectcheckinFlag}
                          onContactedFlagChange={handleContactedFlagChange}
                          onGenerateSmartLockPin={generateSmartLockPin}
                        />

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

                        {/* Billing section */}
                        <div className="scroll-mt-[10rem]">
                          <ReservationRequestNormalSection
                            control={form.control as unknown as Control<FieldValues>}
                            periodFrom={periodFrom}
                            periodTo={periodTo}
                            staffOptions={staffOptions}
                            roomTypeId={roomTypeId}
                            stayTypeId={form.watch('reserve.stay_type_id')}
                            facilityId={facilityId}
                          />
                        </div>

                        {/* ── Section: Occupier Table ─────────────── */}
                        <div ref={refOccupier} className="scroll-mt-[10rem]">
                          <ReservationOccupierTable
                            control={form.control as unknown as Control<FieldValues>}
                            fieldName="reserve.occupiers"
                            client={{
                              client_name: form.getValues('client.client_name'),
                              tel_phone: form.getValues('client.tel_phone'),
                              address1: form.getValues('client.address1'),
                              address2: form.getValues('client.address2'),
                              birthday: form.getValues('client.birthday'),
                              sex: form.getValues('client.sex'),
                            }}
                            disabled={false}
                          />
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
                            <h5 className="font-bold text-[2.3rem] leading-none">Bãi đỗ xe</h5>
                          </CustomCollapsibleTrigger>
                          <CustomCollapsibleContent className="mt-4">
                            <div className="md:flex md:flex-wrap md:items-center grid grid-cols-1 w-full md:max-w-[92.4rem]">
                              <div className="mb-6 w-full md:max-w-none">
                                <ReservationParkingSection
                                  facilityId={facilityId}
                                  periodFrom={periodFrom}
                                  periodTo={periodTo}
                                  reserveId={reserveIdNum}
                                />
                              </div>
                            </div>
                          </CustomCollapsibleContent>
                        </CustomCollapsible>
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>

                  {/* ═══════════════════════════════════════════════════════════
                      ACCORDION 3: HÓA ĐƠN & THANH TOÁN (TEAL #D0E0E3)
                  ═══════════════════════════════════════════════════════════ */}
                  <div ref={refInvoice} className="mt-[2rem] scroll-mt-[10rem]">
                    <CustomAccordionItem
                      value="billing"
                      className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                    >
                      <CustomAccordionTrigger className="bg-[#D0E0E3] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                        <span className="font-bold text-xl sm:text-3xl px-4">
                          Hóa đơn & Thanh toán
                        </span>
                      </CustomAccordionTrigger>
                      <CustomAccordionContent>
                        <div className="p-[2rem] overflow-auto">
                          <ReservationBillingSection
                            reserveId={reserveIdNum}
                            requestTypes={requestTypes}
                            staffOptions={staffOptions}
                          />
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
                      onClick={() => refInvoice.current?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Hóa đơn & Thanh toán
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
