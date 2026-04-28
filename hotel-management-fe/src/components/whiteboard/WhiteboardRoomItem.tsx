import { cn } from '@/lib/utils'
import type { WhiteboardRoom } from '@/types/whiteboard'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { reserveColor } from './colors'

interface WhiteboardRoomItemProps {
  room: WhiteboardRoom
}

export function WhiteboardRoomItem({ room }: WhiteboardRoomItemProps) {
  const { t } = useTranslation()
  const reserves = room.usageStatus
  const isEmpty = reserves.length === 0

  return (
    <div
      className={cn(
        'flex flex-col border border-[#D9D9D9] rounded-[0.4rem] bg-white overflow-hidden',
        'min-h-[8rem]'
      )}
    >
      {/* Header: room number + class */}
      <div className="flex items-center justify-between gap-2 bg-[#F5F7FA] px-3 py-2 border-b border-[#D9D9D9]">
        <span className="font-bold text-[1.6rem] text-black">{room.roomNumber}</span>
        {room.roomClassName && (
          <span className="px-2 py-[0.2rem] bg-[#204172] text-white text-[1.1rem] rounded">
            {formatClass(room.roomClassName)}
          </span>
        )}
      </div>

      {/* Body: reservations list or empty state */}
      <div className="flex flex-col flex-1 px-3 py-2 gap-1">
        {isEmpty ? (
          <div className="flex items-center justify-center flex-1 text-[1.3rem] text-[#888]">
            {t('whiteboard.emptyRoom')}
          </div>
        ) : (
          reserves.map((res) => (
            <div
              key={res.reserveId}
              className="flex items-center gap-2 px-2 py-1 rounded text-[1.2rem]"
              style={{
                backgroundColor: `${reserveColor(res.reserveId)}22`,
                borderLeft: `4px solid ${reserveColor(res.reserveId)}`,
              }}
              title={res.memo ?? undefined}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-black">
                  {res.clientName ?? res.occupierName ?? '---'}
                </div>
                <div className="text-[1.05rem] text-[#555]">
                  {formatPeriod(res.periodFrom, res.periodTo)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-[0.1rem] shrink-0">
                {res.checkinFlag && (
                  <span className="px-1 bg-[#37A86B] text-white text-[1rem] rounded">IN</span>
                )}
                {res.draftFlag && (
                  <span className="px-1 bg-[#999] text-white text-[1rem] rounded">DRAFT</span>
                )}
                {res.rakutenFlag && (
                  <span className="px-1 bg-[#BF0000] text-white text-[1rem] rounded">RKT</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function formatClass(name: string): string {
  if (name === 'SINGLE') return 'S-CLASS'
  if (name === 'TWIN') return 'T-CLASS'
  if (name === 'FAMILY') return 'F-CLASS'
  return name
}

function formatPeriod(from: string | null, to: string | null): string {
  const f = from ? dayjs(from).format('MM/DD') : '---'
  const t = to ? dayjs(to).format('MM/DD') : '---'
  return `${f} ~ ${t}`
}
