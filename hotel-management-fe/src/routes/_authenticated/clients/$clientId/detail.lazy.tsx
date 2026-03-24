import { DialogClose } from '@radix-ui/react-dialog'
import { createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'react-toastify'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import CustomDialog from '@/components/common/CustomDialog'
import Loading from '@/components/common/Loading'
import { NButton } from '@/components/ui/new-button'
import { cn } from '@/lib/utils'

import { useDeleteClient } from '@/hooks/mutations/useDeleteClient'
import { useReactivateClient, useSuspendClient } from '@/hooks/mutations/useSuspendClient'
import { useGetClientById } from '@/hooks/queries/useGetClientById'
import { useGetIdentifications } from '@/hooks/queries/useGetIdentifications'
import { ClientDataStatus, ClientDataType, SexType } from '@/types/client'
import { getIdentificationTypeName } from '@/types/identification'

export const Route = createLazyFileRoute('/_authenticated/clients/$clientId/detail')({
  component: ClientDetailPage,
})

function ClientDetailPage() {
  const navigate = useNavigate()
  const { clientId } = useParams({ from: '/_authenticated/clients/$clientId/detail' })
  const clientIdNum = Number(clientId)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSuspendOpen, setIsSuspendOpen] = useState(false)

  const { data: client, isLoading, refetch } = useGetClientById({ clientId: clientIdNum })
  const { data: identifications } = useGetIdentifications({
    clientId: clientIdNum,
    enabled: !!clientIdNum,
  })

  const deleteClientMutation = useDeleteClient({
    onSuccess: () => {
      toast.success('Xóa khách hàng thành công')
      navigate({ to: '/clients' })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa khách hàng')
    },
  })

  const suspendMutation = useSuspendClient({
    onSuccess: () => {
      toast.success('Tạm ngưng khách hàng thành công')
      refetch()
      setIsSuspendOpen(false)
    },
    onError: () => {
      toast.error('Có lỗi xảy ra')
    },
  })

  const reactivateMutation = useReactivateClient({
    onSuccess: () => {
      toast.success('Kích hoạt lại khách hàng thành công')
      refetch()
      setIsSuspendOpen(false)
    },
    onError: () => {
      toast.error('Có lỗi xảy ra')
    },
  })

  if (isLoading) {
    return <Loading />
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-500">Không tìm thấy khách hàng</p>
        <NButton onClick={() => navigate({ to: '/clients' })} className="mt-4">
          Quay lại danh sách
        </NButton>
      </div>
    )
  }

  const isSuspended = client.dataStatus === ClientDataStatus.SUSPENDED
  const isIndividual = client.dataType === ClientDataType.INDIVIDUAL

  const getDataTypeName = (type: number) => {
    switch (type) {
      case ClientDataType.INDIVIDUAL:
        return 'Cá nhân'
      case ClientDataType.CORPORATION:
        return 'Doanh nghiệp'
      case ClientDataType.SPECIAL_CORPORATION:
        return 'DN đặc biệt'
      default:
        return 'Chưa xác định'
    }
  }

  const getSexName = (sex: number) => {
    switch (sex) {
      case SexType.MALE:
        return 'Nam'
      case SexType.FEMALE:
        return 'Nữ'
      default:
        return 'Khác'
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  const handleDelete = () => {
    deleteClientMutation.mutate(clientIdNum)
    setIsDeleteOpen(false)
  }

  const handleSuspendToggle = () => {
    if (isSuspended) {
      reactivateMutation.mutate(clientIdNum)
    } else {
      suspendMutation.mutate(clientIdNum)
    }
  }

  return (
    <div className="box-border flex flex-col gap-[2.3rem] py-[2.3rem] common-container">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
            <div className="ml-[1.5rem] font-bold text-[2.3rem]">Chi tiết khách hàng</div>
          </div>
          {isSuspended && (
            <span className="ml-2 px-2 py-1 text-sm bg-red-100 text-red-700 rounded">
              Đã tạm ngưng
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <NButton onClick={() => navigate({ to: '/clients' })}>Quay lại</NButton>
          <NButton onClick={() => navigate({ to: `/clients/${clientId}/edit` })}>Chỉnh sửa</NButton>
        </div>
      </div>

      {/* Customer Info Section */}
      <CustomAccordion type="multiple" className="w-full" defaultValue={['info', 'id']}>
        <CustomAccordionItem
          className="bg-white first:mt-0 mb-4 border !border-black rounded-[0.8rem]"
          value="info"
        >
          <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
            <div className="font-bold text-black text-[1.8rem]">Thông tin khách hàng</div>
          </CustomAccordionTrigger>
          <CustomAccordionContent className="pb-0">
            <div className={cn('p-4', isSuspended && 'bg-red-50')}>
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left bg-gray-100 w-1/6">Loại</th>
                    <td className="py-2 px-4">{getDataTypeName(client.dataType)}</td>
                    <th className="py-2 px-4 text-left bg-gray-100 w-1/6">Mã khách hàng</th>
                    <td className="py-2 px-4">{client.clientId}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left bg-gray-100">
                      {isIndividual ? 'Họ tên' : 'Tên công ty'}
                    </th>
                    <td className="py-2 px-4">
                      {isIndividual ? client.clientName : client.companyName || client.clientName}
                    </td>
                    <th className="py-2 px-4 text-left bg-gray-100">Ngày sinh</th>
                    <td className="py-2 px-4">{formatDate(client.birthday)}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left bg-gray-100">Giới tính</th>
                    <td className="py-2 px-4">{getSexName(client.sex)}</td>
                    <th className="py-2 px-4 text-left bg-gray-100">Email</th>
                    <td className="py-2 px-4">{client.email || '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left bg-gray-100">Địa chỉ</th>
                    <td className="py-2 px-4" colSpan={3}>
                      {client.address1} {client.address2}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left bg-gray-100">ĐT (Di động)</th>
                    <td className="py-2 px-4">{client.telPhone || '-'}</td>
                    <th className="py-2 px-4 text-left bg-gray-100">ĐT (Nhà)</th>
                    <td className="py-2 px-4">{client.tel || '-'}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left bg-gray-100">Số lần sử dụng</th>
                    <td className="py-2 px-4">{client.useCount} lần</td>
                    <th className="py-2 px-4 text-left bg-gray-100">Trả sau</th>
                    <td className="py-2 px-4">{client.postpaidFlag ? 'Có' : 'Không'}</td>
                  </tr>
                  <tr>
                    <th className="py-2 px-4 text-left bg-gray-100">Ghi chú</th>
                    <td className="py-2 px-4" colSpan={3}>
                      {client.memo || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CustomAccordionContent>
        </CustomAccordionItem>

        {/* Identification Section */}
        <CustomAccordionItem
          className="bg-white first:mt-0 mb-4 border !border-black rounded-[0.8rem]"
          value="id"
        >
          <CustomAccordionTrigger className="bg-[#79A3E0] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
            <div className="font-bold text-black text-[1.8rem]">Giấy tờ tùy thân</div>
          </CustomAccordionTrigger>
          <CustomAccordionContent className="pb-0">
            <div className="p-4">
              {identifications && identifications.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border text-left">Loại giấy tờ</th>
                      <th className="py-2 px-4 border text-left">Số giấy tờ</th>
                      <th className="py-2 px-4 border text-left">Ngày hết hạn</th>
                      <th className="py-2 px-4 border text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {identifications.map((id) => (
                      <tr key={id.identificationId} className="border-b">
                        <td className="py-2 px-4 border">
                          {getIdentificationTypeName(id.identificationType)}
                          {id.identificationTypeInput && ` (${id.identificationTypeInput})`}
                        </td>
                        <td className="py-2 px-4 border">{id.identificationNumber || '-'}</td>
                        <td className="py-2 px-4 border">{formatDate(id.expirationDate)}</td>
                        <td className="py-2 px-4 border">
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-sm',
                              id.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            )}
                          >
                            {id.active ? 'Đang sử dụng' : 'Không sử dụng'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có giấy tờ tùy thân nào</p>
              )}
            </div>
          </CustomAccordionContent>
        </CustomAccordionItem>
      </CustomAccordion>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <CustomDialog
          opened={isSuspendOpen}
          changeOnOpened={setIsSuspendOpen}
          customClass="text-center [&_svg]:hidden"
          size="max"
          trigger={
            <NButton className={isSuspended ? 'bg-[#8BD08E]' : 'bg-red-400'}>
              {isSuspended ? 'Kích hoạt lại' : 'Tạm ngưng'}
            </NButton>
          }
          title={isSuspended ? 'Xác nhận kích hoạt lại' : 'Xác nhận tạm ngưng'}
          content={
            <div className="p-4">
              <p>
                {isSuspended
                  ? 'Bạn có chắc chắn muốn kích hoạt lại khách hàng này?'
                  : 'Bạn có chắc chắn muốn tạm ngưng khách hàng này?'}
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <DialogClose onClick={handleSuspendToggle}>
                  <div
                    className={cn(
                      'mx-4 w-[12.4rem] btn btn-default',
                      isSuspended ? 'bg-[#8BD08E]' : 'bg-red-400'
                    )}
                  >
                    <span>{isSuspended ? 'Kích hoạt lại' : 'Tạm ngưng'}</span>
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

        <CustomDialog
          opened={isDeleteOpen}
          changeOnOpened={setIsDeleteOpen}
          customClass="text-center [&_svg]:hidden"
          size="max"
          trigger={<NButton className="bg-red-500">Xóa</NButton>}
          title="Xác nhận xóa"
          content={
            <div className="p-4">
              <p>Bạn có chắc chắn muốn xóa khách hàng này?</p>
              <p className="text-sm text-gray-500 mt-1">Hành động này không thể hoàn tác.</p>
              <div className="flex justify-center gap-4 mt-4">
                <DialogClose onClick={handleDelete}>
                  <div className="bg-red-500 mx-4 w-[12.4rem] btn btn-default text-white">
                    <span>Xóa</span>
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
      </div>
    </div>
  )
}
