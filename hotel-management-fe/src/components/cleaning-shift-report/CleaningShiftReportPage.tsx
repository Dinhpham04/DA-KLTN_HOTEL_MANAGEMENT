import { CleaningReportTable } from '@/components/cleaning-shift-report/CleaningReportTable'
import CustomDatePickerNextDay from '@/components/common/CustomDatePickerNextDay'
import { CustomMultiSelect } from '@/components/common/CustomMultiSelect'
import Loading from '@/components/common/Loading'
import { Textarea } from '@/components/ui/textarea'
import { useGetCleaningShiftReport } from '@/hooks/queries/useGetCleaningShiftReport'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetFacilityRoomTypes } from '@/hooks/queries/useGetFacilityRoomTypes'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { cn } from '@/lib/utils'
import { CleaningDataType, type CleaningDetail } from '@/types/cleaning-shift'
import { ArrowBigUpDash } from 'lucide-react'
import { useMemo, useState } from 'react'

type Option = {
  value: string
  label: string
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    weekday: 'short',
  }).format(date)
}

function matchesStaff(detail: CleaningDetail, staffId: string) {
  if (staffId === '-1') return true
  return (
    String(detail.mainStaffId ?? '') === staffId ||
    String(detail.subStaffId ?? '') === staffId ||
    String(detail.checkStaffId ?? '') === staffId
  )
}

export function CleaningShiftReportPage() {
  const [reportDate, setReportDate] = useState(new Date())
  const [facilitySearch, setFacilitySearch] = useState<string[]>([])
  const [roomTypeSearch, setRoomTypeSearch] = useState<string[]>([])
  const [staffSearch, setStaffSearch] = useState('-1')

  const cleaningDate = useMemo(() => formatDate(reportDate), [reportDate])

  const { data: facilityData, isLoading: isLoadingFacilities } = useGetFacilities()
  const facilities = facilityData?.data ?? []
  const facilityById = useMemo(
    () => new Map(facilities.map((facility) => [facility.facilityId, facility])),
    [facilities]
  )

  const selectedFacilityIds = useMemo(() => {
    if (facilitySearch.length > 0) return facilitySearch.map(Number)
    return facilities.map((facility) => facility.facilityId)
  }, [facilitySearch, facilities])

  const { data: staffs = [] } = useGetStaffs({})
  const { data: roomTypeMatrix } = useGetFacilityRoomTypes()

  const facilityOptions = useMemo<Option[]>(
    () =>
      facilities.map((facility) => ({
        value: String(facility.facilityId),
        label: facility.facilityName,
      })),
    [facilities]
  )

  const roomTypeOptions = useMemo<Option[]>(() => {
    const rows = roomTypeMatrix?.facilities ?? []
    const targetFacilityIds =
      selectedFacilityIds.length > 0 ? new Set(selectedFacilityIds) : new Set<number>()
    const roomTypes = new Map<number, string>()

    for (const row of rows) {
      if (targetFacilityIds.size > 0 && !targetFacilityIds.has(row.facilityId)) continue
      for (const roomType of row.roomTypes) {
        roomTypes.set(roomType.roomTypeId, roomType.roomTypeName ?? roomType.roomTypeNameShort)
      }
    }

    return [...roomTypes.entries()].map(([value, label]) => ({
      value: String(value),
      label,
    }))
  }, [roomTypeMatrix, selectedFacilityIds])

  const {
    shifts,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
    refetch,
  } = useGetCleaningShiftReport({
    cleaningDate,
    facilityIds: selectedFacilityIds,
    roomTypeIds: roomTypeSearch.length > 0 ? roomTypeSearch.map(Number) : undefined,
    enabled: selectedFacilityIds.length > 0,
  })

  const allDetails = useMemo(() => shifts.flatMap((shift) => shift.details), [shifts])

  const filteredDetails = useMemo(
    () => allDetails.filter((detail) => matchesStaff(detail, staffSearch)),
    [allDetails, staffSearch]
  )

  const roomDetails = useMemo(
    () => filteredDetails.filter((detail) => detail.dataType === CleaningDataType.ROOM),
    [filteredDetails]
  )

  const commonAreaDetails = useMemo(
    () => filteredDetails.filter((detail) => detail.dataType === CleaningDataType.COMMON_AREA),
    [filteredDetails]
  )

  const specialNote = useMemo(() => {
    return shifts
      .map((shift) => {
        const note = shift.note?.trim()
        if (!note) return ''
        const facility = facilityById.get(shift.facilityId)
        const facilityLabel = facility
          ? `${facility.facilityNo} ${facility.facilityName}`
          : `Cơ sở #${shift.facilityId}`
        return `${facilityLabel}: ${note}`
      })
      .filter(Boolean)
      .join('\n')
  }, [facilityById, shifts])

  const isLoading = isLoadingFacilities || isLoadingReport || isFetchingReport

  const refetchReport = () => {
    void refetch()
  }

  return (
    <>
      {isLoading ? (
        <div className="z-50 fixed inset-0 flex justify-center items-center">
          <Loading />
        </div>
      ) : null}

      <main className="flex flex-col gap-12 py-[4rem] min-w-[80rem] common-container">
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">Nhật báo vệ sinh</div>
        </div>

        <section className="flex flex-col gap-12">
          <div className="items-center gap-12 grid grid-cols-12">
            <div className="col-span-3">
              <CustomDatePickerNextDay
                change={(value) => setReportDate(value ?? new Date())}
                value={reportDate}
                format="yyyy/MM/dd"
                hiddenNextMoth
                className={cn(
                  'flex-1 [&>div]:px-4 w-[18rem] [&_input::placeholder]:text-black text-xl cursor-pointer react-date-picker__calendar-button'
                )}
              />
              <h2 className="mt-4 font-bold text-3xl">{formatLongDate(reportDate)}</h2>
            </div>

            <div className="col-span-9 overflow-auto">
              <table className="[&_td]:border [&_td]:border-black w-full min-w-[60rem] [&_td]:h-14 text-[1.6rem] [&_td]:text-center border-collapse">
                <tbody>
                  <tr>
                    <td className="bg-[#b9b9b9be] w-[6rem] h-[14rem] text-center">
                      <span className="font-semibold text-2xl leading-[3rem] [writing-mode:vertical-rl]">
                        Ghi chú đặc biệt
                      </span>
                    </td>
                    <td className="bg-white p-4">
                      <Textarea
                        className="border border-black min-h-[11rem] !text-[1.4rem] !leading-[2.4rem]"
                        value={specialNote}
                        disabled
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-6">
          <div className="font-bold text-[1.6rem] text-black">Người phụ trách:</div>
          <select
            value={staffSearch}
            onChange={(event) => setStaffSearch(event.currentTarget.value)}
            className="bg-white border border-black px-3 h-14 min-w-[15rem] font-semibold text-[1.4rem]"
          >
            <option value="-1">Tất cả</option>
            {staffs.map((staff) => (
              <option key={staff.staffId} value={String(staff.staffId)}>
                {staff.staffNameShort || staff.staffName}
              </option>
            ))}
          </select>

          <div className="font-bold text-[1.6rem] text-black">Cơ sở:</div>
          <CustomMultiSelect
            options={facilityOptions}
            onValueChange={setFacilitySearch}
            defaultValue={facilitySearch}
            placeholder="---"
            variant="inverted"
            animation={2}
            maxCount={1}
            className="bg-white hover:bg-white w-[21rem]"
          />

          <div className="font-bold text-[1.6rem] text-black">Loại phòng:</div>
          <CustomMultiSelect
            options={roomTypeOptions}
            onValueChange={setRoomTypeSearch}
            defaultValue={roomTypeSearch}
            placeholder="---"
            variant="inverted"
            animation={2}
            maxCount={1}
            className="bg-white hover:bg-white w-[21rem]"
          />
        </div>

        <CleaningReportTable
          title="Dọn phòng"
          details={roomDetails}
          reportDate={reportDate}
          kind="room"
          refetch={refetchReport}
        />

        <CleaningReportTable
          title="Vệ sinh khu vực chung"
          details={commonAreaDetails}
          reportDate={reportDate}
          kind="common"
          refetch={refetchReport}
        />

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="right-[15rem] bottom-[8rem] fixed bg-blue-500 p-2 rounded-full text-white cursor-pointer"
          style={{ zIndex: 11 }}
        >
          <ArrowBigUpDash />
        </button>
      </main>
    </>
  )
}
