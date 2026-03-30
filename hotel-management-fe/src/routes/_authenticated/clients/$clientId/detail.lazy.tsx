import { Link, createLazyFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import CustomDialog from '@/components/common/CustomDialog'
import Loading from '@/components/common/Loading'
import IdentificationSettingModal from '@/components/dialogs/IdentificationSettingModal'
import { BicycleSvg } from '@/components/svgs/BicycleSVG'
import { BinSVG } from '@/components/svgs/BinSVG'
import { CarSvg } from '@/components/svgs/CarSvg'
import { DogSvg } from '@/components/svgs/DogSvg'
import { NButton } from '@/components/ui/new-button'
import { DataType, Sex, StayDurationAutoFlag, UgFlag, UsedMessyLevel } from '@/constants/common'
import { cn } from '@/lib/utils'
import { calculateAge, isEmpty } from '@/misc/type-guard.misc'

import { useGetClientById } from '@/hooks/queries/useGetClientById'
import { useGetIdentifications } from '@/hooks/queries/useGetIdentifications'

export const Route = createLazyFileRoute('/_authenticated/clients/$clientId/detail')({
  component: ClientDetailPage,
})

function ClientDetailPage() {
  const navigate = useNavigate()
  const { clientId } = useParams({ from: '/_authenticated/clients/$clientId/detail' })
  const clientIdNum = Number(clientId)


  const [isIdentificationOpen, setIsIdentificationOpen] = useState(false)

  const { data: client, isLoading, refetch } = useGetClientById({ clientId: clientIdNum })
  const { data: identifications, refetch: refetchIdentifications } = useGetIdentifications({
    clientId: clientIdNum,
    enabled: !!clientIdNum,
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


  // Dynamic label based on data type
  const typeTitleOption: string[] = ['Không xác định', 'Họ tên', 'Tên công ty', 'Tên công ty']


  return (
    <div className="box-border flex flex-col gap-[2rem] py-[2rem] common-container">
      {/* Title */}
      <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
        <div className="ml-[1.5rem] font-bold text-[2.3rem]">Chi tiết khách hàng</div>
      </div>

      {!isEmpty(client) ? (
        <>
          <section className="mt-[2rem]">
            <CustomAccordion type="multiple" defaultValue={['item-1']} className="w-full">
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
                          <td className=" border border-black" colSpan={3}>
                            <div className="flex justify-between gap-[1.3rem] pr-[2rem] h-[80%]">
                              <div className="flex items-center">
                                {client.expirationDateLast
                                  ? `Hạn: ${dayjs(client.expirationDateLast).format('YYYY/MM/DD')}`
                                  : null}
                              </div>
                              <CustomDialog
                                size="medium"
                                opened={isIdentificationOpen}
                                changeOnOpened={setIsIdentificationOpen}
                                trigger={
                                  <NButton className="bg-[#efefef] sm:w-[8rem] text-[1.6rem] sm:text-2xl">
                                    <span>Xem</span>
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
                            {`${client.zipCode || ''} ${client.address2 || ''} ${client.address1 || ''}`}
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
                              ? StayDurationAutoFlag[client.stayDurationAutoFlag ? 1 : 0]
                              : ''}
                          </td>
                          <td className="bg-[#efefef] border border-black w-[14rem] font-bold">
                            Vệ sinh
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
                          className="bg-[#efefef] w-[14.4rem] text-lg sm:text-2xl"
                        >
                          <span>Chỉnh sửa</span>
                        </NButton>
                      </Link>
                    </div>
                  </div>
                </CustomAccordionContent>
              </CustomAccordionItem>
            </CustomAccordion>
          </section>
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
