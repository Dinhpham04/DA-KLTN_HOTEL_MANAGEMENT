import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autoResize?: boolean
  enableNumberConversion?: boolean
}

const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      autoResize = false,
      enableNumberConversion = true,
      onChange,
      onCompositionEnd,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const [isComposing, setIsComposing] = React.useState(false)

    const convertFullWidthToHalfWidth = (str: string): string => {
      return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    }

    const handleCompositionStart = () => {
      setIsComposing(true)
    }

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false)

      const shouldConvert = enableNumberConversion || type === 'number'

      if (shouldConvert) {
        const rawValue = e.currentTarget.value
        const convertedValue = convertFullWidthToHalfWidth(rawValue)

        if (rawValue !== convertedValue) {
          e.currentTarget.value = convertedValue
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: e.currentTarget,
              currentTarget: e.currentTarget,
            } as unknown as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          }
        }
      }

      if (onCompositionEnd) {
        onCompositionEnd(e)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isComposing) {
        const shouldConvert = enableNumberConversion

        if (shouldConvert) {
          const rawValue = e.target.value
          const convertedValue = convertFullWidthToHalfWidth(rawValue)
          e.target.value = convertedValue
        }
      }

      if (onChange) {
        onChange(e)
      }
    }

    React.useEffect(() => {
      if (inputRef.current && autoResize) {
        inputRef.current.style.width = '100%'
        inputRef.current.style.width = `${inputRef.current.scrollWidth}px`
      }
    }, [props.value, autoResize])

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === 'number') {
        e.currentTarget.blur()
      }
    }

    return (
      <input
        type={type}
        className={cn(
          'flex bg-background disabled:!bg-[#D9D9D9] file:bg-transparent disabled:opacity-50 px-3 py-2 border file:border-0 border-black rounded-md focus-visible:outline-none w-full h-[3.6rem] file:font-medium placeholder:font-bold text-[1.6rem] placeholder:text-[#999] file:text-sm disabled:cursor-not-allowed',
          className
        )}
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
        }}
        onWheel={handleWheel}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        {...props}
        value={props.value ? props.value : ''}
      />
    )
  }
)
CustomInput.displayName = 'CustomInput'

export { CustomInput }
