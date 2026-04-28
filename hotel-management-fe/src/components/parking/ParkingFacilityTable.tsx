import { BicycleSvg } from '@/components/svgs/BicycleSVG'
import { CarSvg } from '@/components/svgs/CarSvg'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
// import { useGetStayTypes } from '@/hooks/queries/useGetStayTypes'
import type {
  FacilityParkingStatus,
  UnifiedParkingSlot,
  UnifiedReserveItem,
} from '@/types/parking-status'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react'
import ParkingAvailableSlot from './ParkingAvailableSlot'
import ParkingTimelineSlot from './ParkingTimelineSlot'

dayjs.extend(isSameOrAfter)

interface ParkingFacilityTableProps {
  facility: FacilityParkingStatus
  isBicycle: boolean
}

interface HorizontalDragScrollProps {
  children: ReactNode
  className?: string
}

function HorizontalDragScroll({ children, className }: HorizontalDragScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  })

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    const container = containerRef.current
    if (!container) return

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    }
    setIsDragging(true)
  }

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container || !dragStateRef.current.isDragging) return

    const deltaX = event.clientX - dragStateRef.current.startX
    if (!dragStateRef.current.moved && Math.abs(deltaX) > 3) {
      dragStateRef.current.moved = true
    }

    if (dragStateRef.current.moved) {
      event.preventDefault()
    }

    container.scrollLeft = dragStateRef.current.startScrollLeft - deltaX
  }

  const handleMouseUpOrLeave = () => {
    if (!dragStateRef.current.isDragging) return
    dragStateRef.current.isDragging = false
    setIsDragging(false)
  }

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.moved) return

    event.preventDefault()
    event.stopPropagation()
    dragStateRef.current.moved = false
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-x-auto no-scrollbar',
        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  )
}

/**
 * Table component showing parking slots and their reservation timelines
 * for a single facility. Supports both car and bicycle parking.
 */
export default function ParkingFacilityTable({ facility, isBicycle }: ParkingFacilityTableProps) {
  // const { data: stayTypes = [] } = useGetStayTypes()

  // Normalize car/bicycle data into unified slots
  const slots: UnifiedParkingSlot[] = useMemo(() => {
    if (!isBicycle) {
      return facility.parkings.map((p) => ({
        id: p.parkingId,
        number: p.number,
        heightLimit: p.heightLimit,
        notice: p.notice,
        dataStatus: p.dataStatus,
        facilityId: p.facilityId,
        facilityName: p.facilityName,
        isBicycle: false,
        reserves: p.parkingReserves
          .filter((r) => r.dataStatus !== 0)
          .sort((a, b) => a.periodFrom.localeCompare(b.periodFrom))
          .map(
            (pr): UnifiedReserveItem => ({
              id: pr.parkingReserveId,
              parkingId: pr.parkingId,
              reserveId: pr.reserveId,
              clientId: pr.clientId,
              clientName: pr.clientName,
              clientDataType: pr.clientDataType,
              dataStatus: pr.dataStatus,
              periodFrom: pr.periodFrom,
              periodTo: pr.periodTo,
              confirmFlag: pr.confirmFlag,
              checkinFlag: pr.checkinFlag,
              checkoutFlag: pr.checkoutFlag,
              vehicleInfo: pr.carType ?? null,
              licensePlate: pr.licensePlate,
              note: pr.note,
              saleDate: pr.saleDate,
              chargeStaffId: pr.chargeStaffId,
              facilityNo: pr.facilityNo,
              roomNumber: pr.roomNumber,
              reservePeriodFrom: pr.reservePeriodFrom,
              reservePeriodTo: pr.reservePeriodTo,
            })
          ),
      }))
    }

    return facility.bicycleParkings.map((bp) => ({
      id: bp.bicycleParkingId,
      number: bp.number,
      heightLimit: null,
      notice: bp.notice,
      dataStatus: bp.dataStatus,
      facilityId: bp.facilityId,
      facilityName: bp.facilityName,
      isBicycle: true,
      reserves: bp.bicycleParkingReserves
        .filter((r) => r.dataStatus !== 0)
        .sort((a, b) => a.periodFrom.localeCompare(b.periodFrom))
        .map(
          (bpr): UnifiedReserveItem => ({
            id: bpr.bicycleParkingReserveId,
            parkingId: bpr.bicycleParkingId,
            reserveId: bpr.reserveId,
            clientId: bpr.clientId,
            clientName: bpr.clientName,
            clientDataType: bpr.clientDataType,
            dataStatus: bpr.dataStatus,
            periodFrom: bpr.periodFrom,
            periodTo: bpr.periodTo,
            confirmFlag: bpr.confirmFlag,
            checkinFlag: bpr.checkinFlag,
            checkoutFlag: bpr.checkoutFlag,
            vehicleInfo: bpr.bicycleTypeNote ?? null,
            licensePlate: null,
            note: bpr.note,
            saleDate: bpr.saleDate,
            chargeStaffId: bpr.chargeStaffId,
            facilityNo: bpr.facilityNo,
            roomNumber: bpr.roomNumber,
            reservePeriodFrom: bpr.reservePeriodFrom,
            reservePeriodTo: bpr.reservePeriodTo,
          })
        ),
    }))
  }, [facility, isBicycle])

  // const stayTypeLabelById = useMemo(() => {
  //   return new Map(
  //     stayTypes.map((stayType) => [
  //       stayType.stayTypeId,
  //       stayType.stayTypeName || stayType.stayTypeNameShort,
  //     ])
  //   )
  // }, [stayTypes])

  // const priceColumns = useMemo(
  //   () =>
  //     Object.entries(facility.prices).map(([stayTypeId, price]) => {
  //       const stayTypeKey = Number(stayTypeId)

  //       return {
  //         stayTypeId: stayTypeKey,
  //         stayTypeLabel: stayTypeLabelById.get(stayTypeKey) ?? `Loại ${stayTypeId}`,
  //         price,
  //       }
  //     }),
  //   [facility.prices, stayTypeLabelById]
  // )

  if (slots.length === 0) return null

  const now = dayjs()

  return (
    <div className="my-[1.5rem] last:mb-0 w-[100%] overflow-x-auto no-scrollbar">
      <div className="w-fit min-w-[100%]">
        <Table
          className={cn(
            'bg-white border border-black w-full table-fixed',
            '[&_th]:border [&_th]:border-black [&_td]:border [&_td]:border-black',
            'max-sm:w-[117rem]'
          )}
        >
          <colgroup>
            <col style={{ width: '4.4444%' }} />
            <col style={{ width: '21.1966%' }} />
            <col style={{ width: '7.6923%' }} />
            <col style={{ width: '66.6667%' }} />
          </colgroup>

          {/* Header */}
          <TableHeader className="[&>tr]:h-[6.2rem]">
            <TableRow>
              <TableHead
                colSpan={2}
                className="min-w-[30rem] w-[30rem] max-w-[30rem] !p-0 border-b-[3px] border-double border-black"
              >
                <div
                  className="w-full font-bold text-3xl text-black px-[.5rem] h-full flex items-center justify-between [&>*]:px-4 gap-3"
                  style={{
                    backgroundColor: facility.colorOption || '#3764A8',
                  }}
                >
                  <span className="truncate">{facility.facilityName}</span>
                  {isBicycle ? (
                    <BicycleSvg
                      className="h-[2.3rem] w-[5rem] shrink-0"
                      aria-label="Bicycle parking"
                    />
                  ) : (
                    <CarSvg className="h-[2.3rem] w-[5rem] shrink-0" aria-label="Car parking" />
                  )}
                </div>
              </TableHead>
              <TableHead colSpan={2} className="relative !p-0 border-0">
                {/* {!isBicycle && priceColumns.length > 0 && (
                  <div className="overflow-x-auto h-full">
                    <Table className="w-full h-full table-fixed border-0">
                      <TableHeader className="[&>tr]:h-[2.6rem]">
                        <TableRow>
                          {priceColumns.map((column) => (
                            <TableHead
                              key={`stay-type-${column.stayTypeId}`}
                              className="!p-0 w-[13rem] text-center align-middle"
                            >
                              <div className="flex justify-center items-center px-2 w-full h-full leading-tight">
                                {column.stayTypeLabel}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="[&>tr]:h-[2.6rem]">
                        <TableRow>
                          {priceColumns.map((column) => (
                            <TableCell
                              key={`price-${column.stayTypeId}`}
                              className="!p-0 w-[13rem] text-center align-middle border-x-0"
                            >
                              <div className="flex justify-center items-center px-2 w-full h-full">
                                {column.price.toLocaleString()} đ
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )} */}
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="[&>tr]:h-[6.7rem]">
            {slots.map((slot, rowIndex) => (
              <TableRow key={`slot-${slot.id}-${rowIndex}`}>
                {/* Slot number */}
                <TableCell className="relative min-w-[5.2rem] w-[5.2rem] max-w-[5.2rem] !p-0 text-center">
                  <div className="top-0 right-0 bottom-0 left-0 absolute flex justify-center items-center max-w-[100%] overflow-hidden">
                    <span
                      className={cn(
                        'flex justify-center items-center w-full h-full text-ellipsis whitespace-nowrap',
                        {
                          'bg-green-400':
                            slot.reserves[0] &&
                            dayjs().isSameOrAfter(
                              dayjs(slot.reserves[0].reservePeriodFrom),
                              'day'
                            ) &&
                            slot.reserves[0].chargeStaffId != null,
                          'bg-[#FCFF61]': slot.reserves.length === 0,
                          'bg-[#F86F6F]': slot.dataStatus === 0,
                        }
                      )}
                    >
                      {slot.number}
                    </span>
                  </div>
                </TableCell>

                {/* Height limit + notice */}
                <TableCell className="min-w-[24.8rem] w-[24.8rem] max-w-[24.8rem] text-center">
                  <div className="flex flex-col justify-center items-center gap-2 overflow-hidden">
                    {!isBicycle && slot.heightLimit != null && <span>{slot.heightLimit}m</span>}
                    {slot.notice && (
                      <span
                        className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[12rem]"
                        title={slot.notice}
                      >
                        {slot.notice}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Status indicator column */}
                <TableCell className="relative !w-[9rem] text-center">
                  <div>
                    {slot.reserves[0]?.checkinFlag &&
                    dayjs().isSameOrAfter(dayjs(slot.reserves[0].periodFrom), 'day') ? (
                      <span className="text-black font-medium !text-[1.3rem]">Đang dùng</span>
                    ) : (
                      <span className="text-black">—</span>
                    )}
                  </div>
                </TableCell>

                {/* Timeline */}
                <TableCell className="relative !w-[78rem] !p-0">
                  {slot.dataStatus === 0 ? (
                    <div
                      className={cn(
                        'top-0 right-0 bottom-0 left-0 absolute',
                        'flex items-center justify-center',
                        'font-bold bg-[rgba(0,0,0,.3)]'
                      )}
                    >
                      Tạm dừng
                    </div>
                  ) : (
                    <HorizontalDragScroll className="h-[6.7rem]">
                      <div className="flex flex-row justify-start items-stretch min-w-max h-full">
                        {renderTimeline(slot, now, isBicycle)}
                      </div>
                    </HorizontalDragScroll>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * Renders the timeline cells for a parking slot:
 * - Active reservations
 * - Available gaps between reservations
 * - Available space before first / after last reservation
 */
function renderTimeline(slot: UnifiedParkingSlot, now: dayjs.Dayjs, isBicycle: boolean) {
  const activeReserves = slot.reserves

  const elements: JSX.Element[] = []

  // Common props for ParkingAvailableSlot to enable create modal
  const slotContext = {
    facilityId: slot.facilityId,
    parkingId: isBicycle ? undefined : slot.id,
    bicycleParkingId: isBicycle ? slot.id : undefined,
    isBicycle,
    facilityName: slot.facilityName,
    slotNumber: slot.number,
  }

  // No reservations → show fully available
  if (activeReserves.length === 0) {
    elements.push(
      <ParkingAvailableSlot
        key={`empty-${slot.id}`}
        dateFrom={now.format('YYYY-MM-DD')}
        showBookingLink={true}
        {...slotContext}
      />
    )
    return elements
  }

  // Gap before first reservation
  const firstReserve = activeReserves[0]
  if (dayjs(firstReserve.periodFrom).isAfter(now, 'day')) {
    elements.push(
      <ParkingAvailableSlot
        key={`before-${slot.id}`}
        dateFrom={now.format('YYYY-MM-DD')}
        dateTo={dayjs(firstReserve.periodFrom).subtract(1, 'day').format('YYYY-MM-DD')}
        showBookingLink={true}
        {...slotContext}
      />
    )
  }

  // Render each reservation and gaps between them
  for (let i = 0; i < activeReserves.length; i++) {
    const current = activeReserves[i]

    elements.push(
      <ParkingTimelineSlot key={`reserve-${current.id}`} reserve={current} isBicycle={isBicycle} />
    )

    // Gap between current and next
    if (i < activeReserves.length - 1) {
      const next = activeReserves[i + 1]

      if (current.periodTo && next.periodFrom) {
        const currentEnd = dayjs(current.periodTo)
        const nextStart = dayjs(next.periodFrom)

        if (currentEnd.isBefore(nextStart, 'day')) {
          elements.push(
            <ParkingAvailableSlot
              key={`gap-${slot.id}-${i}`}
              dateFrom={currentEnd.add(1, 'day').format('YYYY-MM-DD')}
              dateTo={nextStart.subtract(1, 'day').format('YYYY-MM-DD')}
              isConfirmed={current.confirmFlag}
              showBookingLink={false}
              {...slotContext}
            />
          )
        }
      } else if (!current.periodTo) {
        elements.push(
          <ParkingAvailableSlot
            key={`gap-null-${slot.id}-${i}`}
            isConfirmed={false}
            showBookingLink={false}
            {...slotContext}
          />
        )
      }
    }
  }

  // Space after last reservation
  const lastReserve = activeReserves[activeReserves.length - 1]
  if (lastReserve.periodTo) {
    const lastReserveEnd = dayjs(lastReserve.periodTo)
    const dateFrom = lastReserveEnd.isBefore(now, 'day')
      ? now.format('YYYY-MM-DD')
      : lastReserveEnd.add(1, 'day').format('YYYY-MM-DD')

    elements.push(
      <ParkingAvailableSlot
        key={`after-${slot.id}`}
        dateFrom={dateFrom}
        isConfirmed={lastReserve.confirmFlag}
        showBookingLink={lastReserve.confirmFlag}
        {...slotContext}
      />
    )
  } else if (!lastReserve.periodTo) {
    elements.push(
      <ParkingAvailableSlot
        key={`after-null-${slot.id}`}
        isConfirmed={false}
        showBookingLink={false}
        {...slotContext}
      />
    )
  }

  return elements
}
