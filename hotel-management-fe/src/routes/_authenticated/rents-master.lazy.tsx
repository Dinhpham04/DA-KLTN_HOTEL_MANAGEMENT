import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute } from '@tanstack/react-router'
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef, 
  useState,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import CustomSelect from '@/components/common/CustomSelect'
import Loading from '@/components/common/Loading'
import { DialogClose } from '@/components/ui/dialog'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { NButton } from '@/components/ui/new-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  useBulkUpdateDeposited,
  useBulkUpdateNotDeposited,
} from '@/hooks/mutations/useBulkUpdateRent'
import { useGetRentList } from '@/hooks/queries/useGetRentList'
import { useGetRoomTypes } from '@/hooks/queries/useGetRoomTypes'
import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'
import type {
  BulkUpdateRentBody,
  RentGroup,
  RentGroupInput,
  RentItemInput,
} from '@/types/rent'
import type { RoomType } from '@/types/room-type'

// ─── Types ──────────────────────────────────────────

interface SelectOption {
  value: string
  label: string
}

interface RentRowHandle {
  getFormValues: () => RentGroupFormData
  validateRent: () => Promise<boolean>
  handleSubmit: () => void
}

// ─── Zod Schema ─────────────────────────────────────

const rentItemSchema = z.object({
  stay_type_id: z.number(),
  data_status: z.number().nullable(),
  day_rent: z.number().nullable().optional(),
  month_rent: z.number().nullable().optional(),
  day_rent_over3: z.number().nullable().optional(),
  month_rent_over3: z.number().nullable().optional(),
  day_clean_fee: z.number().nullable().optional(),
  month_clean_fee: z.number().nullable().optional(),
  day_clean_fee_over3: z.number().nullable().optional(),
  month_clean_fee_over3: z.number().nullable().optional(),
  day_mainte_fee: z.number().nullable().optional(),
  day_utility_fee: z.number().nullable().optional(),
  deposit_pay: z.number().nullable().optional(),
  deposit_pay_over3: z.number().nullable().optional(),
})

const rentGroupSchema = z.object({
  room_type_id: z.union([z.string(), z.number()]),
  room_class_id: z.union([z.string(), z.number()]),
  room_type_name_short: z.string().nullable().optional(),
  month_mainte_fee: z.number().nullable().optional(),
  month_utility_fee: z.number().nullable().optional(),
  order_num: z.number().optional(),
  rents: z.array(rentItemSchema),
})

type RentGroupFormData = z.infer<typeof rentGroupSchema>

// ─── Helpers ────────────────────────────────────────

const N = (v: number | string | null | undefined): number =>
  Number(v ?? 0) || 0

const fmt = (v: number) => v.toLocaleString('en-US')

const INPUT_CLASS =
  'disabled:opacity-100 border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem] text-center'

function CalcCell({
  value,
  className,
}: { value: number; className?: string }) {
  return (
    <TableCell
      className={cn('!bg-[rgba(121,163,224,0.8)] min-w-[10rem]', className)}
    >
      <span>{fmt(value)}</span>
    </TableCell>
  )
}

function InputCell({
  control,
  name,
  disabled,
}: {
  control: any
  name: string
  disabled: boolean
}) {
  return (
    <TableCell className="min-w-[10rem]">
      <FormField
        control={control}
        name={name}
        render={({ field }: any) => (
          <FormItem>
            <FormControl>
              <CustomInput
                {...field}
                value={field.value?.toString() ?? ''}
                type="number"
                className={INPUT_CLASS}
                autoResize
                disabled={disabled}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </TableCell>
  )
}

// ─── Shared Fee Columns (管理費 + 光熱費) ───────────

function SharedFeeCells({
  control,
  monthMainteFee,
  monthUtilityFee,
  disabled,
}: {
  control: any
  monthMainteFee: number
  monthUtilityFee: number
  disabled: boolean
}) {
  return (
    <>
      <CalcCell value={monthMainteFee / 30} />
      <InputCell control={control} name="month_mainte_fee" disabled={disabled} />
      <CalcCell value={monthUtilityFee / 30} />
      <InputCell
        control={control}
        name="month_utility_fee"
        disabled={disabled}
      />
    </>
  )
}

// ─── Action Cells ───────────────────────────────────

function ActionCells({
  isSuspended,
  isCreate,
  onUpdate,
  onSuspend,
  onReactivate,
  onAddRow,
  onCopyRow,
  onDeleteRow,
}: {
  isSuspended: boolean
  isCreate: boolean
  onUpdate: () => void
  onSuspend: () => void
  onReactivate: () => void
  onAddRow: () => void
  onCopyRow: () => void
  onDeleteRow: () => void
}) {
  return (
    <>
      <TableCell className="min-w-[10rem]">
        {!isCreate ? (
          isSuspended ? (
            <CustomDialog
              customClass="text-center [&_svg]:hidden"
              size="medium"
              customClassContent="max-w-[50rem]"
              trigger={
                <NButton className="bg-gray w-auto min-w-fit h-auto">
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                    Sử dụng lại
                  </span>
                </NButton>
              }
              title="Bạn muốn sử dụng lại?"
              content={
                <div className="flex justify-center p-5">
                  <DialogClose onClick={onReactivate}>
                    <div className="bg-[#8bd08e] mx-4 w-[12.4rem] border border-black btn btn-default">
                      <span>Thực hiện</span>
                    </div>
                  </DialogClose>
                  <DialogClose>
                    <div className="bg-[#eee] mx-4 w-[12.4rem] border border-black btn btn-default">
                      <span>Hủy</span>
                    </div>
                  </DialogClose>
                </div>
              }
            />
          ) : (
            <>
              <NButton
                className="bg-gray w-auto min-w-fit h-auto"
                type="button"
                onClick={onUpdate}
              >
                <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                  Cập nhật
                </span>
              </NButton>
              <CustomDialog
                customClass="text-center [&_svg]:hidden"
                size="medium"
                customClassContent="max-w-[50rem]"
                trigger={
                  <NButton className="bg-gray mt-[.5rem] w-auto min-w-fit h-auto">
                    <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                      Tạm dừng
                    </span>
                  </NButton>
                }
                title="Bạn muốn tạm dừng sử dụng?"
                content={
                  <div className="flex justify-center p-5">
                    <DialogClose onClick={onSuspend}>
                      <div className="bg-[#8bd08e] mx-4 w-[12.4rem] border border-black btn btn-default">
                        <span>Thực hiện</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[12.4rem] border border-black btn btn-default">
                        <span>Hủy</span>
                      </div>
                    </DialogClose>
                  </div>
                }
              />
            </>
          )
        ) : (
          <NButton
            className="bg-gray w-auto min-w-fit h-auto"
            type="button"
            onClick={onUpdate}
          >
            <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
              Lưu
            </span>
          </NButton>
        )}
      </TableCell>
      <TableCell className="min-w-[10rem]">
        {!isCreate && (
          <div className="flex flex-col gap-[.5rem]">
            <NButton
              className="bg-gray w-auto min-w-fit h-auto"
              type="button"
              onClick={onAddRow}
            >
              <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                Thêm dòng
              </span>
            </NButton>
            {!isSuspended && (
              <NButton
                className="bg-gray w-auto min-w-fit h-auto"
                type="button"
                onClick={onCopyRow}
              >
                <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                  Sao chép
                </span>
              </NButton>
            )}
            <CustomDialog
              customClass="text-center [&_svg]:hidden"
              size="medium"
              customClassContent="max-w-[50rem]"
              trigger={
                <NButton className="bg-gray w-auto min-w-fit h-auto">
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                    Xóa dòng
                  </span>
                </NButton>
              }
              title="Bạn muốn xóa dòng này?"
              content={
                <div className="flex justify-center p-5">
                  <DialogClose onClick={onDeleteRow}>
                    <div className="bg-[#8bd08e] mx-4 w-[12.4rem] border border-black btn btn-default">
                      <span>Thực hiện</span>
                    </div>
                  </DialogClose>
                  <DialogClose>
                    <div className="bg-[#eee] mx-4 w-[12.4rem] border border-black btn btn-default">
                      <span>Hủy</span>
                    </div>
                  </DialogClose>
                </div>
              }
            />
          </div>
        )}
      </TableCell>
    </>
  )
}

// ─── Not-Deposited Row ──────────────────────────────

interface RowProps {
  rent: RentGroupFormData
  roomTypes: RoomType[]
  roomClassOptions: SelectOption[]
  isCreate: boolean
  index: number
  onSubmitRow: (data: RentGroupFormData, isCreate: boolean, type: number) => void
  onAddRow: () => void
  onCopyRow: (data: RentGroupFormData) => void
  onDeleteRow: () => void
  tableId: string
}

const NotDepositedRow = forwardRef<RentRowHandle, RowProps>(
  (
    {
      rent,
      roomTypes,
      roomClassOptions,
      isCreate,
      index: _index,
      onSubmitRow,
      onAddRow,
      onCopyRow,
      onDeleteRow,
      tableId,
    },
    ref,
  ) => {
    const methods = useForm<RentGroupFormData>({
      resolver: zodResolver(rentGroupSchema),
      defaultValues: rent,
    })

    const { control, watch, handleSubmit, reset, setValue } = methods

    useEffect(() => {
      reset(rent)
    }, [rent, reset])

    useImperativeHandle(ref, () => ({
      getFormValues: () => methods.getValues(),
      validateRent: async () => {
        if (rent.rents[0]?.data_status !== 1) return true
        return methods.trigger()
      },
      handleSubmit: () => {
        handleSubmit((data) => onSubmitRow(data, isCreate, 0))()
      },
    }))

    const rents = watch('rents')
    const monthMainteFee = N(watch('month_mainte_fee'))
    const monthUtilityFee = N(watch('month_utility_fee'))
    const roomTypeId = watch('room_type_id')
    const roomClassId = watch('room_class_id')
    const isSuspended = rent.rents[0]?.data_status === 0

    const filteredRoomTypes = useMemo(
      () =>
        roomTypes
          .filter(
            (rt) =>
              !roomClassId ||
              rt.roomClassId.toString() === roomClassId.toString(),
          )
          .map((rt) => ({
            value: rt.roomTypeId.toString(),
            label: rt.roomTypeName,
          })),
      [roomTypes, roomClassId],
    )

    const shortName = roomTypes.find(
      (rt) => rt.roomTypeId.toString() === roomTypeId?.toString(),
    )?.roomTypeNameShort

    // Monthly period cells (stays 4,5,6)
    const renderMonthlyPeriod = (stayIdx: number) => {
      const mr = N(rents?.[stayIdx]?.month_rent)
      const mc = N(rents?.[stayIdx]?.month_clean_fee)
      const netRent = mr - mc - monthMainteFee - monthUtilityFee
      return (
        <>
          <CalcCell value={netRent / 30} />
          <CalcCell value={netRent} />
          <CalcCell value={mc / 30} />
          <InputCell
            control={control}
            name={`rents.${stayIdx}.month_clean_fee`}
            disabled={isSuspended}
          />
          <InputCell
            control={control}
            name={`rents.${stayIdx}.month_rent`}
            disabled={isSuspended}
          />
        </>
      )
    }

    return (
      <TableRow
        className={cn('!bg-white [&_td]:text-center', {
          '!bg-gray-400': isSuspended,
        })}
      >
        <FormProvider {...methods}>
          {/* Room Class */}
          <TableCell className="min-w-[10rem]">
            <FormField
              control={control}
              name="room_class_id"
              render={({ field }: any) => (
                <FormItem>
                  <FormControl>
                    <CustomSelect
                      change={(option) => {
                        field.onChange(option.value)
                        setValue('room_type_id', '')
                      }}
                      option={roomClassOptions}
                      selected={field.value?.toString() ?? ''}
                      customClassMain="w-[15rem] h-[2rem] sm:h-[3.6rem]"
                      disable={isSuspended}
                      hideWhenDetached
                      collisionBoundary={
                        document.getElementById(tableId) ?? undefined
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TableCell>
          {/* Room Type */}
          <TableCell className="min-w-[10rem]">
            <FormField
              control={control}
              name="room_type_id"
              render={({ field }: any) => (
                <FormItem>
                  <FormControl>
                    <CustomSelect
                      change={(option) => field.onChange(option.value)}
                      option={filteredRoomTypes}
                      selected={field.value?.toString() ?? ''}
                      customClassMain="w-[15rem] h-[2rem] sm:h-[3.6rem]"
                      disable={isSuspended || !roomClassId}
                      hideWhenDetached
                      collisionBoundary={
                        document.getElementById(tableId) ?? undefined
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TableCell>
          {/* Short Name */}
          <TableCell className="min-w-[10rem]">{shortName}</TableCell>

          {/* Stay 0: 1-6 nights (2 cols) */}
          <CalcCell value={(N(rents?.[0]?.day_rent) * 100) / 110} />
          <InputCell
            control={control}
            name="rents.0.day_rent"
            disabled={isSuspended}
          />

          {/* Stay 1: Super-short (4 cols) */}
          <CalcCell value={0} className="!bg-[rgba(121,163,224,0.8)]" />
          <InputCell
            control={control}
            name="rents.1.day_clean_fee"
            disabled={isSuspended}
          />
          <CalcCell value={(N(rents?.[1]?.day_rent) * 100) / 110} />
          <InputCell
            control={control}
            name="rents.1.day_rent"
            disabled={isSuspended}
          />

          {/* Stay 2: Weekly (1 col) */}
          <InputCell
            control={control}
            name="rents.2.day_rent"
            disabled={isSuspended}
          />

          {/* Stay 3: 1 month (2 cols) */}
          <CalcCell value={N(rents?.[3]?.month_rent) / 30} />
          <InputCell
            control={control}
            name="rents.3.month_rent"
            disabled={isSuspended}
          />

          {/* Stay 4,5,6: Monthly periods (5 cols each) */}
          {renderMonthlyPeriod(4)}
          {renderMonthlyPeriod(5)}
          {renderMonthlyPeriod(6)}

          {/* Shared fees */}
          <SharedFeeCells
            control={control}
            monthMainteFee={monthMainteFee}
            monthUtilityFee={monthUtilityFee}
            disabled={isSuspended}
          />

          {/* Actions */}
          <ActionCells
            isSuspended={isSuspended}
            isCreate={isCreate}
            onUpdate={() =>
              handleSubmit((data) => onSubmitRow(data, isCreate, 0))()
            }
            onSuspend={() => {
              const updated = {
                ...methods.getValues(),
                rents: methods
                  .getValues()
                  .rents.map((r) => ({ ...r, data_status: 0 })),
              }
              onSubmitRow(updated, isCreate, 2)
            }}
            onReactivate={() => {
              const updated = {
                ...methods.getValues(),
                rents: methods
                  .getValues()
                  .rents.map((r) => ({ ...r, data_status: 1 })),
              }
              onSubmitRow(updated, isCreate, 1)
            }}
            onAddRow={onAddRow}
            onCopyRow={() => onCopyRow(methods.getValues())}
            onDeleteRow={onDeleteRow}
          />
        </FormProvider>
      </TableRow>
    )
  },
)
NotDepositedRow.displayName = 'NotDepositedRow'

// ─── Deposited Row ──────────────────────────────────

const DepositedRow = forwardRef<RentRowHandle, RowProps>(
  (
    {
      rent,
      roomTypes,
      roomClassOptions,
      isCreate,
      index: _index,
      onSubmitRow,
      onAddRow,
      onCopyRow,
      onDeleteRow,
      tableId,
    },
    ref,
  ) => {
    const methods = useForm<RentGroupFormData>({
      resolver: zodResolver(rentGroupSchema),
      defaultValues: rent,
    })

    const { control, watch, handleSubmit, reset, setValue } = methods

    useEffect(() => {
      reset(rent)
    }, [rent, reset])

    useImperativeHandle(ref, () => ({
      getFormValues: () => methods.getValues(),
      validateRent: async () => {
        if (rent.rents[0]?.data_status !== 1) return true
        return methods.trigger()
      },
      handleSubmit: () => {
        handleSubmit((data) => onSubmitRow(data, isCreate, 0))()
      },
    }))

    const rents = watch('rents')
    const monthMainteFee = N(watch('month_mainte_fee'))
    const monthUtilityFee = N(watch('month_utility_fee'))
    const roomTypeId = watch('room_type_id')
    const roomClassId = watch('room_class_id')
    const isSuspended = rent.rents[0]?.data_status === 0

    const filteredRoomTypes = useMemo(
      () =>
        roomTypes
          .filter(
            (rt) =>
              !roomClassId ||
              rt.roomClassId.toString() === roomClassId.toString(),
          )
          .map((rt) => ({
            value: rt.roomTypeId.toString(),
            label: rt.roomTypeName,
          })),
      [roomTypes, roomClassId],
    )

    const shortName = roomTypes.find(
      (rt) => rt.roomTypeId.toString() === roomTypeId?.toString(),
    )?.roomTypeNameShort

    // Super-short daily total
    const superShortDailyTotal =
      N(rents?.[1]?.day_rent) +
      N(rents?.[1]?.day_clean_fee) +
      monthMainteFee / 30 +
      monthUtilityFee / 30

    // Monthly period cells for deposited (stay 5,6)
    const renderDepositedMonthly = (stayIdx: number) => {
      const mr = N(rents?.[stayIdx]?.month_rent)
      const mc = N(rents?.[stayIdx]?.month_clean_fee)
      const dailyTotal =
        mr / 30 + mc / 30 + monthMainteFee / 30 + monthUtilityFee / 30
      return (
        <>
          <InputCell
            control={control}
            name={`rents.${stayIdx}.deposit_pay`}
            disabled={isSuspended}
          />
          <CalcCell value={mr / 30} />
          <InputCell
            control={control}
            name={`rents.${stayIdx}.month_rent`}
            disabled={isSuspended}
          />
          <CalcCell value={mc / 30} />
          <InputCell
            control={control}
            name={`rents.${stayIdx}.month_clean_fee`}
            disabled={isSuspended}
          />
          <CalcCell value={dailyTotal} />
          <CalcCell value={dailyTotal * 30} />
        </>
      )
    }

    return (
      <TableRow
        className={cn('!bg-white [&_td]:text-center', {
          '!bg-gray-400': isSuspended,
        })}
      >
        <FormProvider {...methods}>
          {/* Room Class */}
          <TableCell className="min-w-[10rem]">
            <FormField
              control={control}
              name="room_class_id"
              render={({ field }: any) => (
                <FormItem>
                  <FormControl>
                    <CustomSelect
                      change={(option) => {
                        field.onChange(option.value)
                        setValue('room_type_id', '')
                      }}
                      option={roomClassOptions}
                      selected={field.value?.toString() ?? ''}
                      customClassMain="w-[15rem] h-[2rem] sm:h-[3.6rem]"
                      disable={isSuspended}
                      hideWhenDetached
                      collisionBoundary={
                        document.getElementById(tableId) ?? undefined
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TableCell>
          {/* Room Type */}
          <TableCell className="min-w-[10rem]">
            <FormField
              control={control}
              name="room_type_id"
              render={({ field }: any) => (
                <FormItem>
                  <FormControl>
                    <CustomSelect
                      change={(option) => field.onChange(option.value)}
                      option={filteredRoomTypes}
                      selected={field.value?.toString() ?? ''}
                      customClassMain="w-[15rem] h-[2rem] sm:h-[3.6rem]"
                      disable={isSuspended || !roomClassId}
                      hideWhenDetached
                      collisionBoundary={
                        document.getElementById(tableId) ?? undefined
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TableCell>
          {/* Short Name */}
          <TableCell className="min-w-[10rem]">{shortName}</TableCell>

          {/* Super-short (4 cols): deposit, cleanFee, dayRent(INPUT), total(CALC) */}
          <InputCell
            control={control}
            name="rents.1.deposit_pay"
            disabled={isSuspended}
          />
          <InputCell
            control={control}
            name="rents.1.day_clean_fee"
            disabled={isSuspended}
          />
          <InputCell
            control={control}
            name="rents.1.day_rent"
            disabled={isSuspended}
          />
          <CalcCell value={superShortDailyTotal} />

          {/* Short 1-3 months (7 cols): deposit, rent/day(CALC), rent/month(CALC), clean/day(CALC), cleanFee(INPUT), total/day(CALC), total/month(CALC) */}
          <InputCell
            control={control}
            name="rents.4.deposit_pay"
            disabled={isSuspended}
          />
          <CalcCell value={N(rents?.[1]?.day_rent)} />
          <CalcCell value={N(rents?.[1]?.day_rent) * 30} />
          <CalcCell value={N(rents?.[1]?.day_clean_fee)} />
          <InputCell
            control={control}
            name="rents.4.month_clean_fee"
            disabled={isSuspended}
          />
          <CalcCell value={superShortDailyTotal} />
          <CalcCell value={superShortDailyTotal * 30} />

          {/* Middle 3-7 months (7 cols) */}
          {renderDepositedMonthly(5)}

          {/* Long 7+ months (7 cols) */}
          {renderDepositedMonthly(6)}

          {/* Shared fees */}
          <SharedFeeCells
            control={control}
            monthMainteFee={monthMainteFee}
            monthUtilityFee={monthUtilityFee}
            disabled={isSuspended}
          />

          {/* Actions */}
          <ActionCells
            isSuspended={isSuspended}
            isCreate={isCreate}
            onUpdate={() =>
              handleSubmit((data) => onSubmitRow(data, isCreate, 0))()
            }
            onSuspend={() => {
              const updated = {
                ...methods.getValues(),
                rents: methods
                  .getValues()
                  .rents.map((r) => ({ ...r, data_status: 0 })),
              }
              onSubmitRow(updated, isCreate, 2)
            }}
            onReactivate={() => {
              const updated = {
                ...methods.getValues(),
                rents: methods
                  .getValues()
                  .rents.map((r) => ({ ...r, data_status: 1 })),
              }
              onSubmitRow(updated, isCreate, 1)
            }}
            onAddRow={onAddRow}
            onCopyRow={() => onCopyRow(methods.getValues())}
            onDeleteRow={onDeleteRow}
          />
        </FormProvider>
      </TableRow>
    )
  },
)
DepositedRow.displayName = 'DepositedRow'

// ─── Not-Deposited Over3 Row ────────────────────────

const NotDepositedOver3Row = forwardRef<
  RentRowHandle,
  { rent: RentGroupFormData; onSubmitRow: (data: RentGroupFormData) => void }
>(({ rent, onSubmitRow }, ref) => {
  const methods = useForm<RentGroupFormData>({
    resolver: zodResolver(rentGroupSchema),
    defaultValues: rent,
  })

  const { control, watch, handleSubmit, reset } = methods

  useEffect(() => {
    reset(rent)
  }, [rent, reset])

  useImperativeHandle(ref, () => ({
    getFormValues: () => methods.getValues(),
    validateRent: async () => methods.trigger(),
    handleSubmit: () => {
      handleSubmit((data) => onSubmitRow(data))()
    },
  }))

  const rents = watch('rents')

  // Monthly period over3
  const renderMonthlyOver3 = (stayIdx: number) => {
    const mr = N(rents?.[stayIdx]?.month_rent_over3)
    const mc = N(rents?.[stayIdx]?.month_clean_fee_over3)
    return (
      <>
        <CalcCell value={(mr - mc) / 30} />
        <CalcCell value={mr - mc} />
        <CalcCell value={mc / 30} />
        <InputCell
          control={control}
          name={`rents.${stayIdx}.month_clean_fee_over3`}
          disabled={false}
        />
        <InputCell
          control={control}
          name={`rents.${stayIdx}.month_rent_over3`}
          disabled={false}
        />
      </>
    )
  }

  return (
    <TableRow className="!bg-white [&_td]:text-center">
      <FormProvider {...methods}>
        <TableCell className="min-w-[10rem]">
          {rent.room_type_name_short}
        </TableCell>

        {/* Stay 0 */}
        <CalcCell value={(N(rents?.[0]?.day_rent_over3) * 100) / 110} />
        <InputCell
          control={control}
          name="rents.0.day_rent_over3"
          disabled={false}
        />

        {/* Stay 1 */}
        <CalcCell value={0} />
        <InputCell
          control={control}
          name="rents.1.day_clean_fee_over3"
          disabled={false}
        />
        <CalcCell value={(N(rents?.[1]?.day_rent_over3) * 100) / 110} />
        <InputCell
          control={control}
          name="rents.1.day_rent_over3"
          disabled={false}
        />

        {/* Stay 2 */}
        <InputCell
          control={control}
          name="rents.2.day_rent_over3"
          disabled={false}
        />

        {/* Stay 3 */}
        <CalcCell value={N(rents?.[3]?.month_rent_over3) / 30} />
        <InputCell
          control={control}
          name="rents.3.month_rent_over3"
          disabled={false}
        />

        {/* Stay 4,5,6 */}
        {renderMonthlyOver3(4)}
        {renderMonthlyOver3(5)}
        {renderMonthlyOver3(6)}

        {/* Actions */}
        <TableCell className="min-w-[10rem]">
          <NButton
            className="bg-gray w-auto min-w-fit h-auto"
            type="button"
            onClick={() => handleSubmit((data) => onSubmitRow(data))()}
          >
            <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
              Cập nhật
            </span>
          </NButton>
        </TableCell>
      </FormProvider>
    </TableRow>
  )
})
NotDepositedOver3Row.displayName = 'NotDepositedOver3Row'

// ─── Deposited Over3 Row ────────────────────────────

const DepositedOver3Row = forwardRef<
  RentRowHandle,
  { rent: RentGroupFormData; onSubmitRow: (data: RentGroupFormData) => void }
>(({ rent, onSubmitRow }, ref) => {
  const methods = useForm<RentGroupFormData>({
    resolver: zodResolver(rentGroupSchema),
    defaultValues: rent,
  })

  const { control, watch, handleSubmit, reset } = methods

  useEffect(() => {
    reset(rent)
  }, [rent, reset])

  useImperativeHandle(ref, () => ({
    getFormValues: () => methods.getValues(),
    validateRent: async () => methods.trigger(),
    handleSubmit: () => {
      handleSubmit((data) => onSubmitRow(data))()
    },
  }))

  const rents = watch('rents')
  const monthMainteFee = N(watch('month_mainte_fee'))
  const monthUtilityFee = N(watch('month_utility_fee'))

  const superShortTotal =
    N(rents?.[1]?.day_rent_over3) +
    N(rents?.[1]?.day_clean_fee_over3) +
    monthMainteFee / 30 +
    monthUtilityFee / 30

  const renderDepositedMonthlyOver3 = (stayIdx: number) => {
    const mr = N(rents?.[stayIdx]?.month_rent_over3)
    const mc = N(rents?.[stayIdx]?.month_clean_fee_over3)
    const dailyTotal =
      mr / 30 + mc / 30 + monthMainteFee / 30 + monthUtilityFee / 30
    return (
      <>
        <InputCell
          control={control}
          name={`rents.${stayIdx}.deposit_pay_over3`}
          disabled={false}
        />
        <CalcCell value={mr / 30} />
        <InputCell
          control={control}
          name={`rents.${stayIdx}.month_rent_over3`}
          disabled={false}
        />
        <CalcCell value={mc / 30} />
        <InputCell
          control={control}
          name={`rents.${stayIdx}.month_clean_fee_over3`}
          disabled={false}
        />
        <CalcCell value={dailyTotal} />
        <CalcCell value={dailyTotal * 30} />
      </>
    )
  }

  return (
    <TableRow className="!bg-white [&_td]:text-center">
      <FormProvider {...methods}>
        <TableCell className="min-w-[10rem]">
          {rent.room_type_name_short}
        </TableCell>

        {/* Super-short over3 */}
        <InputCell
          control={control}
          name="rents.1.deposit_pay_over3"
          disabled={false}
        />
        <InputCell
          control={control}
          name="rents.1.day_clean_fee_over3"
          disabled={false}
        />
        <InputCell
          control={control}
          name="rents.1.day_rent_over3"
          disabled={false}
        />
        <CalcCell value={superShortTotal} />

        {/* Short: uses super-short over3 daily rates */}
        <InputCell
          control={control}
          name="rents.4.deposit_pay_over3"
          disabled={false}
        />
        <CalcCell value={N(rents?.[1]?.day_rent_over3)} />
        <CalcCell value={N(rents?.[1]?.day_rent_over3) * 30} />
        <CalcCell value={N(rents?.[1]?.day_clean_fee_over3)} />
        <InputCell
          control={control}
          name="rents.4.month_clean_fee_over3"
          disabled={false}
        />
        <CalcCell value={superShortTotal} />
        <CalcCell value={superShortTotal * 30} />

        {/* Middle, Long */}
        {renderDepositedMonthlyOver3(5)}
        {renderDepositedMonthlyOver3(6)}

        {/* Actions */}
        <TableCell className="min-w-[10rem]">
          <NButton
            className="bg-gray w-auto min-w-fit h-auto"
            type="button"
            onClick={() => handleSubmit((data) => onSubmitRow(data))()}
          >
            <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
              Cập nhật
            </span>
          </NButton>
        </TableCell>
      </FormProvider>
    </TableRow>
  )
})
DepositedOver3Row.displayName = 'DepositedOver3Row'

// ─── Not-Deposited Table Headers ────────────────────

function NotDepositedTableHeader() {
  return (
    <TableHeader className="!border-0">
      <TableRow className="!border-0">
        <TableHead
          className="flex-1 !bg-transparent !border-0 font-bold"
          colSpan={3}
          rowSpan={3}
        />
        <TableHead
          className="flex-1 !bg-white !border font-bold"
          colSpan={9}
        >
          Hợp đồng tuần
        </TableHead>
        <TableHead
          className="flex-1 !bg-white !border font-bold"
          colSpan={15}
        >
          Hợp đồng tháng
        </TableHead>
        <TableHead
          className="flex-1 !bg-transparent !border-0 font-bold"
          colSpan={6}
          rowSpan={3}
        />
      </TableRow>
      <TableRow className="!bg-white !border-0">
        <TableHead
          className="flex-1 !bg-[#FCFF61] border font-bold"
          colSpan={6}
        >
          {'<Chịu thuế>'}
        </TableHead>
        <TableHead
          className="flex-1 !bg-[#79A3E0] border font-bold"
          colSpan={18}
        >
          {'<Không chịu thuế>'}
        </TableHead>
      </TableRow>
      <TableRow className="!bg-white !border-0">
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={2}>
          1~6 đêm
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={4}>
          7~dưới 1 tháng (Siêu ngắn)
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold">
          Trả theo tuần
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={2}>
          1 tháng
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={5}>
          1~dưới 3 tháng
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={5}>
          3~dưới 7 tháng
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={5}>
          7 tháng trở lên
        </TableHead>
      </TableRow>
      <TableRow className="!border-0">
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Lớp phòng</TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Loại phòng</TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">(Viết tắt)</TableHead>
        {/* Stay 0 */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tiền thuê (trước thuế)</TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tiền thuê (sau thuế)</TableHead>
        {/* Stay 1 */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap">A Tiền thuê</TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">A Phí vệ sinh</TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tiền thuê (trước thuế)</TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tiền thuê (sau thuế)</TableHead>
        {/* Stay 2 */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tiền thuê (sau thuế)</TableHead>
        {/* Stay 3 */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Tiền thuê (sau thuế)
        </TableHead>
        {/* Stay 4 */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Tiền thuê (sau thuế)
        </TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Phí vệ sinh
        </TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tổng (tháng)</TableHead>
        {/* Stay 5 */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Tiền thuê (sau thuế)
        </TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Phí vệ sinh
        </TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tổng (tháng)</TableHead>
        {/* Stay 6 */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Tiền thuê (sau thuế)
        </TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Phí vệ sinh
        </TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Tổng (tháng)</TableHead>
        {/* Shared */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Phí quản lý
        </TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap" colSpan={2}>
          Phí điện nước
        </TableHead>
        {/* Actions */}
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Thao tác dòng</TableHead>
        <TableHead className="flex-1 border font-bold whitespace-nowrap">Thao tác khác</TableHead>
      </TableRow>
    </TableHeader>
  )
}

// ─── Deposited Table Headers ────────────────────────

function DepositedTableHeader() {
  return (
    <TableHeader className="!border-0">
      <TableRow className="!border-0">
        <TableHead
          className="flex-1 !bg-transparent !border-0 font-bold"
          colSpan={3}
          rowSpan={2}
        />
        <TableHead
          className="flex-1 !bg-[#FCFF61] border font-bold"
          colSpan={4}
        >
          Chịu thuế
        </TableHead>
        <TableHead
          className="flex-1 !bg-[#79A3E0] border font-bold"
          colSpan={21}
        >
          {'<Không chịu thuế>'}
        </TableHead>
        <TableHead
          className="flex-1 !bg-transparent !border-0 font-bold"
          colSpan={6}
        />
      </TableRow>
      <TableRow className="!bg-white !border-0">
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={4}>
          Siêu ngắn (7~dưới 1 tháng): Trả theo ngày
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={7}>
          Ngắn hạn (1~dưới 3 tháng)
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={7}>
          Trung hạn (3~dưới 7 tháng)
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border font-bold" colSpan={7}>
          Dài hạn (7 tháng trở lên)
        </TableHead>
        <TableHead className="flex-1 !bg-red-100 border font-bold" colSpan={4}>
          Chung
        </TableHead>
        <TableHead className="flex-1 !bg-transparent border-0 font-bold" colSpan={2} />
      </TableRow>
      <TableRow className="!border-0">
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Lớp phòng</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Loại phòng</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">(Viết tắt)</TableHead>
        {/* Super-short */}
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tiền cọc</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">A Phí vệ sinh</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tiền thuê (trước thuế)</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tổng</TableHead>
        {/* Short */}
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tiền cọc</TableHead>
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Tiền thuê (sau thuế)
        </TableHead>
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Phí vệ sinh
        </TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tổng (ngày)</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tổng (tháng)</TableHead>
        {/* Middle */}
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tiền cọc</TableHead>
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Tiền thuê (sau thuế)
        </TableHead>
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Phí vệ sinh
        </TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tổng (ngày)</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tổng (tháng)</TableHead>
        {/* Long */}
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tiền cọc</TableHead>
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Tiền thuê (sau thuế)
        </TableHead>
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Phí vệ sinh
        </TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tổng (ngày)</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Tổng (tháng)</TableHead>
        {/* Shared */}
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Phí quản lý
        </TableHead>
        <TableHead className="flex-1 border min-w-[12rem] font-bold whitespace-nowrap" colSpan={2}>
          Phí điện nước
        </TableHead>
        {/* Actions */}
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Thao tác dòng</TableHead>
        <TableHead className="flex-1 border min-w-[10rem] font-bold whitespace-nowrap">Thao tác khác</TableHead>
      </TableRow>
    </TableHeader>
  )
}

// ─── Default empty rent group ───────────────────────

function createDefaultRentGroup(): RentGroupFormData {
  return {
    room_type_id: '',
    room_class_id: '',
    room_type_name_short: '',
    month_mainte_fee: 0,
    month_utility_fee: 0,
    order_num: 0,
    rents: Array.from({ length: 7 }, (_, i) => ({
      stay_type_id: i + 1,
      data_status: 1,
      day_rent: null,
      month_rent: null,
      day_rent_over3: null,
      month_rent_over3: null,
      day_clean_fee: null,
      month_clean_fee: null,
      day_clean_fee_over3: null,
      month_clean_fee_over3: null,
      day_mainte_fee: null,
      day_utility_fee: null,
      deposit_pay: null,
      deposit_pay_over3: null,
    })),
  }
}

function apiGroupToFormData(g: RentGroup): RentGroupFormData {
  return {
    room_type_id: g.roomTypeId,
    room_class_id: g.roomClassId ?? '',
    room_type_name_short: g.roomTypeNameShort,
    month_mainte_fee: g.monthMainteFee,
    month_utility_fee: g.monthUtilityFee,
    order_num: g.orderNum,
    rents: g.rents.map((r) => ({
      stay_type_id: r.stayTypeId,
      data_status: r.dataStatus,
      day_rent: r.dayRent,
      month_rent: r.monthRent,
      day_rent_over3: r.dayRentOver3,
      month_rent_over3: r.monthRentOver3,
      day_clean_fee: r.dayCleanFee,
      month_clean_fee: r.monthCleanFee,
      day_clean_fee_over3: r.dayCleanFeeOver3,
      month_clean_fee_over3: r.monthCleanFeeOver3,
      day_mainte_fee: r.dayMainteFee,
      day_utility_fee: r.dayUtilityFee,
      deposit_pay: r.depositPay,
      deposit_pay_over3: r.depositPayOver3,
    })),
  }
}

function formDataToApiInput(f: RentGroupFormData): RentGroupInput {
  return {
    roomTypeId: Number(f.room_type_id),
    roomClassId: f.room_class_id ? Number(f.room_class_id) : undefined,
    monthMainteFee: f.month_mainte_fee,
    monthUtilityFee: f.month_utility_fee,
    rents: f.rents.map(
      (r): RentItemInput => ({
        stayTypeId: r.stay_type_id,
        dataStatus: r.data_status ?? 1,
        dayRent: r.day_rent,
        monthRent: r.month_rent,
        dayRentOver3: r.day_rent_over3,
        monthRentOver3: r.month_rent_over3,
        dayCleanFee: r.day_clean_fee,
        monthCleanFee: r.month_clean_fee,
        dayCleanFeeOver3: r.day_clean_fee_over3,
        monthCleanFeeOver3: r.month_clean_fee_over3,
        dayMainteFee: r.day_mainte_fee,
        dayUtilityFee: r.day_utility_fee,
        depositPay: r.deposit_pay,
        depositPayOver3: r.deposit_pay_over3,
      }),
    ),
  }
}

// ─── Main Page ──────────────────────────────────────

export const Route = createLazyFileRoute('/_authenticated/rents-master')({
  component: RentsMasterPage,
})

const TABLE_CLASSES =
  'bg-transparent [&_th]:bg-[#eee] [&_td]:border [&_th]:border-x [&_td]:border-black [&_th]:border-black w-full min-w-[210rem] [&_td]:h-14 [&_th]:h-14 text-[1.6rem] [&_th]:text-center'

function RentsMasterPage() {
  // ─── Data ───────────────────────────────────────
  const {
    data: rentNotDeposits = [],
    isLoading: isLoadingNotDeposits,
    refetch: refetchNotDeposits,
  } = useGetRentList({ params: { depositFlag: 0 } })

  const {
    data: rentDeposits = [],
    isLoading: isLoadingDeposits,
    refetch: refetchDeposits,
  } = useGetRentList({ params: { depositFlag: 1 } })

  const { data: roomTypesData, isLoading: isLoadingRoomTypes } =
    useGetRoomTypes({ params: { limit: 1000 } })
  const roomTypes = roomTypesData?.data ?? []

  const { isLoading: isLoadingStayTypes } =
    useGetStayTypes()

  // Room class options
  const roomClassOptions = useMemo(() => {
    const map = new Map<number, string>()
    for (const rt of roomTypes) {
      if (rt.roomClassName && !map.has(rt.roomClassId)) {
        map.set(rt.roomClassId, rt.roomClassName)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({
      value: id.toString(),
      label: name,
    }))
  }, [roomTypes])

  // ─── Not-Deposited State ────────────────────────
  const notDepositedRefs = useRef<{
    update: (RentRowHandle | null)[]
    create: (RentRowHandle | null)[]
  }>({ update: [], create: [] })

  const [isAddNotDeposit, setIsAddNotDeposit] = useState(false)
  const [indexAddNotDeposit, setIndexAddNotDeposit] = useState(0)
  const [notDepositCopy, setNotDepositCopy] = useState<RentGroupFormData | null>(null)

  // ─── Deposited State ────────────────────────────
  const depositedRefs = useRef<{
    update: (RentRowHandle | null)[]
    create: (RentRowHandle | null)[]
  }>({ update: [], create: [] })

  const [isAddDeposit, setIsAddDeposit] = useState(false)
  const [indexAddDeposit, setIndexAddDeposit] = useState(0)
  const [depositCopy, setDepositCopy] = useState<RentGroupFormData | null>(null)

  // ─── Mutations ──────────────────────────────────
  const { mutate: putNotDeposited, isPending: isPutNotDeposited } =
    useBulkUpdateNotDeposited({
      onSuccess() {
        toast.success('Cập nhật thành công')
        refetchNotDeposits()
      },
      onError() {
        toast.error('Cập nhật thất bại')
      },
    })

  const { mutate: putDeposited, isPending: isPutDeposited } =
    useBulkUpdateDeposited({
      onSuccess() {
        toast.success('Cập nhật thành công')
        refetchDeposits()
      },
      onError() {
        toast.error('Cập nhật thất bại')
      },
    })

  const isPageLoading =
    isLoadingNotDeposits ||
    isLoadingDeposits ||
    isLoadingRoomTypes ||
    isLoadingStayTypes ||
    isPutNotDeposited ||
    isPutDeposited

  // ─── Form data ──────────────────────────────────
  const notDepositFormData = useMemo(
    () => rentNotDeposits.map(apiGroupToFormData),
    [rentNotDeposits],
  )

  const depositFormData = useMemo(
    () => rentDeposits.map(apiGroupToFormData),
    [rentDeposits],
  )

  // ─── Handlers ───────────────────────────────────
  const handlePutRentNotDeposited = useCallback(
    (data: RentGroupFormData, isCreate: boolean, _index: number, _type: number) => {
      // Collect all current form data and send as bulk
      const allData: RentGroupFormData[] = [...notDepositFormData]
      if (isCreate) {
        allData.splice(_index, 0, data)
      } else {
        allData[_index] = data
      }
      const body: BulkUpdateRentBody = {
        data: allData.map(formDataToApiInput),
      }
      putNotDeposited(body)
      setIsAddNotDeposit(false)
    },
    [notDepositFormData, putNotDeposited],
  )

  const handlePutRentDeposited = useCallback(
    (data: RentGroupFormData, isCreate: boolean, _index: number, _type: number) => {
      const allData: RentGroupFormData[] = [...depositFormData]
      if (isCreate) {
        allData.splice(_index, 0, data)
      } else {
        allData[_index] = data
      }
      const body: BulkUpdateRentBody = {
        data: allData.map(formDataToApiInput),
      }
      putDeposited(body)
      setIsAddDeposit(false)
    },
    [depositFormData, putDeposited],
  )

  const handleBulkUpdateNotDeposited = useCallback(async () => {
    const rents: RentGroupFormData[] = [...notDepositFormData]

    // Validate all
    const allRefs = notDepositedRefs.current.update
    const validations = await Promise.all(
      allRefs.map((r) => r?.validateRent()),
    )
    const firstInvalid = validations.findIndex((v) => v === false)
    if (firstInvalid >= 0) {
      allRefs[firstInvalid]?.handleSubmit()
      return
    }

    // Collect values
    for (let i = 0; i < allRefs.length; i++) {
      if (allRefs[i]) {
        rents[i] = allRefs[i]!.getFormValues()
      }
    }

    // Add create row if present
    const createRefs = notDepositedRefs.current.create
    for (let i = 0; i < createRefs.length; i++) {
      if (createRefs[i]) {
        const val = createRefs[i]!.getFormValues()
        rents.splice(i, 0, val)
      }
    }

    const body: BulkUpdateRentBody = {
      data: rents.map(formDataToApiInput),
    }
    putNotDeposited(body)
    setIsAddNotDeposit(false)
  }, [notDepositFormData, putNotDeposited])

  const handleBulkUpdateDeposited = useCallback(async () => {
    const rents: RentGroupFormData[] = [...depositFormData]

    const allRefs = depositedRefs.current.update
    const validations = await Promise.all(
      allRefs.map((r) => r?.validateRent()),
    )
    const firstInvalid = validations.findIndex((v) => v === false)
    if (firstInvalid >= 0) {
      allRefs[firstInvalid]?.handleSubmit()
      return
    }

    for (let i = 0; i < allRefs.length; i++) {
      if (allRefs[i]) {
        rents[i] = allRefs[i]!.getFormValues()
      }
    }

    const createRefs = depositedRefs.current.create
    for (let i = 0; i < createRefs.length; i++) {
      if (createRefs[i]) {
        const val = createRefs[i]!.getFormValues()
        rents.splice(i, 0, val)
      }
    }

    const body: BulkUpdateRentBody = {
      data: rents.map(formDataToApiInput),
    }
    putDeposited(body)
    setIsAddDeposit(false)
  }, [depositFormData, putDeposited])

  // Over3 handler (updates a single row via bulk)
  const handleOver3Submit = useCallback(
    (
      data: RentGroupFormData,
      allFormData: RentGroupFormData[],
      putFn: (body: BulkUpdateRentBody) => void,
    ) => {
      const idx = allFormData.findIndex(
        (r) => r.room_type_id.toString() === data.room_type_id.toString(),
      )
      if (idx >= 0) {
        // Merge over3 fields back into the main row
        const updated = [...allFormData]
        updated[idx] = {
          ...updated[idx],
          rents: updated[idx].rents.map((r, i) => ({
            ...r,
            day_rent_over3: data.rents[i]?.day_rent_over3 ?? r.day_rent_over3,
            month_rent_over3: data.rents[i]?.month_rent_over3 ?? r.month_rent_over3,
            day_clean_fee_over3: data.rents[i]?.day_clean_fee_over3 ?? r.day_clean_fee_over3,
            month_clean_fee_over3: data.rents[i]?.month_clean_fee_over3 ?? r.month_clean_fee_over3,
            deposit_pay_over3: data.rents[i]?.deposit_pay_over3 ?? r.deposit_pay_over3,
          })),
        }
        putFn({ data: updated.map(formDataToApiInput) })
      }
    },
    [],
  )

  // FA room types for Over3
  const notDepositOver3 = notDepositFormData.filter(
    (r) => r.room_type_name_short?.includes('FA') && r.rents[0]?.data_status === 1,
  )
  const depositOver3 = depositFormData.filter(
    (r) => r.room_type_name_short?.includes('FA') && r.rents[0]?.data_status === 1,
  )

  return (
    <>
      {isPageLoading && <Loading />}
      <div className="py-[2rem] common-container">
        {/* Page Title */}
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <span className="ml-[1.5rem]">Bảng giá phòng</span>
        </div>

        {/* ════════════════ NOT DEPOSITED ════════════════ */}
        <div className="flex items-center bg-white before:bg-green-600 mt-[1.5rem] mb-[1.5rem] before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <h2 className="ml-[1.2rem] font-semibold text-2xl sm:text-4xl">
            ■Không đặt cọc
          </h2>
        </div>

        <div className="group-button flex flex-wrap gap-8 mt-8">
          <NButton
            className="bg-gray"
            onClick={() => {
              setNotDepositCopy(null)
              setIsAddNotDeposit(true)
              setIndexAddNotDeposit(0)
            }}
          >
            <span className="text-[1.4rem] leading-[1.4rem]">
              Thêm dòng lên đầu
            </span>
          </NButton>
          <NButton className="bg-gray" onClick={handleBulkUpdateNotDeposited}>
            <span className="text-[1.4rem] leading-[1.4rem]">
              Cập nhật toàn bộ
            </span>
          </NButton>
        </div>

        <div className="flex flex-col mt-8 !overflow-auto scroll-table">
          {/* Header */}
          <div className="flex w-fit">
            <Table className={TABLE_CLASSES}>
              <NotDepositedTableHeader />
            </Table>
          </div>
          {/* Body */}
          <div
            className="flex w-fit max-h-[45.6rem] overflow-y-auto"
            id="rent-not-deposit-table"
          >
            <Table className={TABLE_CLASSES}>
              <TableBody className="text-[1.4rem]">
                {notDepositFormData.map((rent, index) => (
                  <Fragment key={`nd-${rent.room_type_id}-${index}`}>
                    {isAddNotDeposit && index === indexAddNotDeposit && (
                      <NotDepositedRow
                        rent={notDepositCopy ?? createDefaultRentGroup()}
                        roomTypes={roomTypes}
                        roomClassOptions={roomClassOptions}
                        isCreate
                        index={index}
                        onSubmitRow={(data, isCreate, type) =>
                          handlePutRentNotDeposited(data, isCreate, index, type)
                        }
                        onAddRow={() => {}}
                        onCopyRow={() => {}}
                        onDeleteRow={() => setIsAddNotDeposit(false)}
                        tableId="rent-not-deposit-table"
                        ref={(el) => {
                          notDepositedRefs.current.create[index] = el
                        }}
                      />
                    )}
                    <NotDepositedRow
                      rent={rent}
                      roomTypes={roomTypes}
                      roomClassOptions={roomClassOptions}
                      isCreate={false}
                      index={index}
                      onSubmitRow={(data, isCreate, type) =>
                        handlePutRentNotDeposited(data, isCreate, index, type)
                      }
                      onAddRow={() => {
                        setNotDepositCopy(null)
                        setIsAddNotDeposit(true)
                        setIndexAddNotDeposit(index + 1)
                      }}
                      onCopyRow={(data) => {
                        setNotDepositCopy(data)
                        setIsAddNotDeposit(true)
                        setIndexAddNotDeposit(index + 1)
                      }}
                      onDeleteRow={() => {
                        const updated = notDepositFormData.filter(
                          (_, i) => i !== index,
                        )
                        putNotDeposited({
                          data: updated.map(formDataToApiInput),
                        })
                      }}
                      tableId="rent-not-deposit-table"
                      ref={(el) => {
                        notDepositedRefs.current.update[index] = el
                      }}
                    />
                  </Fragment>
                ))}
                {isAddNotDeposit &&
                  indexAddNotDeposit >= notDepositFormData.length && (
                    <NotDepositedRow
                      rent={notDepositCopy ?? createDefaultRentGroup()}
                      roomTypes={roomTypes}
                      roomClassOptions={roomClassOptions}
                      isCreate
                      index={notDepositFormData.length}
                      onSubmitRow={(data, isCreate, type) =>
                        handlePutRentNotDeposited(
                          data,
                          isCreate,
                          notDepositFormData.length,
                          type,
                        )
                      }
                      onAddRow={() => {}}
                      onCopyRow={() => {}}
                      onDeleteRow={() => setIsAddNotDeposit(false)}
                      tableId="rent-not-deposit-table"
                      ref={(el) => {
                        notDepositedRefs.current.create[
                          notDepositFormData.length
                        ] = el
                      }}
                    />
                  )}
                {!notDepositFormData.length && !isAddNotDeposit && (
                  <TableRow className="!bg-white">
                    <TableCell className="font-bold text-red-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Over3 for not-deposited */}
        {notDepositOver3.length > 0 && (
          <div className="flex flex-col mt-8 !overflow-auto scroll-table">
            <div className="flex items-center mb-4">
              <span className="font-semibold text-[1.6rem]">
                3 người trở lên (Không đặt cọc)
              </span>
            </div>
            <div className="flex w-fit">
              <Table className={TABLE_CLASSES}>
                <TableBody className="text-[1.4rem]">
                  {notDepositOver3.map((rent) => (
                    <NotDepositedOver3Row
                      key={`ndo3-${rent.room_type_id}`}
                      rent={rent}
                      onSubmitRow={(data) =>
                        handleOver3Submit(data, notDepositFormData, putNotDeposited)
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ════════════════ DEPOSITED ════════════════ */}
        <div className="flex items-center bg-white before:bg-green-600 mt-[1.5rem] mb-[1.5rem] before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <h2 className="ml-[1.2rem] font-semibold text-2xl sm:text-4xl">
            ■Có đặt cọc
          </h2>
        </div>

        <div className="group-button flex flex-wrap gap-8 mt-8">
          <NButton
            className="bg-gray"
            onClick={() => {
              setDepositCopy(null)
              setIsAddDeposit(true)
              setIndexAddDeposit(0)
            }}
          >
            <span className="text-[1.4rem] leading-[1.4rem]">
              Thêm dòng lên đầu
            </span>
          </NButton>
          <NButton className="bg-gray" onClick={handleBulkUpdateDeposited}>
            <span className="text-[1.4rem] leading-[1.4rem]">
              Cập nhật toàn bộ
            </span>
          </NButton>
        </div>

        <div className="flex flex-col mt-8 !overflow-auto scroll-table">
          {/* Header */}
          <div className="flex w-fit">
            <Table className={TABLE_CLASSES}>
              <DepositedTableHeader />
            </Table>
          </div>
          {/* Body */}
          <div
            className="flex w-fit max-h-[45.6rem] overflow-y-auto"
            id="rent-deposit-table"
          >
            <Table className={TABLE_CLASSES}>
              <TableBody className="text-[1.4rem]">
                {depositFormData.map((rent, index) => (
                  <Fragment key={`d-${rent.room_type_id}-${index}`}>
                    {isAddDeposit && index === indexAddDeposit && (
                      <DepositedRow
                        rent={depositCopy ?? createDefaultRentGroup()}
                        roomTypes={roomTypes}
                        roomClassOptions={roomClassOptions}
                        isCreate
                        index={index}
                        onSubmitRow={(data, isCreate, type) =>
                          handlePutRentDeposited(data, isCreate, index, type)
                        }
                        onAddRow={() => {}}
                        onCopyRow={() => {}}
                        onDeleteRow={() => setIsAddDeposit(false)}
                        tableId="rent-deposit-table"
                        ref={(el) => {
                          depositedRefs.current.create[index] = el
                        }}
                      />
                    )}
                    <DepositedRow
                      rent={rent}
                      roomTypes={roomTypes}
                      roomClassOptions={roomClassOptions}
                      isCreate={false}
                      index={index}
                      onSubmitRow={(data, isCreate, type) =>
                        handlePutRentDeposited(data, isCreate, index, type)
                      }
                      onAddRow={() => {
                        setDepositCopy(null)
                        setIsAddDeposit(true)
                        setIndexAddDeposit(index + 1)
                      }}
                      onCopyRow={(data) => {
                        setDepositCopy(data)
                        setIsAddDeposit(true)
                        setIndexAddDeposit(index + 1)
                      }}
                      onDeleteRow={() => {
                        const updated = depositFormData.filter(
                          (_, i) => i !== index,
                        )
                        putDeposited({
                          data: updated.map(formDataToApiInput),
                        })
                      }}
                      tableId="rent-deposit-table"
                      ref={(el) => {
                        depositedRefs.current.update[index] = el
                      }}
                    />
                  </Fragment>
                ))}
                {isAddDeposit &&
                  indexAddDeposit >= depositFormData.length && (
                    <DepositedRow
                      rent={depositCopy ?? createDefaultRentGroup()}
                      roomTypes={roomTypes}
                      roomClassOptions={roomClassOptions}
                      isCreate
                      index={depositFormData.length}
                      onSubmitRow={(data, isCreate, type) =>
                        handlePutRentDeposited(
                          data,
                          isCreate,
                          depositFormData.length,
                          type,
                        )
                      }
                      onAddRow={() => {}}
                      onCopyRow={() => {}}
                      onDeleteRow={() => setIsAddDeposit(false)}
                      tableId="rent-deposit-table"
                      ref={(el) => {
                        depositedRefs.current.create[depositFormData.length] =
                          el
                      }}
                    />
                  )}
                {!depositFormData.length && !isAddDeposit && (
                  <TableRow className="!bg-white">
                    <TableCell className="font-bold text-red-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Over3 for deposited */}
        {depositOver3.length > 0 && (
          <div className="flex flex-col mt-8 !overflow-auto scroll-table">
            <div className="flex items-center mb-4">
              <span className="font-semibold text-[1.6rem]">
                3 người trở lên (Có đặt cọc)
              </span>
            </div>
            <div className="flex w-fit">
              <Table className={TABLE_CLASSES}>
                <TableBody className="text-[1.4rem]">
                  {depositOver3.map((rent) => (
                    <DepositedOver3Row
                      key={`do3-${rent.room_type_id}`}
                      rent={rent}
                      onSubmitRow={(data) =>
                        handleOver3Submit(data, depositFormData, putDeposited)
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
