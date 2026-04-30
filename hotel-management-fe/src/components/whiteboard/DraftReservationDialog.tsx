import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomTextarea } from '@/components/common/CustomTextarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NButton } from '@/components/ui/new-button'
import { useCreateReservationDraft } from '@/hooks/mutations/useCreateReservationDraft'
import { useGetClients } from '@/hooks/queries/useGetClients'
import { cn } from '@/lib/utils'
import type { Client } from '@/types/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Loader2, Plus, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'

interface DraftReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facilityId: number
  facilityName?: string
  roomId: number
  roomNumber?: string
  initialPeriodFrom: Date
  initialPeriodTo: Date | null
}

const expirySchema = z.union([z.literal('1'), z.literal('2'), z.literal('3')])

const formSchema = z
  .object({
    clientId: z.number({ invalid_type_error: 'required' }).int().positive(),
    expiredDate: expirySchema,
    periodFrom: z.date({ invalid_type_error: 'required' }),
    periodTo: z.date({ invalid_type_error: 'required' }),
    note: z.string().max(256).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.periodFrom && data.periodTo && data.periodTo.getTime() <= data.periodFrom.getTime()) {
      ctx.addIssue({
        code: 'custom',
        path: ['periodTo'],
        message: 'periodToAfterFrom',
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

const TTL_OPTIONS: Array<{ value: '1' | '2' | '3'; label: string }> = [
  { value: '1', label: '24h' },
  { value: '2', label: '48h' },
  { value: '3', label: '72h' },
]

export function DraftReservationDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
  roomId,
  roomNumber,
  initialPeriodFrom,
  initialPeriodTo,
}: DraftReservationDialogProps) {
  const { t } = useTranslation()

  const { data: clientsData, isLoading: clientsLoading } = useGetClients({
    params: { page: 1, limit: 200 },
  })
  const clients = useMemo<Client[]>(() => clientsData?.items ?? [], [clientsData])

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expiredDate: '1',
      periodFrom: initialPeriodFrom,
      periodTo: initialPeriodTo ?? dayjs(initialPeriodFrom).add(1, 'day').toDate(),
      note: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        expiredDate: '1',
        periodFrom: initialPeriodFrom,
        periodTo: initialPeriodTo ?? dayjs(initialPeriodFrom).add(1, 'day').toDate(),
        note: '',
      })
    }
  }, [open, initialPeriodFrom, initialPeriodTo, reset])

  const { mutateAsync: createDraft } = useCreateReservationDraft({
    onSuccess: () => {
      toast.success(t('whiteboard.draftReservation.successCreate'))
      onOpenChange(false)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : t('whiteboard.draftReservation.errorCreate')
      toast.error(message)
    },
  })

  const onSubmit = async (data: FormValues) => {
    await createDraft({
      clientId: data.clientId,
      facilityId,
      roomId,
      periodFrom: dayjs(data.periodFrom).toISOString(),
      periodTo: dayjs(data.periodTo).toISOString(),
      expiredDate: Number(data.expiredDate) as 1 | 2 | 3,
      note: data.note || undefined,
    }).catch(() => {
      // swallow — toast already shown
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[60rem] [&>button:last-of-type]:hidden">
        <NButton
          type="button"
          variant="ghost"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="top-3 right-3 absolute flex justify-center items-center !p-0 !w-10 !h-10"
        >
          <X className="h-7 w-7" />
        </NButton>
        <DialogHeader>
          <DialogTitle className="text-[1.8rem] font-bold">
            {t('whiteboard.draftReservation.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4 text-[1.4rem]">
          <div className="flex justify-between items-center bg-[#f5f5f5] px-4 py-3 rounded">
            <span className="font-semibold">{t('whiteboard.draftReservation.facility')}</span>
            <span>
              {facilityName ?? `Facility #${facilityId}`} / {roomNumber ?? `Room #${roomId}`}
            </span>
          </div>

          <div className="grid grid-cols-[12rem_1fr] gap-4 items-center">
            <label className="font-semibold">{t('whiteboard.draftReservation.client')}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Controller
                  control={control}
                  name="clientId"
                  render={({ field }) => (
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={cn(
                        'h-12 w-full px-3 rounded border border-black bg-white',
                        errors.clientId && 'border-red-500'
                      )}
                    >
                      <option value="" disabled>
                        {clientsLoading
                          ? t('common.loading')
                          : clients.length === 0
                            ? t('whiteboard.draftReservation.noClients')
                            : t('whiteboard.draftReservation.selectClient')}
                      </option>
                      {clients.map((c) => (
                        <option key={c.clientId} value={c.clientId}>
                          {c.clientName} {c.clientNameEn ? `(${c.clientNameEn})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.clientId && (
                  <p className="mt-1 text-red-500 text-[1.2rem]">
                    {t('whiteboard.draftReservation.clientRequired')}
                  </p>
                )}
              </div>
              <NButton asChild variant="default" className="whitespace-nowrap">
                <Link to="/clients/create" onClick={() => onOpenChange(false)}>
                  <Plus className="mr-1 h-5 w-5" />
                  {t('whiteboard.draftReservation.addClient')}
                </Link>
              </NButton>
            </div>
          </div>

          <div className="grid grid-cols-[12rem_1fr] gap-4 items-center">
            <label className="font-semibold">{t('whiteboard.draftReservation.expiry')}</label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-6">
                {TTL_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" value={opt.value} {...register('expiredDate')} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.expiredDate && (
                <p className="text-red-500 text-[1.2rem]">
                  {t('whiteboard.draftReservation.expiredRequired')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[12rem_1fr] gap-4 items-center">
            <label className="font-semibold">{t('whiteboard.draftReservation.period')}</label>
            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="periodFrom"
                render={({ field }) => (
                  <CustomDatePicker
                    format="yyyy/MM/dd"
                    value={field.value}
                    change={(v) => field.onChange(Array.isArray(v) ? v[0] : v)}
                    className="h-12"
                  />
                )}
              />
              <span className="font-bold">~</span>
              <Controller
                control={control}
                name="periodTo"
                render={({ field }) => (
                  <CustomDatePicker
                    format="yyyy/MM/dd"
                    value={field.value}
                    change={(v) => field.onChange(Array.isArray(v) ? v[0] : v)}
                    className="h-12"
                  />
                )}
              />
            </div>
            {errors.periodTo && (
              <>
                <span />
                <p className="text-red-500 text-[1.2rem]">
                  {t('whiteboard.draftReservation.periodToAfterFrom')}
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-[12rem_1fr] gap-4 items-start">
            <label className="font-semibold mt-2">{t('whiteboard.draftReservation.note')}</label>
            <CustomTextarea
              {...register('note')}
              placeholder={t('whiteboard.draftReservation.notePlaceholder')}
              className="min-h-[8rem]"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <NButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </NButton>
            <NButton type="submit" disabled={isSubmitting} className="hover:text-black">
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                t('whiteboard.draftReservation.submit')
              )}
            </NButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
