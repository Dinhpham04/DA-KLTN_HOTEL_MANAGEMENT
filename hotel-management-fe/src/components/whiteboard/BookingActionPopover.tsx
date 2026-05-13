import { NButton } from '@/components/ui/new-button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Link } from '@tanstack/react-router'
import type { Dayjs } from 'dayjs'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DraftReservationDialog } from './DraftReservationDialog'

interface BookingActionPopoverProps {
  facilityId: number
  facilityName?: string
  roomTypeId?: number
  roomId: number
  roomNumber?: string
  from: Dayjs
  to: Dayjs | null
  children: ReactNode
}

export function BookingActionPopover({
  facilityId,
  facilityName,
  roomTypeId,
  roomId,
  roomNumber,
  from,
  to,
  children,
}: BookingActionPopoverProps) {
  const { t } = useTranslation()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [draftOpen, setDraftOpen] = useState(false)

  const handleOpenDraft = () => {
    setPopoverOpen(false)
    setDraftOpen(true)
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="!opacity-100 block w-full text-left">
            {children}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-2 flex flex-col gap-2" align="center" sideOffset={6}>
          <NButton
            asChild
            variant="default"
            className="!px-2 min-w-[16rem] text-[1.3rem] whitespace-nowrap"
          >
            <Link
              to="/reservations/create"
              search={{
                facilityId: facilityId || undefined,
                roomTypeId: roomTypeId || undefined,
                roomId: roomId || undefined,
                periodFrom: from.format('YYYY-MM-DD'),
                periodTo: to ? to.format('YYYY-MM-DD') : undefined,
              }}
              onClick={() => setPopoverOpen(false)}
            >
              {t('whiteboard.bookingActions.create')}
            </Link>
          </NButton>
          <NButton
            type="button"
            variant="default"
            className="!px-2 min-w-[16rem] text-[1.3rem] whitespace-nowrap"
            onClick={handleOpenDraft}
          >
            {t('whiteboard.bookingActions.createDraft')}
          </NButton>
        </PopoverContent>
      </Popover>

      {draftOpen && (
        <DraftReservationDialog
          open={draftOpen}
          onOpenChange={setDraftOpen}
          facilityId={facilityId}
          facilityName={facilityName}
          roomId={roomId}
          roomNumber={roomNumber}
          initialPeriodFrom={from.toDate()}
          initialPeriodTo={to ? to.toDate() : null}
        />
      )}
    </>
  )
}
