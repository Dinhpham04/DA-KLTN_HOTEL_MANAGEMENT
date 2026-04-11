import type React from 'react'

interface DownChevron extends React.SVGProps<SVGSVGElement> {
  className?: string
  fill?: string
}

export function DownChevronSvg({ className, fill, ...props }: DownChevron) {
  return (
    <svg
      className={className}
      {...props}
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.32037 2L8.3149 9L15.3094 2" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}
