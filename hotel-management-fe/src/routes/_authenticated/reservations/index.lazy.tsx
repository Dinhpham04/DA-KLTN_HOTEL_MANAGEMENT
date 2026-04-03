import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogClose } from '@radix-ui/react-dialog'
import { Link, createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import CustomPagination from '@/components/common/CustomPagination'
import type { PaginationData } from '@/components/common/CustomPagination'
import CustomSelect from '@/components/common/CustomSelect'
import Loading from '@/components/common/Loading'
import { CustomCheckboxWithTitle } from '@/components/ui/checkbox'
import { NButton } from '@/components/ui/new-button'

import {
  useCancelReservation,
  useCheckIn,
  useCheckOut,
  useConfirmReservation,
  useDeleteReservation,
  useReservations,
} from '@/hooks/queries/useReservations'
import type { Reservation, ReservationFilterParams } from '@/types/reservation'
import { DeleteStatus, ReserveStatus } from '@/types/reservation'

export const Route = createLazyFileRoute('/_authenticated/reservations/')({
  component: ReservationsPage,
})

// ─── Types ────────────────────────────────────────────────────────────
interface ReservationSearchFormType {
  clientName: string
  roomNumber: string
  facilityName: string
  statusPending: boolean
  statusConfirmed: boolean
  statusCheckedIn: boolean
  statusCheckedOut: boolean
  statusCancelled: boolean
  periodFrom: string
  periodTo: string
}

interface SortParam {
  sort: string
  direction: 'asc' | 'desc'
}

// ─── Constants ────────────────────────────────────────────────────────
const defaultFormValues: ReservationSearchFormType = {
  clientName: '',
  roomNumber: '',
  facilityName: '',
  statusPending: false,
  statusConfirmed: false,
  statusCheckedIn: false,
  statusCheckedOut: false,
  statusCancelled: false,
  periodFrom: '',
  periodTo: '',
}

const SORT_OPTIONS = [
  { label: 'Ngày tạo (Mới nhất)', value: 'desc' },
  { label: 'Ngày tạo (Cũ nhất)', value: 'asc' },
]

const STATUS_LABELS: Record<number, { label: string; className: string }> = {
  [ReserveStatus.PENDING]: {
    label: 'Chờ xác nhận',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [ReserveStatus.CONFIRMED]: {
    label: 'Đã xác nhận',
    className: 'bg-blue-100 text-blue-800',
  },
  [ReserveStatus.CHECKED_IN]: {
    label: 'Đã nhận phòng',
    className: 'bg-green-100 text-green-800',
  },
  [ReserveStatus.CHECKED_OUT]: {
    label: 'Đã trả phòng',
    className: 'bg-gray-100 text-gray-800',
  },
  [ReserveStatus.CANCELLED]: {
    label: 'Đã hủy',
    className: 'bg-red-100 text-red-800',
  },
}

const ITEMS_PER_PAGE = 20

// ─── Helpers ──────────────────────────────────────────────────────────
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return '-'
  return `${amount.toLocaleString('vi-VN')}₫`
}

// ─── Main Page Component ──────────────────────────────────────────────
function ReservationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [page, setPage] = useState(1)
  const [sortParam, setSortParam] = useState<SortParam>({
    sort: 'createdAt',
    direction: 'desc',
  })
  const [currentFilters, setCurrentFilters] = useState<ReservationFilterParams>({})

  // Form
  const schema = z.object({
    clientName: z.string().optional(),
    roomNumber: z.string().optional(),
    facilityName: z.string().optional(),
    statusPending: z.boolean(),
    statusConfirmed: z.boolean(),
    statusCheckedIn: z.boolean(),
    statusCheckedOut: z.boolean(),
    statusCancelled: z.boolean(),
    periodFrom: z.string().optional(),
    periodTo: z.string().optional(),
  })

  const methods = useForm<ReservationSearchFormType>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
  })

  // API Query
  const { data, isLoading, refetch } = useReservations({
    page,
    limit: ITEMS_PER_PAGE,
    orderBy: sortParam.sort,
    order: sortParam.direction,
    ...currentFilters,
  })

  const items = (data as { items?: Reservation[] })?.items ?? []
  const meta = (data as { meta?: PaginationData })?.meta ?? {
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 0,
  }

  // Mutations
  const { mutateAsync: confirmReservation, isPending: isConfirming } = useConfirmReservation()
  const { mutateAsync: checkInReservation, isPending: isCheckingIn } = useCheckIn()
  const { mutateAsync: checkOutReservation, isPending: isCheckingOut } = useCheckOut()
  const { mutateAsync: cancelReservation, isPending: isCancelling } = useCancelReservation()
  const { mutateAsync: deleteReservation, isPending: isDeleting } = useDeleteReservation()

  const isMutating = isConfirming || isCheckingIn || isCheckingOut || isCancelling || isDeleting

  // Handlers
  const handleSearch = (formData: ReservationSearchFormType) => {
    const filters: ReservationFilterParams = {}

    if (formData.clientName) filters.search = formData.clientName
    if (formData.periodFrom) filters.periodFrom = formData.periodFrom
    if (formData.periodTo) filters.periodTo = formData.periodTo

    // Build status filter — only filter if not all selected
    const statusChecks = [
      formData.statusPending,
      formData.statusConfirmed,
      formData.statusCheckedIn,
      formData.statusCheckedOut,
      formData.statusCancelled,
    ]
    const anySelected = statusChecks.some(Boolean)
    if (anySelected) {
      // Use the first selected status (API takes single reserveStatus)
      if (formData.statusPending) filters.reserveStatus = ReserveStatus.PENDING
      else if (formData.statusConfirmed) filters.reserveStatus = ReserveStatus.CONFIRMED
      else if (formData.statusCheckedIn) filters.reserveStatus = ReserveStatus.CHECKED_IN
      else if (formData.statusCheckedOut) filters.reserveStatus = ReserveStatus.CHECKED_OUT
      else if (formData.statusCancelled) filters.reserveStatus = ReserveStatus.CANCELLED
    }

    setCurrentFilters(filters)
    setPage(1)
  }

  const handleClearForm = () => {
    methods.reset(defaultFormValues)
    setCurrentFilters({})
    setPage(1)
  }

  const handleSortChange = (option: { value: string; label: string }) => {
    setSortParam({
      sort: 'createdAt',
      direction: option.value as 'asc' | 'desc',
    })
    setPage(1)
  }

  const handleConfirm = async (id: number) => {
    await confirmReservation(id)
    refetch()
  }

  const handleCheckIn = async (id: number) => {
    await checkInReservation(id)
    refetch()
  }

  const handleCheckOut = async (id: number) => {
    await checkOutReservation(id)
    refetch()
  }

  const handleCancel = async (id: number) => {
    await cancelReservation({ id })
    refetch()
  }

  const handleDelete = async (id: number) => {
    await deleteReservation(id)
    refetch()
  }

  return (
    <div className="w-full p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[2.4rem] font-bold">{t('reservation.title')}</h2>
        <Link to="/reservations/create">
          <NButton type="button">Tạo đặt phòng</NButton>
        </Link>
      </div>

      {/* ─── Search Form ─────────────────────────────────── */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSearch)}>
          <CustomAccordion type="single" defaultValue="search" collapsible>
            <CustomAccordionItem value="search">
              <CustomAccordionTrigger>Tìm kiếm đặt phòng</CustomAccordionTrigger>
              <CustomAccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 py-4">
                  {/* Client name */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[1.4rem] font-medium">Tên khách hàng</span>
                    <CustomInput {...methods.register('clientName')} placeholder="Nhập tên khách" />
                  </div>

                  {/* Period From */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[1.4rem] font-medium">Từ ngày</span>
                    <Controller
                      control={methods.control}
                      name="periodFrom"
                      render={({ field }) => (
                        <CustomDatePicker
                          value={field.value ? new Date(field.value) : null}
                          change={(date: Date | Date[] | null) => {
                            if (date instanceof Date) {
                              field.onChange(date.toISOString().split('T')[0])
                            } else {
                              field.onChange('')
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Period To */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[1.4rem] font-medium">Đến ngày</span>
                    <Controller
                      control={methods.control}
                      name="periodTo"
                      render={({ field }) => (
                        <CustomDatePicker
                          value={field.value ? new Date(field.value) : null}
                          change={(date: Date | Date[] | null) => {
                            if (date instanceof Date) {
                              field.onChange(date.toISOString().split('T')[0])
                            } else {
                              field.onChange('')
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Status checkboxes */}
                <div className="flex flex-wrap gap-6 py-4">
                  <CustomCheckboxWithTitle
                    label="Chờ xác nhận"
                    checked={methods.watch('statusPending')}
                    onCheckedChange={(checked) =>
                      methods.setValue('statusPending', checked === true)
                    }
                  />
                  <CustomCheckboxWithTitle
                    label="Đã xác nhận"
                    checked={methods.watch('statusConfirmed')}
                    onCheckedChange={(checked) =>
                      methods.setValue('statusConfirmed', checked === true)
                    }
                  />
                  <CustomCheckboxWithTitle
                    label="Đã nhận phòng"
                    checked={methods.watch('statusCheckedIn')}
                    onCheckedChange={(checked) =>
                      methods.setValue('statusCheckedIn', checked === true)
                    }
                  />
                  <CustomCheckboxWithTitle
                    label="Đã trả phòng"
                    checked={methods.watch('statusCheckedOut')}
                    onCheckedChange={(checked) =>
                      methods.setValue('statusCheckedOut', checked === true)
                    }
                  />
                  <CustomCheckboxWithTitle
                    label="Đã hủy"
                    checked={methods.watch('statusCancelled')}
                    onCheckedChange={(checked) =>
                      methods.setValue('statusCancelled', checked === true)
                    }
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 py-4">
                  <NButton type="submit" size="lg">
                    Tìm kiếm
                  </NButton>
                  <NButton type="button" variant="outline" size="lg" onClick={handleClearForm}>
                    Xóa bộ lọc
                  </NButton>
                </div>
              </CustomAccordionContent>
            </CustomAccordionItem>
          </CustomAccordion>
        </form>
      </FormProvider>

      {/* ─── Sort & Pagination Top ─────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[1.4rem] text-muted-foreground">
            Tổng: <strong>{meta.total}</strong> đặt phòng
          </span>
          <CustomSelect
            selected={sortParam.direction}
            change={(val) => handleSortChange({ value: val.value, label: val.label })}
            option={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            customClassMain="min-w-[20rem]"
          />
        </div>
        <CustomPagination
          totalPage={meta.totalPages}
          page={page}
          setPage={setPage}
          dataPagination={meta}
        />
      </div>

      {/* ─── Table ─────────────────────────────────────── */}
      <div className="relative overflow-x-auto border rounded-lg">
        {(isLoading || isMutating) && <Loading />}
        <table className="w-full text-[1.4rem]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">STT</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Mã đặt phòng</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Khách hàng</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Cơ sở</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Phòng</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Từ ngày</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Đến ngày</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Đơn giá</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">NV phụ trách</th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 && !isLoading && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                  Không tìm thấy đặt phòng nào
                </td>
              </tr>
            )}
            {items.map((reservation, index) => (
              <ReservationRow
                key={reservation.reserveId}
                reservation={reservation}
                index={(page - 1) * ITEMS_PER_PAGE + index + 1}
                onConfirm={handleConfirm}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancel}
                onDelete={handleDelete}
                isMutating={isMutating}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination Bottom ─────────────────────────── */}
      <div className="flex items-center justify-end">
        <CustomPagination
          totalPage={meta.totalPages}
          page={page}
          setPage={setPage}
          dataPagination={meta}
        />
      </div>
    </div>
  )
}

// ─── Reservation Row Component ──────────────────────────────────────
interface ReservationRowProps {
  reservation: Reservation
  index: number
  onConfirm: (id: number) => Promise<void>
  onCheckIn: (id: number) => Promise<void>
  onCheckOut: (id: number) => Promise<void>
  onCancel: (id: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
  isMutating: boolean
}

function ReservationRow({
  reservation,
  index,
  onConfirm,
  onCheckIn,
  onCheckOut,
  onCancel,
  onDelete,
  isMutating,
}: ReservationRowProps) {
  const statusInfo = STATUS_LABELS[reservation.reserveStatus] ?? {
    label: 'N/A',
    className: 'bg-gray-100',
  }

  const isCancelled = reservation.reserveStatus === ReserveStatus.CANCELLED
  const isCheckedOut = reservation.reserveStatus === ReserveStatus.CHECKED_OUT

  return (
    <tr
      className={cn('hover:bg-gray-50 transition-colors', {
        'opacity-60': isCancelled,
        'bg-green-50/30': reservation.reserveStatus === ReserveStatus.CHECKED_IN,
      })}
    >
      <td className="px-4 py-3 whitespace-nowrap">{index}</td>
      <td className="px-4 py-3 whitespace-nowrap font-medium">#{reservation.reserveId}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {reservation.clientName || reservation.clientNameEn || '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{reservation.facilityName || '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap">{reservation.roomNumber || '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap">{formatDate(reservation.periodFrom)}</td>
      <td className="px-4 py-3 whitespace-nowrap">{formatDate(reservation.periodTo)}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {formatCurrency(reservation.bookingUnitPrice)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={cn('px-3 py-1 rounded-full text-[1.2rem] font-medium', statusInfo.className)}
        >
          {statusInfo.label}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{reservation.chargeStaffName || '-'}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          {/* Confirm */}
          {reservation.reserveStatus === ReserveStatus.PENDING && (
            <CustomDialog
              title="Xác nhận đặt phòng"
              size="max"
              trigger={
                <NButton size="sm" variant="outline" disabled={isMutating}>
                  Xác nhận
                </NButton>
              }
              content={
                <div className="space-y-4">
                  <p>
                    Xác nhận đặt phòng <strong>#{reservation.reserveId}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                      <NButton variant="outline">Hủy</NButton>
                    </DialogClose>
                    <DialogClose asChild>
                      <NButton onClick={() => onConfirm(reservation.reserveId)}>Xác nhận</NButton>
                    </DialogClose>
                  </div>
                </div>
              }
            />
          )}

          {/* Check In */}
          {reservation.reserveStatus === ReserveStatus.CONFIRMED && (
            <CustomDialog
              title="Check-in"
              size="max"
              trigger={
                <NButton size="sm" variant="outline" disabled={isMutating}>
                  Check-in
                </NButton>
              }
              content={
                <div className="space-y-4">
                  <p>
                    Xác nhận check-in cho đặt phòng <strong>#{reservation.reserveId}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                      <NButton variant="outline">Hủy</NButton>
                    </DialogClose>
                    <DialogClose asChild>
                      <NButton onClick={() => onCheckIn(reservation.reserveId)}>Check-in</NButton>
                    </DialogClose>
                  </div>
                </div>
              }
            />
          )}

          {/* Check Out */}
          {reservation.reserveStatus === ReserveStatus.CHECKED_IN && (
            <CustomDialog
              title="Check-out"
              size="max"
              trigger={
                <NButton size="sm" variant="outline" disabled={isMutating}>
                  Check-out
                </NButton>
              }
              content={
                <div className="space-y-4">
                  <p>
                    Xác nhận check-out cho đặt phòng <strong>#{reservation.reserveId}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                      <NButton variant="outline">Hủy</NButton>
                    </DialogClose>
                    <DialogClose asChild>
                      <NButton onClick={() => onCheckOut(reservation.reserveId)}>Check-out</NButton>
                    </DialogClose>
                  </div>
                </div>
              }
            />
          )}

          {/* Cancel */}
          {!isCancelled && !isCheckedOut && (
            <CustomDialog
              title="Hủy đặt phòng"
              size="max"
              trigger={
                <NButton size="sm" variant="destructive" disabled={isMutating}>
                  Hủy
                </NButton>
              }
              content={
                <div className="space-y-4">
                  <p>
                    Xác nhận hủy đặt phòng <strong>#{reservation.reserveId}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <DialogClose asChild>
                      <NButton variant="outline">Đóng</NButton>
                    </DialogClose>
                    <DialogClose asChild>
                      <NButton
                        variant="destructive"
                        onClick={() => onCancel(reservation.reserveId)}
                      >
                        Hủy đặt phòng
                      </NButton>
                    </DialogClose>
                  </div>
                </div>
              }
            />
          )}

          {/* Delete (soft) */}
          <CustomDialog
            title="Xóa đặt phòng"
            size="max"
            trigger={
              <NButton size="sm" variant="ghost" disabled={isMutating}>
                Xóa
              </NButton>
            }
            content={
              <div className="space-y-4">
                <p className="text-red-600">
                  Bạn có chắc muốn xóa đặt phòng <strong>#{reservation.reserveId}</strong>?
                </p>
                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <NButton variant="outline">Đóng</NButton>
                  </DialogClose>
                  <DialogClose asChild>
                    <NButton variant="destructive" onClick={() => onDelete(reservation.reserveId)}>
                      Xóa
                    </NButton>
                  </DialogClose>
                </div>
              </div>
            }
          />
        </div>
      </td>
    </tr>
  )
}
