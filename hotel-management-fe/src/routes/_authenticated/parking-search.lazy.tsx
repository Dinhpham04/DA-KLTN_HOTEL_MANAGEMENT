import { zodResolver } from '@hookform/resolvers/zod'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDocumentTitle } from 'usehooks-ts'
import { z } from 'zod'

import { CustomRadio, CustomRadioItems } from '@/components/common/CustomRadio'
import CustomSelect from '@/components/common/CustomSelect'
import Loading from '@/components/common/Loading'
import ParkingFacilityTable from '@/components/parking/ParkingFacilityTable'
import { NButton } from '@/components/ui/new-button'
import { useGetFacilities } from '@/hooks/queries/useGetFacilities'
import { useParkingStatus } from '@/hooks/queries/useParkingStatus'
import { cn } from '@/lib/utils'

import type { ParkingStatusFilterParams } from '@/types/parking-status'

// --- Route ---

export const Route = createLazyFileRoute('/_authenticated/parking-search')({
  component: ParkingSearchPage,
})

// --- Form Schema ---

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const searchSchema = z.object({
  facilityId: optionSchema,
  type: z.string(),
})

type SearchForm = z.infer<typeof searchSchema>

// --- Page ---

function ParkingSearchPage() {
  useDocumentTitle('Tình trạng bãi đỗ xe')

  const [filterParams, setFilterParams] = useState<ParkingStatusFilterParams>({
    type: 1, // all
  })

  const methods = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      facilityId: { value: '', label: '' },
      type: 'r1',
    },
  })

  // --- Fetch facilities for dropdown ---
  const { data: facilitiesResponse } = useGetFacilities()

  const facilityOptions = useMemo(
    () =>
      (facilitiesResponse?.data ?? [])
        .filter((f) => f.parkingFlag || f.bicycleParkingFlag)
        .map((f) => ({
          value: String(f.facilityId),
          label: f.facilityName,
        })),
    [facilitiesResponse]
  )

  // --- Fetch parking status ---
  const { data: facilityList = [], isLoading } = useParkingStatus({
    params: filterParams,
  })

  // --- Handlers ---
  function handleSubmit(data: SearchForm) {
    const typeMap: Record<string, number> = { r1: 1, r2: 2, r3: 3 }
    setFilterParams({
      facilityId: data.facilityId.value ? Number(data.facilityId.value) : undefined,
      type: typeMap[data.type] ?? 1,
    })
  }

  function handleReset() {
    methods.reset({
      facilityId: { value: '', label: '' },
      type: 'r1',
    })
    setFilterParams({ type: 1 })
  }

  // --- Determine which parking types to show ---
  const showCar = filterParams.type === 1 || filterParams.type === 2
  const showBicycle = filterParams.type === 1 || filterParams.type === 3

  return (
    <div className="pt-[2.6rem] pb-[12rem] overflow-auto [&_*]:text-[1.4rem] common-container">
      {/* Page Title */}
      <div className="mb-4">
        <div className="flex items-center bg-white before:bg-primary before:w-[.4rem] h-[4.7rem] before:h-full font-bold text-[2.3rem] before:content-['']">
          <div className="ml-[1.5rem] font-bold !text-[2.3rem]">Tình trạng bãi đỗ xe</div>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="mb-[1.5rem]">
        <div className="flex flex-col gap-[1rem] bg-white px-[2rem] py-[2rem] rounded-[0.5rem]">
          {/* Facility filter */}
          <div className="flex max-sm:flex-col max-sm:[&>*]:flex-shrink-0 gap-[2rem] max-sm:gap-[1rem] w-[100%]">
            <div
              className={cn(
                'flex items-center gap-[1rem] w-fit max-sm:w-[100%]',
                '[&>*]:h-[4rem] [&>*]:flex [&>*]:items-center',
                'max-sm:flex-col max-sm:gap-0 max-sm:items-start'
              )}
            >
              <div className="w-[7rem] font-bold text-xl">Cơ sở</div>
              <div className="w-[19rem] max-sm:w-[100%] [&>*]:w-[100%] [&>*]:h-[100%]">
                <Controller
                  control={methods.control}
                  name="facilityId"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelect
                      customClassMain="h-[100%]"
                      option={facilityOptions}
                      change={onChange}
                      selected={value?.value}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Type filter (radio) */}
          <div
            className={cn(
              'flex max-sm:flex-col gap-[1rem] max-sm:gap-0',
              '[&>*]:h-[3rem] [&>*]:flex [&>*]:items-center'
            )}
          >
            <div className="w-[7rem] font-bold text-xl">Loại</div>
            <div className="flex justify-center">
              <Controller
                control={methods.control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <CustomRadio
                    value={value}
                    onValueChange={onChange}
                    className="gap-4 sm:gap-1 md:gap-2 xl:gap-4 grid grid-cols-3"
                  >
                    <div className="flex items-center space-x-4 col-span-1 w-[12rem] h-12">
                      <CustomRadioItems value="r1" id="parking-type-r1" />
                      <label htmlFor="parking-type-r1" className="text-xl cursor-pointer">
                        Tất cả
                      </label>
                    </div>
                    <div className="flex items-center space-x-4 col-span-1 w-[12rem] h-12">
                      <CustomRadioItems value="r2" id="parking-type-r2" />
                      <label htmlFor="parking-type-r2" className="text-xl cursor-pointer">
                        Ô tô
                      </label>
                    </div>
                    <div className="flex items-center space-x-4 col-span-1 w-[12rem] h-12">
                      <CustomRadioItems value="r3" id="parking-type-r3" />
                      <label htmlFor="parking-type-r3" className="text-xl cursor-pointer">
                        Xe đạp
                      </label>
                    </div>
                  </CustomRadio>
                )}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className={cn('flex justify-center gap-[2rem] w-[100%]', '[&>*]:w-[10.4rem]')}>
            <NButton type="submit" className="min-w-[12rem] py-6">
              Tìm kiếm
            </NButton>
            <NButton type="button" onClick={handleReset} className="min-w-[12rem] py-6">
              Xóa
            </NButton>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {isLoading && <Loading />}

      {/* Results */}
      {!isLoading &&
        facilityList.map((facility) => (
          <div key={`facility-${facility.facilityId}`}>
            {/* Car parking table */}
            {showCar && facility.parkings.length > 0 && (
              <ParkingFacilityTable facility={facility} isBicycle={false} />
            )}
            {/* Bicycle parking table */}
            {showBicycle && facility.bicycleParkings.length > 0 && (
              <ParkingFacilityTable facility={facility} isBicycle={true} />
            )}
          </div>
        ))}

      {/* No data message */}
      {!isLoading && facilityList.length === 0 && (
        <div
          className={cn(
            'bg-white shadow-sm p-[.5rem] rounded-[1rem] font-bold text-red text-center'
          )}
        >
          Không có dữ liệu phù hợp.
        </div>
      )}
    </div>
  )
}
