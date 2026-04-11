import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

type TooltipProps = {
  text: string | React.ReactNode
  className?: string
  sideOffset?: number
  trigger?: React.ReactNode
  triggerClass?: string
}

const CustomTooltip: React.FC<TooltipProps> = ({
  text,
  className,
  sideOffset = 4,
  trigger,
  triggerClass,
  ...props
}) => {
  const triggerRef = React.useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)

  React.useEffect(() => {
    if (triggerRef.current) {
      const isOverflowing = triggerRef.current.scrollWidth > triggerRef.current.clientWidth
      setIsTruncated(isOverflowing)
    }
  }, [text])

  if (!text || text === 'null') {
    return null
  }

  if (!(typeof text === 'string')) {
    return text
  }

  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <div className="grid max-w-full overflow-hidden">
            {trigger ?? (
              <span
                ref={triggerRef}
                className={cn(
                  'inline-block w-full overflow-hidden truncate text-ellipsis leading-tight whitespace-nowrap',
                  triggerClass
                )}
              >
                {text}
              </span>
            )}
          </div>
        </TooltipPrimitive.Trigger>
        {(isTruncated || trigger) && (
          <TooltipPrimitive.Content
            sideOffset={sideOffset}
            className={cn(
              'data-[side=left]:slide-in-from-right-2 data-[side=top]:slide-in-from-bottom-2 z-50 bg-white data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2 shadow-md px-4 py-2 border rounded-md overflow-hidden text-popover-foreground text-sm animate-in data-[state=closed]:animate-out hover:cursor-pointer fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              className
            )}
            {...props}
          >
            <p className="max-w-lg text-2xl break-words whitespace-normal hover:cursor-pointer">
              {text}
            </p>
          </TooltipPrimitive.Content>
        )}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

const TooltipProvider = TooltipPrimitive.Provider

export { CustomTooltip, TooltipProvider }
