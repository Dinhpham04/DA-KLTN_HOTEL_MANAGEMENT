import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  facilityId: z.number().optional(),
  roomTypeId: z.number().optional(),
  roomId: z.number().optional(),
  periodFrom: z.string().optional(),
  periodTo: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/reservations/create')({
  validateSearch: searchSchema,
})
