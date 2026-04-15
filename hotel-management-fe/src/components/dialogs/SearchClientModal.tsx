import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { CustomInput } from '@/components/common/CustomInput'
import CustomPagination from '@/components/common/CustomPagination'
import { CustomCheckboxWithTitle } from '@/components/ui/checkbox'
import { NButton } from '@/components/ui/new-button'
import { useGetClients } from '@/hooks/queries/useGetClients'
import { cn } from '@/lib/utils'
import type { Client, ClientFilterParams } from '@/types/client'

interface SearchClientModalProps {
  onSelectClient: (client: Client) => void
}

interface SearchFormValues {
  isIndividual: boolean
  isCompany: boolean
  isSpecial: boolean
  name: string
  contactName: string
  housePhone: string
  ownerPhone: string
  urgentPhone: string
  email: string
}

const defaultValues: SearchFormValues = {
  isIndividual: false,
  isCompany: false,
  isSpecial: false,
  name: '',
  contactName: '',
  housePhone: '',
  ownerPhone: '',
  urgentPhone: '',
  email: '',
}

const TYPE_MAPPING: Record<number, string> = {
  1: 'Cá nhân',
  2: 'Doanh nghiệp',
  3: 'DN đặc biệt',
}

const cleanPhone = (phone: string | undefined) =>
  phone ? phone.replace(/[^a-zA-Z0-9]/g, '') : undefined

export default function SearchClientModal({ onSelectClient }: SearchClientModalProps) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ClientFilterParams>({})

  const methods = useForm<SearchFormValues>({ defaultValues })
  const { isIndividual, isCompany, isSpecial } = methods.watch()

  const { data, isLoading } = useGetClients({
    params: {
      page,
      limit: 10,
      orderBy: 'createdAt',
      order: 'desc',
      ...filters,
    },
  })

  const clients = data?.items ?? []
  const meta = data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }

  const handleSearch = (formData: SearchFormValues) => {
    const dataTypes: number[] = []
    if (formData.isIndividual) dataTypes.push(1)
    if (formData.isCompany) dataTypes.push(2)
    if (formData.isSpecial) dataTypes.push(3)

    setFilters({
      clientName: formData.name || undefined,
      contactName: formData.contactName || undefined,
      email: formData.email || undefined,
      tel: cleanPhone(formData.housePhone),
      telPhone: cleanPhone(formData.ownerPhone),
      telEmergency: cleanPhone(formData.urgentPhone),
      dataTypes: dataTypes.length > 0 ? dataTypes : undefined,
    })
    setPage(1)
  }

  const handleClear = () => {
    methods.reset(defaultValues)
    setFilters({})
    setPage(1)
  }

  const generateLabelText = (): string => {
    const showIndividual = isIndividual || (!isIndividual && !isCompany && !isSpecial)
    const showCompany = isCompany || isSpecial
    const labels: string[] = []
    if (showIndividual) labels.push('Tên')
    if (showCompany) labels.push('Tên công ty')
    return labels.join('/')
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-h-[70vh] overflow-y-auto">
      {/* Search Form */}
      <form onSubmit={methods.handleSubmit(handleSearch)}>
        <div className="flex flex-col gap-4 [&_*]:text-[1.4rem]">
          {/* Type checkboxes */}
          <div className="flex items-center gap-8">
            <span className="font-bold min-w-[12rem]">Loại</span>
            <CustomCheckboxWithTitle
              title="Cá nhân"
              checked={methods.watch('isIndividual')}
              onCheckedChange={(checked) => methods.setValue('isIndividual', checked)}
            />
            <CustomCheckboxWithTitle
              title="Doanh nghiệp"
              checked={methods.watch('isCompany')}
              onCheckedChange={(checked) => methods.setValue('isCompany', checked)}
            />
            <CustomCheckboxWithTitle
              title="DN đặc biệt"
              checked={methods.watch('isSpecial')}
              onCheckedChange={(checked) => methods.setValue('isSpecial', checked)}
            />
          </div>

          {/* Name */}
          <div className="flex items-center gap-4">
            <span className="font-bold min-w-[12rem]">{generateLabelText()}</span>
            <CustomInput {...methods.register('name')} className="w-[20rem]" />
          </div>

          {/* Contact name (only for company types) */}
          {(isCompany || isSpecial) && (
            <div className="flex items-center gap-4">
              <span className="font-bold min-w-[12rem]">Người LH</span>
              <CustomInput {...methods.register('contactName')} className="w-[20rem]" />
            </div>
          )}

          {/* Phone + Email */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold min-w-[12rem]">☎ Nhà</span>
            <CustomInput {...methods.register('housePhone')} className="w-[20rem] mr-[4rem]" />
            <span className="font-bold min-w-[12rem]">☎ Di động</span>
            <CustomInput {...methods.register('ownerPhone')} className="w-[20rem] mr-[4rem]" />
            <span className="font-bold min-w-[12rem]">☎ Khẩn cấp</span>
            <CustomInput {...methods.register('urgentPhone')} className="w-[20rem]" />
          </div>

          <div className="flex items-center gap-4">
            <span className="font-bold min-w-[12rem]">Email</span>
            <CustomInput {...methods.register('email')} className="w-[20rem]" />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <NButton type="submit" className="bg-[#d9d9d9] border border-black min-w-[10rem] p-4">
              Tìm kiếm
            </NButton>
            <NButton
              type="button"
              onClick={handleClear}
              className="bg-[#d9d9d9] border border-black min-w-[10rem] p-4"
            >
              Xóa bộ lọc
            </NButton>
          </div>
        </div>
      </form>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table
          className={cn(
            'bg-white w-full border-collapse',
            '[&_th]:text-[1.3rem] [&_th]:border [&_th]:border-black [&_th]:bg-[#efefef] [&_th]:px-2 [&_th]:py-2',
            '[&_tr]:h-[3.6rem] [&_td]:border [&_td]:border-black',
            '[&_td]:text-center [&_td]:text-[1.3rem] [&_td]:px-2'
          )}
        >
          <thead>
            <tr>
              <th className="w-[5rem]">UG</th>
              <th className="w-[7rem]">Loại</th>
              <th className="w-[15rem]">Tên</th>
              <th className="w-[12rem]">☎ Nhà</th>
              <th className="w-[12rem]">☎ Di động</th>
              <th className="w-[12rem]">Email</th>
              <th className="w-[12rem]">Ghi chú</th>
              <th className="w-[6rem]">Chọn</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="py-4 text-center">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && clients.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 font-bold text-red-500 text-center">
                  Không có dữ liệu
                </td>
              </tr>
            )}
            {!isLoading &&
              clients.map((client) => (
                <tr key={client.clientId} className={cn({ 'bg-orange-200': client.ugFlag })}>
                  <td>{client.ugFlag ? '●' : ''}</td>
                  <td>{TYPE_MAPPING[client.dataType] ?? ''}</td>
                  <td className="text-left px-2">{client.clientName}</td>
                  <td>{client.tel ?? ''}</td>
                  <td>{client.telPhone ?? ''}</td>
                  <td className="text-left px-2 truncate max-w-[12rem]">{client.email ?? ''}</td>
                  <td className="text-left px-2 truncate max-w-[12rem]">{client.memo ?? ''}</td>
                  <td>
                    <NButton
                      type="button"
                      className="bg-[#8BD08E] px-4 py-1 text-[1.2rem]"
                      onClick={() => onSelectClient(client)}
                    >
                      Chọn
                    </NButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center">
          <CustomPagination
            totalPage={meta.totalPages}
            page={page}
            setPage={setPage}
            dataPagination={meta}
          />
        </div>
      )}
    </div>
  )
}
