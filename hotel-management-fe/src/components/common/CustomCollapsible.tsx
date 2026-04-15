import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { DownChevronSvg } from '../svgs/DownChevron'

const CustomCollapsible = CollapsiblePrimitive.Root

const CustomCollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    {...props}
    className={cn(
      'flex justify-center items-center gap-6 [&[data-state=open]>svg]:rotate-0',
      className
    )}
  >
    <DownChevronSvg className="w-6 transition-all duration-300 -rotate-90" />
    <div className="flex-1 text-left">{children}</div>
  </CollapsiblePrimitive.Trigger>
))
CustomCollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName

const CustomCollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className="text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden data-[state=open]:overflow-visible"
    {...props}
  >
    <div className={cn(className)}>{children}</div>
  </CollapsiblePrimitive.Content>
))

CustomCollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export { CustomCollapsible, CustomCollapsibleTrigger, CustomCollapsibleContent }
