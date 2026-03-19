import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { HttpStatusCode } from 'axios'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import CustomDialog from '@/components/common/CustomDialog'
import CustomFileInput from '@/components/common/CustomFileInput'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import CustomSelectClean from '@/components/common/CustomSelectClean'
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
import { useUpdateFacilityOrder } from '@/hooks/mutations/useUpdateFacilityOrder'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import type {
  CreateFacilityBody,
  Facility,
  FacilityErrorResponse,
  UpdateFacilityBody,
} from '@/types/facility'

interface Option {
  value: '0' | '1'
  label: string
}

const KEY_FUNCTION_OPTIONS: Option[] = [
  { label: 'Không sử dụng', value: '0' },
  { label: 'Sử dụng', value: '1' },
]

const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
const maxSize = 10240 * 1024

const BaseSchema = z.object({
  dataStatus: z.number(),
  facilityType: z.number(),
  facilityNo: z
    .string()
    .max(3, { message: 'Mã số chỉ được tối đa 3 ký tự.' })
    .nonempty({ message: 'Mã số là bắt buộc.' }),
  facilityName: z
    .string()
    .max(256, { message: 'Tên cửa hàng tối đa 256 ký tự.' })
    .nonempty({ message: 'Tên cửa hàng là bắt buộc.' }),
  facilityNameEn: z
    .string()
    .max(256, { message: 'Tên cửa hàng (Tiếng Anh) tối đa 256 ký tự.' })
    .nonempty({ message: 'Tên cửa hàng (Tiếng Anh) là bắt buộc.' }),
  zipCode: z
    .string()
    .nonempty({ message: 'ZIP CODE là bắt buộc.' })
    .regex(/^([0-9]{3}-?[0-9]{4})$/, { message: 'Định dạng ZIP CODE không hợp lệ.' })
    .max(9, { message: 'ZIP CODE tối đa 9 ký tự.' }),
  address: z
    .string()
    .max(256, { message: 'Địa chỉ tối đa 256 ký tự.' })
    .nonempty({ message: 'Địa chỉ là bắt buộc.' }),
  addressEn: z
    .string()
    .max(512, { message: 'Địa chỉ (Tiếng Anh) tối đa 512 ký tự.' })
    .nonempty({ message: 'Địa chỉ (Tiếng Anh) là bắt buộc.' }),
  memo: z
    .string()
    .max(1024, { message: 'Ghi chú tối đa 1024 ký tự.' })
    .optional(),
  keyFunction: z
    .object({
      value: z.enum(['0', '1']),
      label: z.string(),
    }),
  colorOption: z.string().optional(),
  sharePlaceFlag: z.enum(['0', '1']),
  deliveryboxFlag: z.enum(['0', '1']),
  parkingFlag: z.enum(['0', '1']),
  parkingImg: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
  bicycleParkingFlag: z.enum(['0', '1']),
  bicycleParkingImg: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
  orderNum: z
    .number()
    .nonnegative({ message: 'Thứ tự là bắt buộc.' })
    .min(1, { message: 'Thứ tự phải lớn hơn hoặc bằng 1.' })
    .max(999999, { message: 'Thứ tự phải nhỏ hơn hoặc bằng 999999.' }),
})

const CreateSchema = BaseSchema.refine(
  (data) => {
    if (data.parkingImg instanceof File) {
      return validMimeTypes.includes(data.parkingImg.type)
    }
    return true
  },
  {
    message: `Định dạng ảnh bãi đỗ xe không hợp lệ. (${validMimeTypes
      .map((type) => type.split('/')[1])
      .join(', ')})`,
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
      message: `Dung lượng ảnh bãi đỗ xe phải nhỏ hơn hoặc bằng ${maxSize / (1024 * 1024)}MB.`,
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
      message: `Định dạng ảnh bãi đỗ xe đạp không hợp lệ. (${validMimeTypes
        .map((type) => type.split('/')[1])
        .join(', ')})`,
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
      message: `Dung lượng ảnh bãi đỗ xe đạp phải nhỏ hơn hoặc bằng ${maxSize / (1024 * 1024)}MB.`,
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
    message: `Định dạng ảnh bãi đỗ xe không hợp lệ. (${validMimeTypes
      .map((type) => type.split('/')[1])
      .join(', ')})`,
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
      message: `Dung lượng ảnh bãi đỗ xe phải nhỏ hơn hoặc bằng ${maxSize / (1024 * 1024)}MB.`,
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
      message: `Định dạng ảnh bãi đỗ xe đạp không hợp lệ. (${validMimeTypes
        .map((type) => type.split('/')[1])
        .join(', ')})`,
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
      message: `Dung lượng ảnh bãi đỗ xe đạp phải nhỏ hơn hoặc bằng ${maxSize / (1024 * 1024)}MB.`,
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
  addFacilityAtIndex: (index: number) => void
}

function getFileNameFromValue(value: FormCreateValues['parkingImg'] | FormUpdateValues['parkingImg']) {
  if (typeof value === 'string') return value
  if (value instanceof File) return value.name
  return ''
}

function boolToRadio(value: boolean): '0' | '1' {
  return value ? '1' : '0'
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
      keyFunction: { value: '0', label: 'Không sử dụng' },
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
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormControl>
                <CustomSelectClean
                  customClassMain={cn(
                    'h-14 border hover:bg-white disabled:bg-gray',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.keyFunction,
                    },
                  )}
                  option={KEY_FUNCTION_OPTIONS}
                  selected={value}
                  change={onChange}
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
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="share_place_flag2-create" />
                    <Label htmlFor="share_place_flag2-create" className="text-[1.4rem]">
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
                <CustomRadio onValueChange={field.onChange} value={field.value.toString()}>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="0" id="deliverybox_flag1-create" />
                    <Label htmlFor="deliverybox_flag1-create" className="text-[1.4rem]">
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="deliverybox_flag2-create" />
                    <Label htmlFor="deliverybox_flag2-create" className="text-[1.4rem]">
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
                <CustomRadio onValueChange={field.onChange} value={field.value.toString()}>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="0" id="parking_flag1-create" />
                    <Label htmlFor="parking_flag1-create" className="text-[1.4rem]">
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="parking_flag2-create" />
                    <Label htmlFor="parking_flag2-create" className="text-[1.4rem]">
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
                    label="Chọn"
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
                      Không
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 w-[6rem]">
                    <CustomRadioItems value="1" id="bicycle_parking_flag2-create" />
                    <Label htmlFor="bicycle_parking_flag2-create" className="text-[1.4rem]">
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
                    label="Chọn"
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

      <TableCell className="text-left" />
      <TableCell className="text-left" />

      <TableCell className="text-left">
        <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
          <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">Lưu</span>
        </NButton>
      </TableCell>
    </TableFormRow>
  )
}

function UpdateFacilityRow({
  facility,
  index,
  handleUpdate,
  addFacilityAtIndex,
}: UpdateFacilityRowProps) {
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
      keyFunction: {
        value: boolToRadio(facility.keyFunction),
        label: boolToRadio(facility.keyFunction),
      },
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
      keyFunction: {
        value: boolToRadio(facility.keyFunction),
        label: boolToRadio(facility.keyFunction),
      },
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
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormControl>
                <CustomSelectClean
                  customClassMain={cn(
                    'h-14 border hover:bg-white disabled:bg-gray',
                    {
                      'border-red-500 focus:outline-red-500 focus-visible:outline-red-500':
                        errors.keyFunction,
                    },
                  )}
                  option={KEY_FUNCTION_OPTIONS}
                  selected={value}
                  change={onChange}
                  disabledSelect={isSuspended}
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
                    label="Chọn"
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
                    label="Chọn"
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

      <TableCell className="text-left">{format(new Date(facility.updatedAt), 'yyyy/MM/dd')}</TableCell>
      <TableCell className="text-left">{facility.updatedByName ?? (facility as Facility & { updatedBy?: string | null }).updatedBy ?? ''}</TableCell>

      <TableCell className="text-left">
        <div className="flex flex-wrap justify-between gap-[.5rem] min-w-[18rem]">
          <div className="flex flex-wrap gap-[.5rem]">
            {facility.dataStatus !== 0 ? (
              <>
                <NButton className="bg-gray w-auto min-w-fit h-auto" type="submit">
                  <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">Cập nhật</span>
                </NButton>
                <CustomDialog
                  customClass="text-center [&_svg]:hidden z-[99999]"
                  size="medium"
                  customClassContent="max-w-[50rem]"
                  trigger={
                    <Button
                      variant="outline"
                      className="bg-gray px-0 w-auto min-w-fit h-auto btn btn-default"
                    >
                      <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">Tạm ngưng</span>
                    </Button>
                  }
                  title="Bạn có muốn tạm ngưng sử dụng?"
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
                        <div className="mx-4 w-[12.4rem] bg-[#8bd08e] btn btn-default">
                          <span>Xác nhận</span>
                        </div>
                      </DialogClose>
                      <DialogClose>
                        <div className="mx-4 w-[12.4rem] bg-[#eee] btn btn-default">
                          <span>Hủy</span>
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
                  <Button
                    variant="outline"
                    className="bg-gray px-0 w-auto min-w-fit h-auto btn btn-default"
                  >
                    <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">Kích hoạt lại</span>
                  </Button>
                }
                title="Bạn có muốn kích hoạt lại?"
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
                      <div className="mx-4 w-[12.4rem] bg-[#8bd08e] btn btn-default">
                        <span>Xác nhận</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="mx-4 w-[12.4rem] bg-[#eee] btn btn-default">
                        <span>Hủy</span>
                      </div>
                    </DialogClose>
                  </div>
                }
              />
            )}
          </div>

          <div className="flex gap-[.5rem]">
            <NButton className="bg-gray w-auto h-auto" type="button" onClick={() => addFacilityAtIndex(index + 1)}>
              <span className="text-[1.4rem] leading-[1.4rem] whitespace-nowrap">Thêm dòng</span>
            </NButton>
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
      toast.success('Thành công.')
      toast.success('Thành công.')
    },
    onError(error) {
      toast.error(getErrorMessage(error))
    },
  })

  const { mutate: updateFacility, isPending: isPendingUpdate } = useUpdateFacility({
    onSuccess() {
      refetch()
      if (currentOperationType === 0) {
        toast.success('Cập nhật thành công.')
        toast.success('Cập nhật thành công.')
      } else if (currentOperationType === 1) {
        toast.success('Đã tạm ngưng cửa hàng.')
      } else if (currentOperationType === 2) {
        toast.success('Đã kích hoạt lại cửa hàng.')
      }
    },
    onError(error) {
      toast.error(getErrorMessage(error))
    },
  })

  const { mutate: updateFacilityOrder, isPending: isPendingUpdateOrder } = useUpdateFacilityOrder({
    onSuccess() {
      refetch()
      toast.success('Đã cập nhật thứ tự.')
      toast.success('Đã cập nhật thứ tự.')
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
      keyFunction: radioToBool(data.keyFunction.value),
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
      keyFunction: radioToBool(data.keyFunction.value),
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

  const handleUpdateOrderNum = () => {
    const payload = facilities.map((facility, index) => ({
      facilityId: facility.facilityId,
      orderNum: index + 1,
    }))
    updateFacilityOrder(payload)
  }

  const isPageLoading =
    isLoading || isPendingUpdate || isPendingCreate || isPendingUpdateOrder

  return (
    <>
      {isPageLoading ? <Loading /> : null}

      <div className="pt-[2.6rem] pb-[12rem] areas-setting-page common-container">
        <div className="flex items-center h-[4.7rem] bg-white font-bold text-[2.3rem] before:content-[''] before:bg-primary before:w-[.4rem] before:h-full">
          <span className="ml-[1.5rem]">Quản lý cơ sở</span>
        </div>

        <div className="flex justify-end mt-[2.4rem]">
          <div className="flex flex-wrap gap-[2.4rem] group-button">
            <NButton className="bg-gray w-[16rem] h-[4rem]" onClick={() => addFacilityAtIndex(0)}>
              <span className="text-[1.4rem] leading-[1.4rem]">Thêm</span>
            </NButton>
            <NButton className="bg-gray w-[16rem] h-[4rem]" onClick={handleUpdateOrderNum}>
              <span className="text-[1.4rem] leading-[1.4rem]">Cập nhật thứ tự</span>
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
                <TableHead className="min-w-[6.5rem] h-[5.6rem]  text-[1.6rem] text-center">Mã</TableHead>
                <TableHead className="min-w-[15rem] h-[5.6rem] text-[1.6rem] text-center">Tên cửa hàng</TableHead>
                <TableHead className="min-w-[15rem] h-[5.6rem] text-[1.6rem] text-center">Tên cửa hàng (Tiếng Anh)</TableHead>
                <TableHead className="min-w-[20rem] h-[5.6rem] text-[1.6rem] text-center">Địa chỉ</TableHead>
                <TableHead className="min-w-[20rem] h-[5.6rem] text-[1.6rem] text-center">Địa chỉ (Tiếng Anh)</TableHead>
                <TableHead className="min-w-[20rem] h-[5.6rem] text-[1.6rem] text-center">Ghi chú</TableHead>
                <TableHead className="min-w-[13rem] h-[5.6rem] text-[1.6rem] text-center">Khóa dọn phòng</TableHead>
                <TableHead className="min-w-[8rem] h-[5.6rem] text-[1.6rem] text-center">Màu nền</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">Cho thú cưng</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">Hộp thư</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">Bãi xe ô tô</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">Bãi xe đạp</TableHead>
                <TableHead className="min-w-[9rem] h-[5.6rem] text-[1.6rem] text-center">Ngày cập nhật</TableHead>
                <TableHead className="min-w-[13rem] h-[5.6rem] text-[1.6rem] text-center">Người cập nhật</TableHead>
                <TableHead className="min-w-[24rem] h-[5.6rem] text-[1.6rem] text-center">Thao tác dòng</TableHead>
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
                    addFacilityAtIndex={addFacilityAtIndex}
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
