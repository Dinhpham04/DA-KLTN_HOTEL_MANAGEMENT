import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomInput } from '@/components/common/CustomInput'
import CustomSelectClean, { type Option } from '@/components/common/CustomSelectClean'
import { CustomTooltip } from '@/components/common/CustomToolTip'
import Loading from '@/components/common/Loading'
import { SelectDownSVG } from '@/components/svgs/SelectDownSVG'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUpdateCleaningDetail } from '@/hooks/mutations/useUpdateCleaningDetail'
import { cn } from '@/lib/utils'
import type { CleaningDetail, UpdateCleaningDetailBody } from '@/types/cleaning-shift'
import type { Staff } from '@/types/staff'
import dayjs from 'dayjs'
import {
  type Dispatch,
  type SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { toast } from 'react-toastify'

const EXTERNAL_STAFF_OPTION: Option = { value: '-1', label: 'Dọn ngoài' }
const EMPTY_OPTION: Option = { value: '', label: '---' }

const SORT_OPTIONS: Option[] = [
  { value: 'new_reserves_date_asc', label: 'Khách vào tiếp (tăng)' },
  { value: 'period_to_desc', label: 'Ngày trả phòng (giảm)' },
  { value: 'facility_no_asc', label: 'Cơ sở & phòng' },
  { value: 'main_staff_name_desc', label: 'Nhân viên phụ trách' },
]

const NEXT_RESERVE_OPTIONS: Option[] = [
  { value: 'no', label: 'Tất cả' },
  { value: 'yes', label: 'Có khách vào tiếp' },
]

const CLEAN_STATUS_LABEL: Record<number, string> = {
  1: 'Chưa bắt đầu',
  2: 'Đang dọn',
  3: 'Tạm dừng',
  4: 'Đã hoàn tất',
  5: 'Đã kiểm tra',
  6: 'Mở lại',
  7: 'Đã hủy',
}

const ROOM_DIRTY_LEVEL_LABEL: Record<number, string> = {
  1: 'Nhỏ',
  2: 'Vừa',
  3: 'Lớn',
  4: 'Rất lớn',
}

interface CleanRoomRow {
  detail: CleaningDetail
  mainStaff: Option
  subStaff: Option
  checkStaff: Option
  scheduledDate: string
  comment: string
}

export interface CleanRoomTableMethods {
  submitForm: () => Promise<void>
  triggerForm: () => Promise<boolean>
}

interface Props {
  details: CleaningDetail[]
  staffs: Staff[]
  dateSearch: Date
  isReadonly?: boolean
  isGlobalLoading?: boolean
  refetch?: () => Promise<unknown> | undefined
  setNextReservationRoomSearch?: Dispatch<SetStateAction<string[]>>
  nextReservationRoomSearch?: string
}

function formatDate(value: string | null | undefined, format = 'MM/DD') {
  if (!value) return ''
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(format) : ''
}

function toDateOnly(value: string | null | undefined) {
  if (!value) return ''
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : ''
}

function toPickerValue(value: Date | Date[] | null) {
  if (!value || Array.isArray(value)) return ''
  return dayjs(value).format('YYYY-MM-DD')
}

function compareDate(a: string | null, b: string | null, direction: 'asc' | 'desc') {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  const result = dayjs(a).valueOf() - dayjs(b).valueOf()
  return direction === 'asc' ? result : -result
}

function compareText(
  a: string | null | undefined,
  b: string | null | undefined,
  direction = 'asc'
) {
  const result = (a ?? '').localeCompare(b ?? '', 'vi', { numeric: true })
  return direction === 'asc' ? result : -result
}

function calculateStayDays(from: string | null, to: string | null) {
  if (!from || !to) return ''
  const start = dayjs(from)
  const end = dayjs(to)
  if (!start.isValid() || !end.isValid()) return ''
  return Math.abs(end.diff(start, 'day')) + 1
}

function isSameDay(value: string | null | undefined, target = dayjs()) {
  return value ? dayjs(value).isSame(target, 'day') : false
}

function isTightTurnover(detail: CleaningDetail) {
  if (!detail.newReserveDate || !detail.reservePeriodTo) return false
  return !dayjs(detail.newReserveDate)
    .subtract(1, 'day')
    .isAfter(dayjs(detail.reservePeriodTo), 'day')
}

function isTodayCheckoutWithMissingKeys(detail: CleaningDetail) {
  if (!isSameDay(detail.reservePeriodTo ?? detail.reserveCheckoutAt)) return false
  if (detail.reserveCheckoutReceptionistId !== null) return false
  if (detail.reserveKeyReturnDatetime !== null) return false
  return Number(detail.reserveReturnKeys ?? 0) < Number(detail.reserveRentalKeys ?? 0)
}

function rowClassName(detail: CleaningDetail) {
  return cn({
    'bg-blue-300 hover:bg-blue-300': isTightTurnover(detail),
    'bg-green-300 hover:bg-green-300': detail.reserveDisableReservation,
  })
}

function nextReserveCellClassName(detail: CleaningDetail) {
  if (!detail.newReserveDate) return ''
  if (isSameDay(detail.newReserveDate)) return 'bg-pink-400'
  if (dayjs(detail.newReserveDate).isBefore(dayjs().add(2, 'day'), 'day')) return 'bg-yellow-200'
  return ''
}

function checkoutCellClassName(detail: CleaningDetail) {
  return isSameDay(detail.reservePeriodTo ?? detail.reserveCheckoutAt) ? 'bg-red-300' : ''
}

function toStaffOption(staffs: Staff[], staffId: number | null, externalFlag: boolean): Option {
  if (externalFlag) return EXTERNAL_STAFF_OPTION
  if (!staffId) return EMPTY_OPTION
  const staff = staffs.find((item) => item.staffId === staffId)
  return {
    value: String(staffId),
    label: staff?.staffNameShort || staff?.staffName || String(staffId),
  }
}

function decodeStaffOption(option: Option) {
  if (option.value === '-1') return { staffId: null, externalFlag: true }
  if (!option.value) return { staffId: null, externalFlag: false }
  return { staffId: Number(option.value), externalFlag: false }
}

function staffLabel(option: Option) {
  return option.value ? option.label : ''
}

function buildRows(details: CleaningDetail[], staffs: Staff[], sortValue: string): CleanRoomRow[] {
  const rows = details.map((detail) => ({
    detail,
    mainStaff: toStaffOption(staffs, detail.mainStaffId, detail.mainStaffExternalFlag),
    subStaff: toStaffOption(staffs, detail.subStaffId, detail.subStaffExternalFlag),
    checkStaff: toStaffOption(staffs, detail.checkStaffId, detail.checkStaffExternalFlag),
    scheduledDate: toDateOnly(detail.scheduledDate),
    comment: detail.comment ?? '',
  }))

  return sortRows(rows, sortValue)
}

function sortRows(rows: CleanRoomRow[], sortValue: string) {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    if (sortValue === 'new_reserves_date_asc') {
      return compareDate(a.detail.newReserveDate, b.detail.newReserveDate, 'asc')
    }
    if (sortValue === 'period_to_desc') {
      return compareDate(
        a.detail.reservePeriodTo ?? a.detail.reserveCheckoutAt,
        b.detail.reservePeriodTo ?? b.detail.reserveCheckoutAt,
        'desc'
      )
    }
    if (sortValue === 'facility_no_asc') {
      const facilityCompare = compareText(a.detail.facilityNo, b.detail.facilityNo)
      return facilityCompare !== 0
        ? facilityCompare
        : compareText(a.detail.roomNumber, b.detail.roomNumber)
    }
    if (sortValue === 'main_staff_name_desc') {
      return compareText(staffLabel(a.mainStaff), staffLabel(b.mainStaff), 'desc')
    }
    return 0
  })
  return sorted
}

export const CleanRoomTable = forwardRef<CleanRoomTableMethods, Props>(function CleanRoomTable(
  {
    details,
    staffs,
    dateSearch,
    isReadonly,
    isGlobalLoading = false,
    refetch,
    setNextReservationRoomSearch,
    nextReservationRoomSearch,
  },
  ref
) {
  const [selectedSortOption, setSelectedSortOption] = useState<Option>(SORT_OPTIONS[0])
  const [rows, setRows] = useState<CleanRoomRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isCustomLoading, setIsCustomLoading] = useState(false)

  const updateMut = useUpdateCleaningDetail()

  const staffOptions = useMemo<Option[]>(
    () => [
      EMPTY_OPTION,
      ...staffs.map((staff) => ({
        value: String(staff.staffId),
        label: staff.staffNameShort || staff.staffName,
      })),
    ],
    [staffs]
  )

  const staffOptionsWithExternal = useMemo<Option[]>(
    () => [...staffOptions, EXTERNAL_STAFF_OPTION],
    [staffOptions]
  )

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.has(row.detail.cleaningDetailId)),
    [rows, selectedIds]
  )

  useEffect(() => {
    setRows(buildRows(details, staffs, selectedSortOption.value))
    setSelectedIds(new Set())
  }, [details, staffs, selectedSortOption.value])

  const updateRow = <K extends keyof CleanRoomRow>(
    cleaningDetailId: number,
    key: K,
    value: CleanRoomRow[K]
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.detail.cleaningDetailId === cleaningDetailId ? { ...row, [key]: value } : row
      )
    )
  }

  const move = (index1: number, index2: number) => {
    setRows((prev) => {
      const next = [...prev]
      const first = next[index1]
      next[index1] = next[index2]
      next[index2] = first
      return next
    })
  }

  const handleCheckboxChange = (cleaningDetailId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(cleaningDetailId)
      else next.delete(cleaningDetailId)
      return next
    })
  }

  const handleSubmitRoomOnly = async () => {
    if (rows.length === 0) return
    setIsCustomLoading(true)
    try {
      await Promise.all(
        rows.map((row, index) => {
          const mainStaff = decodeStaffOption(row.mainStaff)
          const subStaff = decodeStaffOption(row.subStaff)
          const checkStaff = decodeStaffOption(row.checkStaff)
          const data: UpdateCleaningDetailBody = {
            mainStaffId: mainStaff.staffId,
            subStaffId: subStaff.staffId,
            checkStaffId: checkStaff.staffId,
            mainStaffExternalFlag: mainStaff.externalFlag,
            subStaffExternalFlag: subStaff.externalFlag,
            checkStaffExternalFlag: checkStaff.externalFlag,
            comment: row.comment,
            orderNum: index + 1,
          }

          if (row.scheduledDate) {
            data.scheduledDate = row.scheduledDate
          }

          return updateMut.mutateAsync({
            id: row.detail.cleaningDetailId,
            data,
          })
        })
      )
      await refetch?.()
      toast.success('Đã cập nhật thông tin dọn phòng')
    } catch (_error) {
      toast.error('Không thể cập nhật thông tin dọn phòng')
    } finally {
      setIsCustomLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    submitForm: handleSubmitRoomOnly,
    triggerForm: async () => true,
  }))

  const selectedNextReserveOption =
    NEXT_RESERVE_OPTIONS.find((option) => option.value === nextReservationRoomSearch) ??
    NEXT_RESERVE_OPTIONS[0]

  return (
    <div className="relative">
      {!isGlobalLoading && (isCustomLoading || updateMut.isPending) && (
        <div className="z-50 absolute inset-0 flex justify-center items-center">
          <Loading />
        </div>
      )}

      <div className="flex items-center bg-white before:bg-green-600 mb-[1.5rem] before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
        <div className="ml-[1.5rem] w-[20%] font-bold text-[1.8rem]">■ Dọn phòng</div>
        <div className="flex justify-end items-center gap-8 mr-[0.5rem] w-full">
          <h2 className="font-semibold text-2xl">Lọc:</h2>
          <div className="mr-[5rem] w-[17rem]">
            <CustomSelectClean
              option={NEXT_RESERVE_OPTIONS}
              selected={selectedNextReserveOption}
              change={(option) =>
                setNextReservationRoomSearch?.(option.value === 'yes' ? ['yes'] : [])
              }
              customClassMain="h-[3.2rem] text-[1.4rem]"
            />
          </div>
          <h2 className="font-semibold text-2xl">Sắp xếp:</h2>
          <div className="mr-[5rem] w-[19rem]">
            <CustomSelectClean
              option={SORT_OPTIONS}
              selected={selectedSortOption}
              change={(option) => setSelectedSortOption(option)}
              customClassMain="h-[3.2rem] text-[1.4rem]"
            />
          </div>

          <Button
            type="button"
            disabled={isReadonly}
            onClick={handleSubmitRoomOnly}
            className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto font-bold text-[1.4rem] text-black hover:text-white"
          >
            <span>Cập nhật chỉ dọn phòng</span>
          </Button>
        </div>
      </div>

      <section className="min-w-[100rem] mt-[2rem]">
        <div className="store-table relative flex mt-[2.4rem] max-h-[56.4rem] overflow-auto">
          <Table
            className={cn(
              'flex-grow min-w-[72rem] text-[1.4rem] text-center',
              'border-spacing-0 border-separate overflow-x-auto',
              '[&>div>div>div]:border-l-0 [&>div>div>div]:border-t-0',
              '[&_form>div]:border-l-0 [&_form>div]:border-t-0',
              '[&>div>div>div:last-child]:border-r-0',
              '[&>div>form>div:last-child]:border-r-0'
            )}
            style={{ background: 'white' }}
          >
            <TableHeader className="top-0 z-10 sticky bg-gray-eee">
              <TableRow className="text-2xl">
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[5rem] h-[3.5rem] font-bold text-center">
                  No
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[6rem] h-[3.5rem] font-bold text-center">
                  Chọn
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                  Phòng
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                  Thời gian ở
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                  Khách vào tiếp
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                  Trả phòng
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[13rem] h-[3.5rem] font-bold text-center">
                  Trạng thái dọn
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                  Ngày dự kiến
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[6rem] h-[3.5rem] font-bold text-center">
                  Bẩn
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[12rem] h-[3.5rem] font-bold text-center">
                  Comment
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[10rem] h-[3.5rem] font-bold text-center">
                  NV chính
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[10rem] h-[3.5rem] font-bold text-center">
                  NV phụ
                </TableHead>
                <TableHead className="border-black border-t border-b border-l border-solid min-w-[10rem] h-[3.5rem] font-bold text-center">
                  NV kiểm tra
                </TableHead>
                <TableHead className="border border-black border-solid min-w-[7rem] h-[3.5rem] font-bold text-center">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-lg sm:text-2xl">
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow
                    key={row.detail.cleaningDetailId}
                    className={rowClassName(row.detail)}
                    style={{ height: 50 }}
                  >
                    <TableCell className="border-black border-b border-l border-solid">
                      {index + 1}
                    </TableCell>
                    <TableCell className="p-0 border-black border-b border-l border-solid">
                      <div className="flex justify-center items-center p-2">
                        <CustomCheckbox
                          checked={selectedIds.has(row.detail.cleaningDetailId)}
                          disabled={isReadonly}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(row.detail.cleaningDetailId, checked === true)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid">
                      <div className="flex flex-row justify-center">
                        <CustomTooltip
                          text={`Cơ sở: ${row.detail.facilityNo ?? row.detail.facilityId}/${row.detail.facilityName ?? ''}`}
                          trigger={row.detail.facilityNo ?? row.detail.facilityId}
                        />
                        <span>-</span>
                        <CustomTooltip
                          text={`Phòng: ${row.detail.roomNumber ?? ''}/${row.detail.roomTypeName ?? ''}`}
                          trigger={row.detail.roomNumber ?? ''}
                        />
                      </div>
                      <div className="flex items-start">
                        {row.detail.reserveNoreserveCountAfter === 1
                          ? 'x '
                          : row.detail.reserveNoreserveCountAfter === 2
                            ? 'xx '
                            : row.detail.reserveNoreserveCountAfter
                              ? `${row.detail.reserveNoreserveCountAfter}x `
                              : ''}
                      </div>
                    </TableCell>
                    <TableCell className="p-0 border-black border-b border-l border-solid">
                      {row.detail.reserveId
                        ? calculateStayDays(
                            row.detail.reservePeriodFrom,
                            row.detail.reservePeriodTo ?? row.detail.reserveCheckoutAt
                          )
                        : '---'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'p-0 border-black border-b border-l border-solid',
                        nextReserveCellClassName(row.detail)
                      )}
                    >
                      {formatDate(row.detail.newReserveDate)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'p-0 border-black border-b border-l border-solid',
                        checkoutCellClassName(row.detail)
                      )}
                    >
                      {formatDate(row.detail.reservePeriodTo ?? row.detail.reserveCheckoutAt)}
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid">
                      {isTodayCheckoutWithMissingKeys(row.detail)
                        ? 'Trả phòng hôm nay'
                        : CLEAN_STATUS_LABEL[row.detail.cleanStatus] || ''}
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid p-0">
                      {formatDate(row.scheduledDate)}
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid">
                      {row.detail.roomDirtyLevel
                        ? ROOM_DIRTY_LEVEL_LABEL[row.detail.roomDirtyLevel] || ''
                        : ''}
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid">
                      <CustomTooltip text={row.comment} />
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid">
                      <CustomTooltip text={staffLabel(row.mainStaff)} />
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid">
                      <CustomTooltip text={staffLabel(row.subStaff)} />
                    </TableCell>
                    <TableCell className="border-black border-b border-l border-solid">
                      <CustomTooltip text={staffLabel(row.checkStaff)} />
                    </TableCell>
                    <TableCell className="border-black border-r border-b border-l border-solid">
                      <div className="flex flex-wrap justify-center items-center gap-8 min-w-[7rem]">
                        <div className="flex gap-[.5rem]">
                          <Button
                            className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto aspect-square font-bold text-[1.4rem] text-black hover:text-white"
                            type="button"
                            disabled={isReadonly || index === rows.length - 1}
                            onClick={() => move(index, index + 1)}
                          >
                            <SelectDownSVG fill="currentColor" />
                          </Button>
                          <Button
                            className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto aspect-square font-bold text-[1.4rem] text-black hover:text-white"
                            type="button"
                            disabled={isReadonly || index === 0}
                            onClick={() => move(index, index - 1)}
                          >
                            <SelectDownSVG fill="currentColor" className="rotate-180" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="font-bold text-red" colSpan={14}>
                    {dayjs(dateSearch).format('YYYY/MM/DD')} không có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="flex justify-end items-center gap-8 mt-[2rem]">
        <Button
          type="button"
          disabled={isReadonly}
          onClick={handleSubmitRoomOnly}
          className="bg-gray hover:bg-primary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border border-black hover:border-primary rounded-[.4rem] w-auto h-auto font-bold text-[1.4rem] text-black hover:text-white"
        >
          <span>Cập nhật chỉ dọn phòng</span>
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <section className="min-w-[100rem] mt-[2rem]">
          <div className="store-table relative flex mt-[2.4rem] max-h-[56.4rem] overflow-auto">
            <Table
              className={cn(
                'flex-grow min-w-[72rem] text-[1.4rem] text-center',
                'overflow-x-auto',
                '[&>div>div>div]:border-l-0 [&>div>div>div]:border-t-0',
                '[&_form>div]:border-l-0 [&_form>div]:border-t-0',
                '[&>div>div>div:last-child]:border-r-0',
                '[&>div>form>div:last-child]:border-r-0'
              )}
            >
              <TableHeader className="bg-gray-eee">
                <TableRow className="border border-black text-2xl">
                  <TableHead className="border border-black border-solid min-w-[5rem] h-[3.5rem] font-bold text-center">
                    No
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[10rem] h-[3.5rem] font-bold text-center">
                    NV chính
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[10rem] h-[3.5rem] font-bold text-center">
                    NV phụ
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[10rem] h-[3.5rem] font-bold text-center">
                    NV kiểm tra
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                    Phòng
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                    Thời gian ở
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                    Khách vào tiếp
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                    Trả phòng
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[13rem] h-[3.5rem] font-bold text-center">
                    Trạng thái dọn
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[8rem] h-[3.5rem] font-bold text-center">
                    Ngày dự kiến
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[6rem] h-[3.5rem] font-bold text-center">
                    Bẩn
                  </TableHead>
                  <TableHead className="border border-black border-solid min-w-[12rem] h-[3.5rem] font-bold text-center">
                    Comment
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="border border-black text-lg sm:text-2xl">
                {selectedRows.map((row) => {
                  const originalIndex = rows.findIndex(
                    (item) => item.detail.cleaningDetailId === row.detail.cleaningDetailId
                  )
                  return (
                    <TableRow
                      className={rowClassName(row.detail)}
                      key={`selected-${row.detail.cleaningDetailId}`}
                    >
                      <TableCell className="border border-black border-solid">
                        {originalIndex + 1}
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        <CustomSelectClean
                          customClassMain="border h-14 w-[13rem]"
                          option={staffOptionsWithExternal}
                          selected={row.mainStaff}
                          disabledSelect={isReadonly}
                          change={(option) =>
                            updateRow(row.detail.cleaningDetailId, 'mainStaff', option)
                          }
                        />
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        <CustomSelectClean
                          customClassMain="border h-14 w-[13rem]"
                          option={staffOptionsWithExternal}
                          selected={row.subStaff}
                          disabledSelect={isReadonly}
                          change={(option) =>
                            updateRow(row.detail.cleaningDetailId, 'subStaff', option)
                          }
                        />
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        <CustomSelectClean
                          customClassMain="border h-14 w-[13rem]"
                          option={staffOptions}
                          selected={row.checkStaff}
                          disabledSelect={isReadonly}
                          change={(option) =>
                            updateRow(row.detail.cleaningDetailId, 'checkStaff', option)
                          }
                        />
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        <div className="flex flex-row justify-center">
                          <CustomTooltip
                            text={`Cơ sở: ${row.detail.facilityNo ?? row.detail.facilityId}/${row.detail.facilityName ?? ''}`}
                            trigger={row.detail.facilityNo ?? row.detail.facilityId}
                          />
                          <span>-</span>
                          <CustomTooltip
                            text={`Phòng: ${row.detail.roomNumber ?? ''}/${row.detail.roomTypeName ?? ''}`}
                            trigger={row.detail.roomNumber ?? ''}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        {calculateStayDays(
                          row.detail.reservePeriodFrom,
                          row.detail.reservePeriodTo ?? row.detail.reserveCheckoutAt
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'border border-black border-solid',
                          nextReserveCellClassName(row.detail)
                        )}
                      >
                        {formatDate(row.detail.newReserveDate)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'border border-black border-solid',
                          checkoutCellClassName(row.detail)
                        )}
                      >
                        {formatDate(row.detail.reservePeriodTo ?? row.detail.reserveCheckoutAt)}
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        {isTodayCheckoutWithMissingKeys(row.detail)
                          ? 'Trả phòng hôm nay'
                          : CLEAN_STATUS_LABEL[row.detail.cleanStatus] || ''}
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        <CustomDatePicker
                          format="MM/dd"
                          className="border-transparent focus:outline focus:outline-1 w-fit min-h-20 whitespace-break-spaces"
                          value={row.scheduledDate || null}
                          disable={isReadonly}
                          change={(date) =>
                            updateRow(
                              row.detail.cleaningDetailId,
                              'scheduledDate',
                              toPickerValue(date)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        {row.detail.roomDirtyLevel
                          ? ROOM_DIRTY_LEVEL_LABEL[row.detail.roomDirtyLevel] || ''
                          : ''}
                      </TableCell>
                      <TableCell className="border border-black border-solid">
                        <CustomInput
                          value={row.comment}
                          disabled={isReadonly}
                          onChange={(event) =>
                            updateRow(row.detail.cleaningDetailId, 'comment', event.target.value)
                          }
                          placeholder="Nhập comment"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  )
})
