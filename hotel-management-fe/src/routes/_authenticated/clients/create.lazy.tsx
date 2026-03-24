import { zodResolver } from '@hookform/resolvers/zod'
import { DialogClose } from '@radix-ui/react-dialog'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { NButton } from '@/components/ui/new-button'

import { useCreateClient } from '@/hooks/mutations/useCreateClient'
import { ClientDataType, SexType } from '@/types/client'

export const Route = createLazyFileRoute('/_authenticated/clients/create')({
  component: ClientCreatePage,
})

const clientSchema = z.object({
  dataType: z.number().min(1).max(3),
  clientName: z.string().min(1, 'Tên khách hàng là bắt buộc').max(256),
  clientNameEn: z.string().max(256).optional(),
  birthday: z.string().optional(),
  sex: z.number().optional(),
  companyName: z.string().max(256).optional(),
  companyNameEn: z.string().max(256).optional(),
  email: z.string().email('Email không hợp lệ').max(256).optional().or(z.literal('')),
  zipCode: z.string().max(16).optional(),
  address1: z.string().max(256).optional(),
  address2: z.string().max(256).optional(),
  tel: z.string().max(32).optional(),
  telPhone: z.string().max(32).optional(),
  telEmergency: z.string().max(32).optional(),
  emergencyRelation: z.string().max(256).optional(),
  memo: z.string().max(1024).optional(),
  postpaidFlag: z.boolean().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

const dataTypeOptions = [
  { value: String(ClientDataType.INDIVIDUAL), text: 'Cá nhân' },
  { value: String(ClientDataType.CORPORATION), text: 'Doanh nghiệp' },
  { value: String(ClientDataType.SPECIAL_CORPORATION), text: 'DN đặc biệt' },
]

const sexOptions = [
  { value: String(SexType.MALE), text: 'Nam' },
  { value: String(SexType.FEMALE), text: 'Nữ' },
  { value: String(SexType.OTHER), text: 'Khác' },
]

function ClientCreatePage() {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      dataType: ClientDataType.INDIVIDUAL,
      clientName: '',
      sex: SexType.OTHER,
      postpaidFlag: false,
    },
  })

  const createClientMutation = useCreateClient({
    onSuccess: () => {
      toast.success('Tạo khách hàng thành công')
      navigate({ to: '/clients' })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo khách hàng')
    },
  })

  const dataType = form.watch('dataType')
  const isIndividual = dataType === ClientDataType.INDIVIDUAL

  const confirmCreate = () => {
    const values = form.getValues()
    createClientMutation.mutate({
      ...values,
      email: values.email || undefined,
    })
    setIsConfirmOpen(false)
  }

  return (
    <div className="box-border flex flex-col gap-[2.3rem] py-[2.3rem] common-container">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">Tạo khách hàng</div>
        </div>
        <NButton onClick={() => navigate({ to: '/clients' })}>Quay lại</NButton>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {
            setIsConfirmOpen(true)
          })}
        >
          <CustomAccordion type="multiple" className="w-full" defaultValue={['item-1']}>
            <CustomAccordionItem
              className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
              value="item-1"
            >
              <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                <div className="font-bold text-black text-[1.8rem]">Thông tin khách hàng</div>
              </CustomAccordionTrigger>
              <CustomAccordionContent className="pb-0">
                <div className="flex flex-col px-[2rem] py-[1rem] gap-4">
                  {/* Data Type */}
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-2 text-right">
                      Loại <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-10">
                      <FormField
                        control={form.control}
                        name="dataType"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomRadio
                                value={String(field.value)}
                                onValueChange={(val) => field.onChange(Number(val))}
                                className="flex flex-row gap-4"
                              >
                                {dataTypeOptions.map((opt) => (
                                  <div key={opt.value} className="flex items-center gap-2">
                                    <CustomRadioItems value={opt.value} />
                                    <span>{opt.text}</span>
                                  </div>
                                ))}
                              </CustomRadio>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-2 text-right">
                      {isIndividual ? 'Họ tên' : 'Người liên hệ'}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomInput {...field} placeholder="Nhập họ tên" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {!isIndividual && (
                      <>
                        <Label className="col-span-2 text-right">Tên công ty</Label>
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <CustomInput {...field} placeholder="Tên công ty" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Birthday & Sex */}
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-2 text-right">Ngày sinh</Label>
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="birthday"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomInput {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Label className="col-span-2 text-right">Giới tính</Label>
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomRadio
                                value={String(field.value)}
                                onValueChange={(val) => field.onChange(Number(val))}
                                className="flex flex-row gap-4"
                              >
                                {sexOptions.map((opt) => (
                                  <div key={opt.value} className="flex items-center gap-2">
                                    <CustomRadioItems value={opt.value} />
                                    <span>{opt.text}</span>
                                  </div>
                                ))}
                              </CustomRadio>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-2 text-right">Email</Label>
                    <div className="col-span-10">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomInput
                                {...field}
                                type="email"
                                placeholder="example@email.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-2 text-right">Địa chỉ</Label>
                    <div className="col-span-10">
                      <FormField
                        control={form.control}
                        name="address1"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomInput {...field} placeholder="Tỉnh/Thành phố, Quận/Huyện" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <Label className="col-span-2 text-right">ĐT (Di động)</Label>
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="telPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomInput {...field} placeholder="0901-xxx-xxx" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Label className="col-span-2 text-right">ĐT (Nhà)</Label>
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="tel"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomInput {...field} placeholder="028-xxxx-xxxx" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Memo */}
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <Label className="col-span-2 text-right pt-2">Ghi chú</Label>
                    <div className="col-span-10">
                      <FormField
                        control={form.control}
                        name="memo"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <CustomTextarea
                                {...field}
                                rows={4}
                                placeholder="Ghi chú về khách hàng..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CustomAccordionContent>
            </CustomAccordionItem>
          </CustomAccordion>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <CustomDialog
              opened={isConfirmOpen}
              changeOnOpened={setIsConfirmOpen}
              customClass="text-center [&_svg]:hidden"
              size="max"
              trigger={
                <NButton
                  type="submit"
                  className="bg-[#8BD08E] hover:bg-[#7bc07e] px-8"
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? 'Đang xử lý...' : 'Tạo mới'}
                </NButton>
              }
              title="Xác nhận tạo khách hàng"
              content={
                <div className="p-4">
                  <p>Bạn có chắc chắn muốn tạo khách hàng này?</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <DialogClose onClick={confirmCreate}>
                      <div className="bg-[#8BD08E] mx-4 w-[12.4rem] btn btn-default">
                        <span>Thực hiện</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[12.4rem] btn btn-default">
                        <span>Hủy</span>
                      </div>
                    </DialogClose>
                  </div>
                </div>
              }
            />
            <NButton type="button" onClick={() => navigate({ to: '/clients' })}>
              Hủy
            </NButton>
          </div>
        </form>
      </Form>
    </div>
  )
}
