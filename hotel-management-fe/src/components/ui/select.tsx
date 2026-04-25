import { cn } from '@/lib/utils'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import * as React from 'react'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

interface SelectOption {
  value: string
  label: string
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    open?: boolean
    value?: string
    customClassArrow?: string
  }
>(({ className, open, value, customClassArrow, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    {...props}
    className={cn(
      'flex justify-between items-center bg-white hover:bg-[#eeeeee] disabled:opacity-50 py-0 pr-0 pl-4 border border-black w-full text-[1.4rem] [&[data-state=open]>div>svg]:rotate-180 disabled:cursor-not-allowed',
      className
    )}
  >
    <span className="flex flex-1 items-center [&>span]:w-full h-full overflow-hidden text-left [&>span]:text-left [&>span]:line-clamp-2 [&>span]:leading-tight">
      {children ?? <SelectValue placeholder={value ?? '---'} />}
    </span>

    <div
      className={cn(
        'flex justify-center items-center border-black border-l min-w-[3.2rem] h-full',
        props.disabled ? 'bg-white cursor-not-allowed' : 'bg-[#eee]',
        customClassArrow
      )}
    >
      <svg
        className={cn('transition-all duration-300')}
        width="15"
        height="9"
        viewBox="0 0 14 7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Dropdown Arrow</title>
        <path d="M7.05029 7L0.555103 0.249999L13.5455 0.25L7.05029 7Z" fill="black" />
      </svg>
    </div>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    option?: SelectOption[]
  }
>(({ className, children, position = 'popper', option, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'data-[side=left]:slide-in-from-right-2 data-[side=top]:slide-in-from-bottom-2 z-50 relative bg-popover data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2 shadow-md border rounded-md min-w-[8rem] max-h-96 overflow-hidden text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className={cn('p-1')}>
        {option ? (
          option.length ? (
            option
              .filter((item) => item?.value !== '')
              .map((item) => (
                <SelectItem value={item.value} className="text-[1.4rem]" key={item.value}>
                  {item.label}
                </SelectItem>
              ))
          ) : (
            <p className="p-1 text-[1.4rem]">見つかりません</p>
          )
        ) : (
          children
        )}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pr-2 pl-8 font-semibold text-sm', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex items-center focus:bg-accent data-[disabled]:opacity-50 py-1.5 pr-2 pl-8 rounded-sm outline-none w-full text-sm focus:text-accent-foreground cursor-default data-[disabled]:pointer-events-none select-none',
      className
    )}
    {...props}
  >
    <span className="left-2 absolute flex justify-center items-center w-3.5 h-3.5">
      <SelectPrimitive.ItemIndicator>
        <Check className="w-4 h-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('bg-muted -mx-1 my-1 h-px', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
