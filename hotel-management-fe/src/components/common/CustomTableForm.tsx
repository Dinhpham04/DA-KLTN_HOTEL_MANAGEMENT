import * as React from 'react'
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form'

import { cn } from '@/lib/utils'

type TableFormRowProps = React.FormHTMLAttributes<HTMLFormElement> & {
  methods?: UseFormReturn<any>
}

const Table = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <div
        ref={ref}
        className={cn(
          'table w-full border-collapse bg-white caption-bottom text-sm',
          className,
        )}
        {...props}
      />
    </div>
  ),
)
Table.displayName = 'Table'

const TableHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('table-header-group [&_div]:border-b', className)} {...props} />
  ),
)
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('table-row-group [&_form:last-child]:border-0', className)}
      {...props}
    />
  ),
)
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'table-footer-group border-t bg-muted/50 font-medium [&>div]:last:border-b-0',
        className,
      )}
      {...props}
    />
  ),
)
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'table-row border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = 'TableRow'

const TableFormRow = React.forwardRef<HTMLFormElement, TableFormRowProps>(
  ({ className, methods, ...props }, ref) => {
    const formMethods = methods || useForm()

    return (
      <FormProvider {...formMethods}>
        <form
          ref={ref}
          className={cn(
            'table-row border-b transition-colors data-[state=selected]:bg-muted',
            className,
          )}
          {...props}
        />
      </FormProvider>
    )
  },
)
TableFormRow.displayName = 'TableFormRow'

const TableHead = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'table-cell h-12 border border-black border-solid px-4 text-left font-medium align-middle text-black',
        className,
      )}
      {...props}
    />
  ),
)
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('table-cell border border-black border-solid p-4 align-middle', className)}
      {...props}
    />
  ),
)
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  ),
)
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableFormRow,
  TableCell,
  TableCaption,
}
