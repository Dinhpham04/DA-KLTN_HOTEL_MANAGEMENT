import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from 'usehooks-ts'
import { z } from 'zod'

import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import CustomDatePicker from '@/components/common/CustomDatePicker'
import { CustomInput } from '@/components/common/CustomInput'
import { SearchIconSvg } from '@/components/svgs/SearchIconSvg'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { NButton } from '@/components/ui/new-button'
import { WhiteboardIndicator } from '@/components/whiteboard/WhiteboardIndicator'
import { WhiteboardLegend } from '@/components/whiteboard/WhiteboardLegend'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useGetRoomClasses } from '@/hooks/queries/useGetRoomClasses'
import { useWhiteboard } from '@/hooks/queries/useWhiteboard'
import { cn } from '@/lib/utils'
import {
  WHITEBOARD_CLEAN_STATUS,
  WHITEBOARD_SERVICE,
  type WhiteboardFilterParams,
} from '@/types/whiteboard'

export const Route = createLazyFileRoute('/_authenticated/usage-situation')({
  component: UsageSituationPage,
})

const formSchema = z.object({
  facilityIds: z.array(z.string()),
  roomClassIds: z.array(z.string()),
  serviceTypes: z.array(z.string()),
  cleanTypes: z.array(z.string()),
  facilityRoom: z.string().nullable(),
  facilityNo: z.string().nullable(),
  roomNumber: z.string().nullable(),
  periodFrom: z.date().nullable(),
  periodTo: z.date().nullable(),
})

type FormValues = z.infer<typeof formSchema>

function buildFilterParams(values: FormValues): WhiteboardFilterParams {
  return {
    facilityIds: values.facilityIds.map(Number).filter(Boolean),
    roomClassIds: values.roomClassIds.map(Number).filter(Boolean),
    serviceTypes: values.serviceTypes.map(Number).filter(Boolean),
    cleanTypes: values.cleanTypes.map(Number).filter(Boolean),
    roomNumber: values.roomNumber || undefined,
    facilityNo: values.facilityNo || undefined,
    periodFrom: values.periodFrom ? dayjs(values.periodFrom).format('YYYY-MM-DD') : undefined,
    periodTo: values.periodTo ? dayjs(values.periodTo).format('YYYY-MM-DD') : undefined,
  }
}

function UsageSituationPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('whiteboard.title'))

  const formRef = useRef<HTMLFormElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facilityIds: [],
      roomClassIds: [],
      serviceTypes: [],
      cleanTypes: [],
      facilityRoom: null,
      facilityNo: null,
      roomNumber: null,
      periodFrom: null,
      periodTo: null,
    },
  })

  const [filter, setFilter] = useState<WhiteboardFilterParams>({ perPage: 1 })
  const [submittedSearchFrom, setSubmittedSearchFrom] = useState<Date | null>(null)
  const [submittedSearchTo, setSubmittedSearchTo] = useState<Date | null>(null)

  const { data: facilitiesResponse } = useGetFacilities()
  const { data: roomClassesResponse } = useGetRoomClasses()
  const facilities = facilitiesResponse?.data ?? []
  const roomClasses = roomClassesResponse?.data ?? []

  const { data, isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useWhiteboard({ params: { ...filter, perPage: 1 } })

  const flatFacilities = useMemo(() => data?.pages.flatMap((p) => p.usageStatuses) ?? [], [data])

  // F6 / Ctrl+Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F6' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const node = observerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Disable facilityRoom input when any facility is selected
  const formFacilityIds = form.watch('facilityIds')
  useEffect(() => {
    if (formFacilityIds.length > 0) {
      form.setValue('facilityRoom', '')
      form.setValue('facilityNo', null)
      form.setValue('roomNumber', null)
    }
  }, [formFacilityIds, form])

  const handleSubmit = (values: FormValues) => {
    setFilter(buildFilterParams(values))
    setSubmittedSearchFrom(values.periodFrom)
    setSubmittedSearchTo(values.periodTo)
  }

  const handleClear = () => {
    form.reset({
      facilityIds: [],
      roomClassIds: [],
      serviceTypes: [],
      cleanTypes: [],
      facilityRoom: null,
      facilityNo: null,
      roomNumber: null,
      periodFrom: null,
      periodTo: null,
    })
    setFilter({ perPage: 1 })
    setSubmittedSearchFrom(null)
    setSubmittedSearchTo(null)
  }

  return (
    <div className="common-container">
      <div className="pt-16 pb-52">
        {/* Page header */}
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold text-[2.3rem]">{t('whiteboard.title')}</div>
        </div>

        {/* Search Form */}
        <section className="flex lg:flex-row flex-col-reverse justify-between mt-8 mb-[3.2rem]">
          <div className="bg-white p-8 lg:p-[3.2rem] border-[#204172] border-2 rounded-[0.8rem] w-full">
            <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)}>
              {/* Period range */}
              <div className="flex flex-wrap flex-1 mb-4">
                <div className="flex items-center mb-4 md:mb-[0.3rem]">
                  <div className="min-w-[5.5rem] mr-[4rem] font-bold text-[1.6rem] text-black">
                    {t('whiteboard.usageDate')}:
                  </div>
                  <Controller
                    control={form.control}
                    name="periodFrom"
                    render={({ field }) => (
                      <CustomDatePicker
                        format="yyyy/MM/dd"
                        className={cn(
                          'flex-1 [&>div]:px-4 w-[15rem] md:w-[19rem] h-16 [&_input::placeholder]:text-black text-2xl cursor-pointer'
                        )}
                        change={(d) => field.onChange(d)}
                        value={field.value}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center mb-4 md:mb-[0.3rem]">
                  <div className="min-w-[5.5rem] font-bold text-[1.6rem] text-black text-center">
                    ～
                  </div>
                  <Controller
                    control={form.control}
                    name="periodTo"
                    render={({ field }) => (
                      <CustomDatePicker
                        format="yyyy/MM/dd"
                        className={cn(
                          'flex-1 [&>div]:px-4 w-[19rem] h-16 [&_input::placeholder]:text-black text-2xl cursor-pointer'
                        )}
                        change={(d) => field.onChange(d)}
                        value={field.value}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Facility (store) accordion */}
              <Controller
                control={form.control}
                name="facilityIds"
                render={({ field }) => (
                  <div className="flex flex-col mb-2">
                    <div className="my-[1.1rem] font-bold text-[1.6rem] text-black">
                      {t('whiteboard.store')}
                    </div>
                    <Accordion defaultValue="item-1" type="single" collapsible>
                      <AccordionItem
                        className="relative flex items-center px-8 md:px-[3.2rem] pt-0 pb-[2.7rem] border !border-[#999] rounded-[0.4rem] w-full [&>div]:w-full overflow-hidden"
                        value="item-1"
                      >
                        <AccordionContent className="flex-wrap flex-1 gap-[.5rem] grid grid-cols-3 mt-[1.1rem] w-full">
                          {facilities.map((item, index) => {
                            const value = String(item.facilityId)
                            const checked = field.value.includes(value)
                            return (
                              <div
                                key={item.facilityId}
                                className="flex items-center my-2 pr-8 min-w-[11.8rem]"
                              >
                                <CustomCheckbox
                                  id={`facility-${index}`}
                                  checked={checked}
                                  onCheckedChange={(c) =>
                                    field.onChange(
                                      c
                                        ? [...field.value, value]
                                        : field.value.filter((v) => v !== value)
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`facility-${index}`}
                                  className="ml-4 font-normal text-[1.6rem] text-black leading-tight cursor-pointer"
                                >
                                  {item.facilityName}
                                </label>
                              </div>
                            )
                          })}
                        </AccordionContent>
                        <AccordionTrigger className="right-0 bottom-0 left-0 absolute flex justify-center py-4 border-[#D9D9D9] border-t cursor-pointer" />
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              />

              {/* Room class checkboxes */}
              <Controller
                control={form.control}
                name="roomClassIds"
                render={({ field }) => (
                  <div className="flex md:flex-row flex-col flex-wrap md:items-center my-8 md:my-[1.1rem]">
                    <div className="max-md:mb-2 mr-[2rem] min-w-[10.5rem] font-bold text-[1.6rem] text-black">
                      {t('whiteboard.roomClass')}
                    </div>
                    <div className="flex flex-wrap flex-1 items-center">
                      {roomClasses.map((item, index) => {
                        const value = String(item.roomClassId)
                        const checked = field.value.includes(value)
                        return (
                          <div
                            key={item.roomClassId}
                            className="flex items-center my-2 pr-8 min-w-[11.8rem]"
                          >
                            <CustomCheckbox
                              id={`class-${index}`}
                              checked={checked}
                              onCheckedChange={(c) =>
                                field.onChange(
                                  c
                                    ? [...field.value, value]
                                    : field.value.filter((v) => v !== value)
                                )
                              }
                            />
                            <label
                              htmlFor={`class-${index}`}
                              className="ml-4 font-normal text-[1.6rem] text-black leading-tight cursor-pointer"
                            >
                              {formatRoomClassName(item.roomClassName)}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              />

              {/* Service checkboxes */}
              <Controller
                control={form.control}
                name="serviceTypes"
                render={({ field }) => (
                  <div className="flex md:flex-row flex-col flex-wrap md:items-center my-8 md:my-[1.1rem]">
                    <div className="max-md:mb-2 mr-[2rem] min-w-[10.5rem] font-bold text-[1.6rem] text-black">
                      {t('whiteboard.service')}
                    </div>
                    <div className="flex flex-wrap flex-1 items-center">
                      {[
                        { value: WHITEBOARD_SERVICE.PARKING, key: 'service_parking' },
                        { value: WHITEBOARD_SERVICE.BICYCLE, key: 'service_bicycle' },
                        { value: WHITEBOARD_SERVICE.PET, key: 'service_pet' },
                        { value: WHITEBOARD_SERVICE.BOX, key: 'service_box' },
                      ].map((s, idx) => {
                        const value = String(s.value)
                        const checked = field.value.includes(value)
                        return (
                          <div
                            key={s.value}
                            className="flex items-center my-2 pr-8 min-w-[11.8rem]"
                          >
                            <CustomCheckbox
                              id={`service-${idx}`}
                              checked={checked}
                              onCheckedChange={(c) =>
                                field.onChange(
                                  c
                                    ? [...field.value, value]
                                    : field.value.filter((v) => v !== value)
                                )
                              }
                            />
                            <label
                              htmlFor={`service-${idx}`}
                              className="ml-4 font-normal text-[1.6rem] text-black leading-tight cursor-pointer"
                            >
                              {t(`whiteboard.${s.key}`)}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              />

              {/* Status checkboxes (MVP: only "in use") */}
              <Controller
                control={form.control}
                name="cleanTypes"
                render={({ field }) => (
                  <div className="flex md:flex-row flex-col flex-wrap md:items-center my-8 md:my-[1.1rem]">
                    <div className="max-md:mb-2 mr-[2rem] min-w-[10.5rem] font-bold text-[1.6rem] text-black">
                      {t('whiteboard.status')}
                    </div>
                    <div className="flex flex-wrap flex-1 items-center">
                      {[{ value: WHITEBOARD_CLEAN_STATUS.IN_USE, key: 'status_inUse' }].map(
                        (s, idx) => {
                          const value = String(s.value)
                          const checked = field.value.includes(value)
                          return (
                            <div
                              key={s.value}
                              className="flex items-center my-2 pr-8 min-w-[11.8rem]"
                            >
                              <CustomCheckbox
                                id={`status-${idx}`}
                                checked={checked}
                                onCheckedChange={(c) =>
                                  field.onChange(
                                    c
                                      ? [...field.value, value]
                                      : field.value.filter((v) => v !== value)
                                  )
                                }
                              />
                              <label
                                htmlFor={`status-${idx}`}
                                className="ml-4 font-normal text-[1.6rem] text-black leading-tight cursor-pointer"
                              >
                                {t(`whiteboard.${s.key}`)}
                              </label>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}
              />

              {/* Combined facility-no + room-number input */}
              <Controller
                control={form.control}
                name="facilityRoom"
                render={({ field }) => (
                  <div className="flex md:flex-row flex-col flex-wrap md:items-center my-8 md:my-[1.1rem]">
                    <div className="max-md:mb-2 mr-[2rem] min-w-[10.5rem] font-bold text-[1.6rem] text-black">
                      {t('whiteboard.storeRoomNumber')}
                    </div>
                    <CustomInput
                      inputMode="numeric"
                      lang="en"
                      disabled={form.watch('facilityIds').length > 0}
                      value={field.value ?? ''}
                      placeholder="01-201"
                      onChange={(e) => {
                        const raw = e.target.value
                        field.onChange(raw)
                        const normalized = raw.trim().replace(/　/g, ' ').replace(/\s+/g, ' ')
                        const parts = normalized.split(' ').filter(Boolean)

                        let facilityNo = ''
                        let roomNumber = ''
                        if (parts.length >= 2) {
                          facilityNo = parts[0]
                          roomNumber = parts[1]
                        } else if (parts.length === 1) {
                          if (parts[0].length <= 2) facilityNo = parts[0]
                          else roomNumber = parts[0]
                        }
                        form.setValue('facilityNo', facilityNo || null)
                        form.setValue('roomNumber', roomNumber || null)
                      }}
                      className="disabled:bg-[#D6D6D6] !opacity-100 border w-[25rem] h-14"
                    />
                  </div>
                )}
              />

              {/* Action buttons */}
              <div className="flex flex-col items-center mt-[3.2rem]">
                <div className="flex flex-row gap-4">
                  <NButton
                    type="submit"
                    className="!bg-[#37A86B] hover:opacity-60 w-[22rem] h-16 md:h-[5.6rem]"
                    variant="default"
                  >
                    <SearchIconSvg />
                    <span className="text-white">{t('whiteboard.search')}</span>
                  </NButton>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-10 font-bold text-[#1A3CEF] text-[1.4rem] underline hover:no-underline"
                >
                  {t('whiteboard.clearFilters')}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Legend */}
        <div className="mb-4 px-2">
          <WhiteboardLegend />
        </div>

        {/* Results */}
        <section className="min-h-[60vh]">
          <WhiteboardIndicator
            facilities={flatFacilities}
            isLoading={isLoading || (isFetching && flatFacilities.length === 0)}
            isFetchingMore={isFetchingNextPage}
            observerRef={observerRef}
            searchFrom={submittedSearchFrom}
            searchTo={submittedSearchTo}
          />
        </section>
      </div>
    </div>
  )
}

function formatRoomClassName(name: string): string {
  if (name === 'SINGLE') return 'S-CLASS'
  if (name === 'TWIN') return 'T-CLASS'
  if (name === 'FAMILY') return 'F-CLASS'
  return name
}
