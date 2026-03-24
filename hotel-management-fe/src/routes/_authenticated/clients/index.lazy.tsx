import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogClose } from '@radix-ui/react-dialog'
import { Link, createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
import CustomPagination from '@/components/common/CustomPagination'
import type { PaginationData } from '@/components/common/CustomPagination'
import CustomSelect from '@/components/common/CustomSelect'
import Loading from '@/components/common/Loading'
import { CustomCheckboxWithTitle } from '@/components/ui/checkbox'
import { NButton } from '@/components/ui/new-button'

import { useReactivateClient, useSuspendClient } from '@/hooks/mutations/useSuspendClient'
import { useGetClients } from '@/hooks/queries/useGetClients'
import type { Client, ClientFilterParams } from '@/types/client'
import { ClientDataStatus, ClientDataType } from '@/types/client'

export const Route = createLazyFileRoute('/_authenticated/clients/')({
  component: ClientsPage,
})

// ─── Types ────────────────────────────────────────────────────────────
interface TypeOption {
  isIndividual: boolean
  isCompany: boolean
  isSpecial: boolean
}

interface ClientSearchFormType {
  type: TypeOption
  name: string
  kana: string
  housePhone: string
  ownerPhone: string
  urgentPhone: string
  email: string
  contactName: string
  contactKana: string
}

interface SortParam {
  sort: string
  direction: 'asc' | 'desc'
}

// ─── Constants ────────────────────────────────────────────────────────
const defaultFormValues: ClientSearchFormType = {
  type: {
    isIndividual: false,
    isCompany: false,
    isSpecial: false,
  },
  name: '',
  kana: '',
  housePhone: '',
  ownerPhone: '',
  urgentPhone: '',
  email: '',
  contactName: '',
  contactKana: '',
}

const SORT_OPTIONS = [
  { label: 'Ngày đăng ký (Tăng dần)', value: 'asc' },
  { label: 'Ngày đăng ký (Giảm dần)', value: 'desc' },
]

const TYPE_MAPPING: Record<number, string> = {
  1: 'Cá nhân',
  2: 'Doanh nghiệp',
  3: 'DN đặc biệt',
}

// ─── Main Page Component ──────────────────────────────────────────────
function ClientsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const nameInputRef = useRef<HTMLInputElement>(null)

  // State
  const [page, setPage] = useState(1)
  const [sortParam, setSortParam] = useState<SortParam>({
    sort: 'createdAt',
    direction: 'desc',
  })
  const [currentFilters, setCurrentFilters] = useState<ClientFilterParams>({})

  // Form schema
  const schema = z.object({
    type: z.object({
      isIndividual: z.boolean(),
      isCompany: z.boolean(),
      isSpecial: z.boolean(),
    }),
    name: z.string().optional(),
    kana: z.string().optional(),
    housePhone: z.string().optional(),
    ownerPhone: z.string().optional(),
    urgentPhone: z.string().optional(),
    email: z.string().optional(),
    contactName: z.string().optional(),
    contactKana: z.string().optional(),
  })

  const methods = useForm<ClientSearchFormType>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
  })

  const { isIndividual, isCompany, isSpecial } = methods.watch('type')

  // API Query
  const { data, isLoading, refetch } = useGetClients({
    params: {
      page,
      limit: 20,
      orderBy: sortParam.sort,
      order: sortParam.direction,
      ...currentFilters,
    },
  })

  // Mutations
  const { mutateAsync: suspendClient, isPending: isPendingSuspend } = useSuspendClient({
    onError(error) {
      toast.error(extractErrorMessage(error))
    },
  })

  const { mutateAsync: reactivateClient, isPending: isPendingReactivate } = useReactivateClient({
    onError(error) {
      toast.error(extractErrorMessage(error))
    },
  })

  // Handlers
  const handleSearch = (formData: ClientSearchFormType) => {
    const dataTypes: number[] = []
    if (formData.type.isIndividual) dataTypes.push(1)
    if (formData.type.isCompany) dataTypes.push(2)
    if (formData.type.isSpecial) dataTypes.push(3)

    setCurrentFilters({
      search:
        formData.name ||
        formData.email ||
        formData.housePhone ||
        formData.ownerPhone ||
        formData.urgentPhone ||
        undefined,
      dataType: dataTypes.length === 1 ? dataTypes[0] : undefined,
    })
    setPage(1)
  }

  const handleClearForm = () => {
    methods.reset(defaultFormValues)
    setCurrentFilters({})
    setPage(1)
  }

  const handleSuspend = async (clientId: number, currentStatus: number) => {
    try {
      if (currentStatus === ClientDataStatus.ACTIVE) {
        await suspendClient(clientId)
        toast.success(t('client.messages.suspendSuccess'))
      } else {
        await reactivateClient(clientId)
        toast.success(t('client.messages.reactivateSuccess'))
      }
      refetch()
    } catch {
      // Error handled in mutation
    }
  }

  const handleSortChange = (option: { value: string; label: string }) => {
    setSortParam({
      sort: 'createdAt',
      direction: option.value as 'asc' | 'desc',
    })
  }

  // Generate dynamic label text based on selected type
  const generateLabelText = (isKana?: boolean): string => {
    const showIndividual = isIndividual || (!isIndividual && !isCompany && !isSpecial)
    const showCompany = isCompany || isSpecial

    const labels: string[] = []
    if (showIndividual) labels.push(isKana ? 'Tên (Kana)' : 'Tên')
    if (showCompany) labels.push(isKana ? 'Tên công ty (Kana)' : 'Tên công ty')
    return labels.join('/')
  }

  const clients = data?.items || []
  const paginationData: PaginationData = data?.meta || {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  }
  const isPageLoading = isLoading || isPendingSuspend || isPendingReactivate

  return (
    <>
      {isPageLoading && <Loading />}
      <div className="box-border flex flex-col gap-[2.3rem] py-[2.3rem] common-container">
        {/* Title */}
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">{t("client.title")}</div>
        </div>

        {/* Search Form */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSearch)}>
            <CustomAccordion type="multiple" className="w-full" defaultValue={["item-1"]}>
              <CustomAccordionItem
                className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
                value="item-1"
              >
                <CustomAccordionTrigger className="bg-[#79A3E0] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                  <div className="flex justify-between">
                    <div className="flex md:flex-row flex-col items-center text-[1.2rem] md:text-[1.8rem]">
                      <div className="font-bold text-black">{t("client.searchConditions")}</div>
                    </div>
                    <NButton
                      className="bg-white p-4"
                      onClick={() => navigate({ to: '/clients/create' })}
                      type="button"
                    >
                      {t('client.createNew')}
                    </NButton>
                  </div>
                </CustomAccordionTrigger>
                <CustomAccordionContent className="pb-0 font-bold">
                  <div
                    className={cn('flex flex-col px-[2rem] py-[1rem] w-[100%] [&_*]:text-[1.4rem]')}
                  >
                    {/* Type checkboxes */}
                    <div className="gap-[2rem] grid grid-cols-12 max-md:[&>*]:col-span-12 mb-[1.2rem] w-[100%]">
                      <div>
                        <div className="flex items-center h-[100%]">{t("client.filters.type")}</div>
                      </div>
                      <div className="flex [&>*]:flex [&>*]:items-center gap-[3rem] [&>*]:gap-[.5rem] col-span-11">
                        <CustomCheckboxWithTitle
                          title={t('client.type.individual')}
                          checked={methods.watch('type.isIndividual')}
                          onCheckedChange={(checked) =>
                            methods.setValue('type.isIndividual', checked)
                          }
                        />
                        <CustomCheckboxWithTitle
                          title={t('client.type.corporation')}
                          checked={methods.watch('type.isCompany')}
                          onCheckedChange={(checked) => methods.setValue('type.isCompany', checked)}
                        />
                        <CustomCheckboxWithTitle
                          title={t('client.type.specialCorp')}
                          checked={methods.watch('type.isSpecial')}
                          onCheckedChange={(checked) => methods.setValue('type.isSpecial', checked)}
                        />
                      </div>
                    </div>

                    {/* Name/Kana fields */}
                    <div
                      className={cn(
                        'gap-[2rem] max-md:gap-[.5rem] grid grid-cols-12 w-[100%]',
                        '![&_*]:text-[1.4rem] [&>*]:flex [&>*]:flex-col [&>*]:w-[100%] [&>*]:gap-[1rem] [&>*]:h-[3.6rem]',
                        '[&>*]:[&>*]:grid [&>*]:[&>*]:gap-[2rem]',
                        '[&>*]:[&>*]:text-[1.4rem] [&>*]:[&>*]:[&>*]:flex [&>*]:[&>*]:[&>*]:items-center [&>*]:[&>*]:[&>*]:h-[3.6rem] [&>*]:max-md:!col-span-12'
                      )}
                    >
                      <div>
                        <div className="flex items-center h-[100%]">{generateLabelText()}</div>
                      </div>
                      <div className="col-span-2">
                        <CustomInput
                          {...methods.register('name')}
                          ref={nameInputRef}
                          className="w-[100%] hover:!outline-black focus:!outline-black focus:!border-transparent"
                        />
                      </div>

                      <div>
                        <div className="flex items-center h-[100%]">{generateLabelText(true)}</div>
                      </div>
                      <div className="col-span-2">
                        <CustomInput
                          {...methods.register('kana')}
                          className="w-[100%] focus:!outline-black focus:!border-transparent"
                        />
                      </div>

                      <div className="col-span-6 h-[2.5rem]">
                        <div className="flex items-center h-[100%]">
                          {t('client.filters.corpSearchNote')}
                        </div>
                      </div>

                      {/* Contact name fields - show only for company types */}
                      {(isCompany || isSpecial) && (
                        <>
                          <div>
                            <div className="flex items-center h-[100%]">
                              {t('client.filters.contactName')}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <CustomInput
                              {...methods.register('contactName')}
                              className="w-[100%] hover:!outline-black focus:!outline-black focus:!border-transparent"
                            />
                          </div>

                          <div>
                            <div className="flex items-center h-[100%] leading-tight">
                              {t('client.filters.contactNameKana')}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <CustomInput
                              {...methods.register('contactKana')}
                              className="w-[100%] focus:!outline-black focus:!border-transparent"
                            />
                          </div>
                        </>
                      )}
                      {(isCompany || isSpecial) && <div className="col-span-6" />}

                      {/* Phone fields */}
                      <div>
                        <div className="flex items-center h-[100%]">
                          ☎ ({t('client.filters.telHome')})
                        </div>
                      </div>
                      <div className="col-span-2">
                        <CustomInput {...methods.register('housePhone')} className='w-[100%]' />
                      </div>

                      <div>
                        <div className="flex items-center h-[100%]">
                          ☎ ({t('client.filters.telMobile')})
                        </div>
                      </div>
                      <div className="col-span-2 customDatePicker">
                        <CustomInput {...methods.register('ownerPhone')} className='w-[100%]' />
                      </div>

                      <div>
                        <div className="flex items-center h-[100%]">
                          ☎ ({t('client.filters.telEmergency')})
                        </div>
                      </div>
                      <div className="col-span-2">
                        <CustomInput {...methods.register('urgentPhone')} className='w-[100%]' />
                      </div>

                      <div className="max-md:!hidden col-span-3 h-[2.5rem]" />

                      {/* Email field */}
                      <div>
                        <div className="flex items-center h-[100%]">
                          {t('client.filters.email')}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <CustomInput
                          {...methods.register('email')}
                          className="w-[100%] focus:!outline-black focus:!border-transparent"
                        />
                      </div>
                    </div>

                    {/* Search/Clear buttons */}
                    <div
                      className={cn(
                        'gap-[2rem] grid grid-cols-12',
                        '[&>*]:h-[2.5rem] mt-[2rem] mb-[2rem]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex col-span-3 max-md:col-span-12 md:col-start-5',
                          '[&>*]:flex [&>*]:justify-center [&>*]:items-center',
                          'max-md:flex max-md:gap-[2rem] max-md:mt-[1rem]'
                        )}
                      >
                        <NButton
                          className="flex-1 bg-[#d9d9d9] border border-black min-w-[10rem]"
                          type="submit"
                        >
                          {t('client.actions.search')}
                        </NButton>
                        <div className="max-md:!hidden w-[2.5rem] shrink-0" />
                        <NButton
                          className="flex-1 bg-[#d9d9d9] border border-black min-w-[10rem]"
                          type="button"
                          onClick={handleClearForm}
                        >
                          {t('client.actions.clearFilters')}
                        </NButton>
                        <div className="max-md:!hidden w-[2.5rem]" />
                        <div className="max-md:!hidden ml-[2rem] w-[2.5rem]" />
                      </div>
                    </div>
                  </div>
                </CustomAccordionContent>
              </CustomAccordionItem>
            </CustomAccordion>
          </form>
        </FormProvider>

        {/* Pagination & Sort Controls */}
        <div className="flex max-sm:flex-col-reverse gap-[1rem] w-[100%] !h-[4rem]">
          <div>
            <CustomPagination
              totalPage={paginationData.totalPages}
              page={page}
              setPage={setPage}
              dataPagination={paginationData}
            />
          </div>
          <div className="max-sm:hidden flex-1" />
          <div className="flex items-center h-[100%] text-[1.5rem]">{t("client.sort.label")}</div>
          <div className="w-[20rem] max-sm:w-[100%] [&>*]:h-[100%] text-[1.5rem]">
            <CustomSelect
              option={SORT_OPTIONS}
              selected={sortParam.direction}
              customClassMain="h-[100%]"
              change={handleSortChange}
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="max-sm:overflow-x-auto">
          <table
            className={cn(
              'bg-white [&_td]:!border-1 [&_td]:!border-black w-[100%] border-collapse',
              '[&_th]:text-[1.5rem] max-sm:[&_th]:text-nowrap [&_th]:border [&_th]:border-black [&_th]:bg-[#efefef]',
              '[&_tr]:h-[4.6rem] [&_td]:h-[100%] [&_td]:border [&_td]:border-black',
              '[&_td]:text-center [&_td]:text-[1.5rem] [&_th]:px-[1rem]'
            )}
          >
            <thead>
              <tr className="!h-[5.9rem]">
                <th className="w-[5.6rem]">UG</th>
                <th className="w-[7.8rem]">{t("client.columns.type")}</th>
                <th className="w-[20rem]">{t("client.columns.name")}</th>
                <th className="w-[13rem] whitespace-nowrap">{t("client.columns.telHome")}</th>
                <th className="w-[13rem]">{t("client.columns.telMobile")}</th>
                <th className="w-[13rem]">{t("client.columns.telEmergency")}</th>
                <th className="w-[14rem]">{t("client.columns.email")}</th>
                <th className="w-[15.6rem]">{t("client.columns.memo")}</th>
                <th className="w-[5rem]">{t("client.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <ClientRow
                  key={`row-${client.clientId}-${index}`}
                  client={client}
                  onSuspend={handleSuspend}
                  onNavigate={navigate}
                  t={t}
                />
              ))}
              {clients.length === 0 && (
                <tr>
                  <td className="font-bold text-red text-center" colSpan={9}>
                    {t('client.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        <div className="flex max-sm:justify-center w-[100%]">
          <CustomPagination
            totalPage={paginationData.totalPages}
            page={page}
            setPage={setPage}
            dataPagination={paginationData}
          />
        </div>
      </div>
    </>
  )
}

// ─── Client Row Component ─────────────────────────────────────────────
interface ClientRowProps {
  client: Client
  onSuspend: (clientId: number, currentStatus: number) => void
  onNavigate: ReturnType<typeof useNavigate>
  t: ReturnType<typeof useTranslation>['t']
}

function ClientRow({ client, onSuspend, onNavigate, t }: ClientRowProps) {
  const isDeleted = client.deletedAt !== null && client.deletedAt !== undefined
  const isSuspended = client.dataStatus === ClientDataStatus.SUSPENDED

  return (
    <tr
      className={cn({
        '!bg-gray-400': isDeleted,
        'bg-red': isSuspended && !isDeleted,
      })}
    >
      <td>{client.ugFlag ? '✓' : ''}</td>
      <td>{TYPE_MAPPING[client.dataType] || ''}</td>
      <td>
        <Link
          to="/clients/$clientId/detail"
          params={{ clientId: String(client.clientId) }}
          className="hover:underline cursor-pointer block"
        >
          <span className="inline-block w-full overflow-hidden truncate text-ellipsis leading-tight whitespace-nowrap">
            {client.dataType === ClientDataType.INDIVIDUAL
              ? client.clientName
              : client.companyName || client.clientName}
          </span>
        </Link>
      </td>
      <td>{client.tel || ''}</td>
      <td>{client.telPhone || ''}</td>
      <td>{client.telEmergency || ''}</td>
      <td>{client.email || ''}</td>
      <td className="relative">
        <div
          className={cn(
            'flex justify-center items-center max-h-[100%] overflow-auto',
            'absolute top-0 left-0 right-0 bottom-0'
          )}
          style={{ scrollbarWidth: 'thin' }}
        >
          <span className="m-auto">{client.memo ?? ""}</span>
        </div>
      </td>
      <td>
        <div
          className={cn(
            'flex flex-col gap-[.5rem] p-[.5rem]',
            '[&>*]:bg-[#efefef] [&>*]:border-2 [&>*]:box-border [&>*]:border-[black] [&>*]:rounded-[.6rem]',
            { 'h-[7.9rem] justify-center': isDeleted }
          )}
        >
          {isDeleted ? (
            <span>{t('client.actions.delete')}</span>
          ) : (
            <>
              <NButton
                disabled={isDeleted}
                className={cn({ '!border-none !shadow-none': isDeleted })}
                onClick={() =>
                  onNavigate({ to: '/clients/$clientId/edit', params: { clientId: String(client.clientId) } })
                }
              >
                <span className="text-xl">{t("client.actions.edit")}</span>
              </NButton>
              <CustomDialog
                customClass="text-center [&_svg]:hidden"
                size="medium"
                customClassContent="max-w-[50rem]"
                trigger={
                  <NButton
                    variant="default"
                    disabled={isDeleted}
                    className={cn({ '!border-none !shadow-none': isDeleted })}
                  >
                    <span className="text-xl whitespace-nowrap">
                      {isSuspended ? t('client.actions.reactivate') : t('client.actions.suspend')}
                    </span>
                  </NButton>
                }
                title={
                  isSuspended
                    ? t('client.dialogs.reactivateTitle')
                    : t('client.dialogs.suspendTitle')
                }
                content={
                  <div className="flex justify-center p-5">
                    <DialogClose onClick={() => onSuspend(client.clientId, client.dataStatus)}>
                      <div className="bg-[#8bd08e] mx-4 w-[12.4rem] btn btn-default">
                        <span>{t('client.dialogs.execute')}</span>
                      </div>
                    </DialogClose>
                    <DialogClose>
                      <div className="bg-[#eee] mx-4 w-[12.4rem] btn btn-default">
                        <span>{t('client.dialogs.cancel')}</span>
                      </div>
                    </DialogClose>
                  </div>
                }
              />
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────
function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string | string[] } } }
    const message = axiosError.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    return message || 'Đã xảy ra lỗi'
  }
  return 'Đã xảy ra lỗi'
}
