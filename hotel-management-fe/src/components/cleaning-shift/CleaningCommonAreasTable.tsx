import CustomSelectClean, { type Option } from '@/components/common/CustomSelectClean'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import { CustomTooltip } from '@/components/common/CustomToolTip'
import Loading from '@/components/common/Loading'
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
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

const EMPTY_OPTION: Option = { value: '', label: '---' }
const EXTERNAL_STAFF_OPTION: Option = { value: '-1', label: 'Dọn ngoài' }

interface CommonAreaRow {
  detail: CleaningDetail
  mainStaff: Option
  areaName: string
}

export interface CleaningCommonAreasTableMethods {
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

function buildRows(details: CleaningDetail[], staffs: Staff[]): CommonAreaRow[] {
  return details.map((detail) => ({
    detail,
    mainStaff: toStaffOption(staffs, detail.mainStaffId, detail.mainStaffExternalFlag),
    areaName: detail.areaName ?? '',
  }))
}

export const CleaningCommonAreasTable = forwardRef<CleaningCommonAreasTableMethods, Props>(
  function CleaningCommonAreasTable(
    { details, staffs, dateSearch, isReadonly, isGlobalLoading = false, refetch },
    ref
  ) {
    const [rows, setRows] = useState<CommonAreaRow[]>([])
    const [isCustomLoading, setIsCustomLoading] = useState(false)

    const updateMut = useUpdateCleaningDetail()

    const staffOptions = useMemo<Option[]>(
      () => [
        EMPTY_OPTION,
        ...staffs.map((staff) => ({
          value: String(staff.staffId),
          label: staff.staffNameShort || staff.staffName,
        })),
        EXTERNAL_STAFF_OPTION,
      ],
      [staffs]
    )

    useEffect(() => {
      setRows(buildRows(details, staffs))
    }, [details, staffs])

    const updateRow = <K extends keyof CommonAreaRow>(
      cleaningDetailId: number,
      key: K,
      value: CommonAreaRow[K]
    ) => {
      setRows((prev) =>
        prev.map((row) =>
          row.detail.cleaningDetailId === cleaningDetailId ? { ...row, [key]: value } : row
        )
      )
    }

    const handleSubmitCommonAreasOnly = async () => {
      if (rows.length === 0) return
      setIsCustomLoading(true)
      try {
        await Promise.all(
          rows.map((row, index) => {
            const mainStaff = decodeStaffOption(row.mainStaff)
            const data: UpdateCleaningDetailBody = {
              areaName: row.areaName,
              mainStaffId: mainStaff.staffId,
              mainStaffExternalFlag: mainStaff.externalFlag,
              orderNum: index + 1,
            }

            return updateMut.mutateAsync({
              id: row.detail.cleaningDetailId,
              data,
            })
          })
        )
        await refetch?.()
        toast.success('Đã cập nhật vệ sinh khu vực chung')
      } catch (_error) {
        toast.error('Không thể cập nhật vệ sinh khu vực chung')
      } finally {
        setIsCustomLoading(false)
      }
    }

    useImperativeHandle(ref, () => ({
      submitForm: handleSubmitCommonAreasOnly,
      triggerForm: async () => true,
    }))

    return (
      <div className="relative">
        {!isGlobalLoading && (isCustomLoading || updateMut.isPending) && (
          <div className="z-50 absolute inset-0 flex justify-center items-center">
            <Loading />
          </div>
        )}

        <div className="min-w-[50rem]">
          <section className="flex justify-start mt-[2rem] w-full">
            <div className="store-table relative flex w-full max-h-[56.4rem] overflow-auto">
              <Table
                className={cn(
                  'w-full min-w-[72rem] text-[1.4rem] text-center',
                  'border-spacing-0 border-separate overflow-x-auto',
                  '[&>div>div>div]:border-l-0 [&>div>div>div]:border-t-0',
                  '[&_form>div]:border-l-0 [&_form>div]:border-t-0',
                  '[&>div>div>div:last-child]:border-r-0',
                  '[&>div>form>div:last-child]:border-r-0'
                )}
              >
                <TableHeader className="top-0 z-10 sticky bg-gray-eee">
                  <TableRow className="text-2xl">
                    <TableHead
                      className="border-black border-t border-b border-l border-solid min-w-[20rem] h-[3.5rem] font-bold text-center"
                      colSpan={2}
                    >
                      Cơ sở
                    </TableHead>
                    <TableHead
                      className="border-black border-t border-b border-l border-solid min-w-[12rem] h-[3.5rem] font-bold text-center"
                      rowSpan={2}
                    >
                      Phụ trách
                    </TableHead>
                    <TableHead
                      className="border-black border-t border-r border-b border-l border-solid min-w-[37rem] h-[3.5rem] font-bold text-center"
                      rowSpan={2}
                    >
                      Nội dung
                    </TableHead>
                  </TableRow>
                  <TableRow className="border border-black text-2xl">
                    <TableHead className="border-black border-b border-l border-solid min-w-[5rem] h-[3.5rem] font-bold text-center">
                      No
                    </TableHead>
                    <TableHead className="border-black border-b border-l border-solid min-w-[20rem] h-[3.5rem] font-bold text-center">
                      Tên
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-lg sm:text-2xl">
                  {rows.length > 0 ? (
                    rows.map((row) => (
                      <TableRow key={row.detail.cleaningDetailId}>
                        <TableCell className="border-black border-b border-l border-solid">
                          <div className="flex justify-center items-center">
                            {row.detail.facilityNo ?? row.detail.facilityId}
                          </div>
                        </TableCell>
                        <TableCell className="border-black border-b border-l border-solid">
                          <div className="relative flex justify-center items-center p-0">
                            <CustomTooltip text={row.detail.facilityName ?? ''} />
                          </div>
                        </TableCell>
                        <TableCell className="border-black border-b border-l border-solid">
                          <div className="flex justify-center items-center p-0">
                            <CustomSelectClean
                              customClassMain="border h-14 w-[12rem]"
                              option={staffOptions}
                              selected={row.mainStaff}
                              disabledSelect={isReadonly}
                              change={(option) =>
                                updateRow(row.detail.cleaningDetailId, 'mainStaff', option)
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="border-black border-r border-b border-l border-solid">
                          <div className="flex justify-center items-center">
                            <CustomTextarea
                              value={row.areaName}
                              disabled={isReadonly}
                              placeholder="Nhập vị trí/khu vực cần vệ sinh"
                              className="border-transparent focus-visible:outline focus:outline focus-visible:outline-1 focus-visible:outline-gray-300 focus:outline-1 focus:outline-gray-300 w-[28rem] min-w-full h-full min-h-0 whitespace-break-spaces"
                              autoResize={true}
                              disableNewline={true}
                              rows={1}
                              onChange={(event) =>
                                updateRow(
                                  row.detail.cleaningDetailId,
                                  'areaName',
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="font-bold text-red" colSpan={4}>
                        {dayjs(dateSearch).format('YYYY/MM/DD')} không có dữ liệu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </div>
    )
  }
)
