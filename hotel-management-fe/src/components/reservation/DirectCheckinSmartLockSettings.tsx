import { type Control, Controller, type FieldValues } from 'react-hook-form'

import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import {
  CustomCollapsible,
  CustomCollapsibleContent,
  CustomCollapsibleTrigger,
} from '@/components/common/CustomCollapsible'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomInput } from '@/components/common/CustomInput'
import type { Option } from '@/components/common/CustomSelectClean'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import { NButton } from '@/components/ui/new-button'
import { formatDateValue } from '@/lib/reservation'
import { isMaskedSmartLockPin } from '@/lib/smart-lock-directcheckin'

type DirectCheckinSmartLockSettingsProps = {
  control: Control<FieldValues>
  directcheckinFlag: boolean
  contactedFlag: boolean
  staffOptions: Option[]
  onToggleDirectcheckinFlag: (checked: boolean) => void
  onContactedFlagChange: (checked: boolean, onChange: (value: boolean) => void) => void
  onGenerateSmartLockPin: () => string
}

export default function DirectCheckinSmartLockSettings({
  control,
  directcheckinFlag,
  contactedFlag,
  staffOptions,
  onToggleDirectcheckinFlag,
  onContactedFlagChange,
  onGenerateSmartLockPin,
}: DirectCheckinSmartLockSettingsProps) {
  return (
    <CustomCollapsible className="my-8">
      <CustomCollapsibleTrigger className="[&>svg]:hidden">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="reserve.directcheckin_flag"
            render={({ field }) => (
              <CustomCheckbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  onToggleDirectcheckinFlag(checked === true)
                }}
              />
            )}
          />
          <h5 className="font-bold text-[1.6rem] leading-none">Cài đặt nhận phòng trực tiếp</h5>
        </div>
      </CustomCollapsibleTrigger>

      {directcheckinFlag && (
        <CustomCollapsibleContent className="my-4">
          <div className="flex items-center w-full">
            <div className="ml-[-0.1rem] first:ml-0 w-1/2">
              <div className="flex">
                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[20.4rem] h-[7.5rem] font-bold text-[1.6rem] text-center leading-6">
                  Mã PIN Smart Lock
                </p>
                <div className="relative w-full">
                  <Controller
                    control={control}
                    name="reserve.smart_lock_pin"
                    render={({ field }) => (
                      <div className="flex items-center justify-center gap-[2rem] border border-r-0 border-black h-[7.5rem]">
                        <CustomInput
                          value={field.value ?? ''}
                          onFocus={() => {
                            // Masked PIN indicates existing credential from backend.
                            // Clear it on focus so users can type a replacement PIN if needed.
                            if (isMaskedSmartLockPin(field.value)) {
                              field.onChange('')
                            }
                          }}
                          onChange={(event) => {
                            const nextPin = event.target.value.replace(/\D/g, '').slice(0, 12)
                            field.onChange(nextPin)
                          }}
                          className="disabled:bg-[#EEEEEE] !opacity-100 px-6 w-[60%] h-[3.6rem] text-center"
                          placeholder="4-12 chữ số"
                        />
                        <NButton
                          type="button"
                          className="mx-2 px-4 h-[3.6rem] text-[1.2rem] whitespace-nowrap"
                          onClick={() => field.onChange(onGenerateSmartLockPin())}
                        >
                          Tạo PIN
                        </NButton>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="ml-[-0.1rem] first:ml-0 w-1/4">
              <div className="flex items-center">
                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black w-full h-[7.5rem] font-bold text-[1.6rem] text-center leading-6">
                  NV liên hệ
                </p>
                <div className="flex flex-col items-center border-black border-y h-[7.5rem]">
                  <div className="relative">
                    <Controller
                      control={control}
                      name="reserve.di_contact_staff_id"
                      render={({ field }) => (
                        <CustomSelectClean
                          isAll
                          option={staffOptions}
                          selected={staffOptions.find((option) => option.value === field.value)}
                          change={(option) => field.onChange(option.value)}
                          customClassMain="h-16 rounded-none border-x-0 min-w-[18rem] border-t-0 border-r border-black"
                        />
                      )}
                    />
                  </div>
                  <div className="relative flex justify-center items-center w-full gap-[.5rem] h-full">
                    <Controller
                      control={control}
                      name="reserve.contacted_flag"
                      render={({ field }) => (
                        <div className="flex justify-center items-center gap-[.5rem] ml-2 border-black border-r w-full h-full">
                          <CustomCheckbox
                            id="direct-checkin-contacted"
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              onContactedFlagChange(checked === true, field.onChange)
                            }}
                          />
                          <label
                            htmlFor="direct-checkin-contacted"
                            className="text-[1.6rem] whitespace-nowrap cursor-pointer w-full"
                          >
                            Đã liên hệ
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-[-0.1rem] first:ml-0 w-1/4">
              <div className="flex items-center">
                <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[10rem] h-[7.5rem] font-bold text-[1.6rem] text-center leading-6">
                  Ngày giờ
                </p>
                <div className="relative col-span-2 w-full">
                  <Controller
                    control={control}
                    name="reserve.checkin_date"
                    render={({ field }) => (
                      <div className="flex items-center justify-center border w-full border-black h-[7.5rem]">
                        <CustomDatePicker
                          disable={!contactedFlag}
                          value={field.value ? new Date(field.value) : null}
                          format="yyyy/MM/dd HH:mm"
                          className="[&>div]:px-4 w-full border-none h-[3rem] font-bold [&_input::placeholder]:text-black text-2xl cursor-pointer"
                          change={(date: Date | Date[] | null) => {
                            field.onChange(formatDateValue(date, 'YYYY-MM-DD HH:mm'))
                          }}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-[2rem] w-full">
            <div className="flex w-1/2">
              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[20.4rem] h-[7.5rem] font-bold text-[1.6rem] text-center leading-6 px-2">
                Thời gian hiệu lực
              </p>
              <div className="flex items-center justify-center border border-black w-full h-[7.5rem]">
                <Controller
                  control={control}
                  name="reserve.smart_lock_valid_from"
                  render={({ field }) => (
                    <CustomDatePicker
                      format="yyyy/MM/dd HH:mm"
                      className="flex-none [&>div]:px-[0.4rem] border-none h-16 font-bold [&_input::placeholder]:text-black lowercase cursor-pointer"
                      change={(date: Date | Date[] | null) => {
                        field.onChange(formatDateValue(date, 'YYYY-MM-DD HH:mm'))
                      }}
                      value={field.value ? new Date(field.value) : null}
                    />
                  )}
                />
                <div className="flex justify-center items-center !mt-0 w-[2rem] h-16 font-bold text-[1.4rem]">
                  ~
                </div>
                <Controller
                  control={control}
                  name="reserve.smart_lock_valid_to"
                  render={({ field }) => (
                    <CustomDatePicker
                      format="yyyy/MM/dd HH:mm"
                      className="flex-none !mt-0 [&>div]:px-[0.4rem] border-none h-16 font-bold [&_input::placeholder]:text-black lowercase cursor-pointer"
                      change={(date: Date | Date[] | null) => {
                        field.onChange(formatDateValue(date, 'YYYY-MM-DD HH:mm'))
                      }}
                      value={field.value ? new Date(field.value) : null}
                    />
                  )}
                />
              </div>
            </div>

            <div className="ml-[-0.1rem] first:ml-0 flex w-1/2">
              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[18rem] h-[7.5rem] font-bold text-[1.6rem] text-center leading-6">
                Ghi chú nhận phòng
              </p>
              <div className="flex justify-center items-center border border-black w-full">
                <Controller
                  control={control}
                  name="reserve.directcheckin_note"
                  render={({ field }) => (
                    <CustomInput
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      className="!mt-0 px-6 border-none w-[90%] h-[2.5rem]"
                      placeholder="Nhập ghi chú nếu có"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </CustomCollapsibleContent>
      )}
    </CustomCollapsible>
  )
}
