import type React from 'react'

interface CloseSVGProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  fill?: string
}

export function CloseSVG({ className, fill, ...props }: CloseSVGProps) {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect
        x="3.11084"
        y="0.378845"
        width="33.7842"
        height="3"
        transform="rotate(45 3.11084 0.378845)"
        fill="currentColor"
      />
      <rect
        x="27"
        y="2.50018"
        width="33.7842"
        height="3"
        transform="rotate(135 27 2.50018)"
        fill="currentColor"
      />
    </svg>
  )
}
