import { type Control, Controller, type FieldValues } from 'react-hook-form'

import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomInput } from '@/components/common/CustomInput'
import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import type { Option } from '@/components/common/CustomSelectClean'
import CustomSelectClean from '@/components/common/CustomSelectClean'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import DirectCheckinSmartLockSettings from '@/components/reservation/DirectCheckinSmartLockSettings'
import {
  ADVERTISING_TYPE_OPTIONS,
  CONFIRM_FLAG_OPTIONS,
  DIRECTCHECKIN_TYPE_OPTIONS,
  NORESERVE_COUNT_OPTIONS,
  RENTAL_KEYS_OPTIONS,
} from '@/constants/reservation'
import { formatDateValue } from '@/lib/reservation'
import { cn } from '@/lib/utils'

type ReservationInfoCommonSectionProps = {
  control: Control<FieldValues>
  periodFrom?: string
  nightCount: number
  facilityOptions: Option[]
  selectedFacilityShortLabel: string
  onFacilityChange: (value: string) => void
  roomTypeOptions: Option[]
  selectedRoomTypeShortLabel: string
  onRoomTypeChange: (value: string) => void
  roomOptions: Option[]
  onRoomChange: (value: string) => void
  isFacilitySelected: boolean
  stayTypeOptions: Option[]
  checkinTimeFieldName: 'reserve.checkin_time' | 'reserve.period_from_time'
  disableRentalKeysSelect?: boolean
  directcheckinFlag: boolean
  contactedFlag: boolean
  staffOptions: Option[]
  onSyncDirectcheckinFlagByType: (value: string) => void
  onToggleDirectcheckinFlag: (checked: boolean) => void
  onContactedFlagChange: (checked: boolean, onChange: (value: boolean) => void) => void
  onGenerateSmartLockPin: () => string
}

export default function ReservationInfoCommonSection({
  control,
  periodFrom,
  nightCount,
  facilityOptions,
  selectedFacilityShortLabel,
  onFacilityChange,
  roomTypeOptions,
  selectedRoomTypeShortLabel,
  onRoomTypeChange,
  roomOptions,
  onRoomChange,
  isFacilitySelected,
  stayTypeOptions,
  checkinTimeFieldName,
  disableRentalKeysSelect = false,
  directcheckinFlag,
  contactedFlag,
  staffOptions,
  onSyncDirectcheckinFlagByType,
  onToggleDirectcheckinFlag,
  onContactedFlagChange,
  onGenerateSmartLockPin,
}: ReservationInfoCommonSectionProps) {
  return (
    <>
      <h5 className="font-bold text-[2.3rem] leading-none">■ Thông tin đặt phòng</h5>

      {/* Row 1: Main grid (Facility -> RoomType -> Room -> Dates -> StayType -> Flags) */}
      <div className="flex items-center mt-[1.6rem]">
        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[12.4rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Cơ sở
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.facility_id"
                render={({ field }) => (
                  <CustomSelectClean
                    isAll
                    option={facilityOptions}
                    selected={facilityOptions.find((o) => o.value === field.value)}
                    selectedLabel={selectedFacilityShortLabel}
                    change={(o) => onFacilityChange(o.value)}
                    customClassMain="w-full h-16 rounded-none border-black"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[12.4rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Loại phòng
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.room_type_id"
                render={({ field }) => (
                  <CustomSelectClean
                    isAll
                    option={roomTypeOptions}
                    selected={roomTypeOptions.find((o) => o.value === field.value)}
                    selectedLabel={selectedRoomTypeShortLabel}
                    change={(o) => onRoomTypeChange(o.value)}
                    disabledSelect={!isFacilitySelected}
                    customClassMain="w-full h-16 rounded-none border-black"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[12.4rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Số phòng
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.room_id"
                render={({ field }) => (
                  <CustomSelectClean
                    isAll
                    option={roomOptions}
                    selected={roomOptions.find((o) => o.value === field.value)}
                    change={(o) => onRoomChange(o.value)}
                    disabledSelect={!isFacilitySelected}
                    customClassMain="w-full h-16 rounded-none border-black"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[7rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Trước
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.noreserve_count_before"
                render={({ field }) => (
                  <CustomSelectClean
                    option={NORESERVE_COUNT_OPTIONS}
                    selected={NORESERVE_COUNT_OPTIONS.find((o) => o.value === field.value)}
                    change={(o) => field.onChange(o.value)}
                    customClassMain="w-full h-16 rounded-none border-black"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 my-0 ml-[-0.1rem] first:ml-0 min-w-[28.6rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Thời gian lưu trú ({nightCount} đêm)
            </p>
            <div className="flex items-center">
              <div className="relative flex-2 !m-0">
                <Controller
                  control={control}
                  name="reserve.period_from"
                  render={({ field }) => (
                    <CustomDatePicker
                      format="yyyy/MM/dd"
                      className={cn(
                        'flex-none [&>div]:px-[0.4rem] [&>div]:border-black w-[12.3rem] h-16 font-bold [&_input::placeholder]:text-[#999] lowercase cursor-pointer'
                      )}
                      change={(date: Date | Date[] | null) => {
                        field.onChange(formatDateValue(date, 'YYYY-MM-DD'))
                      }}
                      value={field.value ? new Date(field.value) : null}
                    />
                  )}
                />
              </div>
              <div className="flex flex-1 justify-center items-center !mt-0 border-black border-y min-w-[4rem] h-16 font-bold text-[1.4rem]">
                ~
              </div>
              <div className="relative flex-2 !m-0">
                <Controller
                  control={control}
                  name="reserve.period_to"
                  render={({ field }) => (
                    <CustomDatePicker
                      format="yyyy/MM/dd"
                      className={cn(
                        'flex-none !mt-0 [&>div]:px-[0.4rem] [&>div]:border-black w-[12.3rem] h-16 font-bold [&_input::placeholder]:text-[#999] lowercase cursor-pointer'
                      )}
                      change={(date: Date | Date[] | null) => {
                        field.onChange(formatDateValue(date, 'YYYY-MM-DD'))
                      }}
                      value={field.value ? new Date(field.value) : null}
                      defaultActiveStartDate={periodFrom ? new Date(periodFrom) : undefined}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[7rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Sau
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.noreserve_count_after"
                render={({ field }) => (
                  <CustomSelectClean
                    option={NORESERVE_COUNT_OPTIONS}
                    selected={NORESERVE_COUNT_OPTIONS.find((o) => o.value === field.value)}
                    change={(o) => field.onChange(o.value)}
                    customClassMain="w-full h-16 rounded-none border-black"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[20.3rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Loại lưu trú
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.stay_type_id"
                render={({ field }) => (
                  <CustomSelectClean
                    isAll
                    option={stayTypeOptions}
                    selected={stayTypeOptions.find((o) => o.value === field.value)}
                    change={(o) => field.onChange(o.value)}
                    customClassMain="w-full h-16 rounded-none border-black"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[14rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem] leading-8">
              Tự động gia hạn
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.auto_extend_flag"
                render={({ field }) => (
                  <div className="flex justify-center items-center border border-black h-16">
                    <CustomCheckbox checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[16.4rem]">
          <div className="flex flex-col">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
              Xác nhận
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.confirm_flag"
                render={({ field }) => (
                  <CustomSelectClean
                    option={CONFIRM_FLAG_OPTIONS}
                    selected={CONFIRM_FLAG_OPTIONS.find((o) => o.value === field.value)}
                    change={(o) => field.onChange(o.value)}
                    customClassMain="w-full h-16 rounded-none border-black"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="my-8 w-full">
        <div className="flex">
          <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.4rem] h-[4.8rem] font-bold text-[1.6rem]">
            Cách nhận phòng
          </div>
          <div className="flex flex-1 justify-between items-center px-8 py-2 border border-black">
            <Controller
              control={control}
              name="reserve.directcheckin_type"
              render={({ field }) => (
                <CustomRadio
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    onSyncDirectcheckinFlagByType(value)
                  }}
                  className="flex flex-wrap md:flex-nowrap gap-x-8 gap-y-4 !mt-0"
                >
                  {DIRECTCHECKIN_TYPE_OPTIONS.map((opt) => (
                    <div key={opt.id} className="flex items-center">
                      <CustomRadioItems value={opt.value} />
                      <span className="ml-2 font-medium text-[1.4rem] cursor-pointer">
                        {opt.name}
                      </span>
                    </div>
                  ))}
                </CustomRadio>
              )}
            />
          </div>
        </div>
      </div>

      <div className="mt-[-0.1rem] w-full">
        <div className="flex">
          <div className="flex justify-center items-center bg-[#EEEEEE] px-8 border border-black border-r-0 w-[18.4rem] h-[4.8rem] font-bold text-[1.6rem]">
            Kênh quảng cáo
          </div>
          <div className="flex flex-1 justify-between items-center px-8 py-2 border border-black">
            <Controller
              control={control}
              name="reserve.advertising_type"
              render={({ field }) => (
                <CustomRadio
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-wrap md:flex-nowrap gap-x-8 gap-y-4 !mt-0"
                >
                  {ADVERTISING_TYPE_OPTIONS.map((opt) => (
                    <div key={opt.id} className="flex items-center">
                      <CustomRadioItems value={opt.value} />
                      <span className="ml-2 font-medium text-[1.4rem] cursor-pointer">
                        {opt.name}
                      </span>
                    </div>
                  ))}
                </CustomRadio>
              )}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Keys + Checkin Time + Payment Due Date */}
      <div className="flex justify-between items-center">
        <div className="flex items-center mt-[1.6rem] mr-4">
          <div className="my-0 ml-[-0.1rem] first:ml-0 w-[6.5rem]">
            <div className="flex flex-col">
              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                🔑
              </p>
              <div className="relative w-full">
                <Controller
                  control={control}
                  name="reserve.rental_keys"
                  render={({ field }) => (
                    <CustomSelectClean
                      option={RENTAL_KEYS_OPTIONS}
                      selected={RENTAL_KEYS_OPTIONS.find((o) => o.value === field.value)}
                      change={(o) => field.onChange(o.value)}
                      disabledSelect={disableRentalKeysSelect}
                      customClassMain="w-full h-16 rounded-none border-black"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[14rem]">
            <div className="flex flex-col">
              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                Giờ nhận phòng
              </p>
              <div className={cn('relative w-full')}>
                <Controller
                  control={control}
                  name={checkinTimeFieldName}
                  render={({ field }) => (
                    <CustomInput
                      type="time"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      className="h-16 border border-black rounded-none text-center font-medium text-[1.4rem]"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="my-0 ml-[-0.1rem] first:ml-0 min-w-[14rem]">
            <div className="flex flex-col">
              <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-b-0 w-full h-16 font-bold text-[1.6rem]">
                Hạn thanh toán
              </p>
              <div className={cn('relative w-full')}>
                <Controller
                  control={control}
                  name="reserve.payment_due_date"
                  render={({ field }) => (
                    <CustomDatePicker
                      format="yyyy/MM/dd"
                      className={cn(
                        'flex-none [&>div]:px-[0.4rem] [&>div]:border-black w-full h-16 font-medium [&_input::placeholder]:text-black lowercase cursor-pointer'
                      )}
                      change={(date: Date | Date[] | null) => {
                        field.onChange(formatDateValue(date, 'YYYY-MM-DD'))
                      }}
                      value={field.value ? new Date(field.value) : null}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[1.6rem] w-[51.7rem]">
          <div className="flex">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[10.6rem] min-h-[6.9rem] font-bold text-[1.6rem]">
              Ghi chú
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.note"
                render={({ field }) => (
                  <CustomTextarea
                    {...field}
                    className="flex-1 !mt-0 py-4 border border-black border-solid rounded-none h-[6.9rem] min-h-full font-bold text-[1.4rem]"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Disable reservation checkbox + Overdue debt note */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="reserve.disable_reservation"
            render={({ field }) => (
              <div className="flex justify-center items-center h-16">
                <CustomCheckbox
                  id="disable_reservation"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
          <label
            className="font-bold text-[1.6rem] leading-none cursor-pointer"
            htmlFor="disable_reservation"
          >
            Không cho phép đặt phòng tiếp theo sau đặt phòng này
          </label>
        </div>

        <div className="mt-[1.6rem] w-[51.7rem]">
          <div className="flex">
            <p className="flex justify-center items-center bg-[#EEEEEE] border border-black border-r-0 min-w-[10.6rem] min-h-[6.9rem] font-bold text-[1.6rem]">
              Nợ quá hạn
            </p>
            <div className="relative w-full">
              <Controller
                control={control}
                name="reserve.overdue_debt_note"
                render={({ field }) => (
                  <CustomTextarea
                    {...field}
                    className="flex-1 !mt-0 py-4 border border-black border-solid h-[6.9rem] rounded-none min-h-full font-bold text-[1.4rem]"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <DirectCheckinSmartLockSettings
        control={control}
        directcheckinFlag={directcheckinFlag}
        contactedFlag={contactedFlag}
        staffOptions={staffOptions}
        onToggleDirectcheckinFlag={onToggleDirectcheckinFlag}
        onContactedFlagChange={onContactedFlagChange}
        onGenerateSmartLockPin={onGenerateSmartLockPin}
      />
    </>
  )
}
