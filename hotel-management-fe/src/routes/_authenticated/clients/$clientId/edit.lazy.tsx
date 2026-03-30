import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useDocumentTitle } from 'usehooks-ts'
import { z } from 'zod'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import CustomSelect from '@/components/common/CustomSelect'
import type { Option } from '@/components/common/CustomSelectClean'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import Loading from '@/components/common/Loading'
import IdentificationSettingModal from '@/components/dialogs/IdentificationSettingModal'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { NButton } from '@/components/ui/new-button'

import { DataType, regexHtml, regexIcon, regexSQL, regexUrl } from '@/constants/common'
import { useUpdateClient } from '@/hooks/mutations/useUpdateClient'
import { useGetClientById } from '@/hooks/queries/useGetClientById'
import { useGetCountries } from '@/hooks/queries/useGetCountries'
import { useGetIdentifications } from '@/hooks/queries/useGetIdentifications'
import i18n from '@/i18n'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_authenticated/clients/$clientId/edit')({
  component: ClientEditPage,
})

const typeDummyArr = [
  { id: '1', value: '1', name: DataType[1] },
  { id: '2', value: '2', name: DataType[2] },
  { id: '3', value: '3', name: DataType[3] },
]

const sexArr = [
  { id: '1', value: '1', name: 'Nam' },
  { id: '2', value: '2', name: 'Nữ' },
  { id: '9', value: '9', name: 'Khác' },
]

const UsedMessyLevelOption: Option[] = [
  { label: 'Sạch', value: '0' },
  { label: 'Bẩn', value: '1' },
]

const FormSchemaContact = z
  .object({
    data_type: z.string(),
    client_id: z.string().optional(),
    use_count: z.string().optional(),
    used_messy_level: z.object({
      label: z.string(),
      value: z.string(),
    }),
    client_name: z
      .string()
      .max(256, {
        message: i18n.t('maxLength', { field: 'Tên', max: 256 }),
      })
      .optional(),
    contact_name: z
      .string()
      .max(256, {
        message: i18n.t('maxLength', { field: 'Người liên hệ', max: 256 }),
      })
      .optional(),
    company_name: z
      .string()
      .max(256, {
        message: i18n.t('maxLength', { field: 'Tên công ty', max: 256 }),
      })
      .optional(),
    sex: z.string().optional(),
    country_id: z.object({
      label: z.string(),
      value: z.string(),
    }),
    stay_duration_auto_flag: z.boolean(),
    advertising_type: z.boolean(),
    ug_flag: z.boolean(),
    postpaid_flag: z.boolean(),
    birthday: z.date().nullable(),
    memo: z
      .string()
      .max(1024, {
        message: i18n.t('maxLength', { field: 'Ghi chú', max: 1024 }),
      })
      .optional(),
    zip_code: z.string().max(10).optional(),
    company_zip_code: z.string().max(10).optional(),
    email: z.string().max(256).optional(),
    fax: z.string().max(16).nullable().optional(),
    address1: z.string().max(256).optional(),
    address2: z.string().max(256).optional(),
    company_address1: z.string().max(256).optional(),
    company_address2: z.string().max(256).optional(),
    tel_phone: z.string().optional(),
    tel: z.string().optional(),
    company_tel: z.string().optional(),
    tel_emergency: z.string().optional(),
    emargency_relation: z.string().max(32).optional(),
  })
  .superRefine((data, ctx) => {
    const {
      address1,
      address2,
      client_name,
      data_type,
      email,
      contact_name,
      company_name,
      company_address1,
      company_address2,
    } = data

    if (address1 && /^\s+$/.test(address1)) {
      ctx.addIssue({
        code: 'custom',
        path: ['address1'],
        message: i18n.t('pattern', { field: 'Tỉnh/Thành phố' }),
      })
    }

    if (address2 && /^\s+$/.test(address2)) {
      ctx.addIssue({
        code: 'custom',
        path: ['address2'],
        message: i18n.t('pattern', { field: 'Địa chỉ' }),
      })
    }

    if (company_address1 && /^\s+$/.test(company_address1)) {
      ctx.addIssue({
        code: 'custom',
        path: ['company_address1'],
        message: i18n.t('pattern', { field: 'Tỉnh/Thành phố (Công ty)' }),
      })
    }

    if (company_address2 && /^\s+$/.test(company_address2)) {
      ctx.addIssue({
        code: 'custom',
        path: ['company_address2'],
        message: i18n.t('pattern', { field: 'Địa chỉ (Công ty)' }),
      })
    }

    if (!client_name && data_type === '1') {
      ctx.addIssue({
        code: 'custom',
        path: ['client_name'],
        message: i18n.t('required', { field: 'Họ tên' }),
      })
    }

    if (!company_name && data_type !== '1') {
      ctx.addIssue({
        code: 'custom',
        path: ['company_name'],
        message: i18n.t('required', { field: 'Tên công ty' }),
      })
    }

    if (
      client_name &&
      (/^\s+$/.test(client_name) ||
        regexHtml.test(client_name) ||
        regexSQL.test(client_name) ||
        regexUrl.test(client_name) ||
        regexIcon.test(client_name))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['client_name'],
        message: i18n.t('pattern', { field: 'Họ tên' }),
      })
    }

    if (contact_name && /^\s+$/.test(contact_name)) {
      ctx.addIssue({
        code: 'custom',
        path: ['contact_name'],
        message: i18n.t('required', { field: 'Người liên hệ' }),
      })
    }

    if (
      contact_name &&
      (regexHtml.test(contact_name) ||
        regexSQL.test(contact_name) ||
        regexUrl.test(contact_name) ||
        regexIcon.test(contact_name))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['contact_name'],
        message: i18n.t('invalidType', { field: 'Người liên hệ' }),
      })
    }

    if (company_name && /^\s+$/.test(company_name)) {
      ctx.addIssue({
        code: 'custom',
        path: ['company_name'],
        message: i18n.t('required', { field: 'Tên công ty' }),
      })
    }

    if (
      company_name &&
      (regexHtml.test(company_name) ||
        regexSQL.test(company_name) ||
        regexUrl.test(company_name) ||
        regexIcon.test(company_name))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['company_name'],
        message: i18n.t('invalidType', { field: 'Tên công ty' }),
      })
    }

    if (email && z.string().email().safeParse(email).error) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: i18n.t('email'),
      })
    }

    if (
      address1 &&
      (regexHtml.test(address1) ||
        regexSQL.test(address1) ||
        regexUrl.test(address1) ||
        regexIcon.test(address1))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['address1'],
        message: i18n.t('pattern', { field: 'Tỉnh/Thành phố' }),
      })
    }

    if (
      address2 &&
      (regexHtml.test(address2) ||
        regexSQL.test(address2) ||
        regexUrl.test(address2) ||
        regexIcon.test(address2))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['address2'],
        message: i18n.t('pattern', { field: 'Địa chỉ' }),
      })
    }

    if (
      company_address1 &&
      (regexHtml.test(company_address1) ||
        regexSQL.test(company_address1) ||
        regexUrl.test(company_address1) ||
        regexIcon.test(company_address1))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['company_address1'],
        message: i18n.t('pattern', { field: 'Tỉnh/Thành phố (Công ty)' }),
      })
    }

    if (
      company_address2 &&
      (regexHtml.test(company_address2) ||
        regexSQL.test(company_address2) ||
        regexUrl.test(company_address2) ||
        regexIcon.test(company_address2))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['company_address2'],
        message: i18n.t('pattern', { field: 'Địa chỉ (Công ty)' }),
      })
    }

    if (!data_type) {
      ctx.addIssue({
        code: 'custom',
        path: ['data_type'],
        message: i18n.t('required', { field: 'Loại' }),
      })
    }
  })

export interface TypeFormClientSchemaContact extends z.infer<typeof FormSchemaContact> { }

function ClientEditPage() {
  useDocumentTitle('Chỉnh sửa khách hàng')
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clientId } = useParams({ from: '/_authenticated/clients/$clientId/edit' })
  const clientIdNum = Number(clientId)

  const [loading, setLoading] = useState<boolean>(true)
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)
  const [loadingCountry, setLoadingCountry] = useState<boolean>(true)
  const [countryOption, setCountryOption] = useState<Option[]>([])
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false)
  const [isIdentificationOpen, setIsIdentificationOpen] = useState(false)

  const { data: client, isLoading: isLoadingClient, refetch } = useGetClientById({ clientId: clientIdNum })
  const { data: identifications, refetch: refetchIdentifications } = useGetIdentifications({
    clientId: clientIdNum,
    enabled: !!clientIdNum,
  })
  const { data: dataCountries } = useGetCountries()

  useEffect(() => {
    if (dataCountries) {
      setCountryOption(
        dataCountries.map((item) => ({
          label: item.countryName,
          value: String(item.countryId),
        }))
      )
      setLoadingCountry(false)
    }
  }, [dataCountries])

  const updateClientMutation = useUpdateClient({
    onSuccess: () => {
      // Invalidate clients list query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success(t('client.update.success', 'Cập nhật khách hàng thành công'))
      navigate({ to: '/clients' })
    },
    onError: () => {
      toast.error(t('client.update.error', 'Có lỗi xảy ra khi cập nhật khách hàng'))
      setLoadingSubmit(false)
    },
  })

  const form = useForm<TypeFormClientSchemaContact>({
    mode: 'all',
    resolver: zodResolver(FormSchemaContact),
    defaultValues: {
      data_type: typeDummyArr[0].value,
      client_id: '',
      client_name: '',
      contact_name: '',
      company_name: '',
      birthday: null,
      sex: '',
      country_id: { label: '', value: '' },
      address1: '',
      address2: '',
      email: '',
      fax: '',
      tel: '',
      tel_phone: '',
      tel_emergency: '',
      zip_code: '',
      company_zip_code: '',
      company_address1: '',
      company_address2: '',
      company_tel: '',
      use_count: '0',
      stay_duration_auto_flag: false,
      advertising_type: false,
      ug_flag: false,
      postpaid_flag: false,
      used_messy_level: { label: '', value: '' },
      memo: '',
      emargency_relation: '',
    },
  })

  // Populate form when client data loads
  useEffect(() => {
    if (client) {
      setLoading(false)
      form.reset({
        data_type: client.dataType?.toString() || '1',
        client_id: String(client.clientId),
        client_name: client.clientName || '',
        contact_name: client.contactName || '',
        company_name: client.companyName || '',
        birthday: client.birthday ? dayjs(client.birthday).toDate() : null,
        sex: client.sex?.toString() || '',
        country_id: {
          label: client.countryName || '',
          value: client.countryId ? String(client.countryId) : '',
        },
        address1: client.address1 || '',
        address2: client.address2 || '',
        email: client.email || '',
        fax: client.fax || '',
        tel: client.tel || '',
        tel_phone: client.telPhone || '',
        tel_emergency: client.telEmergency || '',
        zip_code: client.zipCode || '',
        company_zip_code: client.companyZipCode || '',
        company_address1: client.companyAddress1 || '',
        company_address2: client.companyAddress2 || '',
        company_tel: client.companyTel || '',
        use_count: String(client.useCount || 0),
        stay_duration_auto_flag: client.stayDurationAutoFlag || false,
        advertising_type: !!client.advertisingType,
        ug_flag: client.ugFlag || false,
        postpaid_flag: client.postpaidFlag || false,
        used_messy_level: {
          label: client.usedMessyLevel?.toString() || '',
          value: client.usedMessyLevel?.toString() || '',
        },
        memo: client.memo || '',
        emargency_relation: client.emergencyRelation || '',
      })
    }
  }, [client, form])

  const convertDate = (data: TypeFormClientSchemaContact) => {
    return data.birthday ? dayjs(data.birthday).format('YYYY-MM-DD') : undefined
  }

  const onSubmit = (data: TypeFormClientSchemaContact) => {
    setLoadingSubmit(true)
    setIsConfirmDialogOpen(false)

    const postpaid_flag_handle = data.data_type === '3' ? data.postpaid_flag : false

    const handleData = {
      clientId: clientIdNum,
      dataType: Number.parseInt(data.data_type),
      clientName: data.client_name || data.company_name || '',
      contactName: data.contact_name,
      companyName: data.company_name,
      email: data.email || undefined,
      countryId: data.country_id.value ? Number(data.country_id.value) : undefined,
      sex: data.sex ? Number.parseInt(data.sex) : undefined,
      birthday: convertDate(data),
      stayDurationAutoFlag: data.stay_duration_auto_flag ?? false,
      advertisingType: data.advertising_type ? 1 : 0,
      ugFlag: data.ug_flag ?? false,
      usedMessyLevel:
        data.used_messy_level.value !== '' ? Number.parseInt(data.used_messy_level.value) : 0,
      postpaidFlag: postpaid_flag_handle,
      zipCode: data.zip_code || '',
      companyZipCode: data.company_zip_code || '',
      address1: data.address1,
      address2: data.address2,
      companyAddress1: data.company_address1,
      companyAddress2: data.company_address2,
      tel: data.tel,
      telPhone: data.tel_phone,
      telEmergency: data.tel_emergency,
      companyTel: data.company_tel,
      emergencyRelation: data.emargency_relation,
      fax: data.fax ?? undefined,
      memo: data.memo,
    }

    updateClientMutation.mutate(handleData)
  }

  const handleOpenConfirmDialog = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      setIsConfirmDialogOpen(true)
    }
  }

  const WatchDataType = Number.parseInt(form.watch('data_type'))

  if (loading || isLoadingClient) return <Loading />

  if (!client) {
    return (
      <div className="common-container">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-gray-500">Không tìm thấy khách hàng</p>
          <NButton onClick={() => navigate({ to: '/clients' })} className="mt-4">
            Quay lại danh sách
          </NButton>
        </div>
      </div>
    )
  }

  return (
    <div className="common-container">
      <div className="pt-16 pb-52">
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">Chỉnh sửa khách hàng</div>
        </div>
        <section className="mt-[2.2rem]">
          <Form {...form}>
            <form
              id="mainForm"
              className={cn('transition-all duration-300', {
                'opacity-60': loadingSubmit,
                'pointer-events-none': loadingSubmit,
              })}
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <CustomAccordion type="multiple" defaultValue={['item-0', 'item']} className="w-full">
                <CustomAccordionItem
                  className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                  value="item"
                >
                  <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                    <div className="flex justify-between">
                      <div className="flex sm:flex-row justify-between w-full items-center text-[1.2rem] sm:text-[1.8rem]">
                        <div className="font-bold text-black">Thông tin khách hàng</div>
                        <div>
                          <NButton
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              navigate({ to: '/clients' })
                            }}
                          >
                            Tìm kiếm
                          </NButton>
                        </div>
                      </div>
                    </div>
                  </CustomAccordionTrigger>
                  <CustomAccordionContent className="pb-0">
                    <div
                      className={cn('px-16 pt-[3.4rem] pb-16 rounded-[0_0_0.8rem_0.8rem] w-full', {
                        'bg-orange-300': form.watch('ug_flag'),
                      })}
                    >
                      {/* Row 1: Type, Client ID, Advertising checkbox */}
                      <div className="flex flex-wrap items-center gap-[1rem]">
                        <FormField
                          control={form.control}
                          name="data_type"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex">
                                <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                  Loại
                                </FormLabel>
                                <CustomRadio onValueChange={field.onChange} className="flex">
                                  {typeDummyArr.map((item, index) => (
                                    <FormItem
                                      key={`key_form${item.name}_item${index}`}
                                      className="flex items-center my-2 mr-[2.4rem]"
                                    >
                                      <FormControl>
                                        <CustomRadioItems
                                          checked={field.value === item.value}
                                          value={item.value}
                                        />
                                      </FormControl>
                                      <FormLabel className="flex items-center !mt-0 ml-3 text-[1.6rem] cursor-pointer">
                                        {item.name}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </CustomRadio>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="client_id"
                          render={({ field }) => (
                            <FormItem className="my-4 mr-10">
                              <div className="flex">
                                <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                  Mã KH
                                </FormLabel>
                                <CustomInput
                                  className="disabled:bg-[#D9D9D9] !opacity-100 w-[12rem]"
                                  {...field}
                                  disabled
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center my-4">
                          <span className="flex items-center min-w-[15rem] font-bold text-[1.6rem] mr-[7.5rem]">
                            Giấy tờ tùy thân
                          </span>
                          <CustomDialog
                            size="medium"
                            opened={isIdentificationOpen}
                            changeOnOpened={setIsIdentificationOpen}
                            trigger={
                              <NButton
                                type="button"
                                className="bg-[#efefef] w-[14rem] text-[1.6rem]"
                              >
                                <span>Thiết lập</span>
                              </NButton>
                            }
                            title="Cài đặt giấy tờ tùy thân"
                            content={
                              <IdentificationSettingModal
                                identification={identifications}
                                clientId={clientIdNum}
                                refetchClient={() => {
                                  refetch()
                                  refetchIdentifications()
                                }}
                                closeModal={() => setIsIdentificationOpen(false)}
                              />
                            }
                          />
                        </div>
                      </div>

                      {/* Advertising checkbox */}
                      <div className="flex items-center ml-[15rem]">
                        <FormItem className="w-96">
                          <FormField
                            control={form.control}
                            name="advertising_type"
                            render={({ field }) => (
                              <>
                                <FormItem className="flex items-center">
                                  <FormControl>
                                    <CustomCheckbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                    Đặt phòng trực tuyến
                                  </FormLabel>
                                </FormItem>
                                <FormMessage className="text-red-500 text-xl" />
                              </>
                            )}
                          />
                        </FormItem>
                      </div>

                      {/* Individual: Name + Sex */}
                      {form.watch('data_type') === '1' && (
                        <div className="flex flex-wrap items-center">
                          <FormField
                            control={form.control}
                            name="client_name"
                            render={({ field }) => (
                              <FormItem className="my-4 mr-16">
                                <div className="flex">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Họ tên
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput
                                      {...field}
                                      id="client_name_1"
                                      className={cn('bg-white w-[26.2rem]', {
                                        ' border-red-500': form.formState.errors.client_name,
                                      })}
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Giới tính
                                  </FormLabel>
                                  <CustomRadio onValueChange={field.onChange} className="flex">
                                    {sexArr.map((item, index) => (
                                      <FormItem
                                        key={`key_form${item.name}_item${index}`}
                                        className="flex items-center my-2 mr-[2.4rem]"
                                      >
                                        <FormControl>
                                          <CustomRadioItems
                                            checked={field.value === item.value}
                                            value={item.value}
                                          />
                                        </FormControl>
                                        <FormLabel className="flex items-center !mt-0 ml-3 text-[1.6rem] cursor-pointer">
                                          {item.name}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </CustomRadio>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Corporation: Company Name + Sex */}
                      {form.watch('data_type') !== '1' && (
                        <div className="flex flex-wrap items-center">
                          <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem className="my-4 mr-16">
                                <div className="flex">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Tên công ty
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput
                                      {...field}
                                      id="company_name_1"
                                      className={cn('bg-white w-[26.2rem]', {
                                        ' border-red-500': form.formState.errors.company_name,
                                      })}
                                      onChange={(e) => {
                                        field.onChange(e)
                                        form.setValue('client_name', e.target.value)
                                      }}
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Giới tính
                                  </FormLabel>
                                  <CustomRadio onValueChange={field.onChange} className="flex">
                                    {sexArr.map((item, index) => (
                                      <FormItem
                                        key={`key_form${item.name}_item${index}`}
                                        className="flex items-center my-2 mr-[2.4rem]"
                                      >
                                        <FormControl>
                                          <CustomRadioItems
                                            checked={field.value === item.value}
                                            value={item.value}
                                          />
                                        </FormControl>
                                        <FormLabel className="flex items-center !mt-0 ml-3 text-[1.6rem] cursor-pointer">
                                          {item.name}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </CustomRadio>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Corporation: Contact Name */}
                      {form.watch('data_type') !== '1' && (
                        <div className="flex flex-wrap items-center">
                          <FormField
                            control={form.control}
                            name="contact_name"
                            render={({ field }) => (
                              <FormItem className="my-4 mr-16">
                                <div className="flex">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Người liên hệ
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput
                                      {...field}
                                      className={cn('bg-white w-[26.2rem]', {
                                        ' border-red-500': form.formState.errors.contact_name,
                                      })}
                                      id="contact_name_1"
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Country + Birthday */}
                      <div className="flex flex-wrap items-center gap-[5rem]">
                        <FormItem className="my-4 md:w-[40rem]">
                          <div className="flex">
                            <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                              Quốc tịch
                            </FormLabel>
                            <Controller
                              control={form.control}
                              name="country_id"
                              render={({ field: { onChange, value }, formState: { errors } }) => (
                                <FormItem className="w-[26.2rem]">
                                  <CustomSelect
                                    disable={loadingCountry}
                                    customClassMain={cn('w-[26.2rem] h-[3.6rem]', {
                                      ' border-red-500': form.formState.errors.country_id,
                                    })}
                                    option={countryOption.map((c) => ({
                                      value: c.value,
                                      label: c.label,
                                    }))}
                                    selected={
                                      countryOption.find((item) => item.value === value.value)
                                        ?.value
                                    }
                                    change={onChange}
                                  />
                                  {errors ? (
                                    <FormMessage className="text-red-500 text-xl">
                                      {errors.country_id?.message}
                                    </FormMessage>
                                  ) : null}
                                </FormItem>
                              )}
                            />
                          </div>
                        </FormItem>

                        <FormItem className="my-4 md:w-[40.6rem]">
                          <div className="flex">
                            <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                              Ngày sinh
                            </FormLabel>
                            <Controller
                              control={form.control}
                              name="birthday"
                              render={({ field: { onChange, value, onBlur } }) => (
                                <FormItem>
                                  <CustomDatePicker
                                    onBlur={onBlur}
                                    format="yyyy/MM/dd"
                                    change={onChange}
                                    value={value}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </FormItem>
                      </div>

                      {/* Individual: Address */}
                      {form.watch('data_type') === '1' && (
                        <div className="flex flex-wrap items-center">
                          <FormField
                            control={form.control}
                            name="zip_code"
                            render={({ field }) => (
                              <FormItem className="my-4">
                                <div className="flex items-center mr-[3.8rem]">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Mã bưu điện
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput className="bg-white w-[26.2rem]" {...field} />
                                    <FormMessage className="max-w-[14rem] text-red-500 text-xl line-clamp-2" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          <div className="flex flex-wrap items-center gap-[2.6rem]">
                            <FormField
                              control={form.control}
                              name="address1"
                              render={({ field }) => (
                                <FormItem className="my-4 mr-8">
                                  <div className="flex">
                                    <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                      Địa chỉ
                                    </FormLabel>
                                    <div className="flex flex-col gap-1">
                                      <CustomInput
                                        {...field}
                                        placeholder="Tỉnh/Thành phố"
                                        className={cn('bg-white w-[26.2rem]', {
                                          ' border-red-500': form.formState.errors.address1,
                                        })}
                                      />
                                      <FormMessage className="text-red-500 text-xl" />
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="address2"
                              render={({ field }) => (
                                <FormItem className="my-4">
                                  <CustomInput
                                    {...field}
                                    className={cn('bg-white w-[35.7rem]', {
                                      ' border-red-500': form.formState.errors.address2,
                                    })}
                                    placeholder="Số nhà, Phường/Xã, Quận/Huyện"
                                  />
                                  <FormMessage className="text-red-500 text-xl" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* Corporation: Company Address */}
                      {form.watch('data_type') !== '1' && (
                        <div className="flex flex-wrap items-center">
                          <FormField
                            control={form.control}
                            name="company_zip_code"
                            render={({ field }) => (
                              <FormItem className="my-4 mr-[3.8rem]">
                                <div className="flex items-center">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                    Mã bưu điện (CT)
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput className="bg-white w-[26.2rem]" {...field} />
                                    <FormMessage className="max-w-[26.2rem] text-red-500 text-xl line-clamp-2" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                          <div className="flex flex-wrap items-center gap-[2.6rem]">
                            <FormField
                              control={form.control}
                              name="company_address1"
                              render={({ field }) => (
                                <FormItem className="my-4 mr-8">
                                  <div className="flex">
                                    <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                      Địa chỉ (CT)
                                    </FormLabel>
                                    <div className="flex flex-col gap-1">
                                      <CustomInput
                                        {...field}
                                        placeholder="Tỉnh/Thành phố"
                                        className={cn('bg-white w-[26.2rem]', {
                                          ' border-red-500': form.formState.errors.company_address1,
                                        })}
                                      />
                                      <FormMessage className="text-red-500 text-xl" />
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="company_address2"
                              render={({ field }) => (
                                <FormItem className="my-4">
                                  <CustomInput
                                    {...field}
                                    className={cn('bg-white w-[35.7rem]', {
                                      ' border-red-500': form.formState.errors.company_address2,
                                    })}
                                    placeholder="Quận/Huyện, Phường/Xã, Số nhà"
                                  />
                                  <FormMessage className="text-red-500 text-xl" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* Phone numbers */}
                      <div className="flex flex-wrap items-center gap-[3.8rem]">
                        {form.watch('data_type') === '1' && (
                          <FormField
                            control={form.control}
                            name="tel"
                            render={({ field }) => (
                              <FormItem className="my-4">
                                <div className="flex items-center">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                    ☎ (Nhà)
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput
                                      className={cn('bg-white w-[26.2rem]', {
                                        ' border-red-500': form.formState.errors.tel,
                                      })}
                                      {...field}
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                        )}
                        {form.watch('data_type') !== '1' && (
                          <FormField
                            control={form.control}
                            name="company_tel"
                            render={({ field }) => (
                              <FormItem className="my-4">
                                <div className="flex items-center">
                                  <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                    ☎ (Công ty)
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput
                                      className={cn('bg-white w-[26.2rem]', {
                                        ' border-red-500': form.formState.errors.company_tel,
                                      })}
                                      {...field}
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name="tel_phone"
                          render={({ field }) => (
                            <FormItem className="my-4">
                              <div className="flex items-center">
                                <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                  ☎ (Di động)
                                </FormLabel>
                                <div className="flex flex-col gap-1">
                                  <CustomInput className="bg-white w-[26.2rem]" {...field} />
                                  <FormMessage className="text-red-500 text-xl" />
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="my-4">
                              <div className="flex items-center ml-2">
                                <FormLabel className="flex items-center min-w-[9.8rem] font-bold text-[1.6rem] leading-7">
                                  Email
                                </FormLabel>
                                <div className="flex flex-col gap-1">
                                  <CustomInput className="bg-white w-[26.2rem]" {...field} />
                                  <FormMessage className="text-red-500 text-xl" />
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Emergency contact */}
                      <div className="flex flex-wrap items-center">
                        <FormField
                          control={form.control}
                          name="tel_emergency"
                          render={({ field }) => (
                            <FormItem className="my-4 mr-[3.8rem]">
                              <div className="flex items-center">
                                <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                  ☎ (Khẩn cấp)
                                </FormLabel>
                                <div className="flex flex-col gap-1">
                                  <CustomInput className="bg-white w-[26.2rem]" {...field} />
                                  <FormMessage className="text-red-500 text-xl" />
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emargency_relation"
                          render={({ field }) => (
                            <FormItem className="my-4">
                              <div className="flex items-center mr-[4.3rem]">
                                <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                  Quan hệ
                                </FormLabel>
                                <div className="flex flex-col gap-1">
                                  <CustomInput className="bg-white w-[26.2rem]" {...field} />
                                  <FormMessage className="text-red-500 text-xl" />
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />

                        {(WatchDataType === 2 || WatchDataType === 3) && (
                          <FormField
                            control={form.control}
                            name="fax"
                            render={({ field: { value, onChange } }) => (
                              <FormItem className="my-4">
                                <div className="flex items-center">
                                  <FormLabel className="flex items-center min-w-[9.8rem] font-bold text-[1.6rem] leading-7">
                                    FAX
                                  </FormLabel>
                                  <div className="flex flex-col gap-1">
                                    <CustomInput
                                      className="bg-white w-[26.2rem]"
                                      value={value ?? ''}
                                      onChange={onChange}
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Individual: Company info section */}
                      {form.watch('data_type') === '1' && (
                        <>
                          <div className="flex flex-wrap items-center">
                            <FormField
                              control={form.control}
                              name="company_name"
                              render={({ field }) => (
                                <FormItem className="my-4 mr-16">
                                  <div className="flex">
                                    <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                      Tên công ty
                                    </FormLabel>
                                    <div className="flex flex-col gap-1">
                                      <CustomInput
                                        {...field}
                                        className={cn('bg-white w-[26.2rem]', {
                                          ' border-red-500': form.formState.errors.company_name,
                                        })}
                                        id="company_name_1"
                                      />
                                      <FormMessage className="text-red-500 text-xl" />
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-[4rem]">
                            <FormField
                              control={form.control}
                              name="company_zip_code"
                              render={({ field }) => (
                                <FormItem className="my-4">
                                  <div className="flex items-center">
                                    <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                      Mã bưu điện (CT)
                                    </FormLabel>
                                    <div className="flex flex-col gap-1">
                                      <CustomInput className="bg-white w-[26.2rem]" {...field} />
                                      <FormMessage className="max-w-[26.2rem] text-red-500 text-xl line-clamp-2" />
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <div className="flex flex-wrap items-center gap-[2.6rem]">
                              <FormField
                                control={form.control}
                                name="company_address1"
                                render={({ field }) => (
                                  <FormItem className="my-4 mr-8">
                                    <div className="flex">
                                      <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem]">
                                        Địa chỉ (CT)
                                      </FormLabel>
                                      <div className="flex flex-col gap-1">
                                        <CustomInput
                                          {...field}
                                          placeholder="Tỉnh/Thành phố"
                                          className={cn('bg-white w-[26.2rem]', {
                                            ' border-red-500':
                                              form.formState.errors.company_address1,
                                          })}
                                        />
                                        <FormMessage className="text-red-500 text-xl" />
                                      </div>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="company_address2"
                                render={({ field }) => (
                                  <FormItem className="my-4">
                                    <CustomInput
                                      {...field}
                                      className={cn('bg-white w-[35.7rem]', {
                                        ' border-red-500': form.formState.errors.company_address2,
                                      })}
                                      placeholder="Quận/Huyện, Phường/Xã, Số nhà"
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-[4.2rem]">
                            <FormField
                              control={form.control}
                              name="company_tel"
                              render={({ field }) => (
                                <FormItem className="my-4">
                                  <div className="flex items-center">
                                    <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                      ☎ (Công ty)
                                    </FormLabel>
                                    <div className="flex flex-col gap-1">
                                      <CustomInput
                                        className={cn('bg-white w-[26.2rem]', {
                                          ' border-red-500': form.formState.errors.company_tel,
                                        })}
                                        {...field}
                                      />
                                      <FormMessage className="text-red-500 text-xl" />
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="fax"
                              render={({ field }) => (
                                <FormItem className="my-4">
                                  <div className="flex items-center">
                                    <FormLabel className="flex items-center min-w-[15rem] font-bold text-[1.6rem] leading-7">
                                      FAX (CT)
                                    </FormLabel>
                                    <div className="flex flex-col gap-1">
                                      <CustomInput
                                        className="bg-white w-[26.2rem]"
                                        {...field}
                                        value={field.value ?? ''}
                                      />
                                      <FormMessage className="text-red-500 text-xl" />
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}

                      {/* Flags row + Memo */}
                      <div className="flex flex-wrap">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center">
                            <FormItem className="w-96">
                              <FormField
                                control={form.control}
                                name="stay_duration_auto_flag"
                                render={({ field }) => (
                                  <>
                                    <FormItem className="flex items-center !my-[1.6rem]">
                                      <FormControl>
                                        <CustomCheckbox
                                          checked={field.value}
                                          onCheckedChange={(checked) => {
                                            field.onChange(checked)
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                        Tự động gia hạn
                                      </FormLabel>
                                    </FormItem>
                                    <FormMessage className="text-red-500 text-xl" />
                                  </>
                                )}
                              />
                            </FormItem>
                            <FormItem className="flex !my-[1.2rem] w-[25rem] mr-[4rem]">
                              <FormLabel className="flex items-center w-[15rem] font-bold text-[1.6rem]">
                                Vệ sinh phòng
                              </FormLabel>
                              <Controller
                                control={form.control}
                                name="used_messy_level"
                                render={({ field: { onChange, value } }) => (
                                  <FormItem className="!mt-0">
                                    <CustomSelect
                                      customClassMain={cn('w-[10.4rem] h-[3.6rem] text-black', {
                                        'border-red-500': form.formState.errors.used_messy_level,
                                      })}
                                      option={UsedMessyLevelOption}
                                      selected={value.value}
                                      change={(e) => {
                                        onChange({
                                          label: e.label,
                                          value: e.value,
                                        })
                                      }}
                                    />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </FormItem>
                                )}
                              />
                            </FormItem>
                            <FormField
                              control={form.control}
                              name="use_count"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center w-[20.6rem]">
                                    <span className="mr-4 font-bold text-[1.6rem]">
                                      Lần sử dụng
                                    </span>
                                    <CustomInput
                                      {...field}
                                      disabled
                                      className="bg-white disabled:bg-[#D9D9D9] !opacity-100 w-[5.6rem]"
                                    />
                                    <span className="ml-5 font-bold text-[1.6rem]">lần</span>
                                  </div>
                                  <FormMessage className="text-red-500 text-xl" />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex items-start">
                            <div className="flex flex-col w-[10rem]">
                              <FormLabel className="flex items-center !my-[1.6rem] w-[9.2rem] h-fit font-bold text-[1.6rem]">
                                Ghi chú
                              </FormLabel>
                              <div>
                                {WatchDataType === 3 && (
                                  <FormItem>
                                    <FormField
                                      control={form.control}
                                      name="postpaid_flag"
                                      render={({ field }) => (
                                        <>
                                          <FormItem className="flex items-center !my-[1.6rem]">
                                            <FormControl>
                                              <CustomCheckbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                  field.onChange(checked)
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                              Trả sau
                                            </FormLabel>
                                          </FormItem>
                                          <FormMessage className="text-red-500 text-xl" />
                                        </>
                                      )}
                                    />
                                  </FormItem>
                                )}
                                <FormField
                                  control={form.control}
                                  name="ug_flag"
                                  render={({ field }) => (
                                    <>
                                      <FormItem className="flex items-center !my-[0.9rem] w-36 h-fit">
                                        <FormControl>
                                          <CustomCheckbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                              field.onChange(checked)
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="flex items-center !mt-0 ml-3 font-bold text-[1.6rem] leading-7 cursor-pointer">
                                          UG
                                        </FormLabel>
                                      </FormItem>
                                      <FormMessage className="text-red-500 text-xl" />
                                    </>
                                  )}
                                />
                              </div>
                            </div>
                            <FormItem className="flex flex-1">
                              <FormField
                                control={form.control}
                                name="memo"
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <CustomTextarea {...field} className="bg-white py-8" />
                                    <FormMessage className="text-red-500 text-xl" />
                                  </FormItem>
                                )}
                              />
                            </FormItem>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CustomAccordionContent>
                </CustomAccordionItem>
              </CustomAccordion>

              {/* Submit button */}
              <div className="flex justify-center mx-auto gap-4">
                <NButton
                  disabled={loadingSubmit}
                  type="button"
                  onClick={handleOpenConfirmDialog}
                  className="bg-[#8BD08E] hover:bg-[#7bc07e] mx-8 w-[15rem]"
                >
                  Cập nhật
                </NButton>
                <NButton
                  type="button"
                  onClick={() => navigate({ to: '/clients' })}
                  className="bg-[#D9D9D9] mx-8 w-[15rem]"
                >
                  Hủy
                </NButton>
                <CustomDialog
                  customClass="text-center [&_svg]:hidden"
                  size="medium"
                  customClassContent="max-w-[50rem]"
                  opened={isConfirmDialogOpen}
                  changeOnOpened={setIsConfirmDialogOpen}
                  trigger={<></>}
                  title={<>Xác nhận cập nhật khách hàng?</>}
                  content={
                    <>
                      <div className="flex justify-center">
                        <NButton
                          type="submit"
                          form="mainForm"
                          className="bg-green-600 mx-4 w-[14.4rem] text-white btn btn-default"
                        >
                          <span>Thực hiện</span>
                        </NButton>
                        <NButton
                          type="button"
                          onClick={() => setIsConfirmDialogOpen(false)}
                          className="bg-[#eee] mx-4 w-[14.4rem] border border-black btn btn-default"
                        >
                          <span>Hủy</span>
                        </NButton>
                      </div>
                    </>
                  }
                />
              </div>
            </form>
          </Form>
        </section>
      </div>
    </div>
  )
}
