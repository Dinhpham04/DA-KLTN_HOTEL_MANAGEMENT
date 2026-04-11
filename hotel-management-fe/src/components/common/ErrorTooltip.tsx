import { cn } from '@/lib/utils'
import { ShieldAlert } from 'lucide-react'
import type React from 'react'

interface ErrorTooltipProps extends React.HTMLProps<HTMLDivElement> {
  text: string
  className?: string
}

const ErrorTooltip: React.FC<ErrorTooltipProps> = ({ text, className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        'group relative flex items-center justify-center w-6 h-6 rounded-full cursor-pointer absolute right-1 top-1',
        className
      )}
    >
      <ShieldAlert size={24} color="#df3434" strokeWidth={2.5} />
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-600 text-white p-2 rounded-xl text-[1.2rem] z-50 whitespace-nowrap">
        {text}
      </div>
    </div>
  )
}

export default ErrorTooltip
