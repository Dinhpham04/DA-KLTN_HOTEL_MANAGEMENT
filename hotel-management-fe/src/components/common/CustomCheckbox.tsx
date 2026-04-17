import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface CustomCheckboxWidthTitleProps {
  checkboxProps?: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
  titleProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  wrapperProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  title: string
}

const CustomCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    classIcon?: string
  }
>(({ className, classIcon, disabled, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'hover:bg-gray-100 bg-white transition-all sm:h-[2.4rem] sm:w-[2.4rem] h-[2.2rem] w-[2.2rem] shrink-0 rounded-[0.4rem] border border-black ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:!bg-[#D9D9D9] data-[state=checked]:bg-primary data-[state=checked]:text-black data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-gray-700 data-[state=checked]:from-0% data-[state=checked]:via-neutral-500 data-[state=checked]:via-0% data-[state=checked]:to-stone-100',
        'disabled:opacity-50',
        className
      )}
      disabled={disabled}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
        <Check className={cn('h-[2.2rem] w-[2.2rem] sm:h-[2rem] sm:w-[2rem]', classIcon)} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
CustomCheckbox.displayName = CheckboxPrimitive.Root.displayName

const CustomCheckboxWidthTitle = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CustomCheckboxWidthTitleProps
>(({ title, checkboxProps, titleProps, wrapperProps }, _ref) => {
  const checkboxRef = React.useRef<HTMLButtonElement>(null)
  return (
    <div
      {...wrapperProps}
      className={cn('flex gap-[.5rem] h-[2.4rem] items-center', wrapperProps?.className ?? '')}
    >
      <CustomCheckbox ref={checkboxRef} {...checkboxProps} />
      <div
        {...titleProps}
        className={cn(
          'select-none cursor-pointer flex text-[1.4rem] font-bold items-center',
          'text-nowrap ',
          titleProps?.className ?? ''
        )}
        onClick={() => {
          checkboxRef.current?.click()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            checkboxRef.current?.click()
          }
        }}
      >
        {title}
      </div>
    </div>
  )
})

export { CustomCheckbox, CustomCheckboxWidthTitle }
