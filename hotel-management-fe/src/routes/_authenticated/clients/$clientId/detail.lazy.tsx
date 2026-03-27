import { DialogClose } from '@radix-ui/react-dialog'
import { Link, createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
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
import { BicycleSvg } from '@/components/svgs/BicycleSVG'
import { BinSVG } from '@/components/svgs/BinSVG'
import { CarSvg } from '@/components/svgs/CarSvg'
import { DogSvg } from '@/components/svgs/DogSvg'
import { NButton } from '@/components/ui/new-button'
import { DataType, Sex, StayDurationAutoFlag, UgFlag, UsedMessyLevel } from '@/constants/common'
import { cn } from '@/lib/utils'
import { calculateAge, isEmpty } from '@/misc/type-guard.misc'

import { useDeleteClient } from '@/hooks/mutations/useDeleteClient'
import { useReactivateClient, useSuspendClient } from '@/hooks/mutations/useSuspendClient'
import { useGetClientById } from '@/hooks/queries/useGetClientById'
import { useGetIdentifications } from '@/hooks/queries/useGetIdentifications'
import { ClientDataStatus } from '@/types/client'
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

  // Dynamic label based on data type
  const typeTitleOption: string[] = ['Không xác định', 'Họ tên', 'Tên công ty', 'Tên công ty']

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return dayjs(dateStr).format('YYYY/MM/DD')
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
    <div className="box-border flex flex-col gap-[2rem] py-[2rem] common-container">
      {/* Title */}
      <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
        <div className="ml-[1.5rem] font-bold text-[2.3rem]">Chi tiết khách hàng</div>
      </div>

      {!isEmpty(client) ? (
        <>
          <section className="mt-[2rem]">
            <CustomAccordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
              {/* Customer Information Section */}
              <CustomAccordionItem
                value="item-1"
                className="bg-white first:mt-0 mb-20 border !border-black rounded-[0.8rem]"
              >
                <CustomAccordionTrigger className="bg-[#8BD08E] py-3 border-none rounded-[0.8rem] [&[data-state=open]]:rounded-[0.8rem_0.8rem_0_0]">
                  <div className="flex items-center">
                    <div className="mr-20 font-bold text-xl sm:text-3xl">Thông tin khách hàng</div>
                  </div>
                </CustomAccordionTrigger>
                <CustomAccordionContent className="p-10">
                  <div className={cn('flex flex-col gap-[2.3rem] w-[100%]')}>
                    <table
                      className={cn(
                        'border-collapse',
                        '[&_td]:h-[4.6rem]',
                        '[&_td]:px-[.5rem] sm:[&_td]:[&_*]:text-[1.6rem] [&_td]:[&_*]:text-[1.1rem]'
                      )}
                    >
                      <tbody>
                        {/* Row 1: Type | Client Code | Identity */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Loại
                          </td>
                          <td className="border border-black">
                            {DataType[client.dataType as keyof typeof DataType]}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Mã khách hàng
                          </td>
                          <td className="border border-black">{client.clientId}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Giấy tờ tùy thân
                          </td>
                          <td className="py-[1rem] border border-black" colSpan={3}>
                            <div className="flex justify-between gap-[1.3rem] pr-[2rem] h-[100%]">
                              <div className="flex items-center">
                                {client.expirationDateLast
                                  ? `Hạn: ${dayjs(client.expirationDateLast).format('YYYY/MM/DD')}`
                                  : null}
                              </div>
                              <CustomDialog
                                size="medium"
                                trigger={
                                  <NButton className="bg-[#efefef] sm:w-[8rem] text-lg sm:text-2xl">
                                    <span>Xem</span>
                                  </NButton>
                                }
                                title="Thông tin giấy tờ tùy thân"
                                content={
                                  <div className="p-4">
                                    {identifications && identifications.length > 0 ? (
                                      <table className="w-full border-collapse">
                                        <thead>
                                          <tr className="bg-gray-100">
                                            <th className="py-2 px-4 border text-left">
                                              Loại giấy tờ
                                            </th>
                                            <th className="py-2 px-4 border text-left">
                                              Số giấy tờ
                                            </th>
                                            <th className="py-2 px-4 border text-left">
                                              Ngày hết hạn
                                            </th>
                                            <th className="py-2 px-4 border text-left">
                                              Trạng thái
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {identifications.map((id) => (
                                            <tr key={id.identificationId} className="border-b">
                                              <td className="py-2 px-4 border">
                                                {getIdentificationTypeName(id.identificationType)}
                                                {id.identificationTypeInput &&
                                                  ` (${id.identificationTypeInput})`}
                                              </td>
                                              <td className="py-2 px-4 border">
                                                {id.identificationNumber || '-'}
                                              </td>
                                              <td className="py-2 px-4 border">
                                                {formatDate(id.expirationDate)}
                                              </td>
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
                                      <p className="text-gray-500 text-center py-4">
                                        Chưa có giấy tờ tùy thân nào
                                      </p>
                                    )}
                                  </div>
                                }
                              />
                            </div>
                          </td>
                        </tr>

                        {/* Row 2: Name | Birthday + Age */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            {typeTitleOption[client.dataType]}
                          </td>
                          <td className="border border-black" colSpan={3}>
                            {client.clientName}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Ngày sinh
                          </td>
                          <td colSpan={2} style={{ borderRight: '1px dashed black' }}>
                            {client.birthday ? dayjs(client.birthday).format('YYYY/MM/DD') : ''}
                          </td>
                          <td
                            className="border-r border-black border-l-dashed"
                            style={{ borderLeft: '1px dashed black' }}
                          >
                            {client.birthday ? `${calculateAge(client.birthday)} tuổi` : null}
                          </td>
                        </tr>

                        {/* Row 3: Nationality | Sex | Address */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Quốc tịch
                          </td>
                          <td className="border border-black">{client.countryName}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Giới tính
                          </td>
                          <td className="border border-black">
                            {client?.sex ? Sex[client.sex] : null}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Địa chỉ
                          </td>
                          <td className="border border-black leading-7" colSpan={3}>
                            {`${client.zipCode || ''} ${client.address1 || ''} ${client.address2 || ''}`}
                          </td>
                        </tr>

                        {/* Row 4: Phone numbers | Email */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            ĐT (Nhà)
                          </td>
                          <td className="border border-black">{client.tel}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            ĐT (Di động)
                          </td>
                          <td className="border border-black">{client.telPhone}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            ĐT (Khẩn cấp)
                          </td>
                          <td className="border border-black">{client.telEmergency}</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Email
                          </td>
                          <td className="border border-black">{client.email}</td>
                        </tr>

                        {/* Empty separator row */}
                        <tr className="border-none">
                          <td className="border-none" />
                        </tr>

                        {/* Row 6: Stay Auto Extend | Room Dirty | UG */}
                        <tr>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Tự động gia hạn
                          </td>
                          <td className="border border-black">
                            {client.stayDurationAutoFlag !== undefined
                              ? StayDurationAutoFlag[client.stayDurationAutoFlag]
                              : ''}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Phòng bẩn
                          </td>
                          <td className="border border-black">
                            {client.usedMessyLevel !== undefined
                              ? UsedMessyLevel[client.usedMessyLevel]
                              : ''}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            UG
                          </td>
                          <td className="border border-black">
                            {client.ugFlag !== undefined
                              ? UgFlag[
                                  typeof client.ugFlag === 'boolean'
                                    ? client.ugFlag
                                      ? 1
                                      : 0
                                    : client.ugFlag
                                ]
                              : ''}
                          </td>
                          <td className="!border-0" />
                          <td className="!border-0" />
                        </tr>

                        {/* Row 7: Memo */}
                        <tr className="!h-[9.2rem]">
                          <td className="bg-[#efefef] border border-black min-w-[14rem] font-bold">
                            Ghi chú
                          </td>
                          <td
                            className="border border-black break-words leading-snug whitespace-normal"
                            colSpan={7}
                          >
                            {client.memo}
                          </td>
                        </tr>

                        {/* Empty separator row */}
                        <tr className="border-none">
                          <td className="border-none" />
                        </tr>

                        {/* Row 9: Use Count | Used Services */}
                        <tr>
                          <td className="bg-[#efefef] border border-black font-bold">
                            Số lần sử dụng
                          </td>
                          <td className="border border-black">{client.useCount} lần</td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Dịch vụ đã dùng
                          </td>
                          <td className="border border-black" colSpan={2}>
                            <div className="flex justify-center gap-[0.5rem]">
                              {client?.lastUsedServiceIds?.map((item) =>
                                item.type === 1 ? (
                                  <div
                                    key={item.id}
                                    className="flex justify-center items-center bg-[#B86020] mr-3 p-2 border-none rounded-[0.4rem] w-10 sm:w-16 h-10 sm:h-16"
                                  >
                                    <CarSvg />
                                  </div>
                                ) : null
                              )}
                              {client?.lastUsedServiceIds?.map((item) =>
                                item.type === 2 ? (
                                  <div
                                    key={item.id}
                                    className="flex justify-center items-center bg-[#B86020] mr-3 p-2 border-none rounded-[0.4rem] w-10 sm:w-16 h-10 sm:h-16"
                                  >
                                    <BicycleSvg />
                                  </div>
                                ) : null
                              )}
                              {client?.lastUsedServiceIds?.map((item) =>
                                item.type === 4 ? (
                                  <div
                                    key={item.id}
                                    className="flex justify-center items-center bg-[#B86020] mr-3 p-2 border-none rounded-[0.4rem] w-10 sm:w-16 h-10 sm:h-16"
                                  >
                                    <DogSvg />
                                  </div>
                                ) : null
                              )}
                              {client?.lastUsedServiceIds?.map((item) =>
                                item.type === 5 ? (
                                  <div
                                    key={item.id}
                                    className="flex justify-center items-center bg-[#B86020] mr-3 p-2 border-none rounded-[0.4rem] w-10 sm:w-16 h-10 sm:h-16"
                                  >
                                    <BinSVG className="[&>path]:fill-white" />
                                  </div>
                                ) : null
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Action buttons inside section */}
                    <div className="flex justify-center items-center gap-[2rem]">
                      <Link
                        to="/clients/$clientId/edit"
                        params={{ clientId }}
                        className={cn({
                          '!hidden': !client.dataStatus,
                        })}
                      >
                        <NButton
                          type="button"
                          className="bg-[#efefef] w-[12.4rem] text-lg sm:text-2xl"
                        >
                          <span>Chỉnh sửa</span>
                        </NButton>
                      </Link>
                    </div>
                  </div>
                </CustomAccordionContent>
              </CustomAccordionItem>

              {/* Identification Section */}
              <CustomAccordionItem
                className="bg-white first:mt-0 mb-4 border !border-black rounded-[0.8rem]"
                value="item-2"
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
          </section>

          {/* Action Buttons at the bottom */}
          <div className="flex justify-center gap-4">
            <NButton onClick={() => navigate({ to: '/clients' })}>Quay lại</NButton>

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
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-gray-500">Không tìm thấy khách hàng</p>
          <NButton onClick={() => navigate({ to: '/clients' })} className="mt-4">
            Quay lại danh sách
          </NButton>
        </div>
      )}
    </div>
  )
}
