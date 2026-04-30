import CustomDatePickerNextDay from '@/components/common/CustomDatePickerNextDay'
import { CustomMultiSelect } from '@/components/common/CustomMultiSelect'
import Loading from '@/components/common/Loading'
import CustomPdfOpenComponent, {
  type CustomPdfOpenMethods,
} from '@/components/dialogs/Custom-pdf-open'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateCleans } from '@/hooks/mutations/useUpdateCleans'
import { useUpsertCleans } from '@/hooks/mutations/useUpsertCleans'
import { useGetCleaningShifts } from '@/hooks/queries/useGetCleaningShifts'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetFacilityRoomTypes } from '@/hooks/queries/useGetFacilityRoomTypes'
import { useGetStaffs } from '@/hooks/queries/useGetStaffs'
import { cn } from '@/lib/utils'
import { CleaningDataType, type CleaningDetail } from '@/types/cleaning-shift'
import { ArrowBigUpDash } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { CleanRoomTable, type CleanRoomTableMethods } from './CleanRoomTable'
import {
  CleaningCommonAreasTable,
  type CleaningCommonAreasTableMethods,
} from './CleaningCommonAreasTable'

type Option = {
  value: string
  label: string
}

function formatDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function CleaningShiftPage() {
  const [dateSearch, setDateSearch] = useState<Date>(addDays(new Date(), 1))
  const [facilitySearch, setFacilitySearch] = useState<string[]>([])
  const [roomSearch, setRoomSearch] = useState<string[]>([])
  const [nextReservationRoomSearch, setNextReservationRoomSearch] = useState<string[]>([])
  const [noteDraft, setNoteDraft] = useState('')

  const customPdfOpenComponentRef = useRef<CustomPdfOpenMethods>(null)
  const cleanRoomTableRef = useRef<CleanRoomTableMethods>(null)
  const cleanCommonAreasTableRef = useRef<CleaningCommonAreasTableMethods>(null)

  const apiDate = useMemo(() => formatDate(addDays(dateSearch, -1)), [dateSearch])
  const previousApiDate = useMemo(() => formatDate(addDays(dateSearch, -2)), [dateSearch])

  const { data: facilityData, isLoading: isLoadingFacility } = useGetFacilities()
  const facilities = facilityData?.data ?? []

  const selectedFacilityId = useMemo(() => {
    if (facilitySearch.length > 0) return Number(facilitySearch[0])
    if (facilities.length > 0) return facilities[0].facilityId
    return null
  }, [facilitySearch, facilities])

  const { data: staffs = [] } = useGetStaffs({})
  const { data: roomTypeMatrix } = useGetFacilityRoomTypes()

  const facilitiesOptions = useMemo<Option[]>(
    () =>
      facilities.map((facility) => ({
        value: String(facility.facilityId),
        label: facility.facilityName,
      })),
    [facilities]
  )

  const typeRoomOptions = useMemo<Option[]>(() => {
    if (!selectedFacilityId || !roomTypeMatrix?.facilities) return []
    const row = roomTypeMatrix.facilities.find(
      (facility) => facility.facilityId === selectedFacilityId
    )
    if (!row) return []
    return row.roomTypes.map((roomType) => ({
      value: String(roomType.roomTypeId),
      label: roomType.roomTypeName ?? roomType.roomTypeNameShort,
    }))
  }, [roomTypeMatrix, selectedFacilityId])

  const {
    data: shift,
    isLoading: isLoadingShift,
    isFetching: isFetchingShift,
    refetch: refetchShift,
  } = useGetCleaningShifts({
    params:
      selectedFacilityId !== null
        ? {
            cleaningDate: apiDate,
            facilityId: selectedFacilityId,
            roomTypeIds: roomSearch.length > 0 ? roomSearch.map(Number) : undefined,
            newReserveFlag: nextReservationRoomSearch[0] === 'yes' ? 1 : undefined,
            sort: 'reserveCheckoutAt',
            direction: 'asc',
          }
        : ({} as never),
    enabled: selectedFacilityId !== null,
  })

  const { data: previousShift } = useGetCleaningShifts({
    params:
      selectedFacilityId !== null
        ? {
            cleaningDate: previousApiDate,
            facilityId: selectedFacilityId,
          }
        : ({} as never),
    enabled: selectedFacilityId !== null,
  })

  const upsertMut = useUpsertCleans({
    onSuccess: () => toast.success('Đã tạo bản ghi'),
    onError: () => toast.error('Không thể tạo bản ghi'),
  })

  const updateNoteMut = useUpdateCleans({
    onSuccess: () => toast.success('Đã lưu'),
    onError: () => toast.error('Không thể lưu'),
  })

  const detailsByType = useMemo(() => {
    const groups: Record<number, CleaningDetail[]> = {
      [CleaningDataType.ROOM]: [],
      [CleaningDataType.COMMON_AREA]: [],
      [CleaningDataType.KEY_SAFETY]: [],
    }
    if (!shift?.details) return groups
    for (const detail of shift.details) {
      if (groups[detail.dataType]) groups[detail.dataType].push(detail)
    }
    return groups
  }, [shift])

  useEffect(() => {
    setNoteDraft(shift?.note ?? '')
  }, [shift?.note])

  const isGlobalLoading = isLoadingFacility || isLoadingShift || isFetchingShift
  const isReadonly = false

  const ensureCleans = async () => {
    if (!selectedFacilityId) return null
    if (shift && shift.cleanId > 0) return shift.cleanId
    const created = await upsertMut.mutateAsync({
      facilityId: selectedFacilityId,
      cleaningDate: apiDate,
    })
    return created.data.cleanId
  }

  const saveNote = async () => {
    const cleanId = await ensureCleans()
    if (!cleanId) return
    updateNoteMut.mutate({
      cleanId,
      data: { note: noteDraft },
    })
  }

  const handleSubmitAll = async () => {
    await saveNote()
    await cleanRoomTableRef.current?.submitForm()
    await cleanCommonAreasTableRef.current?.submitForm()
    toast.success('Đã cập nhật toàn bộ')
  }

  const handleCopyNote = () => {
    setNoteDraft(previousShift?.note ?? '')
    toast.success('Đã sao chép ghi chú ngày trước')
  }

  const handleClearNote = () => setNoteDraft('')

  const openPdf = () => {
    customPdfOpenComponentRef.current?.open('https://example.com')
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      {isGlobalLoading ? (
        <div className="z-50 fixed inset-0 flex justify-center items-center">
          <Loading />
        </div>
      ) : null}

      <main className="flex flex-col gap-8 my-[5rem] pb-24 min-w-[80rem] common-container">
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">Quản lý ca vệ sinh</div>
        </div>

        <div className="top-[17.2rem] right-[5rem] z-[11] fixed flex justify-center items-center">
          <Button
            type="button"
            disabled={isReadonly}
            onClick={handleSubmitAll}
            className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto font-bold text-[1.4rem] text-black hover:text-white"
          >
            <span>Cập nhật toàn bộ</span>
          </Button>
        </div>

        <section className="flex flex-col gap-8">
          <div className="gap-4 grid grid-cols-1 2xl:grid-cols-11">
            <div className="flex col-span-3">
              <div>
                <div className="flex justify-center items-center gap-8">
                  <CustomDatePickerNextDay
                    change={(value) => setDateSearch(value ?? addDays(new Date(), 1))}
                    value={dateSearch}
                    format="yyyy/MM/dd"
                    className={cn(
                      'flex-1 [&>div]:px-4 w-[18rem] [&_input::placeholder]:text-black text-xl cursor-pointer react-date-picker__calendar-button'
                    )}
                  />
                </div>

                <div className="flex flex-col gap-4 mt-[2rem]">
                  <div className="flex justify-between items-center gap-4">
                    <h2 className="font-semibold text-2xl">PDF ca vệ sinh ngày mai:</h2>
                    <Button
                      onClick={openPdf}
                      type="button"
                      className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-[12rem] h-auto font-bold text-[1.4rem] text-black hover:text-white"
                    >
                      <span>Xem trước</span>
                    </Button>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <h2 className="font-semibold text-2xl">Nhật báo tồn vệ sinh:</h2>
                    <Button
                      onClick={openPdf}
                      type="button"
                      className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-[12rem] h-auto font-bold text-[1.4rem] text-black hover:text-white"
                    >
                      <span>Xem trước</span>
                    </Button>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <h2 className="font-semibold text-2xl">
                      Nhật báo tồn vệ sinh (khách tiếp theo - thứ tự phòng):
                    </h2>
                    <Button
                      onClick={openPdf}
                      type="button"
                      className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-[12rem] h-auto font-bold text-[1.4rem] text-black hover:text-white"
                    >
                      <span>Xem trước</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4">
              <div className="flex flex-col gap-4">
                <table
                  className={cn(
                    'border border-black border-collapse',
                    '[&_td]:border [&_td]:border-black',
                    'sm:[&_td]:[&_*]:text-[1.6rem] [&_td]:[&_*]:text-[1.1rem] w-[70%] 2xl:w-full'
                  )}
                >
                  <tbody>
                    <tr>
                      <td className="bg-[#b9b9b9be] w-[6rem] text-center">
                        <div className="flex flex-col justify-center items-center gap-3 font-semibold text-2xl leading-none">
                          <span>Ghi</span>
                          <span>chú</span>
                          <span>đặc</span>
                          <span>biệt</span>
                        </div>
                      </td>
                      <td className="bg-white p-3">
                        <div className="bg-[#F3F3F3]">
                          <div className="p-3">
                            <Textarea
                              onChange={(event) => setNoteDraft(event.target.value)}
                              value={noteDraft}
                              placeholder="Nhập ghi chú vận hành trong ngày..."
                              className="bg-white border border-black/60 focus-visible:border-black min-h-[12rem] !text-[1.4rem] !leading-[2.4rem]"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-4">
              <div className="flex flex-col flex-wrap items-start gap-[2rem] mt-2">
                <Button
                  type="button"
                  onClick={handleCopyNote}
                  className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto font-bold text-[1.4rem] text-black hover:text-white"
                >
                  <span>Sao chép ngày trước</span>
                </Button>
                <Button
                  disabled={isReadonly}
                  type="button"
                  onClick={saveNote}
                  className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto font-bold text-[1.4rem] text-black hover:text-white"
                >
                  <span>Cập nhật</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleClearNote}
                  className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto font-bold text-[1.4rem] text-black hover:text-white"
                >
                  <span>Xóa</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-start items-center gap-4">
            <div className="col-span-2 font-bold text-[1.6rem] text-black">Lọc theo cơ sở:</div>
            <div className="col-span-8">
              <div className="z-50 flex items-center">
                <CustomMultiSelect
                  options={facilitiesOptions}
                  onValueChange={(value) => setFacilitySearch(value.slice(0, 1))}
                  defaultValue={facilitySearch}
                  placeholder="---"
                  variant="inverted"
                  animation={2}
                  maxCount={1}
                  className="bg-white hover:bg-white w-[21rem]"
                />
              </div>
            </div>

            <div className="col-span-2 font-bold text-[1.6rem] text-black">
              Lọc theo loại phòng:
            </div>
            <div className="col-span-8">
              <div className="z-50 flex items-center">
                <CustomMultiSelect
                  options={typeRoomOptions}
                  onValueChange={(value) => setRoomSearch(value.slice(0, 1))}
                  defaultValue={roomSearch}
                  placeholder="---"
                  variant="inverted"
                  animation={2}
                  maxCount={1}
                  className="bg-white hover:bg-white w-[21rem]"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <CleanRoomTable
            ref={cleanRoomTableRef}
            details={detailsByType[CleaningDataType.ROOM] ?? []}
            staffs={staffs}
            dateSearch={dateSearch}
            isReadonly={isReadonly}
            isGlobalLoading={isGlobalLoading}
            refetch={refetchShift}
            setNextReservationRoomSearch={setNextReservationRoomSearch}
            nextReservationRoomSearch={nextReservationRoomSearch[0]}
          />
        </section>

        <section>
          <div className="flex items-center bg-white before:bg-green-600 mb-[1.5rem] before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
            <div className="ml-[1.5rem] font-bold text-[1.8rem]">■ Vệ sinh khu vực chung</div>
            <Button
              type="button"
              disabled={isReadonly}
              onClick={() => void cleanCommonAreasTableRef.current?.submitForm()}
              className="ml-auto mr-[1.5rem] bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto font-bold text-[1.4rem] text-black hover:text-white"
            >
              <span>Cập nhật</span>
            </Button>
          </div>
          <CleaningCommonAreasTable
            ref={cleanCommonAreasTableRef}
            details={detailsByType[CleaningDataType.COMMON_AREA] ?? []}
            staffs={staffs}
            dateSearch={dateSearch}
            isReadonly={isReadonly}
            isGlobalLoading={isGlobalLoading}
            refetch={refetchShift}
          />
        </section>

        <button
          type="button"
          onClick={scrollToTop}
          className="right-[15rem] bottom-[8rem] fixed bg-blue-500 p-2 rounded-full text-white cursor-pointer"
          style={{ zIndex: 11 }}
        >
          <ArrowBigUpDash />
        </button>

        <CustomPdfOpenComponent ref={customPdfOpenComponentRef} />
      </main>
    </>
  )
}
