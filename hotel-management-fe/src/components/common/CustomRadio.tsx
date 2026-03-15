import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const CustomRadio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
CustomRadio.displayName = RadioGroupPrimitive.Root.displayName

interface CustomRadioItemsProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  circleClassName?: string
}

const CustomRadioItems = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  CustomRadioItemsProps
>(({ className, circleClassName, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-[2rem] w-[2rem] rounded-full border border-black text-black hover:bg-gray-100 bg-white ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:!bg-[#D9D9D9]',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle
          className={cn(
            'h-[1rem] w-[1rem] fill-current flex items-center justify-center text-center',
            circleClassName,
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
CustomRadioItems.displayName = RadioGroupPrimitive.Item.displayName

export { CustomRadio, CustomRadioItems }
