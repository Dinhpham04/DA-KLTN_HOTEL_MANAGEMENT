import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute } from '@tanstack/react-router'
import { HttpStatusCode } from 'axios'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'

import i18n from '@/i18n'

import CustomDialog from '@/components/common/CustomDialog'
import CustomFileInput from '@/components/common/CustomFileInput'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import CustomSelect from '@/components/common/CustomSelect'
import {
  Table,
  TableBody,
  TableCell,
  TableFormRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/CustomTableForm'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import Loading from '@/components/common/Loading'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { NButton } from '@/components/ui/new-button'
import { cn } from '@/lib/utils'

import { useCreateFacility } from '@/hooks/mutations/useCreateFacility'
import { useUpdateFacility } from '@/hooks/mutations/useUpdateFacility'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import type {
  CreateFacilityBody,
  Facility,
  FacilityErrorResponse,
  UpdateFacilityBody,
} from '@/types/facility'

import type { CustomSelectOption } from '@/components/common/CustomSelect'

const t = i18n.t.bind(i18n)

const KEY_FUNCTION_OPTIONS: CustomSelectOption[] = [
  { label: t('facility.options.notUsed'), value: '0' },
  { label: t('facility.options.used'), value: '1' },
]

const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
const maxSize = 10240 * 1024

const BaseSchema = z.object({
  dataStatus: z.number(),
  facilityType: z.number(),
  facilityNo: z
    .string()
    .max(3, { message: t('facility.validation.facilityNoMax') })
    .nonempty({ message: t('facility.validation.facilityNoRequired') }),
  facilityName: z
    .string()
    .max(256, { message: t('facility.validation.facilityNameMax') })
    .nonempty({ message: t('facility.validation.facilityNameRequired') }),
  facilityNameEn: z
    .string()
    .max(256, { message: t('facility.validation.facilityNameEnMax') })
    .nonempty({ message: t('facility.validation.facilityNameEnRequired') }),
  zipCode: z
    .string()
    .nonempty({ message: t('facility.validation.zipCodeRequired') })
    .regex(/^([0-9]{3}-?[0-9]{4})$/, { message: t('facility.validation.zipCodeInvalid') })
    .max(9, { message: t('facility.validation.zipCodeMax') }),
  address: z
    .string()
    .max(256, { message: t('facility.validation.addressMax') })
    .nonempty({ message: t('facility.validation.addressRequired') }),
  addressEn: z
    .string()
    .max(512, { message: t('facility.validation.addressEnMax') })
    .nonempty({ message: t('facility.validation.addressEnRequired') }),
  memo: z
    .string()
    .max(1024, { message: t('facility.validation.memoMax') })
    .optional(),
  keyFunction: z.enum(['0', '1']),
  colorOption: z.string().optional(),
  sharePlaceFlag: z.enum(['0', '1']),
  deliveryboxFlag: z.enum(['0', '1']),
  parkingFlag: z.enum(['0', '1']),
  parkingImg: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
  bicycleParkingFlag: z.enum(['0', '1']),
  bicycleParkingImg: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
  orderNum: z
    .number()
    .nonnegative({ message: t('facility.validation.orderNumRequired') })
    .min(1, { message: t('facility.validation.orderNumMin') })
    .max(999999, { message: t('facility.validation.orderNumMax') }),
})

const CreateSchema = BaseSchema.refine(
  (data) => {
    if (data.parkingImg instanceof File) {
      return validMimeTypes.includes(data.parkingImg.type)
    }
    return true
  },
  {
    message: t('facility.validation.parkingImgInvalid'),
    path: ['parkingImg'],
  },
)
  .refine(
    (data) => {
      if (data.parkingImg instanceof File) {
        return data.parkingImg.size <= maxSize
      }
      return true
    },
    {
      message: t('facility.validation.parkingImgSize'),
      path: ['parkingImg'],
    },
  )
  .refine(
    (data) => {
      if (data.bicycleParkingImg instanceof File) {
        return validMimeTypes.includes(data.bicycleParkingImg.type)
      }
      return true
    },
    {
      message: t('facility.validation.bicycleParkingImgInvalid'),
      path: ['bicycleParkingImg'],
    },
  )
  .refine(
    (data) => {
      if (data.bicycleParkingImg instanceof File) {
        return data.bicycleParkingImg.size <= maxSize
      }
      return true
    },
    {
      message: t('facility.validation.bicycleParkingImgSize'),
      path: ['bicycleParkingImg'],
    },
  )

const UpdateSchema = BaseSchema.extend({
  facilityId: z.number(),
}).refine(
  (data) => {
    if (data.parkingImg instanceof File) {
      return validMimeTypes.includes(data.parkingImg.type)
    }
    return true
  },
  {
    message: t('facility.validation.parkingImgInvalid'),
    path: ['parkingImg'],
  },
)
  .refine(
    (data) => {
      if (data.parkingImg instanceof File) {
        return data.parkingImg.size <= maxSize
      }
      return true
    },
    {
      message: t('facility.validation.parkingImgSize'),
      path: ['parkingImg'],
    },
  )
  .refine(
    (data) => {
      if (data.bicycleParkingImg instanceof File) {
        return validMimeTypes.includes(data.bicycleParkingImg.type)
      }
      return true
    },
    {
      message: t('facility.validation.bicycleParkingImgInvalid'),
      path: ['bicycleParkingImg'],
    },
  )
  .refine(
    (data) => {
      if (data.bicycleParkingImg instanceof File) {
        return data.bicycleParkingImg.size <= maxSize
      }
      return true
    },
    {
      message: t('facility.validation.bicycleParkingImgSize'),
      path: ['bicycleParkingImg'],
    },
  )

type FormCreateValues = z.infer<typeof CreateSchema>
type FormUpdateValues = z.infer<typeof UpdateSchema>

interface CreateFacilityRowProps {
  facility?: Facility
  handleCreate: (data: FormCreateValues) => void
}

interface UpdateFacilityRowProps {
  facility: Facility
  index: number
  handleUpdate: (data: FormUpdateValues, type: number) => void
}

function getFileNameFromValue(value: FormCreateValues['parkingImg'] | FormUpdateValues['parkingImg']) {
  if (typeof value === 'string') return value
  if (value instanceof File) return value.name
  return ''
}

function boolToRadio(value: boolean): '0' | '1' {
  return value ? '1' : '0'
}

function getKeyFunctionValue(value: boolean): '0' | '1' {
  return boolToRadio(value)
}

function radioToBool(value: '0' | '1'): boolean {
  return value === '1'
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: FacilityErrorResponse; status?: number } }
    const status = axiosError.response?.status
    const payload = axiosError.response?.data

    if (status === HttpStatusCode.UnprocessableEntity && payload?.errors) {
      const firstErrorKey = Object.keys(payload.errors)[0]
      if (firstErrorKey) {
        const firstError = payload.errors[firstErrorKey]?.[0]
        if (firstError) return firstError
      }
    }

    if (Array.isArray(payload?.message)) {
      return payload.message.join(', ')
    }
    return payload?.message || 'Đã xảy ra lỗi.'
  }
  return 'Đã xảy ra lỗi.'
}

function CreateFacilityRow({ facility, handleCreate }: CreateFacilityRowProps) {
  const { t } = useTranslation()
  const methods = useForm<FormCreateValues>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      facilityNo: '',
      facilityName: '',
      facilityType: 1,
      dataStatus: 1,
      orderNum: facility?.orderNum ?? 1,
      facilityNameEn: '',
      zipCode: '',
      address: '',
      addressEn: '',
      memo: '',
      keyFunction: '0',
      colorOption: '#3764A8',
      sharePlaceFlag: '0',
      deliveryboxFlag: '0',
      parkingFlag: '0',
      parkingImg: '',
      bicycleParkingFlag: '0',
      bicycleParkingImg: '',
    },
  })

  const parkingFlag = methods.watch('parkingFlag')
  const bicycleParkingFlag = methods.watch('bicycleParkingFlag')
  const {
    formState: { errors },
  } = methods

  return (
    <TableFormRow methods={methods} onSubmit={methods.handleSubmit(handleCreate)} className="bg-white">
      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="facilityNo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomInput
                  {...field}
                  type="text"
                  placeholder="NO"
                  className={cn(
                    'min-w-full h-full border-transparent text-[1.4rem] focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.facilityNo,
                    },
                  )}
                  autoResize
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="facilityName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Tên cửa hàng"
                  className={cn(
                    'min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.facilityName,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="facilityNameEn"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Tên cửa hàng (Tiếng Anh)"
                  className={cn(
                    'min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.facilityNameEn,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <div className="flex flex-col">
          <FormField
            control={methods.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder="ZIP CODE"
                    className={cn(
                      'min-w-full h-full border-transparent text-[1.4rem] focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                      {
                        'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                          errors.zipCode,
                      },
                    )}
                    autoResize
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
          <div className="flex-1 mt-[.6rem] mb-[.6rem] ml-[-1rem] w-[calc(100%_+_2rem)] border-t border-black border-dashed" />
          <FormField
            control={methods.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomTextarea
                    {...field}
                    placeholder="Địa chỉ"
                    className={cn(
                      'min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                      {
                        'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                          errors.address,
                      },
                    )}
                    autoResize
                    disableNewline
                    rows={1}
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
        </div>
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="addressEn"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Địa chỉ (Tiếng Anh)"
                  className={cn(
                    'min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.addressEn,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Ghi chú"
                  className={cn(
                    'min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.memo,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="keyFunction"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomSelect
                  change={(option) => field.onChange(option.value)}
                  option={KEY_FUNCTION_OPTIONS}
                  selected={field.value}
                  customClassMain={cn(
                    'h-14 border hover:bg-white disabled:bg-gray',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.keyFunction,
                    },
                  )}
                  ref={field.ref}
                  hideWhenDetached
                  collisionBoundary={document.getElementById('store-table') ?? undefined}
                />
              </FormControl>
              <FormMessage className="text-left text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="colorOption"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormControl>
                <input
                  type="color"
                  className="w-full h-[4rem]"
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage className="text-left text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="sharePlaceFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio onValueChange={field.onChange} value={field.value.toString()}>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="0" id="share_place_flag1-create" />
                    <Label htmlFor="share_place_flag1-create" className="text-[1.4rem]">
                      {t('facility.options.no')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="share_place_flag2-create" />
                    <Label htmlFor="share_place_flag2-create" className="text-[1.4rem]">
                      {t('facility.options.yes')}
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        <div className="mt-[.5rem] min-h-[3.2rem]" />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="deliveryboxFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio onValueChange={field.onChange} value={field.value.toString()}>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="0" id="deliverybox_flag1-create" />
                    <Label htmlFor="deliverybox_flag1-create" className="text-[1.4rem]">
                      {t('facility.options.no')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="deliverybox_flag2-create" />
                    <Label htmlFor="deliverybox_flag2-create" className="text-[1.4rem]">
                      {t('facility.options.yes')}
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        <div className="mt-[.5rem] min-h-[3.2rem]" />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="parkingFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio onValueChange={field.onChange} value={field.value.toString()}>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="0" id="parking_flag1-create" />
                    <Label htmlFor="parking_flag1-create" className="text-[1.4rem]">
                      {t('facility.options.no')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="parking_flag2-create" />
                    <Label htmlFor="parking_flag2-create" className="text-[1.4rem]">
                      {t('facility.options.yes')}
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        {parkingFlag === '1' ? (
          <FormField
            control={methods.control}
            name="parkingImg"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomFileInput
                    label="File"
                    onFileChange={(file) => field.onChange(file)}
                    initialFileName={getFileNameFromValue(field.value)}
                    accept="image/*"
                    className="mt-[.5rem]"
                    inputClassName="bg-gray custom"
                    labelClassName="whitespace-nowrap"
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
        ) : (
          <div className="mt-[.5rem] min-h-[3.2rem]" />
        )}
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="bicycleParkingFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio onValueChange={field.onChange} value={field.value.toString()}>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="0" id="bicycle_parking_flag1-create" />
                    <Label htmlFor="bicycle_parking_flag1-create" className="text-[1.4rem]">
                      {t('facility.options.no')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="bicycle_parking_flag2-create" />
                    <Label htmlFor="bicycle_parking_flag2-create" className="text-[1.4rem]">
                      {t('facility.options.yes')}
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        {bicycleParkingFlag === '1' ? (
          <FormField
            control={methods.control}
            name="bicycleParkingImg"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomFileInput
                    label="File"
                    onFileChange={(file) => field.onChange(file)}
                    initialFileName={getFileNameFromValue(field.value)}
                    accept="image/*"
                    className="mt-[.5rem]"
                    inputClassName="bg-gray custom"
                    labelClassName="whitespace-nowrap"
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
        ) : (
          <div className="mt-[.5rem] min-h-[3.2rem]" />
        )}
      </TableCell>

      <TableCell className="text-center">
        <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
          <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">{t('facility.actions.save')}</span>
        </NButton>
      </TableCell>
    </TableFormRow>
  )
}

function UpdateFacilityRow({
  facility,
  index,
  handleUpdate,
}: UpdateFacilityRowProps) {
  const { t } = useTranslation()
  const methods = useForm<FormUpdateValues>({
    resolver: zodResolver(UpdateSchema),
    defaultValues: {
      facilityId: facility.facilityId,
      facilityNo: facility.facilityNo,
      facilityName: facility.facilityName,
      facilityType: facility.facilityType,
      dataStatus: facility.dataStatus,
      orderNum: facility.orderNum,
      facilityNameEn: facility.facilityNameEn,
      zipCode: facility.zipCode,
      address: facility.address,
      addressEn: facility.addressEn,
      memo: facility.memo ?? '',
      keyFunction: getKeyFunctionValue(facility.keyFunction),
      colorOption: facility.colorOption ?? '#3764A8',
      sharePlaceFlag: boolToRadio(facility.sharePlaceFlag),
      deliveryboxFlag: boolToRadio(facility.deliveryboxFlag),
      parkingFlag: boolToRadio(facility.parkingFlag),
      parkingImg: facility.parkingImg,
      bicycleParkingFlag: boolToRadio(facility.bicycleParkingFlag),
      bicycleParkingImg: facility.bicycleParkingImg,
    },
  })

  const parkingFlag = methods.watch('parkingFlag')
  const bicycleParkingFlag = methods.watch('bicycleParkingFlag')
  const {
    formState: { errors },
  } = methods
  const { reset } = methods

  useEffect(() => {
    reset({
      facilityId: facility.facilityId,
      facilityNo: facility.facilityNo,
      facilityName: facility.facilityName,
      facilityType: facility.facilityType,
      dataStatus: facility.dataStatus,
      orderNum: facility.orderNum,
      facilityNameEn: facility.facilityNameEn,
      zipCode: facility.zipCode,
      address: facility.address,
      addressEn: facility.addressEn,
      memo: facility.memo ?? '',
      keyFunction: getKeyFunctionValue(facility.keyFunction),
      colorOption: facility.colorOption ?? '#3764A8',
      sharePlaceFlag: boolToRadio(facility.sharePlaceFlag),
      deliveryboxFlag: boolToRadio(facility.deliveryboxFlag),
      parkingFlag: boolToRadio(facility.parkingFlag),
      parkingImg: facility.parkingImg,
      bicycleParkingFlag: boolToRadio(facility.bicycleParkingFlag),
      bicycleParkingImg: facility.bicycleParkingImg,
    })
  }, [facility, reset])

  const isSuspended = facility.dataStatus === 0

  return (
    <TableFormRow
      methods={methods}
      onSubmit={methods.handleSubmit((data) => handleUpdate(data, 0))}
      className={cn('bg-white', {
        '!bg-gray-400': isSuspended,
      })}
    >
      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="facilityNo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomInput
                  {...field}
                  type="text"
                  placeholder="NO"
                  className={cn(
                    'disabled:opacity-100 min-w-full h-full border-transparent text-[1.4rem] focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.facilityNo,
                    },
                  )}
                  disabled={isSuspended}
                  autoResize
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="facilityName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Tên cửa hàng"
                  className={cn(
                    'disabled:opacity-100 min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.facilityName,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                  disabled={isSuspended}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="facilityNameEn"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Tên cửa hàng (Tiếng Anh)"
                  className={cn(
                    'disabled:opacity-100 min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.facilityNameEn,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                  disabled={isSuspended}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <div className="flex flex-col">
          <FormField
            control={methods.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder="ZIP CODE"
                    className={cn(
                      'disabled:opacity-100 min-w-full h-full border-transparent text-[1.4rem] focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                      {
                        'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                          errors.zipCode,
                      },
                    )}
                    autoResize
                    disabled={isSuspended}
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
          <div className="flex-1 mt-[.6rem] mb-[.6rem] ml-[-1rem] w-[calc(100%_+_2rem)] border-t border-black border-dashed" />
          <FormField
            control={methods.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomTextarea
                    {...field}
                    placeholder="Địa chỉ"
                    className={cn(
                      'disabled:opacity-100 min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                      {
                        'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                          errors.address,
                      },
                    )}
                    autoResize
                    disableNewline
                    rows={1}
                    disabled={isSuspended}
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
        </div>
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="addressEn"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Địa chỉ (Tiếng Anh)"
                  className={cn(
                    'disabled:opacity-100 min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.addressEn,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                  disabled={isSuspended}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomTextarea
                  {...field}
                  placeholder="Ghi chú"
                  className={cn(
                    'min-w-full h-full min-h-0 border-transparent text-[1.4rem] whitespace-break-spaces focus:outline focus:outline-1 focus:outline-gray-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500': errors.memo,
                    },
                  )}
                  autoResize
                  disableNewline
                  rows={1}
                />
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="keyFunction"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomSelect
                  change={(option) => field.onChange(option.value)}
                  option={KEY_FUNCTION_OPTIONS}
                  selected={field.value}
                  customClassMain={cn(
                    'disabled:opacity-100 h-14 border hover:bg-white disabled:bg-gray',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.keyFunction,
                    },
                    isSuspended && '!bg-gray-400',
                  )}
                  customClassArrow={cn('', {
                    '!bg-gray-400': isSuspended,
                  })}
                  ref={field.ref}
                  disable={isSuspended}
                  hideWhenDetached
                  collisionBoundary={document.getElementById('store-table') ?? undefined}
                />
              </FormControl>
              <FormMessage className="text-left text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="colorOption"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormControl>
                <input
                  type="color"
                  className="w-full h-[4rem]"
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  disabled={isSuspended}
                />
              </FormControl>
              <FormMessage className="text-left text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="sharePlaceFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  disabled={isSuspended}
                >
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="0"
                      id={`share_place_flag1-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label htmlFor={`share_place_flag1-${index}`} className="text-[1.4rem] cursor-pointer">
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="1"
                      id={`share_place_flag2-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label htmlFor={`share_place_flag2-${index}`} className="text-[1.4rem] cursor-pointer">
                      Có
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        <div className="mt-[.5rem] min-h-[3.2rem]" />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="deliveryboxFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  disabled={isSuspended}
                >
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="0"
                      id={`deliverybox_flag1-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label htmlFor={`deliverybox_flag1-${index}`} className="text-[1.4rem] cursor-pointer">
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="1"
                      id={`deliverybox_flag2-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label htmlFor={`deliverybox_flag2-${index}`} className="text-[1.4rem] cursor-pointer">
                      Có
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        <div className="mt-[.5rem] min-h-[3.2rem]" />
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="parkingFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  disabled={isSuspended}
                >
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="0"
                      id={`parking_flag1-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label htmlFor={`parking_flag1-${index}`} className="text-[1.4rem] cursor-pointer">
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="1"
                      id={`parking_flag2-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label htmlFor={`parking_flag2-${index}`} className="text-[1.4rem] cursor-pointer">
                      Có
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        {parkingFlag === '1' ? (
          <FormField
            control={methods.control}
            name="parkingImg"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomFileInput
                    label="File"
                    onFileChange={(file) => {
                      field.onChange(file)
                    }}
                    initialFileName={getFileNameFromValue(field.value)}
                    accept="image/*"
                    className="mt-[.5rem]"
                    inputClassName="bg-gray custom"
                    labelClassName="whitespace-nowrap"
                    disabled={isSuspended}
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
        ) : (
          <div className="mt-[.5rem] min-h-[3.2rem]" />
        )}
      </TableCell>

      <TableCell className="text-left">
        <FormField
          control={methods.control}
          name="bicycleParkingFlag"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CustomRadio
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                  disabled={isSuspended}
                >
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="0"
                      id={`bicycle_parking_flag1-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label
                      htmlFor={`bicycle_parking_flag1-${index}`}
                      className="text-[1.4rem] cursor-pointer"
                    >
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems
                      value="1"
                      id={`bicycle_parking_flag2-${index}`}
                      className="disabled:opacity-100"
                    />
                    <Label
                      htmlFor={`bicycle_parking_flag2-${index}`}
                      className="text-[1.4rem] cursor-pointer"
                    >
                      Có
                    </Label>
                  </div>
                </CustomRadio>
              </FormControl>
              <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
            </FormItem>
          )}
        />
        {bicycleParkingFlag === '1' ? (
          <FormField
            control={methods.control}
            name="bicycleParkingImg"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomFileInput
                    label="File"
                    onFileChange={(file) => {
                      field.onChange(file)
                    }}
                    initialFileName={getFileNameFromValue(field.value)}
                    accept="image/*"
                    className="mt-[.5rem]"
                    inputClassName="bg-gray custom"
                    labelClassName="whitespace-nowrap"
                    disabled={isSuspended}
                  />
                </FormControl>
                <FormMessage className="text-xl text-red-500 whitespace-nowrap" />
              </FormItem>
            )}
          />
        ) : (
          <div className="mt-[.5rem] min-h-[3.2rem]" />
        )}
      </TableCell>

      <TableCell className="text-center">
        <div className="flex flex-wrap justify-center gap-[.5rem] min-w-[18rem]">
          <div className="flex flex-col flex-wrap gap-[.5rem]">
            {facility.dataStatus !== 0 ? (
              <>
                <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">{t('facility.actions.update')}</span>
                </NButton>
                <CustomDialog
                  customClass="text-center [&_svg]:hidden z-[99999]"
                  size="medium"
                  customClassContent="max-w-[50rem]"
                  trigger={
                    <NButton
                      className="bg-gray px-4 w-auto min-w-fit h-auto btn btn-default"
                    >
                      <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">{t('facility.actions.suspend')}</span>
                    </NButton>
                  }
                  title={t('facility.dialogs.suspendTitle')}
                  content={
                    <div className="flex justify-center p-5">
                      <DialogClose
                        onClick={() =>
                          handleUpdate(
                            {
                              ...methods.getValues(),
                              dataStatus: 0,
                            },
                            1,
                          )
                        }
                      >
                        <div className="bg-[#8bd08e] mx-4 w-[14.4rem] border border-black btn btn-default">
                          <span>{t('facility.dialogs.confirm')}</span>
                        </div>
                      </DialogClose>
                      <DialogClose>
                        <div className="bg-[#eee] mx-4 w-[14.4rem] border border-black btn btn-default">
                          <span>{t('facility.dialogs.cancel')}</span>
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
                    <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">{t('facility.actions.reactivate')}</span>
                  </NButton>
                }
                title={t('facility.dialogs.reactivateTitle')}
                content={
                  <div className="flex justify-center p-5">
                    <DialogClose
                      onClick={() =>
                        handleUpdate(
                          {
                            ...methods.getValues(),
                            dataStatus: 1,
                          },
                          2,
                        )
                      }
                    >
                      <div className="bg-[#8bd08e] mx-4 w-[14.4rem] border border-black btn btn-default">
                        <span>{t('facility.dialogs.confirm')}</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[14.4rem] border border-black btn btn-default">
                        <span>{t('facility.dialogs.cancel')}</span>
                      </div>
                    </DialogClose>
                  </div>
                }
              />
            )}
          </div>
        </div>
      </TableCell>
    </TableFormRow>
  )
}

export const Route = createLazyFileRoute('/_authenticated/store-master')({
  component: StoreMasterPage,
})

function StoreMasterPage() {
  const { t } = useTranslation()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isAddFacility, setIsAddFacility] = useState(false)
  const [indexAddFacility, setIndexAddFacility] = useState(0)
  const [currentOperationType, setCurrentOperationType] = useState<number>(0)

  const { data: facilitiesResponse, isLoading, refetch } = useGetFacilities({
    params: { page: 1, limit: 500 },
    onError(error) {
      toast.error(getErrorMessage(error))
    },
  })

  useEffect(() => {
    const sorted = [...(facilitiesResponse?.data ?? [])].sort((a, b) => a.orderNum - b.orderNum)
    setFacilities(sorted)
  }, [facilitiesResponse])

  const { mutate: createFacility, isPending: isPendingCreate } = useCreateFacility({
    onSuccess() {
      refetch()
      setIsAddFacility(false)
      toast.success(t('facility.messages.createSuccess'))
    },
    onError(error) {
      toast.error(getErrorMessage(error))
    },
  })

  const { mutate: updateFacility, isPending: isPendingUpdate } = useUpdateFacility({
    onSuccess() {
      refetch()
      if (currentOperationType === 0) {
        toast.success(t('facility.messages.updateSuccess'))
      } else if (currentOperationType === 1) {
        toast.success(t('facility.messages.suspendSuccess'))
      } else if (currentOperationType === 2) {
        toast.success(t('facility.messages.reactivateSuccess'))
      }
    },
    onError(error) {
      toast.error(getErrorMessage(error))
    },
  })

  const addFacilityAtIndex = (index: number) => {
    setIsAddFacility(true)
    setIndexAddFacility(index)
  }

  const handleCreate = (data: FormCreateValues) => {
    const payload: CreateFacilityBody = {
      facilityNo: data.facilityNo,
      facilityName: data.facilityName,
      facilityNameEn: data.facilityNameEn,
      zipCode: data.zipCode,
      address: data.address,
      addressEn: data.addressEn,
      facilityType: data.facilityType,
      keyFunction: radioToBool(data.keyFunction),
      sharePlaceFlag: radioToBool(data.sharePlaceFlag),
      deliveryboxFlag: radioToBool(data.deliveryboxFlag),
      parkingFlag: radioToBool(data.parkingFlag),
      parkingImg:
        data.parkingImg instanceof File
          ? data.parkingImg.name
          : typeof data.parkingImg === 'string'
            ? data.parkingImg
            : '',
      bicycleParkingFlag: radioToBool(data.bicycleParkingFlag),
      bicycleParkingImg:
        data.bicycleParkingImg instanceof File
          ? data.bicycleParkingImg.name
          : typeof data.bicycleParkingImg === 'string'
            ? data.bicycleParkingImg
            : '',
      memo: data.memo,
      orderNum: data.orderNum,
      colorOption: data.colorOption ?? null,
    }

    createFacility(payload)
  }

  const handleUpdate = (data: FormUpdateValues, type: number) => {
    setCurrentOperationType(type)

    const payload: UpdateFacilityBody = {
      facilityId: data.facilityId,
      dataStatus: data.dataStatus,
      facilityType: data.facilityType,
      facilityNo: data.facilityNo,
      facilityName: data.facilityName,
      facilityNameEn: data.facilityNameEn,
      zipCode: data.zipCode,
      address: data.address,
      addressEn: data.addressEn,
      keyFunction: radioToBool(data.keyFunction),
      sharePlaceFlag: radioToBool(data.sharePlaceFlag),
      deliveryboxFlag: radioToBool(data.deliveryboxFlag),
      parkingFlag: radioToBool(data.parkingFlag),
      parkingImg:
        data.parkingImg instanceof File
          ? data.parkingImg.name
          : typeof data.parkingImg === 'string'
            ? data.parkingImg
            : '',
      bicycleParkingFlag: radioToBool(data.bicycleParkingFlag),
      bicycleParkingImg:
        data.bicycleParkingImg instanceof File
          ? data.bicycleParkingImg.name
          : typeof data.bicycleParkingImg === 'string'
            ? data.bicycleParkingImg
            : '',
      memo: data.memo ?? null,
      orderNum: data.orderNum,
      colorOption: data.colorOption ?? null,
    }

    updateFacility(payload)
  }

  const isPageLoading =
    isLoading || isPendingUpdate || isPendingCreate

  return (
    <>
      {isPageLoading ? <Loading /> : null}

      <div className="pt-[2.6rem] pb-[12rem] areas-setting-page common-container">
        <div className="flex items-center h-[4.7rem] bg-white font-bold text-[2.3rem] before:content-[''] before:bg-primary before:w-[.4rem] before:h-full">
          <span className="ml-[1.5rem]">{t('facility.title')}</span>
        </div>

        <div className="flex justify-end mt-[2.4rem]">
          <div className="flex flex-wrap gap-[2.4rem] group-button">
            <NButton className="bg-gray w-[16rem] h-[4rem]" onClick={() => addFacilityAtIndex(0)}>
              <span className="text-[1.4rem] leading-[1.4rem]">{t('facility.addRow')}</span>
            </NButton>
          </div>
        </div>

        <div
          className="store-table relative flex mt-[2.4rem] border border-black max-h-[56.4rem] overflow-auto"
          id="store-table"
        >
          <Table
            className={cn(
              'flex-grow min-w-[160rem] text-[1.4rem] text-center',
              'border-separate border-spacing-0',
              '[&>div>div>div]:border-l-0 [&>div>div>div]:border-t-0',
              '[&_form>div]:border-l-0 [&_form>div]:border-t-0',
            )}
          >
            <TableHeader className="sticky top-0 z-[9]">
              <TableRow className="bg-gray-eee data-[state=selected]:bg-gray-eee hover:bg-gray-eee">
                <TableHead className="min-w-[6.5rem] h-[5.6rem]  text-[1.6rem] text-center">{t('facility.columns.no')}</TableHead>
                <TableHead className="min-w-[15rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.name')}</TableHead>
                <TableHead className="min-w-[15rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.nameEn')}</TableHead>
                <TableHead className="min-w-[20rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.address')}</TableHead>
                <TableHead className="min-w-[20rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.addressEn')}</TableHead>
                <TableHead className="min-w-[20rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.memo')}</TableHead>
                <TableHead className="min-w-[18rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.keyFunction')}</TableHead>
                <TableHead className="min-w-[8rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.color')}</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.sharePlace')}</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.deliverybox')}</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.parking')}</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.bicycleParking')}</TableHead>
                <TableHead className="min-w-[18rem] h-[5.6rem] text-[1.6rem] text-center">{t('facility.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {facilities.map((facility, index) => (
                <Fragment key={facility.facilityId || index}>
                  {isAddFacility && index === indexAddFacility ? (
                    <CreateFacilityRow facility={facility} handleCreate={handleCreate} />
                  ) : null}

                  <UpdateFacilityRow
                    facility={facility}
                    index={index}
                    handleUpdate={handleUpdate}
                  />
                </Fragment>
              ))}

              {isAddFacility && indexAddFacility >= facilities.length ? (
                <CreateFacilityRow handleCreate={handleCreate} />
              ) : null}
            </TableBody>
          </Table>

          <div className="absolute top-0 right-0 w-[.1rem] h-100% bg-black" />
        </div>
      </div>
    </>
  )
}
