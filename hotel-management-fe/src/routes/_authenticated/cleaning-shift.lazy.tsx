import { CleaningShiftReportPage } from '@/components/cleaning-shift-report/CleaningShiftReportPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/cleaning-shift')({
  component: CleaningShiftReportPage,
})
