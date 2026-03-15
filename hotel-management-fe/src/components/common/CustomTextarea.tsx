import * as React from 'react'
import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean
  disableNewline?: boolean
}

const CustomTextarea = React.forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ className, autoResize = false, disableNewline = false, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [props.value, autoResize])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disableNewline && event.key === 'Enter') {
        event.preventDefault()
      }
    }

    return (
      <textarea
        className={cn(
          'flex min-h-[8.3rem] w-full rounded-md border border-black resize-none bg-background px-3 py-2 text-[1.6rem] ring-offset-background placeholder:text-[#999] placeholder:font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 leading-normal',
          autoResize ? 'overflow-hidden' : '',
          className,
        )}
        ref={(node) => {
          textareaRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref)
            (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
              node
        }}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  },
)
CustomTextarea.displayName = 'CustomTextarea'

export { CustomTextarea }
