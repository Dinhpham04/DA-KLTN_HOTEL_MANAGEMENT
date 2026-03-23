import i18n from '@/i18n'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { DialogClose } from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { NButton } from '@/components/ui/new-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import CustomSelect from '@/components/common/CustomSelect'
import Loading from '@/components/common/Loading'

import { useCreateRoom } from '@/hooks/mutations/useCreateRoom'
import { useDeleteRoom } from '@/hooks/mutations/useDeleteRoom'
import { useUpdateRoom } from '@/hooks/mutations/useUpdateRoom'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRoomTypes } from '@/hooks/queries/useGetRoomTypes'
import { useGetRooms } from '@/hooks/queries/useGetRooms'
import type { CreateRoomBody, Room, RoomErrorResponse, UpdateRoomBody } from '@/types/room'
import { BOOLEAN_FLAG_OPTIONS, KEY_TYPE_OPTIONS, ROOM_STATUS_OPTIONS } from '@/types/room'

// ─── Validation Schemas ──────────────────────────────────────────────
const t = i18n.t.bind(i18n)

const BaseSchema = z.object({
  dataStatus: z.number(),
  facilityId: z.union([
    z.number().positive({ message: t('roomMaster.validation.facilityRequired') }),
    z.string().nonempty({ message: t('roomMaster.validation.facilityRequired') }),
  ]),
  roomTypeId: z.union([
    z.number().positive({ message: t('roomMaster.validation.roomTypeRequired') }),
    z.string().nonempty({ message: t('roomMaster.validation.roomTypeRequired') }),
  ]),
  roomNumber: z
    .string()
    .max(32, { message: t('roomMaster.validation.roomNumberMax') })
    .nonempty({ message: t('roomMaster.validation.roomNumberRequired') }),
  keyType: z.union([z.number(), z.string()]).optional(),
  roomStatus: z.union([
    z.number().positive({ message: t('roomMaster.validation.roomStatusRequired') }),
    z.string().nonempty({ message: t('roomMaster.validation.roomStatusRequired') }),
  ]),
  reservedCleanDay: z.union([z.number(), z.string()]).optional(),
  deliveryboxFlag: z.union([z.boolean(), z.string()]),
  petFlag: z.union([z.boolean(), z.string()]),
  mailboxPassword: z
    .string()
    .max(64, { message: t('roomMaster.validation.mailboxPasswordMax') })
    .nonempty({ message: t('roomMaster.validation.mailboxPasswordRequired') }),
  externalFlag: z.union([z.boolean(), z.string()]),
  externalDateFrom: z.string().optional().or(z.literal('')),
  externalDateTo: z.string().optional().or(z.literal('')),
  orderNum: z.number(),
})

const CreateSchema = BaseSchema
const UpdateSchema = BaseSchema.extend({
  roomId: z.number(),
})

export const Route = createLazyFileRoute('/_authenticated/room-master')({
  component: RoomMasterPage,
})

// ─── Create Room Row ────────────────────────────────────────────────
interface CreateRoomRowProps {
  orderNum: number
  onSubmit: (data: CreateRoomBody) => void
  facilityOptions: { value: string; label: string }[]
  roomTypeOptions: { value: string; label: string }[]
}

function CreateRoomRow({
  orderNum,
  onSubmit,
  facilityOptions,
  roomTypeOptions,
}: CreateRoomRowProps) {
  const { t } = useTranslation()
  const methods = useForm<CreateRoomBody>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      facilityId: '',
      roomTypeId: '',
      roomNumber: '',
      keyType: 0,
      roomStatus: '',
      reservedCleanDay: 0,
      deliveryboxFlag: false,
      petFlag: false,
      mailboxPassword: '',
      externalFlag: false,
      externalDateFrom: '',
      externalDateTo: '',
      dataStatus: 1,
      orderNum,
    },
  })

  const {
    formState: { errors },
  } = methods

  return (
    <TableRow>
      <FormProvider {...methods}>
        {/* STT */}
        <TableCell className="bg-white min-w-[5rem] text-center" />

        {/* Số phòng */}
        <TableCell className="bg-white min-w-[5rem] text-left">
          <FormField
            control={methods.control}
            name="roomNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    placeholder={t('roomMaster.placeholders.roomNumber')}
                    className={cn(
                      'border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem]',
                      { 'border-red-500': errors.roomNumber }
                    )}
                    autoResize
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Cơ sở */}
        <TableCell className="bg-white min-w-[14rem] text-left">
          <FormField
            control={methods.control}
            name="facilityId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={facilityOptions}
                    selected={String(field.value ?? '')}
                    customClassMain={cn('w-full h-[2rem] sm:h-[3.6rem]', {
                      'border-red-500': errors.facilityId,
                    })}
                    ref={field.ref}
                    hideWhenDetached
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Loại phòng */}
        <TableCell className="bg-white min-w-[14rem] text-left">
          <FormField
            control={methods.control}
            name="roomTypeId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={roomTypeOptions}
                    selected={String(field.value ?? '')}
                    customClassMain={cn('w-full h-[2rem] sm:h-[3.6rem]', {
                      'border-red-500': errors.roomTypeId,
                    })}
                    ref={field.ref}
                    hideWhenDetached
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Trạng thái dọn */}
        <TableCell className="bg-white min-w-[12rem] text-left">
          <FormField
            control={methods.control}
            name="roomStatus"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={ROOM_STATUS_OPTIONS}
                    selected={String(field.value ?? '')}
                    customClassMain={cn('w-full h-[2rem] sm:h-[3.6rem]', {
                      'border-red-500': errors.roomStatus,
                    })}
                    ref={field.ref}
                    hideWhenDetached
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Mật khẩu hộp thư */}
        <TableCell className="bg-white min-w-[12rem] text-left">
          <FormField
            control={methods.control}
            name="mailboxPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    placeholder={t('roomMaster.placeholders.mailboxPassword')}
                    className={cn(
                      'border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem]',
                      { 'border-red-500': errors.mailboxPassword }
                    )}
                    autoResize
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Hộp giao hàng */}
        <TableCell className="bg-white min-w-[10rem] text-center">
          <FormField
            control={methods.control}
            name="deliveryboxFlag"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomRadio
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={String(field.value ?? 'false')}
                    ref={field.ref}
                    className="flex justify-center gap-4"
                  >
                    {BOOLEAN_FLAG_OPTIONS.map((opt) => (
                      <div className="flex items-center space-x-2" key={`delivery_${opt.value}`}>
                        <CustomRadioItems value={opt.value} id={`delivery_${opt.value}-create`} />
                        <Label
                          htmlFor={`delivery_${opt.value}-create`}
                          className="text-[1.4rem] cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </CustomRadio>
                </FormControl>
              </FormItem>
            )}
          />
        </TableCell>

        {/* Thú cưng */}
        <TableCell className="bg-white min-w-[10rem] text-center">
          <FormField
            control={methods.control}
            name="petFlag"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomRadio
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={String(field.value ?? 'false')}
                    ref={field.ref}
                    className="flex f justify-center gap-4"
                  >
                    {BOOLEAN_FLAG_OPTIONS.map((opt) => (
                      <div className="flex items-center space-x-2" key={`pet_${opt.value}`}>
                        <CustomRadioItems value={opt.value} id={`pet_${opt.value}-create`} />
                        <Label
                          htmlFor={`pet_${opt.value}-create`}
                          className="text-[1.4rem] cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </CustomRadio>
                </FormControl>
              </FormItem>
            )}
          />
        </TableCell>

        {/* Ngày cập nhật */}
        <TableCell className="bg-white p-[.6rem] min-w-[11rem] text-left" />
        {/* Người cập nhật */}
        <TableCell className="bg-white p-[.6rem] min-w-[12rem] text-left" />

        {/* Thao tác */}
        <TableCell className="bg-white p-[.6rem] min-w-[18rem] text-center">
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
              <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                {t('roomMaster.actions.save')}
              </span>
            </NButton>
          </form>
        </TableCell>
      </FormProvider>
    </TableRow>
  )
}

// ─── Update Room Row ────────────────────────────────────────────────
interface UpdateRoomRowProps {
  room: Room
  onUpdate: (data: UpdateRoomBody, type: number) => void
  onDelete: (roomId: number) => void
  facilityOptions: { value: string; label: string }[]
  roomTypeOptions: { value: string; label: string }[]
}

function UpdateRoomRow({
  room,
  onUpdate,
  onDelete,
  facilityOptions,
  roomTypeOptions,
}: UpdateRoomRowProps) {
  const { t } = useTranslation()
  const isSuspended = room.dataStatus === 0

  const methods = useForm<UpdateRoomBody>({
    resolver: zodResolver(UpdateSchema),
    defaultValues: {
      roomId: room.roomId,
      facilityId: room.facilityId,
      roomTypeId: room.roomTypeId,
      roomNumber: room.roomNumber,
      keyType: room.keyType ?? 0,
      roomStatus: room.roomStatus,
      reservedCleanDay: room.reservedCleanDay,
      deliveryboxFlag: room.deliveryboxFlag,
      petFlag: room.petFlag,
      mailboxPassword: room.mailboxPassword,
      externalFlag: room.externalFlag,
      externalDateFrom: room.externalDateFrom ?? '',
      externalDateTo: room.externalDateTo ?? '',
      dataStatus: room.dataStatus,
      orderNum: room.orderNum,
    },
  })

  const {
    reset,
    formState: { errors },
  } = methods

  useEffect(() => {
    reset({
      roomId: room.roomId,
      facilityId: room.facilityId,
      roomTypeId: room.roomTypeId,
      roomNumber: room.roomNumber,
      keyType: room.keyType ?? 0,
      roomStatus: room.roomStatus,
      reservedCleanDay: room.reservedCleanDay,
      deliveryboxFlag: room.deliveryboxFlag,
      petFlag: room.petFlag,
      mailboxPassword: room.mailboxPassword,
      externalFlag: room.externalFlag,
      externalDateFrom: room.externalDateFrom ?? '',
      externalDateTo: room.externalDateTo ?? '',
      dataStatus: room.dataStatus,
      orderNum: room.orderNum,
    })
  }, [room, reset])

  const isDisabled = isSuspended
  const rowBg = isSuspended ? '!bg-gray-400' : 'bg-white'

  return (
    <TableRow>
      <FormProvider {...methods}>
        {/* STT */}
        <TableCell className={cn(rowBg, 'min-w-[5rem] text-center')}>{room.roomId}</TableCell>

        {/* Số phòng */}
        <TableCell className={cn(rowBg, 'min-w-[10rem] text-left')}>
          <FormField
            control={methods.control}
            name="roomNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    placeholder={!isDisabled ? t('roomMaster.placeholders.roomNumber') : ''}
                    disabled={isDisabled}
                    className={cn(
                      'disabled:opacity-100 border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem]',
                      { 'border-red-500': errors.roomNumber }
                    )}
                    autoResize
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Cơ sở */}
        <TableCell className={cn(rowBg, 'min-w-[14rem] text-left')}>
          <FormField
            control={methods.control}
            name="facilityId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={facilityOptions}
                    selected={String(field.value ?? '')}
                    customClassMain={cn(
                      'disabled:opacity-100 w-full h-[2rem] sm:h-[3.6rem]',
                      { 'border-red-500': errors.facilityId },
                      isSuspended && '!bg-gray-400'
                    )}
                    ref={field.ref}
                    disable={isDisabled}
                    hideWhenDetached
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Loại phòng */}
        <TableCell className={cn(rowBg, 'min-w-[14rem] text-left')}>
          <FormField
            control={methods.control}
            name="roomTypeId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={roomTypeOptions}
                    selected={String(field.value ?? '')}
                    customClassMain={cn(
                      'disabled:opacity-100 w-full h-[2rem] sm:h-[3.6rem]',
                      { 'border-red-500': errors.roomTypeId },
                      isSuspended && '!bg-gray-400'
                    )}
                    ref={field.ref}
                    disable={isDisabled}
                    hideWhenDetached
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Trạng thái dọn */}
        <TableCell className={cn(rowBg, 'min-w-[12rem] text-left')}>
          <FormField
            control={methods.control}
            name="roomStatus"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={ROOM_STATUS_OPTIONS}
                    selected={String(field.value ?? '')}
                    customClassMain={cn(
                      'disabled:opacity-100 w-full h-[2rem] sm:h-[3.6rem]',
                      { 'border-red-500': errors.roomStatus },
                      isSuspended && '!bg-gray-400'
                    )}
                    ref={field.ref}
                    disable={isDisabled}
                    hideWhenDetached
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Mật khẩu hộp thư */}
        <TableCell className={cn(rowBg, 'min-w-[12rem] text-left')}>
          <FormField
            control={methods.control}
            name="mailboxPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    placeholder={!isDisabled ? t('roomMaster.placeholders.mailboxPassword') : ''}
                    disabled={isDisabled}
                    className={cn(
                      'disabled:opacity-100 border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem]',
                      { 'border-red-500': errors.mailboxPassword }
                    )}
                    autoResize
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Hộp giao hàng */}
        <TableCell className={cn(rowBg, 'min-w-[10rem] text-center')}>
          <FormField
            control={methods.control}
            name="deliveryboxFlag"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomRadio
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={String(field.value ?? 'false')}
                    ref={field.ref}
                    disabled={isDisabled}
                    className="flex flex-col justify-center gap-4"
                  >
                    {BOOLEAN_FLAG_OPTIONS.map((opt) => (
                      <div className="flex items-center space-x-2" key={`delivery_${opt.value}`}>
                        <CustomRadioItems
                          value={opt.value}
                          id={`delivery_${opt.value}-${room.roomId}`}
                          className={isDisabled ? 'disabled:opacity-100' : ''}
                        />
                        <Label
                          htmlFor={`delivery_${opt.value}-${room.roomId}`}
                          className="text-[1.4rem] cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </CustomRadio>
                </FormControl>
              </FormItem>
            )}
          />
        </TableCell>

        {/* Thú cưng */}
        <TableCell className={cn(rowBg, 'min-w-[10rem] text-center')}>
          <FormField
            control={methods.control}
            name="petFlag"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomRadio
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={String(field.value ?? 'false')}
                    ref={field.ref}
                    disabled={isDisabled}
                    className="flex flex-col justify-center gap-4"
                  >
                    {BOOLEAN_FLAG_OPTIONS.map((opt) => (
                      <div className="flex items-center space-x-2" key={`pet_${opt.value}`}>
                        <CustomRadioItems
                          value={opt.value}
                          id={`pet_${opt.value}-${room.roomId}`}
                          className={isDisabled ? 'disabled:opacity-100' : ''}
                        />
                        <Label
                          htmlFor={`pet_${opt.value}-${room.roomId}`}
                          className="text-[1.4rem] cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </CustomRadio>
                </FormControl>
              </FormItem>
            )}
          />
        </TableCell>

        {/* Ngày cập nhật */}
        <TableCell className={cn(rowBg, 'min-w-[11rem] text-center')}>
          {room.updatedAt ? format(new Date(room.updatedAt), 'yyyy/MM/dd') : ''}
        </TableCell>

        {/* Người cập nhật */}
        <TableCell className={cn(rowBg, 'min-w-[12rem] text-center')}>
          {room.updatedByName ?? ''}
        </TableCell>

        {/* Thao tác */}
        <TableCell className={cn(rowBg, 'min-w-[18rem] text-center')}>
          {room.dataStatus === 1 ? (
            <>
              <form onSubmit={methods.handleSubmit((data) => onUpdate(data, 0))}>
                <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                    {t('roomMaster.actions.update')}
                  </span>
                </NButton>
              </form>

              <CustomDialog
                customClass="text-center [&_svg]:hidden z-[99999]"
                size="medium"
                customClassContent="max-w-[50rem]"
                trigger={
                  <NButton
                    className="bg-gray mt-[.5rem] mx-2 px-2 w-auto min-w-fit h-auto btn btn-default"
                    variant="default"
                  >
                    <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                      {t('roomMaster.actions.suspend')}
                    </span>
                  </NButton>
                }
                title={t('roomMaster.dialogs.suspendTitle')}
                content={
                  <div className="flex justify-center p-5">
                    <DialogClose
                      onClick={() => onUpdate({ ...methods.getValues(), dataStatus: 0 }, 1)}
                    >
                      <div className="bg-[#8bd08e] mx-4 w-[14.4rem] border border-black btn btn-default">
                        <span>{t('roomMaster.dialogs.confirm')}</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[14.4rem] border border-black btn btn-default">
                        <span>{t('roomMaster.dialogs.cancel')}</span>
                      </div>
                    </DialogClose>
                  </div>
                }
              />

              <CustomDialog
                customClass="text-center [&_svg]:hidden z-[99999]"
                size="medium"
                customClassContent="max-w-[52rem]"
                trigger={
                  <NButton
                    className="bg-gray mt-[.5rem] px-2 w-auto min-w-fit h-auto btn btn-default"
                    variant="default"
                  >
                    <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                      {t('roomMaster.actions.delete')}
                    </span>
                  </NButton>
                }
                title={t('roomMaster.dialogs.deleteTitle')}
                content={
                  <div className="flex justify-center p-5">
                    <DialogClose onClick={() => onDelete(room.roomId)}>
                      <div className="bg-[#8bd08e] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                        <span>{t('roomMaster.dialogs.confirm')}</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                        <span>{t('roomMaster.dialogs.cancel')}</span>
                      </div>
                    </DialogClose>
                  </div>
                }
              />
            </>
          ) : (
            <CustomDialog
              customClass="text-center [&_svg]:hidden z-[99999]"
              size="medium"
              customClassContent="max-w-[50rem]"
              trigger={
                <NButton
                  className="bg-gray px-2 w-auto min-w-fit h-auto btn btn-default"
                  variant="default"
                >
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                    {t('roomMaster.actions.reactivate')}
                  </span>
                </NButton>
              }
              title={t('roomMaster.dialogs.reactivateTitle')}
              content={
                <div className="flex justify-center p-5">
                  <DialogClose
                    onClick={() => onUpdate({ ...methods.getValues(), dataStatus: 1 }, 2)}
                  >
                    <div className="bg-[#8bd08e] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                      <span>{t('roomMaster.dialogs.confirm')}</span>
                    </div>
                  </DialogClose>
                  <DialogClose>
                    <div className="bg-[#eee] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                      <span>{t('roomMaster.dialogs.cancel')}</span>
                    </div>
                  </DialogClose>
                </div>
              }
            />
          )}
        </TableCell>
      </FormProvider>
    </TableRow>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────
function RoomMasterPage() {
  const { t } = useTranslation()
  const [facilityFilter, setFacilityFilter] = useState('')
  const [isAddRoom, setIsAddRoom] = useState(false)
  const [indexAddRoom, setIndexAddRoom] = useState(0)

  const roomListForm = useForm<{ rooms: Room[] }>({})
  const { fields: fieldRooms, replace } = useFieldArray({
    control: roomListForm.control,
    name: 'rooms',
  })

  // Fetch facilities for dropdown
  const { data: facilitiesData } = useGetFacilities({
    params: { page: 1, limit: 500 },
  })

  // Fetch room types for dropdown
  const { data: roomTypesData } = useGetRoomTypes({
    params: { page: 1, limit: 500 },
  })

  const facilityOptions = useMemo(() => {
    const options = [{ value: '', label: '---' }]
    if (facilitiesData?.data) {
      facilitiesData.data.forEach((f) => {
        options.push({ value: String(f.facilityId), label: f.facilityName })
      })
    }
    return options
  }, [facilitiesData])

  const roomTypeOptions = useMemo(() => {
    const options = [{ value: '', label: '---' }]
    if (roomTypesData?.data) {
      roomTypesData.data.forEach((rt) => {
        options.push({ value: String(rt.roomTypeId), label: rt.roomTypeName })
      })
    }
    return options
  }, [roomTypesData])

  const { isLoading, refetch } = useGetRooms({
    params: {
      page: 1,
      limit: 500,
      ...(facilityFilter ? { facilityId: Number(facilityFilter) } : {}),
    },
    onSuccess(data) {
      replace([...data].sort((a, b) => (b.dataStatus === 1 ? 1 : 0) - (a.dataStatus === 1 ? 1 : 0)))
    },
    onError(error) {
      toast.error(extractErrorMessage(error))
    },
  })

  const { mutate: createRoom, isPending: isPendingCreate } = useCreateRoom({
    onSuccess() {
      refetch()
      setIsAddRoom(false)
      toast.success(t('roomMaster.messages.createSuccess'))
    },
    onError(error) {
      showFieldErrors(error)
    },
  })

  const { mutate: updateRoom, isPending: isPendingUpdate } = useUpdateRoom({
    onSuccess() {
      refetch()
    },
    onError(error) {
      showFieldErrors(error)
    },
  })

  const { mutate: deleteRoomMutation, isPending: isPendingDelete } = useDeleteRoom({
    onSuccess() {
      refetch()
      toast.success(t('roomMaster.messages.deleteSuccess'))
    },
    onError(error) {
      toast.error(extractErrorMessage(error))
    },
  })

  useEffect(() => {
    refetch()
  }, [facilityFilter])

  const addRoomAtIndex = (index: number) => {
    setIsAddRoom(true)
    setIndexAddRoom(index)
  }

  const handleCreate = (data: CreateRoomBody) => {
    createRoom({
      ...data,
      facilityId: Number(data.facilityId),
      roomTypeId: Number(data.roomTypeId),
      roomStatus: Number(data.roomStatus),
      keyType: data.keyType ? Number(data.keyType) : 0,
      reservedCleanDay: data.reservedCleanDay ? Number(data.reservedCleanDay) : 0,
      deliveryboxFlag:
        typeof data.deliveryboxFlag === 'string'
          ? data.deliveryboxFlag === 'true'
          : data.deliveryboxFlag,
      petFlag: typeof data.petFlag === 'string' ? data.petFlag === 'true' : data.petFlag,
      externalFlag:
        typeof data.externalFlag === 'string' ? data.externalFlag === 'true' : data.externalFlag,
    })
  }

  const handleUpdate = (data: UpdateRoomBody, type: number) => {
    updateRoom({
      ...data,
      facilityId: data.facilityId ? Number(data.facilityId) : undefined,
      roomTypeId: data.roomTypeId ? Number(data.roomTypeId) : undefined,
      roomStatus: data.roomStatus ? Number(data.roomStatus) : undefined,
      keyType: data.keyType ? Number(data.keyType) : undefined,
      reservedCleanDay: data.reservedCleanDay ? Number(data.reservedCleanDay) : undefined,
      deliveryboxFlag:
        typeof data.deliveryboxFlag === 'string'
          ? data.deliveryboxFlag === 'true'
          : data.deliveryboxFlag,
      petFlag: typeof data.petFlag === 'string' ? data.petFlag === 'true' : data.petFlag,
      externalFlag:
        typeof data.externalFlag === 'string' ? data.externalFlag === 'true' : data.externalFlag,
    })

    if (type === 0) toast.success(t('roomMaster.messages.updateSuccess'))
    if (type === 1) toast.success(t('roomMaster.messages.suspendSuccess'))
    if (type === 2) toast.success(t('roomMaster.messages.reactivateSuccess'))
  }

  const isPageLoading = isLoading || isPendingCreate || isPendingUpdate || isPendingDelete

  return (
    <>
      {isPageLoading ? <Loading /> : null}
      <div className="pt-[2.6rem] pb-[12rem] common-container room-master-page">
        {/* Title */}
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <span className="ml-[1.5rem]">{t('roomMaster.title')}</span>
        </div>

        {/* Filter & Actions bar */}
        <div className="flex flex-wrap justify-between gap-[2rem] mt-[2.4rem]">
          <div className="group-button flex flex-nowrap items-center gap-[1rem]">
            <div className="font-bold text-[1.8rem] text-nowrap">
              <span>{t('roomMaster.filterByFacility')}</span>
            </div>
            <CustomSelect
              option={facilityOptions}
              change={(option) => setFacilityFilter(option.value)}
              selected={facilityFilter}
              customClassMain="w-[18.5rem] sm:h-[3.6rem] h-[2rem] text-[1.4rem]"
              customClassArrow="w-[4rem] text-[1.4rem]"
            />
          </div>
          <div className="group-button flex flex-wrap gap-[2.4rem]">
            <NButton className="bg-gray" onClick={() => addRoomAtIndex(0)}>
              <span className="text-[1.4rem] leading-[1.4rem]">{t('roomMaster.addRow')}</span>
            </NButton>
          </div>
        </div>

        {/* Table */}
        <div
          className="relative flex mt-[2.4rem] border border-black max-h-[56.4rem] overflow-auto"
          id="room-table"
        >
          <Table
            className={cn(
              'flex-grow min-w-[150rem] text-[1.4rem] text-center',
              'border-separate border-spacing-0',
              '[&_td]:border [&_td]:border-black [&_td]:border-l-0 [&_td]:border-t-0',
              '[&_th]:border [&_th]:border-black [&_th]:border-l-0 [&_th]:border-t-0'
            )}
          >
            <TableHeader className="top-0 z-[9] sticky">
              <TableRow className="bg-gray-eee data-[state=selected]:bg-gray-eee hover:bg-gray-eee">
                <TableHead className="min-w-[5rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.no')}
                </TableHead>
                <TableHead className="min-w-[10rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.roomNumber')}
                </TableHead>
                <TableHead className="min-w-[14rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.facility')}
                </TableHead>
                <TableHead className="min-w-[14rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.roomType')}
                </TableHead>
                <TableHead className="min-w-[12rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.roomStatus')}
                </TableHead>
                <TableHead className="min-w-[12rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.mailboxPassword')}
                </TableHead>
                <TableHead className="min-w-[10rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.deliveryboxFlag')}
                </TableHead>
                <TableHead className="min-w-[10rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.petFlag')}
                </TableHead>
                <TableHead className="min-w-[11rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.updatedAt')}
                </TableHead>
                <TableHead className="min-w-[12rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.updatedBy')}
                </TableHead>
                <TableHead className="min-w-[15rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">
                  {t('roomMaster.columns.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fieldRooms.map((room, index) => (
                <Fragment key={room.roomId || index}>
                  {isAddRoom && index === indexAddRoom ? (
                    <CreateRoomRow
                      orderNum={room?.orderNum || 1}
                      onSubmit={handleCreate}
                      facilityOptions={facilityOptions}
                      roomTypeOptions={roomTypeOptions}
                    />
                  ) : null}
                  <UpdateRoomRow
                    room={room}
                    onUpdate={handleUpdate}
                    onDelete={(roomId) => deleteRoomMutation(roomId)}
                    facilityOptions={facilityOptions}
                    roomTypeOptions={roomTypeOptions}
                  />
                </Fragment>
              ))}

              {isAddRoom && indexAddRoom >= fieldRooms.length && (
                <CreateRoomRow
                  orderNum={(fieldRooms[fieldRooms.length - 1]?.orderNum ?? 0) + 1}
                  onSubmit={handleCreate}
                  facilityOptions={facilityOptions}
                  roomTypeOptions={roomTypeOptions}
                />
              )}

              {!fieldRooms.length && !isAddRoom && (
                <TableRow className="!bg-white">
                  <TableCell className="font-bold text-red-500">{t('roomMaster.noData')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────
function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: RoomErrorResponse } }
    const message = axiosError.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    return message || 'Đã xảy ra lỗi'
  }
  return 'Đã xảy ra lỗi'
}

function showFieldErrors(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: RoomErrorResponse } }
    const data = axiosError.response?.data
    if (data?.errors) {
      for (const key in data.errors) {
        if (Object.prototype.hasOwnProperty.call(data.errors, key)) {
          const firstError = data.errors[key][0]
          if (firstError) {
            toast.error(firstError)
          }
        }
      }
    } else {
      toast.error(extractErrorMessage(error))
    }
  }
}
