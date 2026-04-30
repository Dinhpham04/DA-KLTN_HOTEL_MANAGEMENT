import { CleaningShiftPage } from '@/components/cleaning-shift/CleaningShiftPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/cleaning')({
  component: CleaningShiftPage,
})
