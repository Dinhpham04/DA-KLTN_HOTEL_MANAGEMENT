import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Fragment, useEffect, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { cn } from '@/lib/utils'
import i18n from '@/i18n'

import { NButton } from '@/components/ui/new-button'
import { Label } from '@/components/ui/label'
import { DialogClose } from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { CustomInput } from '@/components/common/CustomInput'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import CustomSelect from '@/components/common/CustomSelect'
import CustomDialog from '@/components/common/CustomDialog'
import Loading from '@/components/common/Loading'

import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useCreateStaff } from '@/hooks/mutations/useCreateStaff'
import { useUpdateStaff } from '@/hooks/mutations/useUpdateStaff'
import { useDeleteStaff } from '@/hooks/mutations/useDeleteStaff'
import type {
  CreateStaffBody,
  Staff,
  StaffErrorResponse,
  UpdateStaffBody,
} from '@/types/staff'
import { ATTENDANCE_OPTIONS, STAFF_TYPE_OPTIONS } from '@/types/staff'

// ─── Validation Schemas ──────────────────────────────────────────────
const t = i18n.t.bind(i18n)

const BaseSchema = z.object({
  dataStatus: z.number(),
  staffType: z.union([
    z.number().nonnegative({ message: t('validation.required', { field: 'Vai trò' }) }),
    z.string().nonempty({ message: t('validation.required', { field: 'Vai trò' }) }),
  ]),
  staffName: z
    .string()
    .max(256, { message: t('validation.maxLength', { field: 'Họ tên', max: 256 }) })
    .nonempty({ message: t('validation.required', { field: 'Họ tên' }) }),
  staffNameEn: z
    .string()
    .max(256, { message: t('validation.maxLength', { field: 'Tên (Tiếng Anh)', max: 256 }) })
    .optional()
    .or(z.literal('')),
  staffNameShort: z
    .string()
    .max(32, { message: t('validation.maxLength', { field: 'Tên viết tắt', max: 32 }) })
    .optional(),
  displayInAttendance: z.union([
    z.boolean(),
    z.string().nonempty({ message: t('validation.required', { field: 'Chấm công' }) }),
  ]),
  mail: z
    .string()
    .max(64, { message: t('validation.maxLength', { field: 'Email', max: 64 }) })
    .optional()
    .refine(
      (value) =>
        value === undefined || value === null || value === '' || z.string().email().safeParse(value).success,
      { message: t('validation.email', { field: 'Email' }) },
    ),
  orderNum: z.number(),
})

const CreateSchema = BaseSchema.extend({
  password: z
    .string()
    .nonempty({ message: t('validation.required', { field: 'Mật khẩu' }) })
    .min(8, { message: t('validation.passwordLength') })
    .max(16, { message: t('validation.passwordLength') }),
})

const UpdateSchema = BaseSchema.extend({
  staffId: z.number(),
  password: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.length >= 8,
      { message: t('validation.passwordLength') },
    )
    .refine(
      (value) => !value || value.length <= 16,
      { message: t('validation.passwordLength') },
    ),
})

export const Route = createFileRoute('/_authenticated/staff-master')({
  component: StaffMasterPage,
})

// ─── Create Staff Row ────────────────────────────────────────────────
interface CreateStaffRowProps {
  orderNum: number
  onSubmit: (data: CreateStaffBody) => void
}

function CreateStaffRow({ orderNum, onSubmit }: CreateStaffRowProps) {
  const { t } = useTranslation()
  const methods = useForm<CreateStaffBody>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      staffName: '',
      staffNameEn: '',
      staffNameShort: '',
      staffType: '',
      password: '',
      displayInAttendance: true,
      mail: '',
      dataStatus: 1,
      orderNum,
    },
  })

  const { formState: { errors } } = methods

  return (
    <TableRow>
      <FormProvider {...methods}>
        {/* STT */}
        <TableCell className="bg-white min-w-[5rem] text-center" />

        {/* Họ tên */}
        <TableCell className="bg-white min-w-[20rem] text-left">
          <FormField
            control={methods.control}
            name="staffName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomTextarea
                    {...field}
                    placeholder={t('staff.columns.name')}
                    className={cn(
                      'border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full min-h-0 text-[1.4rem] whitespace-break-spaces',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.staffName },
                    )}
                    autoResize
                    disableNewline
                    rows={1}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
          <div className="flex-1 mt-[.6rem] mb-[.6rem] ml-[-.5rem] border-black border-t border-dashed w-[calc(100%_+_2rem)]" />
          <FormField
            control={methods.control}
            name="staffNameShort"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomTextarea
                    {...field}
                    placeholder={t('staff.columns.shortName')}
                    className={cn(
                      'border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full min-h-0 text-[1.4rem] whitespace-break-spaces',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.staffNameShort },
                    )}
                    autoResize
                    disableNewline
                    rows={1}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Vai trò */}
        <TableCell className="bg-white min-w-[14rem] text-left">
          <FormField
            control={methods.control}
            name="staffType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={STAFF_TYPE_OPTIONS}
                    selected={String(field.value ?? '')}
                    customClassMain={cn(
                      'w-[18.5rem] h-[2rem] sm:h-[3.6rem]',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.staffType },
                    )}
                    customClassArrow={errors.staffType ? 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500' : ''}
                    ref={field.ref}
                    hideWhenDetached
                    collisionBoundary={document.getElementById('store-table') ?? undefined}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Mật khẩu */}
        <TableCell className="bg-white min-w-[14rem] text-left">
          <FormField
            control={methods.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    type="password"
                    placeholder={t('staff.columns.password')}
                    className={cn(
                      'border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem]',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.password },
                    )}
                    autoResize
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Chấm công */}
        <TableCell className="bg-white min-w-[11rem] text-left">
          <FormField
            control={methods.control}
            name="displayInAttendance"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomRadio
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={String(field.value ?? '')}
                    ref={field.ref}
                  >
                    {ATTENDANCE_OPTIONS.map((opt) => (
                      <div className="flex items-center space-x-4 w-[4.3rem]" key={`att_${opt.value}`}>
                        <CustomRadioItems value={opt.value} id={`att_${opt.value}-create`} />
                        <Label
                          htmlFor={`att_${opt.value}-create`}
                          className="text-[1.4rem] whitespace-nowrap cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </CustomRadio>
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Email */}
        <TableCell className="bg-white min-w-[18rem] text-left">
          <FormField
            control={methods.control}
            name="mail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder={t('staff.columns.email')}
                    className={cn(
                      'border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem]',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.mail },
                    )}
                    autoResize
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Ngày cập nhật */}
        <TableCell className="bg-white p-[.6rem] min-w-[11rem] text-left" />
        {/* Người cập nhật */}
        <TableCell className="bg-white p-[.6rem] min-w-[15rem] text-left" />

        {/* Thao tác */}
        <TableCell className="bg-white p-[.6rem] min-w-[15rem] text-center">
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
              <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                {t('staff.actions.save')}
              </span>
            </NButton>
          </form>
        </TableCell>
      </FormProvider>
    </TableRow>
  )
}

// ─── Update Staff Row ────────────────────────────────────────────────
interface UpdateStaffRowProps {
  staff: Staff
  onUpdate: (data: UpdateStaffBody, type: number) => void
  onDelete: (staffId: number) => void
}

function UpdateStaffRow({ staff, onUpdate, onDelete }: UpdateStaffRowProps) {
  const { t } = useTranslation()
  const isSuspended = staff.dataStatus === 0

  const methods = useForm<UpdateStaffBody>({
    resolver: zodResolver(UpdateSchema),
    defaultValues: {
      staffId: staff.staffId,
      staffName: staff.staffName,
      staffNameEn: staff.staffNameEn,
      staffNameShort: staff.staffNameShort || '',
      staffType: staff.staffType,
      password: '',
      displayInAttendance: staff.displayInAttendance,
      mail: staff.mail || '',
      dataStatus: staff.dataStatus,
      orderNum: staff.orderNum,
    },
  })

  const { reset, formState: { errors } } = methods

  useEffect(() => {
    reset({
      staffId: staff.staffId,
      staffName: staff.staffName,
      staffNameEn: staff.staffNameEn,
      staffNameShort: staff.staffNameShort || '',
      staffType: staff.staffType,
      password: '',
      displayInAttendance: staff.displayInAttendance,
      mail: staff.mail || '',
      dataStatus: staff.dataStatus,
      orderNum: staff.orderNum,
    })
  }, [staff, reset])

  const isDisabled = isSuspended
  const rowBg = isSuspended ? '!bg-gray-400' : 'bg-white'

  return (
    <TableRow>
      <FormProvider {...methods}>
        {/* STT */}
        <TableCell className={cn(rowBg, 'min-w-[5rem] text-center')}>
          {staff.staffId}
        </TableCell>

        {/* Họ tên */}
        <TableCell className={cn(rowBg, 'min-w-[20rem] text-left')}>
          <FormField
            control={methods.control}
            name="staffName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomTextarea
                    {...field}
                    placeholder={!isDisabled ? t('staff.columns.name') : ''}
                    disabled={isDisabled}
                    className={cn(
                      'disabled:opacity-100 border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full min-h-0 text-[1.4rem] whitespace-break-spaces',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.staffName },
                    )}
                    autoResize
                    disableNewline
                    rows={1}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
          <div className="flex-1 mt-[.6rem] mb-[.6rem] ml-[-.5rem] border-black border-t border-dashed w-[calc(100%_+_2rem)]" />
          <FormField
            control={methods.control}
            name="staffNameShort"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomTextarea
                    {...field}
                    value={field.value ?? ''}
                    placeholder={!isDisabled ? t('staff.columns.shortName') : ''}
                    disabled={isDisabled}
                    className={cn(
                      'disabled:opacity-100 border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full min-h-0 text-[1.4rem] whitespace-break-spaces',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.staffNameShort },
                    )}
                    autoResize
                    disableNewline
                    rows={1}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Vai trò */}
        <TableCell className={cn(rowBg, 'min-w-[14rem] text-left')}>
          <FormField
            control={methods.control}
            name="staffType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    change={(option) => field.onChange(option.value)}
                    option={STAFF_TYPE_OPTIONS}
                    selected={String(field.value ?? '')}
                    customClassMain={cn(
                      'disabled:opacity-100 w-[18.5rem] h-[2rem] sm:h-[3.6rem]',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.staffType },
                      isSuspended && '!bg-gray-400',
                    )}
                    customClassArrow={cn('', {
                      'focus:outline-red-500 focus-visible:outline-red-500 border-red-500 disabled:opacity-100': errors.staffType,
                      '!bg-gray-400': isSuspended,
                    })}
                    ref={field.ref}
                    disable={isDisabled}
                    hideWhenDetached
                    collisionBoundary={document.getElementById('store-table') ?? undefined}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Mật khẩu */}
        <TableCell className={cn(rowBg, 'min-w-[14rem] max-w-[14rem] text-left')}>
          <FormField
            control={methods.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    type="password"
                    placeholder="••••••••••"
                    disabled={isDisabled}
                    className={cn(
                      'disabled:opacity-100 border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem] placeholder:text-black',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.password },
                    )}
                    autoResize
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Chấm công */}
        <TableCell className={cn(rowBg, 'min-w-[11rem] text-left')}>
          <FormField
            control={methods.control}
            name="displayInAttendance"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomRadio
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={String(field.value ?? '')}
                    ref={field.ref}
                    disabled={isDisabled}
                  >
                    {ATTENDANCE_OPTIONS.map((opt) => (
                      <div className="flex items-center space-x-4 w-[4.3rem]" key={`att_${opt.value}`}>
                        <CustomRadioItems
                          value={opt.value}
                          id={`att_${opt.value}-${staff.staffId}`}
                          className={isDisabled ? 'disabled:opacity-100' : ''}
                        />
                        <Label
                          htmlFor={`att_${opt.value}-${staff.staffId}`}
                          className="text-[1.4rem] whitespace-nowrap cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </CustomRadio>
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Email */}
        <TableCell className={cn(rowBg, 'min-w-[18rem] text-left')}>
          <FormField
            control={methods.control}
            name="mail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder={!isDisabled ? t('staff.columns.email') : ''}
                    disabled={isDisabled}
                    className={cn(
                      'disabled:opacity-100 border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 min-w-full h-full text-[1.4rem]',
                      { 'focus:outline-red-500 focus-visible:outline-red-500 border-red-500': errors.mail },
                    )}
                    autoResize
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xl whitespace-nowrap" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Ngày cập nhật */}
        <TableCell className={cn(rowBg, 'min-w-[11rem] text-center')}>
          {staff.updatedAt ? format(new Date(staff.updatedAt), 'yyyy/MM/dd') : ''}
        </TableCell>

        {/* Người cập nhật */}
        <TableCell className={cn(rowBg, 'min-w-[15rem] text-center')}>
          {staff.updatedByName ?? ''}
        </TableCell>

        {/* Thao tác */}
        <TableCell className={cn(rowBg, 'min-w-[15rem] text-center')}>
          {staff.dataStatus === 1 ? (
            <>
              <form onSubmit={methods.handleSubmit((data) => onUpdate(data, 0))}>
                <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                    {t('staff.actions.update')}
                  </span>
                </NButton>
              </form>

              <CustomDialog
                customClass="text-center [&_svg]:hidden z-[99999]"
                size="medium"
                customClassContent="max-w-[50rem]"
                trigger={
                  <NButton className="bg-gray mt-[.5rem] mx-2 px-2 w-auto min-w-fit h-auto btn btn-default" variant="default">
                    <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                      {t('staff.actions.suspend')}
                    </span>
                  </NButton>
                }
                title={t('staff.dialogs.suspendTitle')}
                content={
                  <div className="flex justify-center p-5">
                    <DialogClose
                      onClick={() =>
                        onUpdate({ ...methods.getValues(), dataStatus: 0 }, 1)
                      }
                    >
                      <div className="bg-[#8bd08e] mx-4 w-[14.4rem] border border-black btn btn-default">
                        <span>{t('staff.dialogs.confirm')}</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[14.4rem] border border-black btn btn-default">
                        <span>{t('staff.dialogs.cancel')}</span>
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
                  <NButton className="bg-gray mt-[.5rem] px-2 w-auto min-w-fit h-auto btn btn-default" variant="default">
                    <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                      {t('staff.actions.delete')}
                    </span>
                  </NButton>
                }
                title={t('staff.dialogs.deleteTitle')}
                content={
                  <div className="flex justify-center p-5">
                    <DialogClose onClick={() => onDelete(staff.staffId)}>
                      <div className="bg-[#8bd08e] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                        <span>{t('staff.dialogs.confirm')}</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                        <span>{t('staff.dialogs.cancel')}</span>
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
                <NButton className="bg-gray px-2 w-auto min-w-fit h-auto btn btn-default" variant="default">
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">
                    {t('staff.actions.reactivate')}
                  </span>
                </NButton>
              }
              title={t('staff.dialogs.reactivateTitle')}
              content={
                <div className="flex justify-center p-5">
                  <DialogClose
                    onClick={() =>
                      onUpdate({ ...methods.getValues(), dataStatus: 1 }, 2)
                    }
                  >
                    <div className="bg-[#8bd08e] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                      <span>{t('staff.dialogs.confirm')}</span>
                    </div>
                  </DialogClose>
                  <DialogClose>
                    <div className="bg-[#eee] mx-4 w-[14.4rem] btn btn-default border-[1px] border-black">
                      <span>{t('staff.dialogs.cancel')}</span>
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
function StaffMasterPage() {
  const { t } = useTranslation()
  const [staffType, setStaffType] = useState('')
  const [isAddStaff, setIsAddStaff] = useState(false)
  const [indexAddStaff, setIndexAddStaff] = useState(0)

  const staffListForm = useForm<{ staffs: Staff[] }>({})
  const { fields: fieldStaffs, replace } = useFieldArray({
    control: staffListForm.control,
    name: 'staffs',
  })

  const { isLoading, refetch } = useGetStaffs({
    staffType,
    onSuccess(data) {
      replace([...data].sort((a, b) => (b.dataStatus === 1 ? 1 : 0) - (a.dataStatus === 1 ? 1 : 0)))
    },
    onError(error) {
      toast.error(extractErrorMessage(error))
    },
  })

  const { mutate: createStaff, isPending: isPendingCreate } = useCreateStaff({
    onSuccess() {
      refetch()
      setIsAddStaff(false)
      toast.success(t('staff.messages.createSuccess'))
    },
    onError(error) {
      showFieldErrors(error)
    },
  })

  const { mutate: updateStaff, isPending: isPendingUpdate } = useUpdateStaff({
    onSuccess() {
      refetch()
    },
    onError(error) {
      showFieldErrors(error)
    },
  })

  const { mutate: deleteStaffMutation, isPending: isPendingDelete } = useDeleteStaff({
    onSuccess() {
      refetch()
      toast.success(t('staff.messages.deleteSuccess'))
    },
    onError(error) {
      toast.error(extractErrorMessage(error))
    },
  })

  useEffect(() => {
    refetch()
  }, [staffType])

  const addStaffAtIndex = (index: number) => {
    setIsAddStaff(true)
    setIndexAddStaff(index)
  }

  const handleCreate = (data: CreateStaffBody) => {
    const { dataStatus, ...rest } = data
    createStaff({
      ...rest,
      staffType: Number(data.staffType),
    })
  }

  const handleUpdate = (data: UpdateStaffBody, type: number) => {
    const { password, ...rest } = data
    const updateData: UpdateStaffBody = {
      ...rest,
      ...(password ? { password } : {}),
    }
    updateStaff(updateData)

    if (type === 0) toast.success(t('staff.messages.updateSuccess'))
    if (type === 1) toast.success(t('staff.messages.suspendSuccess'))
    if (type === 2) toast.success(t('staff.messages.reactivateSuccess'))
  }

  const isPageLoading = isLoading || isPendingCreate || isPendingUpdate || isPendingDelete

  return (
    <>
      {isPageLoading ? <Loading /> : null}
      <div className="pt-[2.6rem] pb-[12rem] common-container staff-master-page">
        {/* Title */}
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <span className="ml-[1.5rem]">{t('staff.title')}</span>
        </div>

        {/* Filter & Actions bar */}
        <div className="flex flex-wrap justify-between gap-[2rem] mt-[2.4rem]">
          <div className="group-button flex flex-nowrap items-center gap-[1rem]">
            <div className="font-bold text-[1.8rem] text-nowrap">
              <span>{t('staff.filterByRole')}</span>
            </div>
            <CustomSelect
              option={STAFF_TYPE_OPTIONS}
              change={(option) => setStaffType(option.value)}
              selected={staffType}
              customClassMain="w-[18.5rem] sm:h-[3.6rem] h-[2rem] text-[1.4rem]"
              customClassArrow="w-[4rem] text-[1.4rem]"
            />
          </div>
          <div className="group-button flex flex-wrap gap-[2.4rem]">
            <NButton className="bg-gray" onClick={() => addStaffAtIndex(0)}>
              <span className="text-[1.4rem] leading-[1.4rem]">
                {t('staff.addRowTop')}
              </span>
            </NButton>
          </div>
        </div>

        {/* Table — single table with sticky header like store-master */}
        <div
          className="relative flex mt-[2.4rem] border border-black max-h-[56.4rem] overflow-auto"
          id="store-table"
        >
          <Table
            className={cn(
              'flex-grow min-w-[130rem] text-[1.4rem] text-center',
              'border-separate border-spacing-0',
              '[&_td]:border [&_td]:border-black [&_td]:border-l-0 [&_td]:border-t-0',
              '[&_th]:border [&_th]:border-black [&_th]:border-l-0 [&_th]:border-t-0',
            )}
          >
            <TableHeader className="top-0 z-[9] sticky">
              <TableRow className="bg-gray-eee data-[state=selected]:bg-gray-eee hover:bg-gray-eee">
                <TableHead className="min-w-[5rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.no')}</TableHead>
                <TableHead className="min-w-[20rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.name')}</TableHead>
                <TableHead className="min-w-[14rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.role')}</TableHead>
                <TableHead className="min-w-[14rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.password')}</TableHead>
                <TableHead className="min-w-[11rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.attendance')}</TableHead>
                <TableHead className="min-w-[18rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.email')}</TableHead>
                <TableHead className="min-w-[11rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.updatedAt')}</TableHead>
                <TableHead className="min-w-[15rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.updatedBy')}</TableHead>
                <TableHead className="min-w-[15rem] h-[5.6rem] font-bold text-[1.6rem] text-center text-black bg-[#eee]">{t('staff.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fieldStaffs.map((staff, index) => (
                <Fragment key={staff.staffId || index}>
                  {isAddStaff && index === indexAddStaff ? (
                    <CreateStaffRow
                      orderNum={staff?.orderNum || 1}
                      onSubmit={handleCreate}
                    />
                  ) : null}
                  <UpdateStaffRow
                    staff={staff}
                    onUpdate={handleUpdate}
                    onDelete={(staffId) => deleteStaffMutation(staffId)}
                  />
                </Fragment>
              ))}

              {isAddStaff && indexAddStaff >= fieldStaffs.length && (
                <CreateStaffRow
                  orderNum={(fieldStaffs[fieldStaffs.length - 1]?.orderNum ?? 0) + 1}
                  onSubmit={handleCreate}
                />
              )}

              {!fieldStaffs.length && !isAddStaff && (
                <TableRow className="!bg-white">
                  <TableCell className="font-bold text-red-500">
                    {t('staff.noData')}
                  </TableCell>
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
    const axiosError = error as { response?: { data?: StaffErrorResponse } }
    const message = axiosError.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    return message || 'Đã xảy ra lỗi'
  }
  return 'Đã xảy ra lỗi'
}

function showFieldErrors(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: StaffErrorResponse } }
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
