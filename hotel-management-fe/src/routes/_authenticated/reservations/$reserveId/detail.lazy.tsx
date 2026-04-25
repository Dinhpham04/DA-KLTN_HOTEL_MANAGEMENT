import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import { CustomTooltip } from '@/components/common/CustomToolTip'
import Loading from '@/components/common/Loading'
import { BicycleSvg } from '@/components/svgs/BicycleSVG'
import { BinSVG } from '@/components/svgs/BinSVG'
import { CarSvg } from '@/components/svgs/CarSvg'
import { DogSvg } from '@/components/svgs/DogSvg'
import { NButton } from '@/components/ui/new-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StayDurationAutoFlag, UsedMessyLevel } from '@/constants/common'
import { ADVERTISING_TYPE_OPTIONS, RENTAL_KEYS_OPTIONS } from '@/constants/reservation'
import { useReservation, useUpdateReservation } from '@/hooks/queries/useReservations'
import { cn } from '@/lib/utils'
import { calculateAge, formatMoney, isEmpty } from '@/misc/type-guard.misc'
import type { Reservation } from '@/types/reservation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

// ─── Route Definition ──────────────────────────────────────────────
export const Route = createLazyFileRoute('/_authenticated/reservations/$reserveId/detail')({
  component: ReservationDetail,
})

// ─── Constants ─────────────────────────────────────────────────────
const titleTable1 = [
  'Khu vực',
  'Cơ sở',
  'Loại phòng',
  'Số phòng',
  'Loại lưu trú',
  'Trước ×',
  'Thời gian sử dụng',
  'Sau ×',
  'Tự động gia hạn',
  'Xác nhận',
]

const titleTable2 = ['🔑', 'Giờ nhận phòng', 'RC・ĐT・Nệm', 'Tiền đặt cọc', 'Di chuyển']

const typeOption: string[] = ['Không xác định', 'Cá nhân', 'Doanh nghiệp', 'DN đặc biệt']
const typeTitleOption: string[] = ['Không xác định', 'Họ tên', 'Tên công ty', 'Tên công ty']

const DELETE_STATUS_MAP: Record<number, string> = {
  1: 'Xóa',
  2: 'Hủy',
  3: 'No-Show',
}

// ─── Mock data for billing/occupier (Backend chưa triển khai) ─────
interface MockOccupier {
  no: number
  name: string
  sex: string
  birthday: string | null
  age: number | null
  tel: string
  address: string
}

interface MockBillingNormal {
  id: number
  item: string
  periodFrom: string
  periodTo: string
  days: number
  unitPrice: number
  quantity: number
  staffName: string
  amount: number
  printed: boolean
  printDate: string | null
  billingId: number
}

interface MockBillingAdvance {
  id: number
  content: string
  paymentMethod1: string
  paymentMethod2: string
  amount: number
  paymentDate: string
  summary: string
  printed: boolean
  printDate: string | null
  billingId: number
}

const MOCK_OCCUPIERS: MockOccupier[] = []
const MOCK_BILLING_NORMAL: MockBillingNormal[] = []
const MOCK_BILLING_ADVANCE: MockBillingAdvance[] = []

// ─── Zod schemas ───────────────────────────────────────────────────
const keyReturnSchema = z.object({
  keyReturnContactType: z.string(),
  keyReturnFlag: z.boolean(),
  returnKeys: z.object({
    value: z.string(),
    label: z.string(),
  }),
  keyReturnDatetime: z.date().nullable(),
})
type KeyReturnFormData = z.infer<typeof keyReturnSchema>

const announcementSchema = z.object({
  announcement: z.string(),
})
type AnnouncementFormData = z.infer<typeof announcementSchema>

// ─── Extended reservation type (includes joined data from API) ─────
interface ReservationDetail extends Reservation {
  client?: {
    clientId: number
    clientName: string
    dataType: number
    birthday: string | null
    countryName: string
    zipCode: string | null
    address1: string | null
    address2: string | null
    tel: string | null
    telPhone: string | null
    telEmergency: string | null
    email: string | null
    fax: string | null
    emergencyRelation: string | null
    stayDurationAutoFlag: boolean
    usedMessyLevel: number
    postpaidFlag: boolean
    ugFlag: boolean
    memo: string | null
    lastUsedServiceIds: { id: number; type: number }[]
    expirationDateLast: string | null
    useCount: number
  }
  areaName?: string
  movedFacilityName?: string
  movedRoomNumber?: string
  extensionTime?: number
  keyboxName?: string
  keyboxPassword?: string
  directcheckinNote?: string
  parkingReserves?: {
    facilityName: string
    roomNumber: string
    periodFrom: string
    periodTo: string
    unitPrice: number
  }[]
  bicycleParkingReserves?: {
    facilityName: string
    roomNumber: string
    periodFrom: string
    periodTo: string
    unitPrice: number
  }[]
  trunkRoomsReserve?: {
    facilityName: string
    roomNumber: string
    periodFrom: string
    periodTo: string
    unitPrice: number
  }[]
  substituteRoomFacilityName?: string
  substituteRoomNumber?: string
  substituteRoomPeriodFrom?: string
  substituteRoomPeriodTo?: string
  substituteRoomContent?: string
  requestNormalCount?: number
  saleNormalCount?: number
  noreserveCountBefore?: number
  noreserveCountAfter?: number
  createdStaffName?: string
  updatedStaffName?: string
}

// ─── Main Component ────────────────────────────────────────────────
function ReservationDetail() {
  const navigate = useNavigate()
  const { reserveId } = useParams({ from: '/_authenticated/reservations/$reserveId/detail' })
  const reserveIdNum = Number(reserveId)

  const [selectedBillingIds, setSelectedBillingIds] = useState<number[]>([])
  const [selectedAdvanceIds, setSelectedAdvanceIds] = useState<number[]>([])

  // ─── Queries ──────────────────────────────────────────────
  const { data: reserveData, isLoading, refetch } = useReservation(reserveIdNum)
  const reserve = reserveData as ReservationDetail | undefined

  const { mutateAsync: updateReservation } = useUpdateReservation()

  // ─── Key return form ──────────────────────────────────────
  const keyReturnForm = useForm<KeyReturnFormData>({
    resolver: zodResolver(keyReturnSchema),
    defaultValues: {
      keyReturnContactType: String(reserve?.keyReturnContactType ?? 0),
      keyReturnFlag: reserve?.keyReturnFlag ?? false,
      returnKeys: {
        value: String(reserve?.returnKeys ?? 0),
        label: String(reserve?.returnKeys ?? 0),
      },
      keyReturnDatetime: null,
    },
  })

  // ─── Announcement form ────────────────────────────────────
  const announcementForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      announcement: reserve?.announcement ?? '',
    },
  })

  // ─── Handlers ─────────────────────────────────────────────
  async function handleKeyReturnUpdate(data: KeyReturnFormData) {
    try {
      await updateReservation({
        reserveId: reserveIdNum,
        keyReturnContactType: Number(data.keyReturnContactType),
        keyReturnFlag: data.keyReturnFlag,
        returnKeys: Number(data.returnKeys.value),
      })
      toast.success('Cập nhật thành công')
      refetch()
    } catch {
      toast.error('Đã xảy ra lỗi')
    }
  }

  async function handleAnnouncementUpdate(data: AnnouncementFormData) {
    try {
      await updateReservation({
        reserveId: reserveIdNum,
        announcement: data.announcement,
      } as Parameters<typeof updateReservation>[0])
      toast.success('Cập nhật thành công')
      refetch()
    } catch {
      toast.error('Đã xảy ra lỗi')
    }
  }

  function handleSetCurrentTime() {
    keyReturnForm.setValue('keyReturnDatetime', new Date())
  }

  // ─── Loading & Not Found ──────────────────────────────────
  if (isLoading) return <Loading />

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

  const client = reserve.client
  const advertisingLabel =
    ADVERTISING_TYPE_OPTIONS.find((o) => o.value === String(reserve.advertisingType))?.name ?? ''
  const deleteStatusLabel = reserve.deleteStatus
    ? (DELETE_STATUS_MAP[reserve.deleteStatus] ?? 'Không xác định')
    : 'Không xóa'

  // Helper: calc days between two dates
  function calcDays(from?: string | null, to?: string | null) {
    if (!from || !to) return 0
    return dayjs(to).diff(dayjs(from), 'day')
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="box-border flex flex-col gap-[2rem] py-[2rem] common-container">
      {/* ═══ Title Bar ═══ */}
      <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
        <div className="ml-[1.5rem] font-bold text-[2.3rem]">Chi tiết đặt phòng</div>
      </div>

      {!isEmpty(reserve) ? (
        <>
          {/* ═══════════════════════════════════════════════════════════
              SECTION 1 — Thông tin khách hàng (Customer Info)
              ═══════════════════════════════════════════════════════════ */}
          <section className="mt-[2rem]">
            <CustomAccordion
              type="multiple"
              defaultValue={['item-1', 'item-2', 'item-3']}
              className="w-full"
            >
              <CustomAccordionItem
                value="item-1"
                className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
              >
                <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                  <div className="flex items-center">
                    <div className="mr-20 font-bold text-xl sm:text-3xl">Thông tin khách hàng</div>
                  </div>
                </CustomAccordionTrigger>
                <CustomAccordionContent className="p-10">
                  <div className={cn('flex flex-col gap-[2.3rem] w-[100%]')}>
                    <table
                      className={cn(
                        'border-collapse',
                        '[&_td]:h-[4.6rem]',
                        '[&_td]:px-[.5rem] sm:[&_td]:[&_*]:text-[1.6rem] [&_td]:[&_*]:text-[1.1rem]'
                      )}
                    >
                      <tbody>
                        {/* Row 1: Loại | Giấy tờ tùy thân */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Loại
                          </td>
                          <td className="border border-black">
                            {client ? (typeOption[client.dataType] ?? '') : ''}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Giấy tờ tùy thân
                          </td>
                          <td className="border border-black" colSpan={3}>
                            <div className="flex justify-between gap-[1.3rem] pr-[2rem] h-[80%]">
                              <div className="flex items-center">
                                {client?.expirationDateLast
                                  ? `Hạn: ${dayjs(client.expirationDateLast).format('YYYY/MM/DD')}`
                                  : null}
                              </div>
                              <NButton className="bg-[#efefef] sm:w-[8rem] text-[1.6rem] sm:text-2xl">
                                <span>Xem</span>
                              </NButton>
                            </div>
                          </td>
                        </tr>

                        {/* Row 2: Họ tên | Ngày sinh + Tuổi */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            {client ? (typeTitleOption[client.dataType] ?? 'Họ tên') : 'Họ tên'}
                          </td>
                          <td className="border border-black" colSpan={3}>
                            {client?.clientName}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Ngày sinh
                          </td>
                          <td
                            className="border border-black"
                            style={{ borderRight: '1px dashed black' }}
                          >
                            {client?.birthday ? dayjs(client.birthday).format('YYYY/MM/DD') : ''}
                          </td>
                          <td
                            className="border-r border-black"
                            style={{ borderLeft: '1px dashed black' }}
                          >
                            {client?.birthday ? `${calculateAge(client.birthday)} tuổi` : null}
                          </td>
                        </tr>

                        {/* Row 3: Quốc tịch | Địa chỉ */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Quốc tịch
                          </td>
                          <td className="border border-black">{client?.countryName}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Địa chỉ
                          </td>
                          <td className="border border-black leading-7" colSpan={4}>
                            {`${client?.zipCode || ''} ${client?.address2 || ''} ${client?.address1 || ''}`}
                          </td>
                        </tr>

                        {/* Row 4: ĐT (Nhà) | ĐT (Di động) | ĐT (Khẩn cấp) */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            ĐT (Nhà)
                          </td>
                          <td className="border border-black">{client?.tel}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            ĐT (Di động)
                          </td>
                          <td className="border border-black">{client?.telPhone}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            ĐT (Khẩn cấp)
                          </td>
                          <td className="border border-black" colSpan={2}>
                            {client?.telEmergency}
                          </td>
                        </tr>

                        {/* Row 5: Email | FAX | Người LH khẩn cấp */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Email
                          </td>
                          <td className="border border-black">{client?.email}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            FAX
                          </td>
                          <td className="border border-black">{client?.fax}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Người LH khẩn cấp
                          </td>
                          <td className="border border-black" colSpan={2}>
                            {client?.emergencyRelation}
                          </td>
                        </tr>

                        {/* Empty separator */}
                        <tr className="border-none">
                          <td className="border-none" />
                        </tr>

                        {/* Row 7: Tự động gia hạn | Vệ sinh phòng | Thanh toán sau */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Tự động gia hạn
                          </td>
                          <td className="border border-black">
                            {client?.stayDurationAutoFlag !== undefined
                              ? StayDurationAutoFlag[client.stayDurationAutoFlag ? 1 : 0]
                              : ''}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Vệ sinh phòng
                          </td>
                          <td className="border border-black">
                            {client?.usedMessyLevel !== undefined
                              ? UsedMessyLevel[client.usedMessyLevel]
                              : ''}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Thanh toán sau
                          </td>
                          <td className="border border-black" colSpan={2}>
                            {client?.postpaidFlag ? 'Có' : 'Không'}
                          </td>
                        </tr>

                        {/* Row 8: Dịch vụ đã dùng */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Dịch vụ đã dùng
                          </td>
                          <td className="border border-black" colSpan={6}>
                            <div className="flex gap-[0.5rem]">
                              {client?.lastUsedServiceIds?.map((item) => {
                                const Icon =
                                  item.type === 1
                                    ? CarSvg
                                    : item.type === 2
                                      ? BicycleSvg
                                      : item.type === 4
                                        ? DogSvg
                                        : item.type === 5
                                          ? BinSVG
                                          : null
                                if (!Icon) return null
                                return (
                                  <div
                                    key={item.id}
                                    className="flex justify-center items-center bg-[#B86020] mr-3 p-2 border-none rounded-[0.4rem] w-10 sm:w-16 h-10 sm:h-16"
                                  >
                                    <Icon
                                      className={item.type === 5 ? '[&>path]:fill-white' : ''}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Action buttons */}
                    <div className="flex justify-center items-center gap-[2rem]">
                      {client && (
                        <>
                          <Link
                            to="/clients/$clientId/edit"
                            params={{ clientId: String(client.clientId) }}
                          >
                            <NButton
                              type="button"
                              className="bg-[#efefef] w-[14.4rem] text-lg sm:text-2xl"
                            >
                              <span>Chỉnh sửa</span>
                            </NButton>
                          </Link>
                          <Link
                            to="/clients/$clientId/detail"
                            params={{ clientId: String(client.clientId) }}
                          >
                            <NButton
                              type="button"
                              className="bg-[#efefef] w-[14.4rem] text-lg sm:text-2xl"
                            >
                              <span>Chi tiết</span>
                            </NButton>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </CustomAccordionContent>
              </CustomAccordionItem>

              {/* ═══════════════════════════════════════════════════════════
                  SECTION 2 — Thông tin đặt phòng (Reservation Info)
                  ═══════════════════════════════════════════════════════════ */}
              <CustomAccordionItem
                value="item-2"
                className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
              >
                <CustomAccordionTrigger className="bg-blue-300 py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                  <div className="flex items-center">
                    <div className="mr-20 font-bold text-xl sm:text-3xl">Thông tin đặt phòng</div>
                  </div>
                </CustomAccordionTrigger>
                <CustomAccordionContent className="p-10">
                  {/* ── Table 1: Reservation summary ── */}
                  <Table className="border border-black border-collapse">
                    <TableHeader>
                      <TableRow className="!border-b-0">
                        {titleTable1.map((title) => (
                          <TableHead
                            key={title}
                            className="bg-[#efefef] border border-black text-center font-bold text-black sm:text-[1.4rem]"
                          >
                            {title}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="border border-black text-center">
                          <CustomTooltip text={reserve.areaName ?? ''} />
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          <CustomTooltip text={reserve.facilityName ?? ''} />
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          <CustomTooltip text={reserve.roomTypeName ?? ''} />
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          {reserve.roomNumber}
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          {reserve.stayTypeName}
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          {reserve.noreserveCountBefore ?? 0}
                        </TableCell>
                        <TableCell className="border border-black text-center whitespace-nowrap">
                          {reserve.periodFrom ? dayjs(reserve.periodFrom).format('YYYY/MM/DD') : ''}
                          {' ~ '}
                          {reserve.periodTo ? dayjs(reserve.periodTo).format('YYYY/MM/DD') : ''}
                          {reserve.periodFrom && reserve.periodTo && (
                            <span className="ml-2 text-gray-500">
                              ({calcDays(reserve.periodFrom, reserve.periodTo)} ngày)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          {reserve.noreserveCountAfter ?? 0}
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          {reserve.autoExtendFlag ? '○' : '×'}
                        </TableCell>
                        <TableCell className="border border-black text-center">
                          {reserve.confirmFlag ? '○' : '×'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {/* ── Table 2: Key / Move-in time / Deposit ── */}
                  <div className="flex gap-4 mt-[2rem]">
                    <Table className="border border-black border-collapse flex-1">
                      <TableHeader>
                        <TableRow className="!border-b-0">
                          {titleTable2.map((title) => (
                            <TableHead
                              key={title}
                              className="bg-[#efefef] border border-black text-center font-bold text-black sm:text-[1.4rem]"
                            >
                              {title}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="border border-black text-center">
                            {reserve.rentalKeys ?? 0}
                          </TableCell>
                          <TableCell className="border border-black text-center whitespace-nowrap">
                            {reserve.periodFrom ? dayjs(reserve.periodFrom).format('HH:mm') : ''}
                          </TableCell>
                          <TableCell className="border border-black text-center">
                            {reserve.amendment ?? ''}
                          </TableCell>
                          <TableCell className="border border-black text-center">
                            {reserve.deposit != null
                              ? `${formatMoney(reserve.deposit)} đ`
                              : 'Không'}
                          </TableCell>
                          <TableCell className="border border-black text-center whitespace-nowrap">
                            {reserve.movedFacilityName
                              ? `${reserve.movedFacilityName} ${reserve.movedRoomNumber ?? ''}`
                              : 'Không'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Memo box */}
                    <div className="border border-black w-[30%] min-h-[8rem]">
                      <div className="bg-[#efefef] border-b border-black px-4 py-2 font-bold text-center">
                        Ghi chú
                      </div>
                      <div className="p-4 text-[1.4rem] break-words whitespace-pre-wrap">
                        {reserve.note ?? ''}
                      </div>
                    </div>
                  </div>

                  {/* ── 時間延長、予約削除 → Gia hạn thời gian, Xóa đặt phòng ── */}
                  <div className="mt-[2rem]">
                    <p className="font-bold text-[1.6rem]">・Gia hạn thời gian, Xóa đặt phòng</p>
                    <table
                      className={cn(
                        'border-collapse mt-4',
                        '[&_td]:h-[4.6rem] [&_td]:px-[.5rem]',
                        'sm:[&_td]:[&_*]:text-[1.6rem] [&_td]:[&_*]:text-[1.1rem]'
                      )}
                    >
                      <tbody>
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[18rem] font-bold">
                            Ngày dự kiến trả phòng sớm
                          </td>
                          <td className="border border-black w-[25rem]">
                            {reserve.earlyExitDatetime
                              ? dayjs(reserve.earlyExitDatetime).format('YYYY/MM/DD HH:mm')
                              : ''}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Gia hạn thời gian
                          </td>
                          <td className="border border-black">
                            {reserve.extensionTime ? `${reserve.extensionTime} giờ` : 'Không'}
                          </td>
                        </tr>
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[18rem] font-bold">
                            Lý do xóa
                          </td>
                          <td className="border border-black" colSpan={3}>
                            {deleteStatusLabel}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* ── Direct Check-in settings ── */}
                  {reserve.directcheckinFlag && (
                    <div className="mt-[2rem]">
                      <p className="font-bold text-[1.6rem]">・Cài đặt nhận phòng trực tiếp</p>
                      <table
                        className={cn(
                          'border-collapse mt-4',
                          '[&_td]:h-[4.6rem] [&_td]:px-[.5rem]',
                          'sm:[&_td]:[&_*]:text-[1.6rem] [&_td]:[&_*]:text-[1.1rem]'
                        )}
                      >
                        <tbody>
                          <tr>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Box
                            </td>
                            <td className="border border-black">{reserve.keyboxName ?? ''}</td>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Mật mã
                            </td>
                            <td className="border border-black">{reserve.keyboxPassword ?? ''}</td>
                          </tr>
                          <tr>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Nhân viên phụ trách
                            </td>
                            <td className="border border-black">{reserve.chargeStaffName ?? ''}</td>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Đã liên hệ
                            </td>
                            <td className="border border-black">
                              {reserve.contactedFlag ? 'Đã liên hệ' : 'Chưa'}
                            </td>
                          </tr>
                          <tr>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Ghi chú đặc biệt
                            </td>
                            <td className="border border-black" colSpan={3}>
                              {reserve.directcheckinNote ?? ''}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Services section ── */}
                  <div className="mt-[2rem]">
                    <p className="font-bold text-[1.6rem]">・Dịch vụ kèm theo</p>
                    <div className="flex flex-col gap-6 mt-4">
                      {/* Parking */}
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 w-[14rem] font-bold">
                          <div className="flex justify-center items-center bg-[#B86020] p-2 rounded-[0.4rem] w-10 sm:w-12 h-10 sm:h-12">
                            <CarSvg />
                          </div>
                          Bãi xe ô tô
                        </div>
                        <div className="flex-1">
                          {reserve.parkingReserves?.length ? (
                            reserve.parkingReserves.map((p, i) => (
                              <div key={i} className="text-[1.4rem]">
                                {p.facilityName} {p.roomNumber} |{' '}
                                {dayjs(p.periodFrom).format('YYYY/MM/DD')} ~{' '}
                                {dayjs(p.periodTo).format('YYYY/MM/DD')} |{' '}
                                {formatMoney(p.unitPrice)} đ/ngày
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">Không</span>
                          )}
                        </div>
                      </div>

                      {/* Bicycle Parking */}
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 w-[14rem] font-bold">
                          <div className="flex justify-center items-center bg-[#B86020] p-2 rounded-[0.4rem] w-10 sm:w-12 h-10 sm:h-12">
                            <BicycleSvg />
                          </div>
                          Bãi xe đạp
                        </div>
                        <div className="flex-1">
                          {reserve.bicycleParkingReserves?.length ? (
                            reserve.bicycleParkingReserves.map((p, i) => (
                              <div key={i} className="text-[1.4rem]">
                                {p.facilityName} {p.roomNumber} |{' '}
                                {dayjs(p.periodFrom).format('YYYY/MM/DD')} ~{' '}
                                {dayjs(p.periodTo).format('YYYY/MM/DD')} |{' '}
                                {formatMoney(p.unitPrice)} đ/ngày
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">Không</span>
                          )}
                        </div>
                      </div>

                      {/* Trunk Room */}
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 w-[14rem] font-bold">
                          <div className="flex justify-center items-center bg-[#B86020] p-2 rounded-[0.4rem] w-10 sm:w-12 h-10 sm:h-12">
                            <BinSVG className="[&>path]:fill-white" />
                          </div>
                          Phòng hành lý
                        </div>
                        <div className="flex-1">
                          {reserve.trunkRoomsReserve?.length ? (
                            reserve.trunkRoomsReserve.map((p, i) => (
                              <div key={i} className="text-[1.4rem]">
                                {p.facilityName} {p.roomNumber} |{' '}
                                {dayjs(p.periodFrom).format('YYYY/MM/DD')} ~{' '}
                                {dayjs(p.periodTo).format('YYYY/MM/DD')} |{' '}
                                {formatMoney(p.unitPrice)} đ/ngày
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">Không</span>
                          )}
                        </div>
                      </div>

                      {/* Other services: Pet | Deliverybox */}
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 w-[14rem] font-bold">
                          Dịch vụ khác
                        </div>
                        <div className="flex gap-4">
                          {reserve.petFlag && (
                            <div className="flex items-center gap-2">
                              <div className="flex justify-center items-center bg-[#B86020] p-2 rounded-[0.4rem] w-10 sm:w-12 h-10 sm:h-12">
                                <DogSvg />
                              </div>
                              <span>Thú cưng</span>
                            </div>
                          )}
                          {reserve.deliveryboxFlag && (
                            <div className="flex items-center gap-2">
                              <div className="flex justify-center items-center bg-[#B86020] p-2 rounded-[0.4rem] w-10 sm:w-12 h-10 sm:h-12">
                                <BinSVG className="[&>path]:fill-white" />
                              </div>
                              <span>Hộp giao hàng</span>
                            </div>
                          )}
                          {!reserve.petFlag && !reserve.deliveryboxFlag && (
                            <span className="text-gray-400">Không</span>
                          )}
                        </div>
                      </div>

                      {/* Advertising type */}
                      <div className="flex items-start gap-4">
                        <div className="w-[14rem] font-bold">Kênh quảng cáo</div>
                        <div>{advertisingLabel || 'Không'}</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Substitute settings (conditional) ── */}
                  {reserve.substituteRoomNumber && (
                    <div className="mt-[2rem]">
                      <p className="font-bold text-[1.6rem]">・Cài đặt phòng thay thế</p>
                      <table
                        className={cn(
                          'border-collapse mt-4',
                          '[&_td]:h-[4.6rem] [&_td]:px-[.5rem]',
                          'sm:[&_td]:[&_*]:text-[1.6rem] [&_td]:[&_*]:text-[1.1rem]'
                        )}
                      >
                        <tbody>
                          <tr>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Số phòng
                            </td>
                            <td className="border border-black">
                              {reserve.substituteRoomFacilityName} {reserve.substituteRoomNumber}
                            </td>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Thời gian
                            </td>
                            <td className="border border-black">
                              {reserve.substituteRoomPeriodFrom
                                ? dayjs(reserve.substituteRoomPeriodFrom).format('YYYY/MM/DD')
                                : ''}
                              {' ~ '}
                              {reserve.substituteRoomPeriodTo
                                ? dayjs(reserve.substituteRoomPeriodTo).format('YYYY/MM/DD')
                                : ''}
                            </td>
                          </tr>
                          <tr>
                            <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                              Nội dung
                            </td>
                            <td className="border border-black" colSpan={3}>
                              {reserve.substituteRoomContent ?? ''}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Occupier information table ── */}
                  <div className="mt-[2rem]">
                    <p className="font-bold text-[1.6rem]">Thông tin người ở</p>
                    <Table className="border border-black border-collapse mt-4">
                      <TableHeader>
                        <TableRow className="!border-b-0">
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black w-[4rem]">
                            No
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Họ tên
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Giới tính
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Ngày sinh
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Tuổi
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            SĐT
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Địa chỉ
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_OCCUPIERS.length > 0 ? (
                          MOCK_OCCUPIERS.map((occ) => (
                            <TableRow key={occ.no}>
                              <TableCell className="border border-black text-center">
                                {occ.no}
                              </TableCell>
                              <TableCell className="border border-black">{occ.name}</TableCell>
                              <TableCell className="border border-black text-center">
                                {occ.sex}
                              </TableCell>
                              <TableCell className="border border-black text-center">
                                {occ.birthday ? dayjs(occ.birthday).format('YYYY/MM/DD') : ''}
                              </TableCell>
                              <TableCell className="border border-black text-center">
                                {occ.age}
                              </TableCell>
                              <TableCell className="border border-black">{occ.tel}</TableCell>
                              <TableCell className="border border-black">{occ.address}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="border border-black text-center py-8 text-gray-400"
                            >
                              Không có dữ liệu.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* ── Key return information ── */}
                  <div className="mt-[2rem]">
                    <p className="font-bold text-[1.6rem]">■ Thông tin trả chìa khóa</p>
                    <FormProvider {...keyReturnForm}>
                      <form
                        onSubmit={keyReturnForm.handleSubmit(handleKeyReturnUpdate)}
                        className="flex flex-col gap-6 mt-4"
                      >
                        {/* Return contact radio */}
                        <div className="flex items-center gap-8">
                          <span className="w-[14rem] font-bold">Liên hệ trả</span>
                          <Controller
                            control={keyReturnForm.control}
                            name="keyReturnContactType"
                            render={({ field: { onChange, value } }) => (
                              <CustomRadio
                                value={value}
                                onValueChange={onChange}
                                className="flex gap-8"
                              >
                                <CustomRadioItems value="1" id="contact-bring" />
                                <label
                                  htmlFor="contact-bring"
                                  className="font-bold text-xl cursor-pointer"
                                >
                                  Mang đến
                                </label>
                                <CustomRadioItems value="2" id="contact-tel" />
                                <label
                                  htmlFor="contact-tel"
                                  className="font-bold text-xl cursor-pointer"
                                >
                                  Điện thoại
                                </label>
                                <CustomRadioItems value="0" id="contact-none" />
                                <label
                                  htmlFor="contact-none"
                                  className="font-bold text-xl cursor-pointer"
                                >
                                  Chưa
                                </label>
                              </CustomRadio>
                            )}
                          />
                        </div>

                        {/* Key collection OK checkbox + date picker */}
                        <div className="flex items-center gap-8">
                          <span className="w-[14rem] font-bold">Thu hồi chìa khóa OK</span>
                          <Controller
                            control={keyReturnForm.control}
                            name="keyReturnFlag"
                            render={({ field: { onChange, value } }) => (
                              <CustomCheckbox
                                checked={value}
                                onCheckedChange={onChange}
                                id="key-return-flag"
                              />
                            )}
                          />
                          <Controller
                            control={keyReturnForm.control}
                            name="keyReturnDatetime"
                            render={({ field: { onChange, value } }) => (
                              <CustomDatePicker
                                format="y/MM/dd HH:mm"
                                value={value}
                                change={onChange}
                                className="w-[22rem]"
                              />
                            )}
                          />
                        </div>

                        {/* Key return select + buttons */}
                        <div className="flex items-center gap-8">
                          <span className="w-[14rem] font-bold">Trả chìa khóa</span>
                          <Controller
                            control={keyReturnForm.control}
                            name="returnKeys"
                            render={({ field: { onChange, value } }) => (
                              <select
                                className="border border-black rounded px-4 py-2 text-[1.4rem] w-[8rem]"
                                value={value.value}
                                onChange={(e) =>
                                  onChange({ value: e.target.value, label: e.target.value })
                                }
                              >
                                {RENTAL_KEYS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                          <NButton
                            type="button"
                            onClick={handleSetCurrentTime}
                            className="bg-[#efefef] w-[14rem] text-lg sm:text-2xl"
                          >
                            <span>Đặt giờ hiện tại</span>
                          </NButton>
                          <NButton
                            type="submit"
                            className="bg-[#efefef] w-[10rem] text-lg sm:text-2xl"
                          >
                            <span>Cập nhật</span>
                          </NButton>
                        </div>
                      </form>
                    </FormProvider>
                  </div>

                  {/* ── Billing information ── */}
                  <div className="mt-[2rem]">
                    <p className="font-bold text-[1.6rem]">■ Thông tin thanh toán</p>

                    {/* Count summary */}
                    <div className="flex gap-8 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Số hóa đơn:</span>
                        <span>{reserve.requestNormalCount ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Số doanh thu:</span>
                        <span>{reserve.saleNormalCount ?? 0}</span>
                      </div>
                    </div>

                    {/* Billing normal table */}
                    <Table className="border border-black border-collapse mt-4">
                      <TableHeader>
                        <TableRow className="!border-b-0">
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black w-[3rem]">
                            chk
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Hạng mục
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Thời gian thanh toán
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black w-[5rem]">
                            Số ngày
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Đơn giá
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black w-[5rem]">
                            SL
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            NV phụ trách
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Số tiền
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black w-[5rem]">
                            In
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Ngày in
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Mã HĐ
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_BILLING_NORMAL.length > 0 ? (
                          MOCK_BILLING_NORMAL.map((bill) => (
                            <TableRow key={bill.id}>
                              <TableCell className="border border-black text-center">
                                <CustomCheckbox
                                  checked={selectedBillingIds.includes(bill.id)}
                                  onCheckedChange={(checked) => {
                                    setSelectedBillingIds((prev) =>
                                      checked
                                        ? [...prev, bill.id]
                                        : prev.filter((id) => id !== bill.id)
                                    )
                                  }}
                                />
                              </TableCell>
                              <TableCell className="border border-black">{bill.item}</TableCell>
                              <TableCell className="border border-black text-center">
                                {dayjs(bill.periodFrom).format('YYYY/MM/DD')} ~{' '}
                                {dayjs(bill.periodTo).format('YYYY/MM/DD')}
                              </TableCell>
                              <TableCell className="border border-black text-center">
                                {bill.days}
                              </TableCell>
                              <TableCell className="border border-black text-right">
                                {formatMoney(bill.unitPrice)} đ
                              </TableCell>
                              <TableCell className="border border-black text-center">
                                {bill.quantity}
                              </TableCell>
                              <TableCell className="border border-black">
                                {bill.staffName}
                              </TableCell>
                              <TableCell className="border border-black text-right">
                                {formatMoney(bill.amount)} đ
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'border border-black text-center',
                                  !bill.printed && 'bg-yellow-300'
                                )}
                              >
                                {bill.printed ? 'Đã in' : 'Chưa'}
                              </TableCell>
                              <TableCell className="border border-black text-center">
                                {bill.printDate ? dayjs(bill.printDate).format('YYYY/MM/DD') : ''}
                              </TableCell>
                              <TableCell className="border border-black text-center text-blue-600">
                                {bill.billingId}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={11}
                              className="border border-black text-center py-8 text-gray-400"
                            >
                              Không có dữ liệu.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {/* Announcement */}
                    <FormProvider {...announcementForm}>
                      <form
                        onSubmit={announcementForm.handleSubmit(handleAnnouncementUpdate)}
                        className="mt-4"
                      >
                        <div className="flex items-start gap-4">
                          <span className="w-[14rem] font-bold mt-2">Liên lạc nội bộ</span>
                          <Controller
                            control={announcementForm.control}
                            name="announcement"
                            render={({ field: { onChange, value } }) => (
                              <CustomTextarea
                                value={value}
                                onChange={onChange}
                                className="flex-1 min-h-[8rem]"
                              />
                            )}
                          />
                          <NButton
                            type="submit"
                            className="bg-[#efefef] w-[10rem] text-lg sm:text-2xl"
                          >
                            <span>Cập nhật</span>
                          </NButton>
                        </div>
                      </form>
                    </FormProvider>
                  </div>

                  {/* ── Advance payment information ── */}
                  <div className="mt-[2rem]">
                    <p className="font-bold text-[1.6rem]">■ Thông tin thanh toán trước</p>
                    <Table className="border border-black border-collapse mt-4">
                      <TableHeader>
                        <TableRow className="!border-b-0">
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black w-[3rem]">
                            chk
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Nội dung
                          </TableHead>
                          <TableHead
                            className="bg-[#efefef] border border-black text-center font-bold text-black"
                            colSpan={2}
                          >
                            Phương thức TT
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Số tiền
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Ngày TT
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Ghi chú
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black w-[5rem]">
                            In
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Ngày in
                          </TableHead>
                          <TableHead className="bg-[#efefef] border border-black text-center font-bold text-black">
                            Mã HĐ
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_BILLING_ADVANCE.length > 0 ? (
                          MOCK_BILLING_ADVANCE.map((adv) => (
                            <TableRow key={adv.id}>
                              <TableCell className="border border-black text-center">
                                <CustomCheckbox
                                  checked={selectedAdvanceIds.includes(adv.id)}
                                  onCheckedChange={(checked) => {
                                    setSelectedAdvanceIds((prev) =>
                                      checked
                                        ? [...prev, adv.id]
                                        : prev.filter((id) => id !== adv.id)
                                    )
                                  }}
                                />
                              </TableCell>
                              <TableCell className="border border-black">{adv.content}</TableCell>
                              <TableCell className="border border-black">
                                {adv.paymentMethod1}
                              </TableCell>
                              <TableCell className="border border-black">
                                {adv.paymentMethod2}
                              </TableCell>
                              <TableCell className="border border-black text-right">
                                {formatMoney(adv.amount)} đ
                              </TableCell>
                              <TableCell className="border border-black text-center">
                                {dayjs(adv.paymentDate).format('YYYY/MM/DD')}
                              </TableCell>
                              <TableCell className="border border-black">{adv.summary}</TableCell>
                              <TableCell
                                className={cn(
                                  'border border-black text-center',
                                  !adv.printed && 'bg-yellow-300'
                                )}
                              >
                                {adv.printed ? 'Đã in' : 'Chưa'}
                              </TableCell>
                              <TableCell className="border border-black text-center">
                                {adv.printDate ? dayjs(adv.printDate).format('YYYY/MM/DD') : ''}
                              </TableCell>
                              <TableCell className="border border-black text-center text-blue-600">
                                {adv.billingId}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              className="border border-black text-center py-8 text-gray-400"
                            >
                              Không có dữ liệu.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="flex justify-center items-center gap-[2rem] mt-[3rem] flex-wrap">
                    <NButton className="bg-[#efefef] w-[14.4rem] text-lg sm:text-2xl">
                      <span>Đăng ký hóa đơn</span>
                    </NButton>
                    <NButton
                      type="button"
                      onClick={() =>
                        navigate({
                          to: '/reservations/$reserveId/edit',
                          params: { reserveId },
                        })
                      }
                      className="bg-[#efefef] w-[14.4rem] text-lg sm:text-2xl"
                    >
                      <span>Chỉnh sửa</span>
                    </NButton>
                    <NButton className="bg-[#efefef] w-[14.4rem] text-lg sm:text-2xl">
                      <span>Khảo sát</span>
                    </NButton>
                    <NButton className="bg-[#efefef] w-[14.4rem] text-lg sm:text-2xl">
                      <span>Tìm sửa chữa</span>
                    </NButton>
                    <NButton className="bg-[#efefef] w-[18rem] text-lg sm:text-2xl">
                      <span>Cài đặt HĐ/DT</span>
                    </NButton>
                  </div>
                </CustomAccordionContent>
              </CustomAccordionItem>

              {/* ═══════════════════════════════════════════════════════════
                  SECTION 3 — Thông tin sắp xếp (Arrangement Info)
                  ═══════════════════════════════════════════════════════════ */}
              <CustomAccordionItem
                value="item-3"
                className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
              >
                <CustomAccordionTrigger className="py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                  <div className="flex items-center">
                    <div className="mr-20 font-bold text-xl sm:text-3xl">Thông tin sắp xếp</div>
                  </div>
                </CustomAccordionTrigger>
                <CustomAccordionContent className="p-10">
                  <p className="text-gray-400 text-center py-8">Chưa có dữ liệu sắp xếp.</p>
                </CustomAccordionContent>
              </CustomAccordionItem>
            </CustomAccordion>
          </section>

          {/* ═══ Footer Info Box ═══ */}
          <div className="flex flex-wrap gap-8 bg-gray-100 rounded-lg p-6 mt-4">
            <div className="flex gap-2">
              <span className="font-bold">Người tạo:</span>
              <span>{reserve.createdStaffName ?? ''}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Ngày tạo:</span>
              <span>
                {reserve.createdAt ? dayjs(reserve.createdAt).format('YYYY/MM/DD HH:mm') : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Người cập nhật:</span>
              <span>{reserve.updatedStaffName ?? ''}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Ngày cập nhật:</span>
              <span>
                {reserve.updatedAt ? dayjs(reserve.updatedAt).format('YYYY/MM/DD HH:mm') : ''}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-gray-500">Không tìm thấy đặt phòng</p>
          <NButton onClick={() => navigate({ to: '/reservations' })} className="mt-4">
            Quay lại danh sách
          </NButton>
        </div>
      )}
    </div>
  )
}
