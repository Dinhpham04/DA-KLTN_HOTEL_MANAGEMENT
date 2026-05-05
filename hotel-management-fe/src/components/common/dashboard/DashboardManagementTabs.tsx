import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePickerNextDay from '@/components/common/CustomDatePickerNextDay'
import CustomSelectClean, { type Option } from '@/components/common/CustomSelectClean'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import Loading from '@/components/common/Loading'
import { NButton } from '@/components/ui/new-button'
import { DIRECTCHECKIN_TYPE_OPTIONS } from '@/constants/reservation'
import { useUpdateBicycleParkingReserve } from '@/hooks/mutations/useUpdateBicycleParkingReserve'
import {
  useUpdateAllDailyReserve,
  useUpdateDailyReserve,
} from '@/hooks/mutations/useUpdateDailyReserve'
import { useUpdateParkingReserve } from '@/hooks/mutations/useUpdateParkingReserve'
import { useDailyReserve } from '@/hooks/queries/useDailyReserve'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { useParkingStatus } from '@/hooks/queries/useParkingStatus'
import {
  useCheckOut,
  useReservations,
  useUpdateAllReservations,
  useUpdateReservation,
} from '@/hooks/queries/useReservations'
import { cn } from '@/lib/utils'
import type { DailyReserve, UpdateDailyReserveBody } from '@/types/daily-reserve'
import type {
  BicycleParkingReserveItem,
  ParkingReserveItem,
  ParkingStatusResponse,
} from '@/types/parking-status'
import type { Reservation, UpdateReservationBody } from '@/types/reservation'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Bed, Bike, Car, Package, PawPrint, RefreshCw } from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

type ManagementTab = 'daily-reserve' | 'exit-management'
type VehicleReserve = ParkingReserveItem | BicycleParkingReserveItem

interface DashboardManagementTabsProps {
  date: Date
  onDateChange: (date: Date) => void
  selectedTab: string
  onTabChange: (tab: string) => void
}

interface DailyReserveDraft {
  note: string
  chargeStaffId: string
  directcheckinType: string
  smartLockPin: string
  smartLockCardCount: string
  checkinFlag: boolean
}

interface ExitManagementDraft {
  keyReturnContactType: string
  returnKeys: string
  checkoutReceptionistId: string
  roomDirtyLevel: string
}

const activeTabClass =
  'flex h-[5.6rem] w-[17rem] items-center justify-center rounded-t-[.8rem] border-2 border-primary border-b-0 bg-white text-center text-[1.5rem] font-bold text-black leading-none'
const inactiveTabClass =
  'flex h-[4.5rem] w-[13.3rem] items-center justify-center rounded-t-[.8rem] border-2 border-primary border-b-0 bg-primary text-center text-[1.5rem] font-bold text-white leading-none'

const directCheckinOptions: Option[] = DIRECTCHECKIN_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.name,
}))

const keyReturnOptions: Option[] = [
  { value: '', label: '---' },
  { value: '1', label: 'Mang tới' },
  { value: '2', label: 'Điện thoại' },
  { value: '3', label: 'Đã trả' },
  { value: '4', label: 'Chưa' },
]

const roomDirtyLevelOptions: Option[] = [
  { value: '', label: '---' },
  { value: '1', label: 'Nhỏ' },
  { value: '2', label: 'Vừa' },
  { value: '3', label: 'Lớn' },
  { value: '4', label: 'Rất lớn' },
]

function dayRange(date: Date) {
  return {
    start: dayjs(date).startOf('day').toISOString(),
    end: dayjs(date).endOf('day').toISOString(),
  }
}

function isSameDay(value: string | null | undefined, date: Date) {
  return value ? dayjs(value).isSame(dayjs(date), 'day') : false
}

function getReservationItems(data: unknown): Reservation[] {
  const response = data as { data?: Reservation[]; items?: Reservation[] } | undefined
  return response?.data ?? response?.items ?? []
}

function formatDate(value: string | null | undefined, fallback = '-') {
  return value && dayjs(value).isValid() ? dayjs(value).format('YYYY/MM/DD') : fallback
}

function formatHour(value: string | null | undefined) {
  return value && dayjs(value).isValid() ? `${dayjs(value).format('HH')} giờ` : '-'
}

function formatRoom(reserve: Pick<DailyReserve, 'facilityNo' | 'facilityName' | 'roomNumber'>) {
  const facility = reserve.facilityNo ?? reserve.facilityName ?? ''
  const room = reserve.roomNumber ?? ''
  return [facility, room].filter(Boolean).join(' - ') || '-'
}

function formatReservationRoom(reserve: Reservation) {
  const facility = reserve.facilityNo ?? reserve.facilityName ?? ''
  const room = reserve.roomNumber ?? ''
  return [facility, room].filter(Boolean).join(' - ') || '-'
}

function formatGuest(reserve: Reservation) {
  return reserve.clientName ?? reserve.clientNameEn ?? '-'
}

function vehicleDateMatches(item: VehicleReserve, date: Date, mode: 'checkin' | 'checkout') {
  return isSameDay(mode === 'checkin' ? item.periodFrom : item.periodTo, date)
}

function getVehicleRows(
  facilities: ParkingStatusResponse | undefined,
  date: Date,
  mode: 'checkin' | 'checkout'
) {
  const carRows =
    facilities?.flatMap((facility) =>
      facility.parkings.flatMap((parking) =>
        parking.parkingReserves
          .filter((reserve) => vehicleDateMatches(reserve, date, mode))
          .map((reserve) => ({
            id: reserve.parkingReserveId,
            parkingNumber: parking.number,
            facilityName: facility.facilityName,
            clientName: reserve.clientName,
            room: [reserve.facilityNo, reserve.roomNumber].filter(Boolean).join(' - '),
            periodFrom: reserve.periodFrom,
            periodTo: reserve.periodTo,
            vehicleInfo: reserve.carType,
            licensePlate: reserve.licensePlate,
            checkinFlag: reserve.checkinFlag,
            checkoutFlag: reserve.checkoutFlag,
            isBicycle: false,
          }))
      )
    ) ?? []

  const bicycleRows =
    facilities?.flatMap((facility) =>
      facility.bicycleParkings.flatMap((parking) =>
        parking.bicycleParkingReserves
          .filter((reserve) => vehicleDateMatches(reserve, date, mode))
          .map((reserve) => ({
            id: reserve.bicycleParkingReserveId,
            parkingNumber: parking.number,
            facilityName: facility.facilityName,
            clientName: reserve.clientName,
            room: [reserve.facilityNo, reserve.roomNumber].filter(Boolean).join(' - '),
            periodFrom: reserve.periodFrom,
            periodTo: reserve.periodTo,
            vehicleInfo: reserve.bicycleTypeNote,
            licensePlate: null,
            checkinFlag: reserve.checkinFlag,
            checkoutFlag: reserve.checkoutFlag,
            isBicycle: true,
          }))
      )
    ) ?? []

  return { carRows, bicycleRows }
}

export default function DashboardManagementTabs({
  date,
  onDateChange,
  selectedTab,
  onTabChange,
}: DashboardManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<ManagementTab>(
    selectedTab === 'exit-management' ? 'exit-management' : 'daily-reserve'
  )

  const exitDate = dayjs(date).subtract(1, 'day').toDate()
  const exitRange = dayRange(exitDate)
  const dailyReserveParams = useMemo(() => ({ time: dayjs(date).format('YYYY/MM/DD') }), [date])

  const dailyReserveQuery = useDailyReserve(dailyReserveParams)
  const exitReservationsQuery = useReservations({
    limit: 500,
    periodFrom: exitRange.start,
    periodTo: exitRange.end,
    orderBy: 'periodTo',
    order: 'asc',
  })
  const parkingStatusQuery = useParkingStatus()
  const staffsQuery = useGetStaffs({})

  const staffOptions = useMemo<Option[]>(
    () => [
      { value: '', label: '---' },
      ...(staffsQuery.data ?? []).map((staff) => ({
        value: String(staff.staffId),
        label: staff.staffNameShort || staff.staffName,
      })),
    ],
    [staffsQuery.data]
  )

  const dailyReserves = dailyReserveQuery.data?.reserves ?? []

  const exitReservations = useMemo(
    () =>
      getReservationItems(exitReservationsQuery.data).filter((reserve) =>
        isSameDay(reserve.earlyExitDatetime ?? reserve.periodTo, exitDate)
      ),
    [exitReservationsQuery.data, exitDate]
  )

  const dailyVehicles = useMemo(
    () => getVehicleRows(parkingStatusQuery.data, date, 'checkin'),
    [parkingStatusQuery.data, date]
  )
  const exitVehicles = useMemo(
    () => getVehicleRows(parkingStatusQuery.data, exitDate, 'checkout'),
    [parkingStatusQuery.data, exitDate]
  )

  const updateDailyReserveMutation = useUpdateDailyReserve()
  const updateAllDailyReserveMutation = useUpdateAllDailyReserve()
  const updateReservationMutation = useUpdateReservation()
  const updateAllReservationsMutation = useUpdateAllReservations()
  const checkOutMutation = useCheckOut()
  const updateParkingMutation = useUpdateParkingReserve({
    onSuccess: () => toast.success('Lưu bãi đỗ xe thành công'),
    onError: () => toast.error('Lưu bãi đỗ xe thất bại'),
  })
  const updateBicycleMutation = useUpdateBicycleParkingReserve({
    onSuccess: () => toast.success('Lưu bãi xe đạp thành công'),
    onError: () => toast.error('Lưu bãi xe đạp thất bại'),
  })

  const isLoading =
    dailyReserveQuery.isLoading ||
    exitReservationsQuery.isLoading ||
    parkingStatusQuery.isLoading ||
    staffsQuery.isLoading ||
    updateDailyReserveMutation.isPending ||
    updateAllDailyReserveMutation.isPending ||
    updateReservationMutation.isPending ||
    updateAllReservationsMutation.isPending

  const handleTabChange = (tab: ManagementTab) => {
    setActiveTab(tab)
    onTabChange(tab)
  }

  const handleRefresh = () => {
    dailyReserveQuery.refetch()
    exitReservationsQuery.refetch()
    parkingStatusQuery.refetch()
  }

  return (
    <div className="bg-transparent pb-[5rem]">
      <div className="common-container pt-[3.2rem]">
        <div className="flex h-[4.7rem] items-center bg-white font-bold text-[2.3rem] before:h-full before:w-[.4rem] before:bg-green-600 before:content-['']">
          <span className="ml-[1.5rem]">Danh sách quản lý</span>
        </div>

        <div className="mt-[2.4rem] flex items-center justify-between gap-4">
          <CustomDatePickerNextDay
            change={(value) => onDateChange(value || new Date())}
            value={date}
            format="yyyy/MM/dd"
            className="h-[4rem]"
            classNameButton="h-[4rem] bg-gray-100 hover:text-white"
            classNameWrapper="h-[4rem] w-[18rem]"
            hiddenNextMoth
          />
          <NButton
            type="button"
            onClick={handleRefresh}
            className="flex h-[4rem] items-center gap-2 bg-white px-4 text-[1.4rem]"
          >
            <RefreshCw className="h-[1.6rem] w-[1.6rem]" />
            Làm mới
          </NButton>
        </div>

        <div className="mt-[3.2rem] overflow-hidden">
          <div className="flex items-end gap-[.8rem]">
            <button
              type="button"
              onClick={() => handleTabChange('daily-reserve')}
              className={activeTab === 'daily-reserve' ? activeTabClass : inactiveTabClass}
            >
              Nhận phòng
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('exit-management')}
              className={activeTab === 'exit-management' ? activeTabClass : inactiveTabClass}
            >
              Trả phòng
            </button>
          </div>

          <div className="relative mt-[-.2rem] w-full border-2 border-primary bg-white p-[2.2rem]">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                <Loading />
              </div>
            )}

            {activeTab === 'daily-reserve' ? (
              <DailyReserveTab
                date={date}
                reserves={dailyReserves}
                staffOptions={staffOptions}
                carRows={dailyVehicles.carRows}
                bicycleRows={dailyVehicles.bicycleRows}
                onUpdateReserve={(body) => updateDailyReserveMutation.mutate(body)}
                onUpdateAll={(bodies) => updateAllDailyReserveMutation.mutate({ reserves: bodies })}
                onUpdateVehicle={(row, checked) => {
                  if (row.isBicycle) {
                    updateBicycleMutation.mutate({ id: row.id, data: { checkinFlag: checked } })
                    return
                  }
                  updateParkingMutation.mutate({ id: row.id, data: { checkinFlag: checked } })
                }}
              />
            ) : (
              <ExitManagementTab
                exitDate={exitDate}
                reservations={exitReservations}
                staffOptions={staffOptions}
                carRows={exitVehicles.carRows}
                bicycleRows={exitVehicles.bicycleRows}
                onUpdateAll={(bodies) => updateAllReservationsMutation.mutate(bodies)}
                onCheckOut={(id, body) => {
                  updateReservationMutation
                    .mutateAsync(body)
                    .then(() => checkOutMutation.mutate(id))
                    .catch(() => undefined)
                }}
                onUpdateVehicle={(row, checked) => {
                  if (row.isBicycle) {
                    updateBicycleMutation.mutate({ id: row.id, data: { checkoutFlag: checked } })
                    return
                  }
                  updateParkingMutation.mutate({ id: row.id, data: { checkoutFlag: checked } })
                }}
              />
            )}
          </div>
        </div>
      </div>
      <input type="hidden" value={selectedTab} readOnly />
    </div>
  )
}

interface VehicleRow {
  id: number
  parkingNumber: string
  facilityName: string
  clientName: string | null
  room: string
  periodFrom: string
  periodTo: string | null
  vehicleInfo: string | null
  licensePlate: string | null
  checkinFlag: boolean
  checkoutFlag: boolean
  isBicycle: boolean
}

interface DailyReserveTabProps {
  date: Date
  reserves: DailyReserve[]
  staffOptions: Option[]
  carRows: VehicleRow[]
  bicycleRows: VehicleRow[]
  onUpdateReserve: (body: UpdateDailyReserveBody) => void
  onUpdateAll: (bodies: UpdateDailyReserveBody[]) => void
  onUpdateVehicle: (row: VehicleRow, checked: boolean) => void
}

function DailyReserveTab({
  date,
  reserves,
  staffOptions,
  carRows,
  bicycleRows,
  onUpdateReserve,
  onUpdateAll,
  onUpdateVehicle,
}: DailyReserveTabProps) {
  const [drafts, setDrafts] = useState<Record<number, DailyReserveDraft>>({})

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<number, DailyReserveDraft> = {}
      for (const reserve of reserves) {
        next[reserve.reserveId] = current[reserve.reserveId] ?? createDraft(reserve)
      }
      return next
    })
  }, [reserves])

  const updateDraft = (reserveId: number, patch: Partial<DailyReserveDraft>) => {
    setDrafts((current) => ({
      ...current,
      [reserveId]: {
        ...(current[reserveId] ??
          createDraft(reserves.find((item) => item.reserveId === reserveId))),
        ...patch,
      },
    }))
  }

  const buildBody = (reserve: DailyReserve) => buildUpdateBody(reserve, drafts[reserve.reserveId])

  const handleUpdateAll = () => {
    if (reserves.length === 0) {
      toast.warning('Không có lịch nhận phòng để cập nhật')
      return
    }
    onUpdateAll(reserves.map(buildBody))
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-[1.2rem] bg-white pb-[.5rem]">
        <SummaryBox label="Số lịch nhận phòng" value={`${reserves.length} phòng`} />
        <NButton
          type="button"
          className="h-[4rem] min-w-[16rem] bg-gray-100 text-[1.4rem]"
          onClick={handleUpdateAll}
        >
          Cập nhật tất cả
        </NButton>
      </div>

      <section className="mt-[2.4rem]">
        <div className="w-full overflow-auto">
          <table className="w-full min-w-[124rem] flex-grow border-collapse bg-white text-center text-[1.4rem]">
            <thead className="text-[1.6rem]">
              <tr className="bg-[#eeeeee]">
                <DailyHead rowSpan={2} className="w-[4rem] min-w-[4rem]">
                  No
                </DailyHead>
                <DailyHead rowSpan={2} className="w-[10rem] min-w-[10rem]">
                  Cơ sở
                  <br />
                  Phòng
                </DailyHead>
                <DailyHead rowSpan={2} className="w-[16rem] min-w-[16rem]">
                  Người ở
                </DailyHead>
                <DailyHead rowSpan={2} className="w-[7rem] min-w-[7rem]">
                  Thanh toán
                  <br />
                  Trạng thái
                </DailyHead>
                <DailyHead rowSpan={2} colSpan={2} className="w-[15rem] min-w-[15rem]">
                  Phương thức
                  <br />
                  nhận phòng
                </DailyHead>
                <DailyHead rowSpan={2} className="w-[16rem]">
                  Smart lock
                  <br />
                  PIN / Card
                </DailyHead>
                <DailyHead rowSpan={2} className="min-w-[12rem]">
                  Người phụ trách
                </DailyHead>
                <DailyHead className="min-w-[10rem]">Đêm</DailyHead>
                <DailyHead rowSpan={2} className="min-w-[18rem]">
                  Ghi chú đặt phòng
                </DailyHead>
                <DailyHead rowSpan={2} className="w-[10rem]">
                  Thao tác
                </DailyHead>
              </tr>
              <tr className="bg-[#eeeeee]">
                <DailyHead>Kênh QC</DailyHead>
              </tr>
            </thead>
            <tbody>
              {reserves.length === 0 ? (
                <tr>
                  <DailyCell colSpan={11} className="text-left font-bold text-red-600">
                    Không có dữ liệu phù hợp.
                  </DailyCell>
                </tr>
              ) : (
                reserves.map((reserve, index) => {
                  const draft = drafts[reserve.reserveId] ?? createDraft(reserve)
                  return (
                    <DailyReserveRow
                      key={reserve.reserveId}
                      index={index}
                      date={date}
                      reserve={reserve}
                      draft={draft}
                      staffOptions={staffOptions}
                      onDraftChange={(patch) => updateDraft(reserve.reserveId, patch)}
                      onUpdate={() => onUpdateReserve(buildBody(reserve))}
                    />
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <VehicleSection
        title="Bãi đỗ xe"
        rows={carRows}
        mode="checkin"
        onUpdateVehicle={onUpdateVehicle}
      />
      <VehicleSection
        title="Bãi xe đạp"
        rows={bicycleRows}
        mode="checkin"
        onUpdateVehicle={onUpdateVehicle}
      />
    </div>
  )
}

function DailyReserveRow({
  index,
  date,
  reserve,
  draft,
  staffOptions,
  onDraftChange,
  onUpdate,
}: {
  index: number
  date: Date
  reserve: DailyReserve
  draft: DailyReserveDraft
  staffOptions: Option[]
  onDraftChange: (patch: Partial<DailyReserveDraft>) => void
  onUpdate: () => void
}) {
  const rowClass = cn(
    dayjs().isBefore(dayjs(date), 'day') &&
      reserve.canCheckIn &&
      (reserve.smartLock.maskedPin || (reserve.smartLock.cardCount ?? 0) > 0) &&
      'bg-[#f7dede] hover:bg-[#f7dede]',
    reserve.checkinFlag && 'bg-neutral-400 hover:bg-neutral-400'
  )

  return (
    <>
      <tr className={rowClass}>
        <DailyCell rowSpan={2}>{index + 1}</DailyCell>
        <DailyCell rowSpan={2}>
          <Link
            to="/reservations/$reserveId/edit"
            params={{ reserveId: String(reserve.reserveId) }}
            className="flex flex-col items-center justify-center gap-2 font-bold text-[#1A3CEF] hover:underline"
          >
            {formatRoom(reserve)}
          </Link>
        </DailyCell>
        <DailyCell rowSpan={2} className="max-w-[14rem]">
          {reserve.clientId ? (
            <Link
              to="/clients/$clientId/detail"
              params={{ clientId: String(reserve.clientId) }}
              className="block hover:underline"
            >
              <span className="block truncate font-bold">{reserve.clientName ?? '-'}</span>
              <span className="block truncate">
                {reserve.occupierName ?? reserve.contactName ?? ''}
              </span>
            </Link>
          ) : (
            <span>{reserve.clientName ?? '-'}</span>
          )}
        </DailyCell>
        <DailyCell rowSpan={2} className="whitespace-nowrap">
          {reserve.result}
        </DailyCell>
        <DailyCell rowSpan={2}>
          {reserve.directcheckinFlag ? (
            <span>D/I</span>
          ) : (
            <CustomSelectClean
              option={directCheckinOptions}
              selected={directCheckinOptions.find((item) => item.value === draft.directcheckinType)}
              change={(option) => onDraftChange({ directcheckinType: option.value })}
              customClassMain="h-[3.6rem] w-[11rem]"
            />
          )}
        </DailyCell>
        <DailyCell rowSpan={2}>{formatHour(reserve.periodFrom)}</DailyCell>
        <DailyCell rowSpan={2}>
          <div className="flex flex-col gap-2">
            <input
              value={draft.smartLockPin}
              onChange={(event) => onDraftChange({ smartLockPin: event.target.value })}
              placeholder={reserve.smartLock.maskedPin ?? 'PIN'}
              className="h-[3.2rem] w-full border border-black px-2 text-[1.3rem]"
              inputMode="numeric"
            />
            <input
              value={draft.smartLockCardCount}
              onChange={(event) => onDraftChange({ smartLockCardCount: event.target.value })}
              placeholder="Số lượng thẻ"
              className="h-[3.2rem] w-full border border-black px-2 text-[1.3rem]"
              inputMode="numeric"
              min={0}
              type="number"
            />
            <div className="flex items-center justify-center gap-2 text-[1.2rem]">
              <CustomCheckbox
                checked={draft.checkinFlag}
                onCheckedChange={(value) => onDraftChange({ checkinFlag: value === true })}
              />
              Đã nhận
            </div>
          </div>
        </DailyCell>
        <DailyCell rowSpan={2}>
          <CustomSelectClean
            option={staffOptions}
            selected={staffOptions.find((item) => item.value === draft.chargeStaffId)}
            change={(option) => onDraftChange({ chargeStaffId: option.value })}
            customClassMain="h-[3.6rem] w-[14rem]"
          />
        </DailyCell>
        <DailyCell>{reserve.confirmFlag ? `${reserve.rentalTime} đêm` : 'Chưa xác nhận'}</DailyCell>
        <DailyCell rowSpan={2}>
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <ServiceFlags reserve={reserve} />
            <CustomTextarea
              value={draft.note}
              onChange={(event) => onDraftChange({ note: event.target.value })}
              autoResize
              rows={2}
              className="min-h-[6.4rem] min-w-[15rem] border border-black py-2 font-bold text-[1.4rem]"
            />
          </div>
        </DailyCell>
        <DailyCell rowSpan={2}>
          <NButton type="button" className="bg-gray-100 text-[1.4rem]" onClick={onUpdate}>
            Cập nhật
          </NButton>
        </DailyCell>
      </tr>
      <tr className={rowClass}>
        <DailyCell>{advertisingTypeLabel(reserve.advertisingType)}</DailyCell>
      </tr>
    </>
  )
}

function ServiceFlags({ reserve }: { reserve: DailyReserve }) {
  const flags = [
    { key: 'deliverybox', active: reserve.serviceFlags.deliverybox, icon: Package, label: 'Tủ đồ' },
    { key: 'bicycle', active: reserve.serviceFlags.bicycleParking, icon: Bike, label: 'Xe đạp' },
    { key: 'parking', active: reserve.serviceFlags.parking, icon: Car, label: 'Ô tô' },
    { key: 'pet', active: reserve.serviceFlags.pet, icon: PawPrint, label: 'Thú cưng' },
    { key: 'futon', active: reserve.serviceFlags.futon, icon: Bed, label: 'Nệm' },
  ].filter((flag) => flag.active)

  if (flags.length === 0) return null

  return (
    <div className="flex w-full flex-row items-start justify-start gap-2">
      {flags.map(({ key, icon: Icon, label }) => (
        <span
          key={key}
          className="flex h-8 w-8 items-center justify-center rounded-[0.4rem] bg-[#B86020] p-1 text-white"
          title={label}
        >
          <Icon className="h-5 w-5" />
        </span>
      ))}
    </div>
  )
}

function createDraft(reserve: DailyReserve | undefined): DailyReserveDraft {
  return {
    note: reserve?.note ?? '',
    chargeStaffId: reserve?.chargeStaffId ? String(reserve.chargeStaffId) : '',
    directcheckinType: reserve?.directcheckinType ? String(reserve.directcheckinType) : '',
    smartLockPin: '',
    smartLockCardCount:
      reserve?.smartLock.cardCount === null || reserve?.smartLock.cardCount === undefined
        ? ''
        : String(reserve.smartLock.cardCount),
    checkinFlag: reserve?.checkinFlag ?? false,
  }
}

function buildUpdateBody(
  reserve: DailyReserve,
  draft: DailyReserveDraft | undefined
): UpdateDailyReserveBody {
  const current = draft ?? createDraft(reserve)
  const smartLockPin = current.smartLockPin.trim()
  const smartLockCardCount = current.smartLockCardCount.trim()
  const existingCardCount =
    reserve.smartLock.cardCount === null || reserve.smartLock.cardCount === undefined
      ? ''
      : String(reserve.smartLock.cardCount)
  const body: UpdateDailyReserveBody = {
    reserveId: reserve.reserveId,
    note: current.note,
    chargeStaffId: current.chargeStaffId ? Number(current.chargeStaffId) : null,
    directcheckinType: current.directcheckinType ? Number(current.directcheckinType) : null,
  }

  if (smartLockPin) body.smartLockPin = smartLockPin
  if (smartLockCardCount !== existingCardCount) {
    body.smartLockCardCount = smartLockCardCount ? Number(smartLockCardCount) : null
  }
  if (current.checkinFlag !== reserve.checkinFlag) body.checkinFlag = current.checkinFlag

  return body
}

function DailyHead({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('border border-black border-solid p-[.6rem] text-center font-bold', className)}
      {...props}
    >
      {children}
    </th>
  )
}

function DailyCell({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('border border-black border-solid p-[.6rem]', className)} {...props}>
      {children}
    </td>
  )
}

interface ExitManagementTabProps {
  exitDate: Date
  reservations: Reservation[]
  staffOptions: Option[]
  carRows: VehicleRow[]
  bicycleRows: VehicleRow[]
  onUpdateAll: (bodies: UpdateReservationBody[]) => void
  onCheckOut: (reserveId: number, body: UpdateReservationBody) => void
  onUpdateVehicle: (row: VehicleRow, checked: boolean) => void
}

function ExitManagementTab({
  exitDate,
  reservations,
  staffOptions,
  carRows,
  bicycleRows,
  onUpdateAll,
  onCheckOut,
  onUpdateVehicle,
}: ExitManagementTabProps) {
  const [drafts, setDrafts] = useState<Record<number, ExitManagementDraft>>({})

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<number, ExitManagementDraft> = {}
      for (const reserve of reservations) {
        next[reserve.reserveId] = current[reserve.reserveId] ?? createExitDraft(reserve)
      }
      return next
    })
  }, [reservations])

  const updateDraft = (reserveId: number, patch: Partial<ExitManagementDraft>) => {
    setDrafts((current) => ({
      ...current,
      [reserveId]: { ...(current[reserveId] ?? createExitDraft()), ...patch },
    }))
  }

  const buildBody = (reserve: Reservation) =>
    buildExitUpdateBody(reserve, drafts[reserve.reserveId])

  const handleUpdateAll = () => {
    const editableReservations = reservations.filter((reserve) => !reserve.checkoutAt)

    if (editableReservations.length === 0) {
      toast.warning('Không có lịch trả phòng để cập nhật')
      return
    }
    onUpdateAll(editableReservations.map(buildBody))
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-[1.2rem] bg-white pb-[.5rem]">
        <SummaryBox label="Số lịch trả phòng" value={`${reservations.length} phòng`} />
        <NButton
          type="button"
          className="h-[4rem] min-w-[16rem] bg-gray-100 text-[1.4rem]"
          onClick={handleUpdateAll}
        >
          Cập nhật tất cả
        </NButton>
        <div className="font-bold text-[#555] text-[1.4rem]">
          Ngày trả phòng: {dayjs(exitDate).format('YYYY/MM/DD')}
        </div>
      </div>

      <ReservationCheckoutTable
        reservations={reservations}
        drafts={drafts}
        staffOptions={staffOptions}
        onDraftChange={updateDraft}
        onCheckOut={(reserve) => onCheckOut(reserve.reserveId, buildBody(reserve))}
      />

      <VehicleSection
        title="Bãi đỗ xe"
        rows={carRows}
        mode="checkout"
        onUpdateVehicle={onUpdateVehicle}
      />
      <VehicleSection
        title="Bãi xe đạp"
        rows={bicycleRows}
        mode="checkout"
        onUpdateVehicle={onUpdateVehicle}
      />
    </div>
  )
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="mr-[3.2rem] flex w-fit border border-black">
      <div className="inline-flex h-[4.8rem] min-w-[14.6rem] flex-1 items-center justify-center border-black border-r bg-gray-100 p-[1.8rem] font-bold text-[1.6rem]">
        <p className="whitespace-nowrap">{label}</p>
      </div>
      <div className="inline-flex h-[4.8rem] w-[14.6rem] flex-1 items-center justify-end p-[1.8rem] font-bold text-[1.6rem]">
        <p>{value}</p>
      </div>
    </div>
  )
}

function createExitDraft(reserve?: Reservation): ExitManagementDraft {
  return {
    keyReturnContactType: reserve?.keyReturnContactType ? String(reserve.keyReturnContactType) : '',
    returnKeys:
      reserve?.returnKeys === null || reserve?.returnKeys === undefined
        ? ''
        : String(reserve.returnKeys),
    checkoutReceptionistId: reserve?.checkoutReceptionistId
      ? String(reserve.checkoutReceptionistId)
      : '',
    roomDirtyLevel: reserve?.roomDirtyLevel ? String(reserve.roomDirtyLevel) : '',
  }
}

function buildExitUpdateBody(
  reserve: Reservation,
  draft: ExitManagementDraft | undefined
): UpdateReservationBody {
  const current = draft ?? createExitDraft(reserve)

  return {
    reserveId: reserve.reserveId,
    returnKeys: current.returnKeys ? Number(current.returnKeys) : null,
    keyReturnContactType: current.keyReturnContactType
      ? Number(current.keyReturnContactType)
      : null,
    checkoutReceptionistId: current.checkoutReceptionistId
      ? Number(current.checkoutReceptionistId)
      : null,
    roomDirtyLevel: current.roomDirtyLevel ? Number(current.roomDirtyLevel) : null,
  }
}

function keyCountOptions(count: number | null): Option[] {
  const maxCount = Math.max(count ?? 0, 0)
  return [
    { value: '', label: '---' },
    ...Array.from({ length: maxCount + 1 }, (_, index) => ({
      value: String(index),
      label: String(index),
    })),
  ]
}

function formatStayDuration(reserve: Reservation) {
  const from = reserve.periodFrom ? dayjs(reserve.periodFrom).startOf('day') : null
  const toValue = reserve.earlyExitDatetime ?? reserve.periodTo
  const to = toValue ? dayjs(toValue).endOf('day') : null

  if (!from || !to || !from.isValid() || !to.isValid()) return '-'

  const days = to.diff(from, 'day') + 1
  return days >= 0 ? `${days} ngày` : '-'
}

function ReservationCheckoutTable({
  reservations,
  drafts,
  staffOptions,
  onDraftChange,
  onCheckOut,
}: {
  reservations: Reservation[]
  drafts: Record<number, ExitManagementDraft>
  staffOptions: Option[]
  onDraftChange: (reserveId: number, patch: Partial<ExitManagementDraft>) => void
  onCheckOut: (reserve: Reservation) => void
}) {
  return (
    <section className="mt-[2.4rem]">
      <DashboardTable
        headers={[
          'No.',
          'Khách',
          'Cơ sở / phòng',
          'Thẻ phòng nhận',
          'Thẻ phòng trả',
          'Liên hệ trả khóa',
          'Nhân viên lễ tân',
          'Mức bẩn',
          'Thời gian lưu trú',
          'Thao tác',
        ]}
        headerClassNames={['w-[4rem] px-1']}
        empty={reservations.length === 0}
      >
        {reservations.map((reserve, index) => {
          const draft = drafts[reserve.reserveId] ?? createExitDraft(reserve)
          const disabled = !!reserve.checkoutAt
          const returnKeyOptions = keyCountOptions(reserve.rentalKeys)

          return (
            <tr
              key={reserve.reserveId}
              className={cn(
                disabled && 'bg-neutral-300 hover:bg-neutral-300',
                !disabled && 'hover:bg-[#f7fbff]'
              )}
            >
              <Cell center className="w-[4rem] px-1">
                {index + 1}
              </Cell>
              <Cell>
                {reserve.clientId ? (
                  <Link
                    to="/clients/$clientId/detail"
                    params={{ clientId: String(reserve.clientId) }}
                    className="font-bold text-[#1A3CEF] hover:underline"
                  >
                    {formatGuest(reserve)}
                  </Link>
                ) : (
                  formatGuest(reserve)
                )}
              </Cell>
              <Cell center>
                <Link
                  to="/reservations/$reserveId/edit"
                  params={{ reserveId: String(reserve.reserveId) }}
                  className="font-bold text-[#1A3CEF] hover:underline"
                >
                  {formatReservationRoom(reserve)}
                </Link>
              </Cell>
              <Cell center>{reserve.rentalKeys ?? '-'}</Cell>
              <Cell center>
                <CustomSelectClean
                  option={returnKeyOptions}
                  selected={returnKeyOptions.find((item) => item.value === draft.returnKeys)}
                  change={(option) =>
                    onDraftChange(reserve.reserveId, { returnKeys: option.value })
                  }
                  customClassMain="h-[3.2rem] w-[8rem]"
                  disabledSelect={disabled}
                />
              </Cell>
              <Cell center>
                <CustomSelectClean
                  option={keyReturnOptions}
                  selected={keyReturnOptions.find(
                    (item) => item.value === draft.keyReturnContactType
                  )}
                  change={(option) =>
                    onDraftChange(reserve.reserveId, { keyReturnContactType: option.value })
                  }
                  customClassMain="h-[3.2rem] w-[10rem]"
                  disabledSelect={disabled}
                />
              </Cell>
              <Cell center>
                <CustomSelectClean
                  option={staffOptions}
                  selected={
                    staffOptions.find((item) => item.value === draft.checkoutReceptionistId) ??
                    (reserve.checkoutReceptionistName
                      ? {
                          value: draft.checkoutReceptionistId,
                          label: reserve.checkoutReceptionistName,
                        }
                      : staffOptions[0])
                  }
                  change={(option) =>
                    onDraftChange(reserve.reserveId, { checkoutReceptionistId: option.value })
                  }
                  customClassMain="h-[3.2rem] w-[12rem]"
                  disabledSelect={disabled}
                />
              </Cell>
              <Cell center>
                <CustomSelectClean
                  option={roomDirtyLevelOptions}
                  selected={roomDirtyLevelOptions.find(
                    (item) => item.value === draft.roomDirtyLevel
                  )}
                  change={(option) =>
                    onDraftChange(reserve.reserveId, { roomDirtyLevel: option.value })
                  }
                  customClassMain="h-[3.2rem] w-[10rem]"
                  disabledSelect={disabled}
                />
              </Cell>
              <Cell center>{formatStayDuration(reserve)}</Cell>
              <Cell center>
                <NButton
                  type="button"
                  className="h-[3.2rem] min-w-[7rem] bg-gray-100 px-3 text-[1.3rem]"
                  disabled={disabled}
                  onClick={() => onCheckOut(reserve)}
                >
                  Trả
                </NButton>
              </Cell>
            </tr>
          )
        })}
      </DashboardTable>
    </section>
  )
}

function VehicleSection({
  title,
  rows,
  mode,
  onUpdateVehicle,
}: {
  title: string
  rows: VehicleRow[]
  mode: 'checkin' | 'checkout'
  onUpdateVehicle: (row: VehicleRow, checked: boolean) => void
}) {
  return (
    <section className="mt-[4rem]">
      <div className="flex items-center font-bold text-[1.8rem]">
        <span>{title}</span>
      </div>
      <div className="mt-[2.4rem] w-full">
        <DashboardTable
          headers={[
            'No.',
            'Vị trí',
            'Cơ sở',
            'Khách',
            'Phòng',
            'Từ ngày',
            'Đến ngày',
            'Thông tin xe',
            'Biển số',
            mode === 'checkin' ? 'Đã vào' : 'Đã ra',
          ]}
          empty={rows.length === 0}
        >
          {rows.map((row, index) => {
            const checked = mode === 'checkin' ? row.checkinFlag : row.checkoutFlag
            return (
              <tr key={`${row.isBicycle ? 'bicycle' : 'car'}-${row.id}`}>
                <Cell center>{index + 1}</Cell>
                <Cell center>{row.parkingNumber}</Cell>
                <Cell>{row.facilityName}</Cell>
                <Cell>{row.clientName ?? '-'}</Cell>
                <Cell center>{row.room || '-'}</Cell>
                <Cell center>{formatDate(row.periodFrom)}</Cell>
                <Cell center>{formatDate(row.periodTo)}</Cell>
                <Cell>{row.vehicleInfo ?? '-'}</Cell>
                <Cell>{row.licensePlate ?? '-'}</Cell>
                <Cell center>
                  <CustomCheckbox
                    checked={checked}
                    onCheckedChange={(value) => onUpdateVehicle(row, value === true)}
                  />
                </Cell>
              </tr>
            )
          })}
        </DashboardTable>
      </div>
    </section>
  )
}

function DashboardTable({
  headers,
  headerClassNames,
  empty,
  children,
}: {
  headers: string[]
  headerClassNames?: string[]
  empty: boolean
  children: React.ReactNode
}) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[96rem] table-fixed border-separate border-spacing-0 bg-white text-[1.4rem]">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={header}
                className={cn(
                  'h-[4rem] border-black border-t border-r border-b bg-[#EEEEEE] px-3 text-center font-bold first:border-l',
                  headerClassNames?.[index]
                )}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td
                colSpan={headers.length}
                className="h-[5rem] border-black border-r border-b border-l text-center font-bold text-red-600"
              >
                Không có dữ liệu phù hợp.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}

function Cell({
  children,
  center,
  className,
}: {
  children: React.ReactNode
  center?: boolean
  className?: string
}) {
  return (
    <td
      className={cn(
        'h-[4.8rem] border-black border-r border-b bg-inherit px-3 py-2 first:border-l',
        center && 'text-center',
        className
      )}
    >
      {children}
    </td>
  )
}

function advertisingTypeLabel(value: number | null) {
  switch (value) {
    case 1:
      return 'Khách cũ'
    case 2:
      return 'Walk-in'
    case 3:
      return 'Website'
    case 4:
      return 'OTA'
    default:
      return 'Khác'
  }
}
