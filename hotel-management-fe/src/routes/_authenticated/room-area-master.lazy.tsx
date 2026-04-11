import { CustomInput } from '@/components/common/CustomInput'
import Loading from '@/components/common/Loading'
import { NButton } from '@/components/ui/new-button'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUpsertFacilityRoomTypes } from '@/hooks/mutations/useUpsertFacilityRoomTypes'
import { useGetFacilityRoomTypes } from '@/hooks/queries/useGetFacilityRoomTypes'
import { cn } from '@/lib/utils'
import type {
  FacilityRoomTypeMatrixResponse,
  FacilityRowResponse,
  UpsertFacilityRoomTypeBody,
} from '@/types/facility-room-type'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

export const Route = createLazyFileRoute('/_authenticated/room-area-master')({
  component: RoomAreaMasterPage,
})

function RoomAreaMasterPage() {
  const [matrixData, setMatrixData] = useState<FacilityRoomTypeMatrixResponse | null>(null)
  // acreageValues[facilityId][roomTypeId] = string value
  const [acreageValues, setAcreageValues] = useState<Record<number, Record<number, string>>>({})

  const { isLoading } = useGetFacilityRoomTypes({
    onSuccess: (data) => {
      setMatrixData(data)
    },
    onError: () => {
      toast.error('Không thể tải dữ liệu diện tích phòng')
    },
  })

  const { mutate: upsertMatrix, isPending } = useUpsertFacilityRoomTypes({
    onSuccess: () => {
      toast.success('Cập nhật diện tích thành công')
    },
    onError: () => {
      toast.error('Cập nhật diện tích thất bại')
    },
  })

  // Extract unique room types from the first facility row (all rows share the same columns)
  const roomTypeColumns = useMemo(() => {
    if (!matrixData?.facilities.length) return []
    return matrixData.facilities[0].roomTypes.map((rt) => ({
      roomTypeId: rt.roomTypeId,
      roomTypeNameShort: rt.roomTypeNameShort,
      roomTypeName: rt.roomTypeName,
    }))
  }, [matrixData])

  // Initialize acreageValues from API data
  useEffect(() => {
    if (!matrixData) return
    const values: Record<number, Record<number, string>> = {}
    for (const facility of matrixData.facilities) {
      values[facility.facilityId] = {}
      for (const rt of facility.roomTypes) {
        values[facility.facilityId][rt.roomTypeId] = rt.acreage ?? ''
      }
    }
    setAcreageValues(values)
  }, [matrixData])

  const handleChange = useCallback((facilityId: number, roomTypeId: number, value: string) => {
    setAcreageValues((prev) => ({
      ...prev,
      [facilityId]: {
        ...prev[facilityId],
        [roomTypeId]: value,
      },
    }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!matrixData) return

      const body: UpsertFacilityRoomTypeBody = {
        facilities: matrixData.facilities.map((facility) => ({
          facilityId: facility.facilityId,
          roomTypes: facility.roomTypes.map((rt) => ({
            roomTypeId: rt.roomTypeId,
            acreage: acreageValues[facility.facilityId]?.[rt.roomTypeId]?.trim() || null,
          })),
        })),
      }

      upsertMatrix(body)
    },
    [matrixData, acreageValues, upsertMatrix]
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="pt-[2.6rem] pb-[12rem] common-container">
        {/* Page Title */}
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <span className="ml-[1.5rem]">Diện tích phòng</span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-[2.4rem]">
          <NButton type="submit" disabled={isPending} className=" bg-[#eeeeee]">
            Cập nhật
          </NButton>
        </div>

        {/* Matrix Table */}
        <div className="relative flex bg-white mt-[2.4rem] max-h-[56.4rem] overflow-auto">
          <table className="w-full min-w-[120rem] text-[1.6rem] max-sm:text-[1.1rem] border-separate border-spacing-0 table-fixed text-black">
            <TableHeader className="z-[999]">
              <TableRow>
                <TableHead className="top-0 left-0 z-20 sticky bg-[#EEEEEE] border-t border-r border-b border-black border-l w-[10rem] h-14 font-bold text-center">
                  Tên cơ sở
                </TableHead>
                {roomTypeColumns.map((col) => (
                  <TableHead
                    key={col.roomTypeId}
                    className="top-0 z-10 sticky border-t bg-[#EEEEEE] border-r border-b border-black w-[8rem] h-14 font-bold text-center"
                  >
                    <span title={col.roomTypeName ?? col.roomTypeNameShort}>
                      {col.roomTypeNameShort}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrixData?.facilities.map((facility) => (
                <FacilityRow
                  key={facility.facilityId}
                  facility={facility}
                  acreageValues={acreageValues[facility.facilityId] ?? {}}
                  onChange={handleChange}
                />
              ))}
            </TableBody>
          </table>
        </div>
      </div>
    </form>
  )
}

interface FacilityRowProps {
  facility: FacilityRowResponse
  acreageValues: Record<number, string>
  onChange: (facilityId: number, roomTypeId: number, value: string) => void
}

function FacilityRow({ facility, acreageValues, onChange }: FacilityRowProps) {
  return (
    <TableRow>
      <TableCell
        className="left-0 sticky p-2 border-r border-b border-black border-l h-20 font-medium text-center"
        style={{
          backgroundColor: facility.colorOption ?? '#3764A8',
        }}
      >
        {facility.facilityName}
      </TableCell>
      {facility.roomTypes.map((rt) => (
        <TableCell
          key={rt.roomTypeId}
          className="p-2 border-r border-b border-black h-20 text-center"
        >
          <CustomInput
            className={cn(
              'border border-transparent focus:border-black focus:outline-none w-full text-center',
              !rt.isExists && 'bg-gray-300'
            )}
            value={acreageValues[rt.roomTypeId] ?? ''}
            onChange={(e) => onChange(facility.facilityId, rt.roomTypeId, e.target.value)}
          />
        </TableCell>
      ))}
    </TableRow>
  )
}
