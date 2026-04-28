import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { parkingReserveApi } from '@/api/parking-reserve.api'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import { NButton } from '@/components/ui/new-button'
import { useDeleteBicycleParkingReserve } from '@/hooks/mutations/useDeleteBicycleParkingReserve'
import { useDeleteParkingReserve } from '@/hooks/mutations/useDeleteParkingReserve'
import { useUpdateBicycleParkingReserve } from '@/hooks/mutations/useUpdateBicycleParkingReserve'
import { useUpdateParkingReserve } from '@/hooks/mutations/useUpdateParkingReserve'
import { useQueryClient } from '@tanstack/react-query'

import type { UnifiedReserveItem } from '@/types/parking-status'
import { CustomCheckbox } from '../common/CustomCheckbox'

// ─── Form Schema ───────────────────────────────────

const formSchema = z.object({
  periodFrom: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
  periodTo: z.date().nullable().optional(),
  carType: z.string().optional(),
  licensePlate: z.string().optional(),
  bicycleTypeNote: z.string().optional(),
  note: z.string().optional(),
  confirmFlag: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

// ─── Props ─────────────────────────────────────────

interface ParkingReserveEditModalProps {
  /** The reserve data to edit */
  reserve: UnifiedReserveItem
  /** Whether this is a bicycle parking slot */
  isBicycle: boolean
  /** Trigger element to open modal */
  trigger: React.ReactNode
}

// ─── Component ─────────────────────────────────────

export default function ParkingReserveEditModal({
  reserve,
  isBicycle,
  trigger,
}: ParkingReserveEditModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const queryClient = useQueryClient()

  const getFormDefaults = (): FormValues => ({
    periodFrom: new Date(reserve.periodFrom),
    periodTo: reserve.periodTo ? new Date(reserve.periodTo) : null,
    carType: isBicycle ? '' : (reserve.vehicleInfo ?? ''),
    licensePlate: reserve.licensePlate ?? '',
    bicycleTypeNote: isBicycle ? (reserve.vehicleInfo ?? '') : '',
    note: reserve.note ?? '',
    confirmFlag: reserve.confirmFlag,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaults(),
  })

  const updateCarMutation = useUpdateParkingReserve({
    onSuccess: () => {
      toast.success('Đã cập nhật đặt chỗ thành công')
      setIsOpen(false)
    },
    onError: () => toast.error('Không thể cập nhật đặt chỗ'),
  })

  const updateBicycleMutation = useUpdateBicycleParkingReserve({
    onSuccess: () => {
      toast.success('Đã cập nhật đặt chỗ xe đạp thành công')
      setIsOpen(false)
    },
    onError: () => toast.error('Không thể cập nhật đặt chỗ xe đạp'),
  })

  const deleteCarMutation = useDeleteParkingReserve({
    onSuccess: () => {
      toast.success('Đã xóa đặt chỗ')
      setIsOpen(false)
      setShowDeleteConfirm(false)
    },
    onError: () => toast.error('Không thể xóa đặt chỗ'),
  })

  const deleteBicycleMutation = useDeleteBicycleParkingReserve({
    onSuccess: () => {
      toast.success('Đã xóa đặt chỗ xe đạp')
      setIsOpen(false)
      setShowDeleteConfirm(false)
    },
    onError: () => toast.error('Không thể xóa đặt chỗ xe đạp'),
  })

  const isPending =
    updateCarMutation.isPending ||
    updateBicycleMutation.isPending ||
    deleteCarMutation.isPending ||
    deleteBicycleMutation.isPending

  function onSubmit(values: FormValues) {
    const periodFrom = dayjs(values.periodFrom).format('YYYY-MM-DD')
    const periodTo = values.periodTo ? dayjs(values.periodTo).format('YYYY-MM-DD') : undefined

    if (isBicycle) {
      updateBicycleMutation.mutate({
        id: reserve.id,
        data: {
          periodFrom,
          periodTo,
          bicycleTypeNote: values.bicycleTypeNote || undefined,
          note: values.note || undefined,
          confirmFlag: values.confirmFlag,
        },
      })
    } else {
      updateCarMutation.mutate({
        id: reserve.id,
        data: {
          periodFrom,
          periodTo,
          carType: values.carType || undefined,
          licensePlate: values.licensePlate || undefined,
          note: values.note || undefined,
          confirmFlag: values.confirmFlag,
        },
      })
    }
  }

  function handleDelete() {
    if (isBicycle) {
      deleteBicycleMutation.mutate(reserve.id)
    } else {
      deleteCarMutation.mutate(reserve.id)
    }
  }

  async function handleToggleFlag(type: 'checkin' | 'checkout') {
    const isActive = type === 'checkin' ? reserve.checkinFlag : reserve.checkoutFlag
    const label = type === 'checkin' ? 'check-in' : 'check-out'
    try {
      if (type === 'checkin') {
        await (isBicycle
          ? parkingReserveApi.checkinBicycle(reserve.id)
          : parkingReserveApi.checkin(reserve.id))
      } else {
        await (isBicycle
          ? parkingReserveApi.checkoutBicycle(reserve.id)
          : parkingReserveApi.checkout(reserve.id))
      }
      toast.success(isActive ? `Đã hủy ${label}` : `Đã ${label} thành công`)
      queryClient.invalidateQueries({ queryKey: ['parking-status'] })
      setIsOpen(false)
    } catch {
      toast.error(`Không thể thay đổi trạng thái ${label}`)
    }
  }

  const reservationLabel = reserve.reserveId ? `#${reserve.reserveId}` : 'Không liên kết'
  const roomLabel = reserve.reserveId
    ? `${reserve.facilityNo ?? '---'}−${reserve.roomNumber ?? '---'}`
    : 'Chưa chọn phòng'
  const statusLabel = [
    reserve.checkinFlag ? 'Đã check-in' : 'Chưa check-in',
    reserve.checkoutFlag ? 'Đã check-out' : 'Chưa check-out',
  ].join(' | ')

  const content = (
    <div className="flex flex-col gap-[1.5rem] [&_*]:text-[1.4rem]">
      <div className="grid grid-cols-2 gap-[1rem] border border-black bg-gray-50 p-[1rem] rounded-[.4rem] max-md:grid-cols-1">
        <div className="flex items-center gap-[1rem]">
          <span className="font-bold w-[10rem]">Khách hàng:</span>
          <span className="bg-white border border-black px-4 py-2 rounded min-w-[22rem] max-md:min-w-0 max-md:w-full">
            {reserve.clientName ?? 'Khách lẻ'}
          </span>
        </div>

        <div className="flex items-center gap-[1rem]">
          <span className="font-bold w-[10rem]">Phòng:</span>
          <span className="bg-white border border-black px-4 py-2 rounded min-w-[22rem] max-md:min-w-0 max-md:w-full">
            {roomLabel}
          </span>
        </div>

        <div className="flex items-center gap-[1rem]">
          <span className="font-bold w-[10rem]">Đặt phòng:</span>
          <span className="bg-white border border-black px-4 py-2 rounded min-w-[22rem] max-md:min-w-0 max-md:w-full">
            {reservationLabel}
          </span>
        </div>

        <div className="flex items-center gap-[1rem]">
          <span className="font-bold w-[10rem]">Trạng thái:</span>
          <span className="bg-white border border-black px-4 py-2 rounded min-w-[22rem] max-md:min-w-0 max-md:w-full">
            {statusLabel}
          </span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[1.5rem]">
        <div className="border border-black rounded-[.4rem] p-[1.2rem] flex flex-col gap-[1rem]">
          <div className="font-bold text-[1.5rem]">Thông tin đặt chỗ</div>

          <div className="grid grid-cols-2 gap-[1rem] max-md:grid-cols-1">
            <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
              <span className="font-bold w-[8rem]">Từ ngày:</span>
              <Controller
                control={form.control}
                name="periodFrom"
                render={({ field: { value, onChange } }) => (
                  <CustomDatePicker
                    value={value}
                    change={(d) => onChange(d)}
                    className="!w-[22rem] h-[4rem] max-md:!w-full"
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
              <span className="font-bold w-[8rem]">Đến ngày:</span>
              <Controller
                control={form.control}
                name="periodTo"
                render={({ field: { value, onChange } }) => (
                  <CustomDatePicker
                    value={value}
                    change={(d) => onChange(d)}
                    className="!w-[22rem] h-[4rem] max-md:!w-full"
                  />
                )}
              />
            </div>

            {form.formState.errors.periodFrom && (
              <p className="text-red-500 text-sm col-span-2 max-md:col-span-1">
                {form.formState.errors.periodFrom.message}
              </p>
            )}
            {form.formState.errors.periodTo && (
              <p className="text-red-500 text-sm col-span-2 max-md:col-span-1">
                {form.formState.errors.periodTo.message}
              </p>
            )}

            {!isBicycle && (
              <>
                <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
                  <span className="font-bold w-[8rem]">Loại xe:</span>
                  <input
                    {...form.register('carType')}
                    className="border border-black px-4 py-2 w-[22rem] outline-none max-md:w-full"
                  />
                </div>

                <div className="flex items-center gap-[1rem] max-md:flex-col max-md:items-start">
                  <span className="font-bold w-[8rem]">Biển số:</span>
                  <input
                    {...form.register('licensePlate')}
                    className="border border-black px-4 py-2 w-[22rem] outline-none max-md:w-full"
                  />
                </div>
              </>
            )}

            {isBicycle && (
              <div className="flex items-center gap-[1rem] col-span-2 max-md:col-span-1 max-md:flex-col max-md:items-start">
                <span className="font-bold w-[8rem]">Loại xe:</span>
                <input
                  {...form.register('bicycleTypeNote')}
                  className="border border-black px-4 py-2 w-full outline-none"
                />
              </div>
            )}

            <div className="flex items-start gap-[1rem] col-span-2 max-md:col-span-1">
              <span className="font-bold w-[8rem] pt-2">Ghi chú:</span>
              <textarea
                {...form.register('note')}
                rows={2}
                className="border border-black px-4 py-2 flex-1 outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-[1rem] col-span-2 max-md:col-span-1">
              <span className="font-bold w-[8rem]">Xác nhận:</span>
              <Controller
                control={form.control}
                name="confirmFlag"
                render={({ field: { value, onChange, name } }) => (
                  <div className="flex items-center gap-3">
                    <CustomCheckbox
                      id={name}
                      checked={!!value}
                      onCheckedChange={(checked) => onChange(checked === true)}
                    />
                    <label htmlFor={name} className="font-bold cursor-pointer select-none">
                      Đã xác nhận đặt chỗ
                    </label>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-between items-center gap-[1rem] pt-[1rem] border-t border-gray-200">
          <div className="flex flex-wrap gap-[1rem] items-center">
            <NButton
              type="button"
              onClick={() => handleToggleFlag('checkin')}
              variant={reserve.checkinFlag ? 'outline' : 'default'}
              className="min-w-[12rem] h-[4rem]"
            >
              {reserve.checkinFlag ? 'Hủy Check-in' : 'Check-in'}
            </NButton>

            <NButton
              type="button"
              onClick={() => handleToggleFlag('checkout')}
              disabled={!reserve.checkinFlag}
              variant={reserve.checkoutFlag ? 'outline' : 'default'}
              className="min-w-[12rem] h-[4rem]"
            >
              {reserve.checkoutFlag ? 'Hủy Check-out' : 'Check-out'}
            </NButton>

            {!showDeleteConfirm ? (
              <NButton
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="min-w-[8rem] h-[4rem]"
              >
                Xóa
              </NButton>
            ) : (
              <div className="flex gap-[.8rem] items-center border border-red-300 bg-red-50 rounded-[.4rem] px-3 py-2">
                <span className="text-red-600 font-bold whitespace-nowrap">Xác nhận xóa?</span>
                <NButton
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  variant="destructive"
                  className="min-w-[7rem] h-[3.6rem]"
                >
                  Xóa
                </NButton>
                <NButton
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="min-w-[7rem] h-[3.6rem]"
                >
                  Hủy
                </NButton>
              </div>
            )}
          </div>

          <NButton type="submit" disabled={isPending} className="min-w-[14rem] h-[4rem]">
            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </NButton>
        </div>
      </form>
    </div>
  )

  return (
    <CustomDialog
      size="medium"
      title={isBicycle ? 'Chỉnh sửa đặt chỗ xe đạp' : 'Chỉnh sửa đặt chỗ đỗ xe'}
      trigger={trigger}
      opened={isOpen}
      changeOnOpened={(open) => {
        setIsOpen(open)
        if (open) {
          form.reset(getFormDefaults())
          setShowDeleteConfirm(false)
        }
      }}
      content={content}
    />
  )
}
