import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-[2.4rem] w-[2.4rem] shrink-0 rounded-[0.4rem] border border-black ring-offset-background',
      'hover:bg-gray-100 bg-white transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:!bg-[#D9D9D9] disabled:opacity-50',
      'data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-gray-700 data-[state=checked]:via-neutral-500 data-[state=checked]:to-stone-100',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-[2rem] w-[2rem]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

// CustomCheckboxWithTitle - matches source CustomCheckboxWidthTitle
export interface CustomCheckboxWithTitleProps {
  title: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const CustomCheckboxWithTitle = React.forwardRef<HTMLDivElement, CustomCheckboxWithTitleProps>(
  ({ title, checked, onCheckedChange, disabled, className }, ref) => {
    const checkboxRef = React.useRef<HTMLButtonElement>(null)

    return (
      <div ref={ref} className={cn('flex gap-[.5rem] h-[2.4rem] items-center', className)}>
        <Checkbox
          ref={checkboxRef}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange?.(!!val)}
          disabled={disabled}
        />
        <div
          className={cn(
            'select-none cursor-pointer flex text-[1.4rem] font-bold items-center',
            'text-nowrap'
          )}
          onClick={() => checkboxRef.current?.click()}
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
  }
)
CustomCheckboxWithTitle.displayName = 'CustomCheckboxWithTitle'

export { Checkbox, CustomCheckboxWithTitle }
