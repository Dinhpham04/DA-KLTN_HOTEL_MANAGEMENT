import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type React from 'react'
import { useMemo } from 'react'

export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface CustomPaginationProps {
  totalPage: number
  page: number
  setPage: (page: number) => void
  dataPagination: PaginationData
  disabled?: boolean
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalPage,
  page,
  setPage,
  dataPagination,
  disabled,
}) => {
  function handleChangePage(inputValue: number | string) {
    if (typeof inputValue === 'number') {
      if (inputValue < 1) {
        setPage(1)
        return
      }
      if (totalPage && inputValue > totalPage) {
        setPage(totalPage)
        return
      }
      setPage(inputValue)
      return
    }
    if (inputValue === '<<') {
      setPage(1)
      return
    }
    if (totalPage && inputValue === '>>') {
      setPage(totalPage)
      return
    }
    if (inputValue === '<') {
      setPage(page - 1 < 1 ? 1 : page - 1)
      return
    }
    if (totalPage && inputValue === '>') {
      setPage(page + 1 > totalPage ? totalPage : page + 1)
    }
  }

  const renderPagination = useMemo<(string | number)[]>(() => {
    const getArray = (): number[] => {
      const res: number[] = []

      if (totalPage <= 5) {
        return Array.from({ length: totalPage }, (_, i) => i + 1)
      }

      if (page <= 3) {
        res.push(1, 2, 3, 4, 5)
      } else if (page > totalPage - 3) {
        res.push(totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage)
      } else {
        res.push(page - 2, page - 1, page, page + 1, page + 2)
      }

      return res
    }

    return ['<<', '<', ...getArray(), '>', '>>']
  }, [page, totalPage])

  return (
    <div
      className={cn(
        'flex [&>*]:h-[4rem] [&>*]:w-[4rem] [&>*]:text-[1.5rem] max-sm:w-[100%]',
        '[&>*]:flex [&>*]:justify-center [&>*]:items-center',
        '[&>*]:border-[0.15rem] [&>*]:border-black [&>*]:border-l-0',
        {
          hidden: dataPagination && dataPagination.total / dataPagination.limit <= 0,
        }
      )}
    >
      {renderPagination.map((e, index) => {
        const isDisabled =
          (e === '<' && page === 1) ||
          (e === '>' && page === dataPagination?.totalPages) ||
          (e === '<<' && page === 1) ||
          (e === '>>' && page === dataPagination?.totalPages)

        return (
          <button
            type="button"
            key={`pagination-${index}`}
            className={cn(
              'bg-[#EEEEEE] hover:bg-[#dfdede] hover:text-black transition-colors font-bold py-[0.5rem] px-[1rem]',
              {
                'bg-[#dfdede] text-black': page === e,
                '!border-l': e === '<<',
                'cursor-not-allowed bg-white hover:bg-white': isDisabled || disabled,
              }
            )}
            onClick={() => !isDisabled && handleChangePage(e)}
            disabled={isDisabled || disabled}
          >
            {e === '>' ? (
              <ChevronRight className="w-[1.6rem] h-[1.6rem]" />
            ) : e === '>>' ? (
              <ChevronsRight className="w-[1.6rem] h-[1.6rem]" />
            ) : e === '<<' ? (
              <ChevronsLeft className="w-[1.6rem] h-[1.6rem]" />
            ) : e === '<' ? (
              <ChevronLeft className="w-[1.6rem] h-[1.6rem]" />
            ) : (
              e
            )}
          </button>
        )
      })}
    </div>
  )
}

export default CustomPagination
