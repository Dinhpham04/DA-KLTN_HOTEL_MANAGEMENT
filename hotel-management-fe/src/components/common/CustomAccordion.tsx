import { cn } from '@/lib/utils'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

const CustomAccordion = AccordionPrimitive.Root

const CustomAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn(className)} {...props} />
))
CustomAccordionItem.displayName = 'CustomAccordionItem'

const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header
    className={cn(
      'flex flex-1 items-center justify-between transition-all bg-[#79A3E0] border border-[#000]',
      className
    )}
  >
    <AccordionPrimitive.Trigger
      ref={ref}
      {...props}
      className="flex justify-center items-center gap-6 px-4 md:px-12 w-full h-[4.8rem] [&[data-state=open]>svg]:rotate-0"
    >
      <ChevronDown className="w-6 -rotate-90 transition-all duration-300 flex-shrink-0" />
      <div className="flex-1 text-left flex-shrink-0">{children}</div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
CustomAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const CustomAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=open]:overflow-visible text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
CustomAccordionContent.displayName = AccordionPrimitive.Content.displayName

export { CustomAccordion, CustomAccordionContent, CustomAccordionItem, CustomAccordionTrigger }
