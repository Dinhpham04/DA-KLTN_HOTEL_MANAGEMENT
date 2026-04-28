import { Link } from '@tanstack/react-router'
import dayjs, { type Dayjs } from 'dayjs'
import { Loader2 } from 'lucide-react'
import { type MutableRefObject, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from '@/components/common/CustomAccordion'
import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import { CustomTooltip } from '@/components/common/CustomToolTip'
import { BicycleSvg } from '@/components/svgs/BicycleSVG'
import { CarSvg } from '@/components/svgs/CarSvg'
import { DogSvg } from '@/components/svgs/DogSvg'
import { TrashSVG } from '@/components/svgs/TrashSVG'
import { cn } from '@/lib/utils'
import type {
  WhiteboardFacility,
  WhiteboardReserveItem,
  WhiteboardRoom,
  WhiteboardStayTypeRent,
} from '@/types/whiteboard'

interface WhiteboardIndicatorProps {
  facilities: WhiteboardFacility[]
  isLoading: boolean
  isFetchingMore: boolean
  observerRef: MutableRefObject<HTMLDivElement | null>
  searchFrom?: Date | null
  searchTo?: Date | null
}

interface RoomTypeGroup {
  key: string
  label: string
  rooms: WhiteboardRoom[]
  acreage: string | null
  rents: WhiteboardStayTypeRent[]
}

type CheckedItems = Record<number, Record<string, boolean>>

const MIN_TIMELINE_COLUMNS = 4

type TimelineCell =
  | { type: 'reserve'; reserve: WhiteboardReserveItem }
  | { type: 'booking'; from: Dayjs; to: Dayjs | null }

export function WhiteboardIndicator({
  facilities,
  isLoading,
  isFetchingMore,
  observerRef,
  searchFrom,
  searchTo,
}: WhiteboardIndicatorProps) {
  const { t } = useTranslation()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({})

  const hasDateFilter = Boolean(searchFrom || searchTo)

  useEffect(() => {
    setOpenItems(facilities.map((facility) => `facility-${facility.facilityId}`))
    setCheckedItems({})
  }, [facilities])

  const displayFacilities = useMemo(
    () =>
      facilities.map((facility) => {
        const roomTypeGroups = groupRoomsByType(facility.rooms)
        const occupiedRooms = facility.rooms.filter(isRoomOccupiedNow).length

        return {
          ...facility,
          roomTypeGroups,
          emptyRooms: Math.max(facility.rooms.length - occupiedRooms, 0),
          hasPetService: hasPetService(facility.rooms),
          hasDeliveryBoxService: hasDeliveryBoxService(facility),
        }
      }),
    [facilities]
  )

  const toggleCheckbox = (facilityId: number, roomTypeKey: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [facilityId]: {
        ...prev[facilityId],
        [roomTypeKey]: !prev[facilityId]?.[roomTypeKey],
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin h-8 w-8 text-[#204172]" />
      </div>
    )
  }

  if (facilities.length === 0) {
    return <div className="text-center text-[1.6rem] text-[#666] py-10">{t('common.noData')}</div>
  }

  return (
    <section>
      <CustomAccordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="w-full"
      >
        {displayFacilities.map((facility) => (
          <CustomAccordionItem
            className="relative last:border-black last:border-b"
            key={facility.facilityId}
            value={`facility-${facility.facilityId}`}
          >
            <CustomAccordionTrigger
              className="z-10 sticky top-[9rem] border-b-0"
              style={{
                backgroundColor: facility.colorOption || '#3764A8',
                padding: 34,
              }}
            >
              <div className="flex justify-between w-full overflow-hidden">
                <div className="flex sm:flex-row flex-col sm:items-center gap-1 sm:gap-[3rem] text-[1.2rem] sm:text-[1.8rem] min-w-0">
                  <div className="relative font-bold text-black min-w-0">
                    <div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
                      {facility.facilityNo
                        ? `${facility.facilityNo} ${facility.facilityName}`
                        : facility.facilityName}
                    </div>
                  </div>
                  <div className="font-normal text-black whitespace-nowrap">
                    {t('whiteboard.emptyRoom')}:{facility.emptyRooms}/{facility.rooms.length}
                  </div>
                  <div className="font-normal text-black whitespace-nowrap">
                    P:{facility.parkingHasReserveCount}/{facility.parkingCount}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 sm:ml-8">
                  {facility.parkingFlag ? (
                    <div className="bg-[#B86020] p-2 border-none rounded-[0.4rem] w-12 sm:w-20 h-12 sm:h-20 center-all">
                      <CarSvg />
                    </div>
                  ) : null}
                  {facility.bicycleParkingFlag ? (
                    <div className="bg-[#B86020] p-2 border-none rounded-[0.4rem] w-12 sm:w-20 h-12 sm:h-20 center-all">
                      <BicycleSvg />
                    </div>
                  ) : null}
                  {facility.hasPetService ? (
                    <div className="bg-[#B86020] p-2 border-none rounded-[0.4rem] w-12 sm:w-20 h-12 sm:h-20 center-all">
                      <DogSvg className="w-14" />
                    </div>
                  ) : null}
                  {facility.hasDeliveryBoxService ? (
                    <div className="bg-[#B86020] p-2 border-none rounded-[0.4rem] w-12 sm:w-20 h-12 sm:h-20 center-all">
                      <TrashSVG />
                    </div>
                  ) : null}
                  <div className="bg-white p-2 ml-2 sm:ml-4 w-fit sm:w-[19.4rem] btn btn-default text-black whitespace-nowrap">
                    Chi tiet co so
                  </div>
                </div>
              </div>
            </CustomAccordionTrigger>

            <CustomAccordionContent className="pb-0">
              <div className="table-manager-hotel bg-[#EEEEEE] text-[1.3rem]">
                {facility.roomTypeGroups.map((group, roomTypeIndex) => {
                  const showOccupied = checkedItems[facility.facilityId]?.[group.key] ?? false
                  const rooms =
                    hasDateFilter && !showOccupied
                      ? group.rooms.filter((room) => !isRoomOccupiedNow(room))
                      : group.rooms

                  return (
                    <div key={`room-type-group-${facility.facilityId}-${group.key}`}>
                      <RoomTypeInfoRow
                        roomTypeLabel={group.label}
                        acreage={group.acreage}
                        rents={group.rents}
                        hasDateFilter={hasDateFilter}
                        showOccupied={showOccupied}
                        checkboxId={`room-type-${facility.facilityId}-${roomTypeIndex}`}
                        onToggle={() => toggleCheckbox(facility.facilityId, group.key)}
                      />
                      <ul className="grid auto-cols-max overflow-x-auto snap-x hotel-list">
                        {rooms.map((room) => (
                          <RoomTimelineRow
                            key={`timeline-room-${room.roomId}`}
                            room={room}
                            emptyRoomLabel={t('whiteboard.emptyRoom')}
                            searchFrom={searchFrom}
                            searchTo={searchTo}
                          />
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </CustomAccordionContent>
          </CustomAccordionItem>
        ))}
      </CustomAccordion>

      <div ref={observerRef} className="z-50 h-12 flex justify-center items-center">
        {isFetchingMore && <Loader2 className="animate-spin h-6 w-6 text-[#204172]" />}
      </div>
    </section>
  )
}

function RoomTypeInfoRow({
  roomTypeLabel,
  acreage,
  rents,
  hasDateFilter,
  showOccupied,
  checkboxId,
  onToggle,
}: {
  roomTypeLabel: string
  acreage: string | null
  rents: WhiteboardStayTypeRent[]
  hasDateFilter: boolean
  showOccupied: boolean
  checkboxId: string
  onToggle: () => void
}) {
  const renderRents =
    rents.length > 0 ? rents : [{ stayTypeId: 0, stayTypeNameShort: null, price: null }]

  return (
    <div className="table-rows flex border-black border-x border-y first:border-t-0 last:border-b-0 text-[1.3rem]">
      <div className="table-columns flex justify-center items-center px-2 border-black border-l first:border-l-0 w-[8rem] h-16 snap-start">
        <CustomTooltip text={roomTypeLabel} />
      </div>
      {renderRents.map((rent) => (
        <div
          key={`rent-${roomTypeLabel}-${rent.stayTypeId}`}
          className="table-columns flex justify-center items-center border-black border-l first:border-l-0 w-48 h-16 snap-start"
        >
          {formatRent(rent.price)}
        </div>
      ))}
      <div className="table-columns flex justify-center items-center border-black border-l first:border-l-0 w-48 h-16 snap-start">
        <CustomTooltip text={formatAcreage(acreage)} />
      </div>
      {hasDateFilter ? (
        <div className="table-columns flex justify-end items-center px-8 border-black border-l first:border-l-0 w-full h-16 snap-end">
          <div className="flex items-center gap-4">
            <CustomCheckbox id={checkboxId} checked={showOccupied} onCheckedChange={onToggle} />
            <label
              htmlFor={checkboxId}
              className="font-semibold text-[1.3rem] cursor-pointer"
            >
              Hiển thị phòng đang ở
            </label>
          </div>
        </div>
      ) : (
        <div className="table-columns flex justify-center items-center border-black border-l first:border-l-0 w-[8rem] h-16 snap-start" />
      )}
    </div>
  )
}

function RoomTimelineRow({
  room,
  emptyRoomLabel,
  searchFrom,
  searchTo,
}: {
  room: WhiteboardRoom
  emptyRoomLabel: string
  searchFrom?: Date | null
  searchTo?: Date | null
}) {
  const timelineCells = buildTimelineCells(room, searchFrom, searchTo)
  const timelineSlots = timelineCells.length > 0 ? timelineCells.length : 1
  const placeholderCount = Math.max(MIN_TIMELINE_COLUMNS - timelineSlots, 0)
  // const anchorDate = searchFrom ? dayjs(searchFrom) : dayjs()
  const isOccupied = isRoomOccupiedNow(room)

  return (
    <li className="flex w-auto snap-start border-b border-x border-black last:border-b-0 min-w-[138rem] hotel-list__items table-rows bg-white">
      <div
        className={cn(
          'table-columns flex justify-center items-center border-black border-l first:border-l-0 w-[8rem] h-16 sm:h-[5.6rem] font-bold snap-start',
          isOccupied ? 'bg-[#F86F6F]' : 'bg-white'
        )}
      >
        {room.roomNumber}
      </div>
      {/* <div className="table-columns flex justify-center items-center border-black border-l first:border-l-0 w-[14rem] h-16 sm:h-[5.6rem] font-bold snap-start">
        {anchorDate.format('YYYY/MM/DD')}
      </div> */}

      {timelineCells.length > 0 ? (
        timelineCells.map((cell, index) =>
          cell.type === 'reserve' ? (
            <ReserveTimelineCells
              key={`reserve-${room.roomId}-${cell.reserve.reserveId}-${index}`}
              reserve={cell.reserve}
            />
          ) : (
            <BookingOpportunityCell
              key={`booking-${room.roomId}-${cell.from.valueOf()}-${index}`}
              from={cell.from}
              to={cell.to}
            />
          )
        )
      ) : (
        <TimelineEmptyCell label={emptyRoomLabel} />
      )}

      {Array.from({ length: placeholderCount }).map((_, index) => (
        <TimelineSpacerCell key={`timeline-spacer-${room.roomId}-${index}`} />
      ))}
    </li>
  )
}

function ReserveTimelineCells({ reserve }: { reserve: WhiteboardReserveItem }) {
  const hasExplicitEnd = Boolean(reserve.earlyExitDatetime || reserve.periodTo)
  const activeFlags = getReserveServiceFlags(reserve)
  const displayName =
    reserve.occupierName || reserve.clientName || (reserve.rakutenFlag ? 'Rakuten' : '---')
  const endLabel = formatReserveEndLabel(reserve)
  const isDraft = reserve.draftFlag
  const plateClasses = cn(
    'table-columns flex justify-center items-center border-black border-l first:border-l-0 w-[23.5rem] min-w-[23.5rem] h-16 sm:h-[5.6rem] snap-start usage-station-item-inner',
    {
      'bg-[#FCFF61] text-black': hasExplicitEnd && reserve.confirmFlag && !isDraft,
      'bg-[#8BD08E] text-black': (!hasExplicitEnd || !reserve.confirmFlag) && !isDraft,
      'bg-[#F86F6F] text-black':
        (!hasExplicitEnd || !reserve.confirmFlag) && reserve.clientDataType === 3 && !isDraft,
      'bg-[#4ADEDE] text-black':
        (reserve.clientAdvertisingType === 1 || reserve.advertisingType === 5) && !isDraft,
      'bg-black text-white': isDraft,
    }
  )

  const indicatorText = reserve.directcheckinFlag ? 'D/I' : reserve.confirmFlag ? '◯' : ''
  return (
    <>
      <div className={plateClasses} title={reserve.memo ?? undefined}>
        <div className="flex justify-between p-[0.3rem] w-full h-full">
          <div className="flex flex-col flex-1 gap-[1rem] justify-center px-1 py-1 overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="min-w-0">
                <Link
                  to="/reservations/$reserveId/edit"
                  params={{ reserveId: String(reserve.reserveId) }}
                  className="cursor-pointer hover:underline !opacity-100"
                  onClick={(event) => event.stopPropagation()}
                >
                  <CustomTooltip text={displayName} />
                </Link>
              </span>
              <span className="font-bold text-[#DF2727]">{indicatorText}</span>
            </div>
            <div className="flex justify-between mt-1 w-full">
              <span>{formatDateOrDash(reserve.periodFrom)}</span>
              <span>~</span>
              <span
                className={cn('font-bold', {
                  'bg-[#FCFF61] px-1': hasExplicitEnd && !isDraft,
                  'text-red': reserve.confirmFlag && !isDraft,
                  'font-medium': !hasExplicitEnd,
                })}
              >
                {endLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {activeFlags.length > 0 ? (
        <div className="table-columns flex justify-center items-center gap-1 bg-white p-1 border-black border-l w-[4.8rem] min-w-[4.8rem] h-16 sm:h-[5.6rem] snap-start">
          <div className="grid grid-cols-1 gap-1">
            {activeFlags.map((flag) => (
              <div
                key={`reserve-flag-${reserve.reserveId}-${flag}`}
                className="flex justify-center items-center bg-[#B86020] p-1 rounded-[0.4rem] w-7 h-7"
              >
                {flag === 'parking' ? <CarSvg /> : null}
                {flag === 'bicycle' ? <BicycleSvg /> : null}
                {flag === 'pet' ? <DogSvg /> : null}
                {flag === 'box' ? <TrashSVG /> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {reserve.disableReservation ? (
        <div className="table-columns flex justify-center items-center bg-white border-black border-l w-[2.6rem] min-w-[2.6rem] h-16 sm:h-[5.6rem] snap-start">
          <span className="font-bold text-[#444]">▶</span>
        </div>
      ) : null}
    </>
  )
}

function BookingOpportunityCell({
  from,
  to,
}: {
  from: Dayjs
  to: Dayjs | null
}) {
  const toLabel = to ? `${to.format('MM/DD')}` : '→'

  return (
    <div className="table-columns flex justify-center items-center p-[0.3rem] border-black border-l first:border-l-0 w-[23.5rem] min-w-[23.5rem] h-16 sm:h-[5.6rem] snap-start usage-station-item-inner">
      <Link to="/reservations/create" className="!opacity-100 block w-full">
        <div className="flex flex-col justify-center items-start gap-[1rem] w-full text-[#DF2727] font-bold leading-tight">
          <div className="flex justify-between items-center w-full">
            <span className="text-black">
              {from.format('MM/DD')}
              {to ? '~' : ''}
            </span>
            <span className="text-black">{toLabel}</span>
          </div>
          <span className="text-left">Đặt phòng：〇</span>
        </div>
      </Link>
    </div>
  )
}

function TimelineEmptyCell({ label }: { label: string }) {
  return (
    <div className="table-columns flex justify-center items-center p-[0.3rem] border-black border-l first:border-l-0 w-[23.5rem] h-16 sm:h-[5.6rem] snap-start usage-station-item-inner text-black">
      {label}
    </div>
  )
}

function TimelineSpacerCell() {
  return (
    <div className="table-columns flex justify-center items-center border-black border-l first:border-l-0 w-[23.5rem] h-16 sm:h-[5.6rem] snap-start" />
  )
}

function groupRoomsByType(rooms: WhiteboardRoom[]): RoomTypeGroup[] {
  const groups = new Map<string, RoomTypeGroup>()

  for (const room of rooms) {
    const key = String(room.roomTypeId)
    const rawLabel =
      room.roomTypeNameShort || room.roomTypeName || room.roomClassName || `TYPE-${room.roomTypeId}`
    const label = formatRoomTypeLabel(rawLabel)
    const roomRents = [...room.stayTypeRents].sort((a, b) => a.stayTypeId - b.stayTypeId)
    const existingGroup = groups.get(key)

    if (existingGroup) {
      existingGroup.rooms.push(room)
      if (!existingGroup.acreage && room.acreage) {
        existingGroup.acreage = room.acreage
      }
      if (existingGroup.rents.length === 0 && roomRents.length > 0) {
        existingGroup.rents = roomRents
      }
      continue
    }

    groups.set(key, {
      key,
      label,
      rooms: [room],
      acreage: room.acreage,
      rents: roomRents,
    })
  }

  return Array.from(groups.values())
}

function formatRent(price: number | null): string {
  if (price === null) return '--'
  return `${new Intl.NumberFormat('vi-VN').format(price)} VND`
}

function formatAcreage(acreage: string | null): string {
  if (!acreage || acreage.trim().length === 0) return '__m2'
  return `~${acreage}m2`
}

function formatRoomTypeLabel(name: string): string {
  const normalized = name.toUpperCase()
  if (normalized === 'SINGLE') return 'S'
  if (normalized === 'TWIN') return 'T'
  if (normalized === 'FAMILY') return 'FA'
  return name
}

function formatDateOrDash(value: string | null) {
  if (!value) return '--/--'
  const date = dayjs(value)
  return date.isValid() ? date.format('MM/DD') : '--/--'
}

function formatReserveEndLabel(reserve: WhiteboardReserveItem) {
  if (!reserve.periodTo && !reserve.earlyExitDatetime) return 'Chưa xác định'

  const value = reserve.earlyExitDatetime ?? reserve.periodTo
  const date = value ? dayjs(value) : null
  if (!date || !date.isValid()) return '--/--'

  const formatted = date.format('MM/DD')
  return reserve.extensionTime ? `${formatted} (${reserve.extensionTime}h)` : formatted
}

function getReserveServiceFlags(reserve: WhiteboardReserveItem) {
  const flags: Array<'parking' | 'bicycle' | 'pet' | 'box'> = []
  if (reserve.parkingReserveCount > 0) flags.push('parking')
  if (reserve.bicycleParkingReserveCount > 0) flags.push('bicycle')
  if (reserve.petFlag) flags.push('pet')
  if (reserve.deliveryboxFlag) flags.push('box')
  return flags
}

function buildTimelineCells(
  room: WhiteboardRoom,
  searchFrom?: Date | null,
  searchTo?: Date | null
): TimelineCell[] {
  const cells: TimelineCell[] = []
  const sortedReservations = [...room.usageStatus].sort((a, b) => {
    const aTime = getReserveStartDate(a)?.valueOf() ?? Number.MAX_SAFE_INTEGER
    const bTime = getReserveStartDate(b)?.valueOf() ?? Number.MAX_SAFE_INTEGER
    if (aTime === bTime) return a.reserveId - b.reserveId
    return aTime - bTime
  })

  const upperBound = searchTo ? dayjs(searchTo).startOf('day') : null
  let cursor: Dayjs | null = searchFrom ? dayjs(searchFrom).startOf('day') : dayjs().startOf('day')

  for (const reserve of sortedReservations) {
    const effective = getEffectiveReservePeriod(reserve)
    if (!effective.start) {
      cells.push({ type: 'reserve', reserve })
      continue
    }

    if (cursor && effective.start.isAfter(cursor, 'day')) {
      cells.push({
        type: 'booking',
        from: cursor,
        to: effective.start.subtract(1, 'day'),
      })
    }

    cells.push({ type: 'reserve', reserve })

    if (!cursor) continue
    if (effective.end) {
      cursor = effective.end.add(1, 'day')
    } else {
      cursor = null
      break
    }
  }

  if (cursor) {
    if (!upperBound) {
      cells.push({ type: 'booking', from: cursor, to: null })
    } else if (cursor.isBefore(upperBound, 'day') || cursor.isSame(upperBound, 'day')) {
      cells.push({ type: 'booking', from: cursor, to: upperBound })
    }
  }

  return cells
}

function getEffectiveReservePeriod(reserve: WhiteboardReserveItem): {
  start: Dayjs | null
  end: Dayjs | null
} {
  const start = getReserveStartDate(reserve)
  if (!start) {
    return { start: null, end: null }
  }

  const shouldApplyPadding = !reserve.draftFlag && !reserve.rakutenFlag
  const paddedStart = shouldApplyPadding
    ? start.subtract(Math.max(reserve.noreserveCountBefore ?? 0, 0), 'day')
    : start

  const endSource = reserve.earlyExitDatetime ?? reserve.periodTo
  const rawEnd = endSource ? dayjs(endSource) : null
  const isOpenEnded = !reserve.confirmFlag || !rawEnd || !rawEnd.isValid()
  if (isOpenEnded) {
    return { start: paddedStart, end: null }
  }

  const paddedEnd = shouldApplyPadding
    ? rawEnd.add(Math.max(reserve.noreserveCountAfter ?? 0, 0), 'day')
    : rawEnd

  return { start: paddedStart, end: paddedEnd }
}

function getReserveStartDate(reserve: WhiteboardReserveItem): Dayjs | null {
  if (!reserve.periodFrom) return null
  const date = dayjs(reserve.periodFrom)
  return date.isValid() ? date.startOf('day') : null
}

function isRoomOccupiedNow(room: WhiteboardRoom) {
  return room.usageStatus.some((status) => {
    if (!status.checkinFlag || !status.periodFrom) return false
    const from = dayjs(status.periodFrom)
    if (!from.isValid()) return false
    const today = dayjs()
    return today.isAfter(from, 'day') || today.isSame(from, 'day')
  })
}

function hasPetService(rooms: WhiteboardRoom[]) {
  return rooms.some(
    (room) => room.petFlag || room.usageStatus.some((reservation) => reservation.petFlag)
  )
}

function hasDeliveryBoxService(facility: WhiteboardFacility) {
  return (
    facility.deliveryboxFlag ||
    facility.rooms.some(
      (room) =>
        room.deliveryboxFlag || room.usageStatus.some((reservation) => reservation.deliveryboxFlag)
    )
  )
}
