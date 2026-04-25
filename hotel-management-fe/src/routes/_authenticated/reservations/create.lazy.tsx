import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
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
import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import type { Option } from '@/components/common/CustomSelectClean'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import Loading from '@/components/common/Loading'
import ReservationInfoCommonSection from '@/components/reservation/ReservationInfoCommonSection'
import ReservationRequestNormalSection from '@/components/reservation/ReservationRequestNormalSection'
import { DialogClose } from '@/components/ui/dialog'
import { NButton } from '@/components/ui/new-button'
import { DATA_TYPE_OPTIONS, SEX_OPTIONS, USED_MESSY_LEVEL_OPTIONS } from '@/constants/reservation'

import IdentificationSettingModal from '@/components/dialogs/IdentificationSettingModal'
import SearchClientModal from '@/components/dialogs/SearchClientModal'
import { useCreateSmartLockPin } from '@/hooks/mutations/useCreateSmartLockPin'
import { useGetCountries } from '@/hooks/queries/useGetCountries'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRoomTypes } from '@/hooks/queries/useGetRoomTypes'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'
import { useCreateReservation } from '@/hooks/queries/useReservations'
import { useDirectCheckinSmartLock } from '@/hooks/useDirectCheckinSmartLock'
import { calculateStayTypeId, formatDateValue, mergeDateAndTime } from '@/lib/reservation'
import {
  getReservationClientDefaultValues,
  getReservationCreateReserveDefaultValues,
  reservationClientSchema,
  reservationCreateReserveSchema,
} from '@/lib/reservation-form'
import {
  generateSmartLockPin,
  resolveSelfCheckinSmartLockState,
} from '@/lib/smart-lock-directcheckin'
import { cn } from '@/lib/utils'

export const Route = createLazyFileRoute('/_authenticated/reservations/create')({
  component: ReservationCreatePage,
})

// ─── Schema ──────────────────────────────────────────────────────────
const formSchema = z.object({
  client: reservationClientSchema,
  reserve: reservationCreateReserveSchema.extend({
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
    ...getReservationCreateReserveDefaultValues(),
    directcheckin_note: '',
    smart_lock_pin: '',
    smart_lock_valid_from: '',
    smart_lock_valid_to: '',
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
  const directcheckinType = form.watch('reserve.directcheckin_type')
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
  const { mutateAsync: createSmartLockPin } = useCreateSmartLockPin()
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
  const checkinTime = form.watch('reserve.checkin_time')
  const nightCount = useMemo(() => {
    if (!periodFrom || !periodTo) return 0
    return dayjs(periodTo).add(1, 'day').diff(dayjs(periodFrom), 'day')
  }, [periodFrom, periodTo])

  const { syncDirectcheckinFlagByType, toggleDirectcheckinFlag, handleContactedFlagChange } =
    useDirectCheckinSmartLock({
      getValues: form.getValues,
      setValue: form.setValue,
      periodFrom,
      periodTo,
      checkinTime,
      directcheckinFlag,
      directcheckinType,
    })

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

    const {
      isSelfCheckin,
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
      checkinTime: values.reserve.checkin_time,
    })

    if (smartLockValidationError) {
      toast.error(smartLockValidationError)
      return
    }

    setIsLoading(true)
    try {
      const reservationResponse = await createReservation({
        clientId: Number(values.client.client_id),
        facilityId: values.reserve.facility_id ? Number(values.reserve.facility_id) : undefined,
        roomId: values.reserve.room_id ? Number(values.reserve.room_id) : undefined,
        stayTypeId: values.reserve.stay_type_id ? Number(values.reserve.stay_type_id) : undefined,
        periodFrom: mergeDateAndTime(values.reserve.period_from, values.reserve.checkin_time),
        periodTo: values.reserve.period_to,
        advertisingType: values.reserve.advertising_type
          ? Number(values.reserve.advertising_type)
          : undefined,
        directcheckinType: values.reserve.directcheckin_type
          ? Number(values.reserve.directcheckin_type)
          : undefined,
        directcheckinFlag: values.reserve.directcheckin_flag,
        directcheckinNote: values.reserve.directcheckin_note || undefined,
        diContactStaffId: values.reserve.di_contact_staff_id
          ? Number(values.reserve.di_contact_staff_id)
          : undefined,
        contactedFlag: values.reserve.contacted_flag,
        checkinDate: values.reserve.checkin_date
          ? dayjs(values.reserve.checkin_date).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        confirmFlag: values.reserve.confirm_flag === '1',
        autoExtendFlag: values.reserve.auto_extend_flag,
        note: values.reserve.note,
        memo: values.client.memo,
      })

      if (isSelfCheckin && values.reserve.room_id && smartLockPin) {
        const createdReserveId =
          typeof reservationResponse.data === 'object' &&
          reservationResponse.data !== null &&
          'reserveId' in reservationResponse.data &&
          typeof reservationResponse.data.reserveId === 'number'
            ? reservationResponse.data.reserveId
            : null

        if (!createdReserveId) {
          toast.warning('Đặt phòng đã tạo nhưng không lấy được mã đặt phòng để tạo PIN smart lock')
        } else {
          try {
            const smartLockValidFromIso = dayjs(smartLockValidFrom).toISOString()
            const smartLockValidToIso = dayjs(smartLockValidTo).toISOString()

            await createSmartLockPin({
              reserveId: createdReserveId,
              roomId: Number(values.reserve.room_id),
              pin: smartLockPin,
              validFrom: smartLockValidFromIso,
              validTo: smartLockValidToIso,
              status: 1,
              dataStatus: 1,
            })
          } catch {
            toast.warning(
              'Đặt phòng đã tạo nhưng tạo PIN smart lock thất bại. Vui lòng kiểm tra lại.'
            )
          }
        }
      }

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
                        <ReservationInfoCommonSection
                          control={form.control as unknown as Control<FieldValues>}
                          periodFrom={periodFrom}
                          nightCount={nightCount}
                          facilityOptions={facilityOptions}
                          selectedFacilityShortLabel={selectedFacilityShortLabel}
                          onFacilityChange={handleFacilityChange}
                          roomTypeOptions={roomTypeOptions}
                          selectedRoomTypeShortLabel={selectedRoomTypeShortLabel}
                          onRoomTypeChange={handleRoomTypeChange}
                          roomOptions={roomOptions}
                          onRoomChange={handleRoomChange}
                          isFacilitySelected={!!selectedFacilityId}
                          stayTypeOptions={stayTypeOptions}
                          checkinTimeFieldName="reserve.checkin_time"
                          disableRentalKeysSelect
                          directcheckinFlag={directcheckinFlag}
                          contactedFlag={contactedFlag}
                          staffOptions={staffOptions}
                          onSyncDirectcheckinFlagByType={syncDirectcheckinFlagByType}
                          onToggleDirectcheckinFlag={toggleDirectcheckinFlag}
                          onContactedFlagChange={handleContactedFlagChange}
                          onGenerateSmartLockPin={generateSmartLockPin}
                        />

                        <ReservationRequestNormalSection
                          control={form.control as unknown as Control<FieldValues>}
                          periodFrom={periodFrom}
                          periodTo={periodTo}
                          staffOptions={staffOptions}
                        />
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
