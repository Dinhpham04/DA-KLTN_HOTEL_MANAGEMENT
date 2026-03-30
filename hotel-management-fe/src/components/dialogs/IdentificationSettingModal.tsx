import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type * as React from 'react'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomInput } from '@/components/common/CustomInput'
import { CloseCommonWhite } from '@/components/svgs/CloseCommonWhite'
import { NButton } from '@/components/ui/new-button'
import { IdentificationsConst, regexHtml, regexIcon, regexSQL, regexUrl } from '@/constants/common'
import { useCreateIdentification } from '@/hooks/mutations/useCreateIdentification'
import { useUpdateIdentification } from '@/hooks/mutations/useUpdateIdentification'
import { useUploadImage } from '@/hooks/mutations/useUploadImage'
import { cn } from '@/lib/utils'
import { isEmpty } from '@/misc/type-guard.misc'
import type { Identification } from '@/types/identification'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import { z } from 'zod'

const typeDummyArr = [
  {
    id: '1',
    value: IdentificationsConst.license.value,
    name: IdentificationsConst.license.label,
  },
  {
    id: '2',
    value: IdentificationsConst.passport.value,
    name: IdentificationsConst.passport.label,
  },
  {
    id: '3',
    value: IdentificationsConst.other.value,
    name: IdentificationsConst.other.label,
  },
]

interface IdentificationFormItem {
  id?: string
  identificationId?: number
  clientId?: number
  identificationInputType?: number
  imageUrl?: string
  imagePath: string | null
  active: number
  identificationType?: number
  identificationTypeInput?: string | null
  identificationNumber: string
  fileImg?: File | null
  expirationDate: string | Date | null
}

const defaultValue: IdentificationFormItem = {
  active: 1,
  identificationTypeInput: '',
  clientId: undefined,
  expirationDate: '',
  identificationInputType: undefined,
  fileImg: null,
  identificationNumber: '',
  identificationId: undefined,
  imagePath: null,
  identificationType: undefined,
  imageUrl: '',
  id: undefined,
}

const FormSchemaIdentifications = z
  .object({
    identifications: z.array(
      z.object({
        id: z.string().optional(),
        identificationId: z.number().optional(),
        clientId: z.number().optional(),
        identificationInputType: z.number().optional(),
        imageUrl: z.string().optional(),
        imagePath: z.string().nullable(),
        active: z.number(),
        identificationType: z.number().optional(),
        identificationTypeInput: z.string().optional().nullable(),
        identificationNumber: z.string(),
        fileImg: z.instanceof(File, { message: 'File is required' }).nullable().optional(),
        expirationDate: z.union([z.string().nullable(), z.date().nullable()]),
      })
    ),
  })
  .superRefine(({ identifications }, ctx) => {
    identifications.forEach((i, index) => {
      if (
        i?.identificationType ||
        i?.identificationInputType ||
        i?.fileImg ||
        i?.identificationNumber ||
        i?.expirationDate
      ) {
        if (!i?.identificationType) {
          ctx.addIssue({
            code: 'custom',
            path: [`identifications.${index}.identificationType`],
            message: 'Loại giấy tờ là bắt buộc',
          })
        }
        if (
          i?.identificationType?.toString() === IdentificationsConst.other.value &&
          !i?.identificationTypeInput &&
          i?.identificationTypeInput !== null &&
          i?.identificationTypeInput !== undefined
        ) {
          ctx.addIssue({
            code: 'custom',
            path: [`identifications.${index}.identificationTypeInput`],
            message: 'Chi tiết loại khác là bắt buộc',
          })
        } else if (i?.identificationTypeInput && i?.identificationTypeInput?.length > 32) {
          ctx.addIssue({
            code: 'custom',
            path: [`identifications.${index}.identificationTypeInput`],
            message: 'Chi tiết không được quá 32 ký tự',
          })
        } else if (
          regexHtml.test(i?.identificationTypeInput ?? '') ||
          regexSQL.test(i?.identificationTypeInput ?? '') ||
          regexUrl.test(i?.identificationTypeInput ?? '') ||
          regexIcon.test(i?.identificationTypeInput ?? '') ||
          /^\s+$/.test(i?.identificationTypeInput ?? '')
        ) {
          ctx.addIssue({
            code: 'custom',
            path: [`identifications.${index}.identificationTypeInput`],
            message: 'Định dạng không hợp lệ',
          })
        }

        if (!i?.identificationNumber) {
          ctx.addIssue({
            code: 'custom',
            path: [`identifications.${index}.identificationNumber`],
            message: 'Số giấy tờ là bắt buộc',
          })
        } else {
          if (i.identificationNumber.length > 32) {
            ctx.addIssue({
              code: 'custom',
              path: [`identifications.${index}.identificationNumber`],
              message: 'Số giấy tờ không được quá 32 ký tự',
            })
          } else if (
            regexHtml.test(i.identificationNumber) ||
            regexSQL.test(i.identificationNumber) ||
            regexUrl.test(i.identificationNumber) ||
            regexIcon.test(i.identificationNumber) ||
            /^\s+$/.test(i.identificationNumber)
          ) {
            ctx.addIssue({
              code: 'custom',
              path: [`identifications.${index}.identificationNumber`],
              message: 'Định dạng số giấy tờ không hợp lệ',
            })
          }
        }
        if (!i?.expirationDate) {
          ctx.addIssue({
            code: 'custom',
            path: [`identifications.${index}.expirationDate`],
            message: 'Ngày hết hạn là bắt buộc',
          })
        } else if (i.expirationDate) {
          const expirationDate = new Date(i.expirationDate)
          const today = new Date()
          if (expirationDate < today) {
            ctx.addIssue({
              code: 'custom',
              path: [`identifications.${index}.expirationDate`],
              message: 'Giấy tờ đã hết hạn',
            })
          }
        }
        if (i.fileImg) {
          const validFormats = ['image/png', 'image/jpg', 'image/jpeg']
          if (!validFormats.includes(i.fileImg.type)) {
            ctx.addIssue({
              code: 'custom',
              path: [`identifications.${index}.imageUrl`],
              message: 'Vui lòng tải lên file ảnh png, jpg hoặc jpeg',
            })
          }
          if (i.fileImg.size > 5 * 1024 * 1024) {
            ctx.addIssue({
              code: 'custom',
              path: [`identifications.${index}.imageUrl`],
              message: 'File ảnh không được quá 5MB',
            })
          }
        }
      }
    })
  })

export type TypeFormSchemaIdentifications = z.infer<typeof FormSchemaIdentifications>

interface IdentificationSettingModalProps {
  identification?: Identification[]
  readonly?: boolean
  onSubmitForm?: (data: IdentificationFormItem[]) => void
  setIsHidden?: Dispatch<SetStateAction<boolean>>
  clientId?: number
  refetchClient?: () => void
  closeModal?: () => void
}

const IdentificationSettingModal: React.FC<IdentificationSettingModalProps> = ({
  identification,
  readonly,
  onSubmitForm,
  setIsHidden,
  clientId,
  refetchClient,
  closeModal,
}) => {
  const convertToFormItem = (item?: Identification): IdentificationFormItem => {
    if (!item) return defaultValue
    return {
      id: item.identificationId?.toString(),
      identificationId: item.identificationId,
      clientId: item.clientId,
      identificationInputType: item.identificationInputType ?? undefined,
      imageUrl: item.imagePath ?? '',
      imagePath: item.imagePath,
      active: item.active ? 1 : 0,
      identificationType: item.identificationType,
      identificationTypeInput: item.identificationTypeInput,
      identificationNumber: item.identificationNumber ?? '',
      fileImg: null,
      expirationDate: item.expirationDate ?? '',
    }
  }

  const isItemChanged = (item: IdentificationFormItem, original?: Identification): boolean => {
    if (!original) return true
    const origDate = original.expirationDate
      ? dayjs(original.expirationDate).format('YYYY-MM-DD')
      : ''
    const newDate = item.expirationDate
      ? dayjs(item.expirationDate).format('YYYY-MM-DD')
      : ''
    return (
      item.identificationType !== original.identificationType ||
      (item.identificationTypeInput ?? '') !== (original.identificationTypeInput ?? '') ||
      item.identificationNumber !== (original.identificationNumber ?? '') ||
      newDate !== origDate ||
      (original.active ? 1 : 0) !== item.active ||
      item.fileImg !== null ||
      item.imagePath !== original.imagePath
    )
  }

  const form = useForm<TypeFormSchemaIdentifications>({
    mode: 'all',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(FormSchemaIdentifications),
    defaultValues: {
      identifications: Array.from(
        { length: 2 },
        (_, index) => convertToFormItem(identification?.[index]) || defaultValue
      ),
    },
  })

  useEffect(() => {
    function onScrollHandle(e: Event) {
      // Don't hide modal if interacting with calendar
      const target = e.target as HTMLElement
      if (
        target.closest('.react-datetime-picker__calendar') ||
        target.closest('.react-calendar')
      ) {
        return
      }
      setIsHidden?.(true)
    }

    window.addEventListener('scroll', onScrollHandle)
    window.addEventListener('wheel', onScrollHandle)
    return () => {
      window.removeEventListener('scroll', onScrollHandle)
      window.removeEventListener('wheel', onScrollHandle)
    }
  }, [setIsHidden])

  const { fields: identifications } = useFieldArray({
    control: form.control,
    name: 'identifications',
  })

  const watchIdentificationTypes = form
    .watch('identifications')
    ?.map((item) => item.identificationType)

  const createMutation = useCreateIdentification({
    onSuccess() {
      toast.success('Tạo giấy tờ thành công')
      refetchClient?.()
    },
    onError(error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    },
  })

  const updateMutation = useUpdateIdentification({
    onSuccess() {
      toast.success('Cập nhật giấy tờ thành công')
      refetchClient?.()
    },
    onError(error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    },
  })

  const uploadMutation = useUploadImage()

  const onSubmit = async (data: TypeFormSchemaIdentifications) => {
    if (!onSubmitForm && !clientId) return
    const valid = await form.trigger()
    if (!valid) return

    setIsUploading(true)

    try {
      const newData: IdentificationFormItem[] = []

      for (const item of data.identifications) {
        // Skip empty items
        if (
          isEmpty(item?.identificationType) &&
          isEmpty(item?.identificationInputType) &&
          isEmpty(item?.identificationNumber) &&
          isEmpty(item?.expirationDate)
        ) {
          continue
        }

        let imagePath = item.imagePath

        // Upload image if fileImg exists
        if (item.fileImg) {
          try {
            const uploadResponse = await uploadMutation.mutateAsync({
              file: item.fileImg,
              subfolder: 'identifications',
            })
            imagePath = uploadResponse.url
          } catch {
            toast.error('Lỗi khi tải ảnh lên. Vui lòng thử lại.')
            setIsUploading(false)
            return
          }
        }

        newData.push({
          ...item,
          imagePath,
          expirationDate: item.expirationDate
            ? `${dayjs(item.expirationDate).format('YYYY-MM-DD')}`
            : '',
        })
      }

      if (clientId) {
        for (const item of newData) {
          if (item.identificationId) {
            // Chỉ update nếu dữ liệu thực sự thay đổi
            const originalItem = identification?.find(
              (orig) => orig.identificationId === item.identificationId
            )
            if (!isItemChanged(item, originalItem)) continue

            updateMutation.mutate({
              identificationId: item.identificationId,
              identificationType: item.identificationType,
              identificationTypeInput: item.identificationTypeInput ?? undefined,
              identificationInputType: item.identificationInputType,
              identificationNumber: item.identificationNumber,
              expirationDate: item.expirationDate as string,
              active: item.active === 1,
              imagePath: item.imagePath ?? undefined,
            })
          } else if (item.identificationType) {
            // Create new
            createMutation.mutate({
              clientId,
              data: {
                identificationType: item.identificationType,
                identificationTypeInput: item.identificationTypeInput ?? undefined,
                identificationInputType: item.identificationInputType,
                identificationNumber: item.identificationNumber,
                expirationDate: item.expirationDate as string,
                active: item.active === 1,
                imagePath: item.imagePath ?? undefined,
              },
            })
          }
        }
        closeModal?.()
      }
      onSubmitForm?.(newData)
    } finally {
      setIsUploading(false)
    }
  }

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const openFileDialog = (index: number) => {
    const input = document.getElementById(`file-upload-${index}`) as HTMLInputElement
    input?.click()
  }

  const setFile = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      form.setValue(`identifications.${index}.fileImg`, file)
      form.setValue(`identifications.${index}.imageUrl`, URL.createObjectURL(file))
      form.clearErrors(`identifications.${index}.imageUrl`)
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap font-bold text-[1.6rem] whitespace-nowrap">
          * Giấy tờ thứ 2 không bắt buộc nhập.
        </div>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {identifications?.map((item, index) => (
              <div key={item.id} className="mt-[2rem] reservation-period">
                <h5 className="items-center mb-2 font-bold text-[1.6rem]">
                  Giấy tờ{' '}
                  <span className="inline-flex justify-center items-center border border-[#00000078] rounded-full w-7 h-7 text-[1.4rem]">
                    {index + 1}
                  </span>
                </h5>

                <div className="px-4 border border-black rounded-[0.4rem]">
                  <div className="md:flex p-4">
                    <div className="flex items-center gap-[2rem]">
                      <span className="items-center font-bold text-[1.6rem] whitespace-nowrap">
                        Loại
                      </span>

                      <FormField
                        control={form.control}
                        name={`identifications.${index}.identificationType`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex">
                              <CustomRadio
                                value={`${field.value}`}
                                onValueChange={(value) => {
                                  field.onChange(Number.parseInt(value))
                                  // Reset identificationTypeInput when selecting non-"other" option
                                  if (value !== IdentificationsConst.other.value) {
                                    form.setValue(`identifications.${index}.identificationTypeInput`, '')
                                    form.clearErrors(`identifications.${index}.identificationTypeInput`)
                                  }
                                }}
                                className="flex"
                              >
                                {typeDummyArr.map((item, radioIndex) => (
                                  <FormItem
                                    key={`key_form${item.name}_item${radioIndex}`}
                                    className="flex items-center my-2 mr-[2.4rem] last:mr-1 whitespace-nowrap"
                                  >
                                    <FormControl>
                                      <CustomRadioItems
                                        disabled={readonly}
                                        value={`${item.value}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="flex items-center !mt-0 ml-3 text-[1.6rem] cursor-pointer">
                                      {item.name}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </CustomRadio>
                            </div>
                            <FormMessage className="text-red-500 text-xl" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-1 items-center pt-4 md:pt-0">
                      <div className="flex items-center pr-8 w-3/4">
                        <FormField
                          control={form.control}
                          name={`identifications.${index}.identificationTypeInput`}
                          render={({ field: { value, onChange } }) => (
                            <FormItem className="my-4 w-[28.5rem]">
                              <div className="flex items-center">
                                <CustomInput
                                  placeholder="Nhập chi tiết nếu chọn Khác"
                                  className="disabled:bg-[#D9D9D9] !opacity-100 w-full"
                                  disabled={
                                    readonly ||
                                    watchIdentificationTypes?.[index]?.toString() !==
                                    IdentificationsConst.other.value
                                  }
                                  value={value ?? ''}
                                  onChange={onChange}
                                  onBlur={(e) => onChange(e.target.value?.trim())}
                                />
                              </div>
                              <FormMessage className="text-red-500 text-xl" />
                            </FormItem>
                          )}
                        />
                      </div>
                      {!readonly && (
                        <NButton
                          onClick={() => {
                            form.setValue(
                              `identifications.${index}`,
                              identifications?.[index]
                                ? {
                                  ...identifications[index],
                                  expirationDate: '',
                                  identificationTypeInput: '',
                                  active: 1,
                                  identificationInputType: undefined,
                                  fileImg: null,
                                  identificationNumber: '',
                                  identificationType: undefined,
                                  imageUrl: '',
                                  imagePath: null,
                                }
                                : defaultValue
                            )
                            form.clearErrors('identifications')
                          }}
                          type="button"
                          className="bg-[#D9D9D9] ml-auto w-[8rem]"
                        >
                          Xóa
                        </NButton>
                      )}
                    </div>
                  </div>
                  <div className="md:flex justify-between p-4">
                    <div className="flex flex-1 items-center">
                      <label
                        htmlFor="area"
                        className="w-[11rem] font-bold text-[1.6rem] text-black"
                      >
                        Ảnh giấy tờ
                      </label>
                      <div className="flex items-center w-3/4">
                        <div className="flex items-center w-full text-[1.6rem]">
                          <FormItem
                            className={cn(
                              'relative flex items-center border border-black rounded-md w-fit min-w-[20rem] max-w-full min-h-[3.6rem]'
                            )}
                          >
                            <FormLabel
                              onClick={() => openFileDialog(index)}
                              className={cn(
                                'flex justify-center items-center bg-gray hover:opacity-60 w-[5.5rem] h-[3.5rem] !font-semibold text-[1.4rem] text-black transition-all duration-300 cursor-pointer',
                                readonly && 'pointer-events-none'
                              )}
                            >
                              Chọn
                            </FormLabel>
                            <input
                              accept="image/png, image/gif, image/jpeg, image/webp"
                              type="file"
                              id={`file-upload-${index}`}
                              style={{ display: 'none' }}
                              onChange={(e) => setFile(index, e)}
                            />

                            <div className="!mt-0 rounded-3xl image-preview">
                              <FormField
                                control={form.control}
                                name={`identifications.${index}.imageUrl`}
                                render={({ field: { value }, formState: { errors } }) => (
                                  <>
                                    {value && (
                                      <img
                                        className="w-96 h-64 object-cover hover:opacity-90 transition-all duration-200 cursor-zoom-in"
                                        src={value}
                                        alt="Preview"
                                        onClick={() => setPreviewImageUrl(value)}
                                        onKeyDown={(e) =>
                                          e.key === 'Enter' && setPreviewImageUrl(value)
                                        }
                                      />
                                    )}
                                    {errors && (
                                      <FormMessage className="-bottom-8 left-0 absolute text-red-500 text-xl whitespace-nowrap">
                                        {errors?.identifications?.[index]?.imageUrl?.message}
                                      </FormMessage>
                                    )}
                                  </>
                                )}
                              />
                            </div>
                          </FormItem>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:flex justify-between p-4">
                    <div className="flex items-center w-[100%]">
                      <label
                        htmlFor="area"
                        className="w-[11rem] font-bold text-[1.6rem] text-black"
                      >
                        Số giấy tờ
                      </label>
                      <div className="flex items-center">
                        <FormField
                          control={form.control}
                          name={`identifications.${index}.identificationNumber`}
                          render={({ field: { onChange, value } }) => (
                            <FormItem className="my-4">
                              <div className="flex items-center w-[20rem]">
                                <CustomInput
                                  onBlur={(e) => onChange(e.target.value?.trim())}
                                  placeholder="Nhập số giấy tờ"
                                  disabled={readonly}
                                  className="disabled:bg-[#D9D9D9] !opacity-100 w-full"
                                  value={value}
                                  inputMode="numeric"
                                  lang="en"
                                  onChange={onChange}
                                />
                              </div>
                              <FormMessage className="text-red-500 text-xl" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex items-center w-fit">
                      <label htmlFor="area" className="w-[12rem] font-bold text-[1.6rem] text-black">
                        Ngày hết hạn
                      </label>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <FormField
                            control={form.control}
                            name={`identifications.${index}.expirationDate`}
                            render={({ field: { onChange, value } }) => (
                              <FormItem className={cn()}>
                                <FormControl>
                                  <CustomDatePicker
                                    disable={readonly}
                                    change={onChange}
                                    value={value}
                                    format="yyyy/MM/dd"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xl" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!readonly && (
              <div className="group-button flex justify-center mt-[2rem]">
                <div className="flex gap-[2rem]">
                  <NButton
                    type="button"
                    disabled={isUploading || !form.formState.isDirty}
                    onClick={() => {
                      onSubmit(form.getValues())
                    }}
                    className="bg-[#D9D9D9] w-[14rem]"
                  >
                    {isUploading ? 'Đang tải...' : 'Cập nhật'}
                  </NButton>
                </div>
              </div>
            )}
          </form>
        </FormProvider>
        {previewImageUrl && (
          <div
            className="fixed top-[5rem] inset-0 z-[9999] bg-black flex items-center justify-center"
            onClick={() => setPreviewImageUrl(null)}
            onKeyDown={(e) => e.key === 'Escape' && setPreviewImageUrl(null)}
          >
            <img
              src={previewImageUrl}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-md"
              alt="Preview"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <div className="top-6 right-6 absolute">
              <div
                onClick={() => setPreviewImageUrl(null)}
                onKeyDown={(e) => e.key === 'Enter' && setPreviewImageUrl(null)}
                className="z-[9999] flex justify-center items-center bg-[#606060] hover:opacity-60 rounded-full w-10 h-10 transition-all duration-300 cursor-pointer"
              >
                <CloseCommonWhite width={15} height={15} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default IdentificationSettingModal
