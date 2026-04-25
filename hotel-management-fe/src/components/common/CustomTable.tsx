import * as React from 'react'

import { cn } from '@/lib/utils'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { ScrollBar } from '../ui/scroll-area'

interface ExtendedScrollProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  loading?: boolean
}
const CustomScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ExtendedScrollProps
>(({ className, loading, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative w-[calc(100%)] [&>div]:border-b [&>div]:border-black', className)}
    // className={cn(
    //   'relative w-[calc(100% + 2rem)] pr-8 [&>div]:border-b [&>div]:border-black',
    //   className
    // )}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="rounded-[inherit] w-full h-full">
      {loading && (
        <div className="z-20 absolute inset-0 bg-[#fff9]">
          <div
            role="status"
            className="top-2/4 left-1/2 absolute -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              aria-hidden="true"
              className="h-w-10 w-10 text-white dark:text-gray-600 animate-spin fill-[#efefef]"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        </div>
      )}
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))

CustomScrollArea.displayName = 'CustomScrollArea'

interface ExtendedTableProps extends React.HTMLAttributes<HTMLTableElement> {
  scrollClass?: string
  loading?: boolean
}
const CustomTable = React.forwardRef<HTMLTableElement, ExtendedTableProps>(
  ({ className, loading, scrollClass, ...props }, ref) => (
    <CustomScrollArea
      loading={loading}
      className={cn('h-fit data-[state=visible]:pr-11 relative', scrollClass)}
    >
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-[1.4rem] [&_th]:border-x [&_th]:border-black bg-white',
          className
        )}
        {...props}
      />
      <ScrollBar className="w-8 bg-white border !border-[#000] [&>div]:bg-[#999] [&>div]:rounded-none relative" />
    </CustomScrollArea>
  )
)
CustomTable.displayName = 'CustomTable'

const CustomTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('sticky top-0 [&_tr]:border-b', className)} {...props} />
))
CustomTableHeader.displayName = 'CustomTableHeader'

const CustomTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child_td]:border-b-0 [&_tr:first-child_td]:border-t-0', className)}
    {...props}
  >
    {children}
  </tbody>
))
CustomTableBody.displayName = 'CustomTableBody'

const CustomTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
))
CustomTableFooter.displayName = 'CustomTableFooter'

const CustomTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      '!border-b-0 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
))
CustomTableRow.displayName = 'CustomTableRow'

const CustomTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'min-h-14 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 shadow-[0px_1px_0_#000_inset,0px_-1px_0_#000_inset]',
      className
    )}
    {...props}
  />
))
CustomTableHead.displayName = 'CustomTableHead'

const CustomTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
CustomTableCell.displayName = 'CustomTableCell'

const CustomTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
))
CustomTableCaption.displayName = 'CustomTableCaption'

export {
  CustomTable,
  CustomTableHeader,
  CustomTableBody,
  CustomTableFooter,
  CustomTableHead,
  CustomTableRow,
  CustomTableCell,
  CustomTableCaption,
  CustomScrollArea,
}
