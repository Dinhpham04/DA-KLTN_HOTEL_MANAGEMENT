import { Controller, type Control, type FieldValues, useFieldArray, useWatch } from 'react-hook-form'
import dayjs from 'dayjs'
import React from 'react'
import { CustomInput } from '@/components/common/CustomInput'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import { NButton } from '@/components/ui/new-button'
import { SEX_OPTIONS } from '@/constants/reservation'

interface ReservationOccupierTableProps {
  control: Control<FieldValues>
  fieldName: string
  client?: {
    client_name?: string
    tel_phone?: string
    address1?: string
    address2?: string
    birthday?: string
    sex?: string
  }
  disabled?: boolean
}

type Option = {
  value: string
  label: string
}

const sexOptions: Option[] = SEX_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.name,
}))

export const ReservationOccupierTable: React.FC<ReservationOccupierTableProps> = ({
  control,
  fieldName,
  client,
  disabled = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName as never,
  })

  const handleAddCurrentClient = () => {
    append({
      occupier_name: client?.client_name ?? '',
      sex: client?.sex ?? '',
      tel: client?.tel_phone ?? '',
      address1: `${client?.address1 ?? ''} ${client?.address2 ?? ''}`.trim(),
      birthday: client?.birthday ?? null,
      order_num: fields.length,
    })
  }

  const handleAdd = () => {
    append({
      occupier_name: '',
      sex: '',
      tel: '',
      address1: '',
      birthday: null,
      order_num: fields.length,
    })
  }

  const handleCopy = (index: number) => {
    const field = fields[index]
    if (field) {
      const dataCopy = { ...field, order_num: fields.length }
      append(dataCopy)
    }
  }

  const handleDelete = (index: number) => {
    remove(index)
  }

  return (
    <div className="mt-16">
      <div className="flex mb-4 items-center bg-white h-[4.7rem]  font-bold text-[2.3rem]">
        <h2 className="font-bold text-[2.3rem]">■ Khách lưu trú</h2>
      </div>
      <div className="flex justify-end items-center bg-[#EEEEEE] px-8 py-[1.9rem] border border-black border-b-0 w-full min-w-full">
        <div className="flex items-center gap-4">
          <NButton
            type="button"
            disabled={disabled}
            onClick={handleAddCurrentClient}
            className="bg-[#EEEEEE] text-[1.6rem] h-[3.6rem] px-4"
          >
            Thêm (Khách hàng)
          </NButton>
          <NButton
            type="button"
            disabled={disabled}
            onClick={handleAdd}
            className="bg-[#EEEEEE] text-[1.6rem] h-[3.6rem] px-4"
          >
            Thêm
          </NButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[1.6rem] border-collapse border border-black">
          <thead>
            <tr className="bg-[#EEEEEE]">
              <th className="border border-black h-16 text-center font-bold w-[3%]">No</th>
              <th className="border border-black h-16 text-center font-bold w-[15%]">Họ tên</th>
              <th className="border border-black h-16 text-center font-bold w-[12%]">Giới tính</th>
              <th className="border border-black h-16 text-center font-bold w-[12%]">Ngày sinh</th>
              <th className="border border-black h-16 text-center font-bold w-[12%]">Tuổi</th>
              <th className="border border-black h-16 text-center font-bold w-[12%]">SĐT</th>
              <th className="border border-black h-16 text-center font-bold w-[15%]">Địa chỉ</th>
              <th className="border border-black h-16 text-center font-bold w-[19%]">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border border-black h-16 text-center text-gray-400 py-8"
                >
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id} className="border-t border-black">
                  <td className="border border-black h-16 text-center">{index + 1}</td>

                  {/* Họ tên */}
                  <td className="border border-black h-16 p-0">
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.occupier_name`}
                      render={({ field }) => (
                        <CustomInput
                          {...field}
                          value={field.value ?? ''}
                          disabled={disabled}
                          className="border-none w-full h-full"
                        />
                      )}
                    />
                  </td>

                  {/* Giới tính */}
                  <td className="border border-black h-16 p-0">
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.sex`}
                      render={({ field }) => (
                        <CustomSelectClean
                          isAll
                          option={sexOptions}
                          selected={sexOptions.find((o) => o.value === field.value)}
                          change={(o) => field.onChange(o.value)}
                          customClassMain="h-16 w-full border-none"
                        />
                      )}
                    />
                  </td>

                  {/* Ngày sinh */}
                  <td className="border border-black h-16 p-0">
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.birthday`}
                      render={({ field }) => (
                        <CustomDatePicker
                          value={field.value ? new Date(field.value) : null}
                          format="yyyy/MM/dd"
                          change={(date: Date | Date[] | null) => {
                            if (date && !(date instanceof Array)) {
                              field.onChange(dayjs(date).format('YYYY-MM-DD'))
                            } else {
                              field.onChange(null)
                            }
                          }}
                          className="h-16 border-none w-full"
                        />
                      )}
                    />
                  </td>

                  {/* Tuổi (auto-calculated) */}
                  <td className="border border-black h-16 text-center">
                    <AgeDisplay
                      control={control}
                      fieldName={fieldName}
                      index={index}
                    />
                  </td>

                  {/* SĐT */}
                  <td className="border border-black h-16 p-0">
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.tel`}
                      render={({ field }) => (
                        <CustomInput
                          {...field}
                          value={field.value ?? ''}
                          disabled={disabled}
                          className="border-none w-full h-full"
                          inputMode="numeric"
                        />
                      )}
                    />
                  </td>

                  {/* Địa chỉ */}
                  <td className="border border-black h-16 p-0">
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.address1`}
                      render={({ field }) => (
                        <CustomInput
                          {...field}
                          value={field.value ?? ''}
                          disabled={disabled}
                          className="border-none w-full h-full"
                        />
                      )}
                    />
                  </td>

                  {/* Thao tác */}
                  <td className="border border-black h-16 p-0">
                    <div className="flex justify-center items-center h-full gap-2">
                      <NButton
                        type="button"
                        disabled={disabled}
                        onClick={() => handleCopy(index)}
                        className="h-[2.8rem] px-3 text-[1.4rem]"
                      >
                        Sao chép
                      </NButton>
                      <NButton
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDelete(index)}
                        className="h-[2.8rem] px-3 text-[1.4rem]"
                      >
                        Xóa
                      </NButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface AgeDisplayProps {
  control: Control<FieldValues>
  fieldName: string
  index: number
}

const AgeDisplay: React.FC<AgeDisplayProps> = ({ control, fieldName, index }) => {
  const birthday = useWatch({ control, name: `${fieldName}.${index}.birthday` })

  if (!birthday) return <span>---</span>
  const age = dayjs().diff(dayjs(birthday), 'year')
  return <span>{age >= 0 ? age : '---'}</span>
}
