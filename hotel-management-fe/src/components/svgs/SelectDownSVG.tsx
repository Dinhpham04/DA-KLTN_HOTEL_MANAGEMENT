import type React from 'react'

interface SelectDownSVGProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  fill?: string
}

export function SelectDownSVG({ className, fill, ...props }: SelectDownSVGProps) {
  return (
    <svg
      width="13"
      height="7"
      viewBox="0 0 13 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <title>Select Down Icon</title>
      <path d="M6.5 7L0.00480997 0.249999L12.9952 0.25L6.5 7Z" fill={fill || 'black'} />
    </svg>
  )
}
