interface BinSVGProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  fill?: string
}

export function BinSVG({ className, fill, ...props }: BinSVGProps) {
  return (
    <svg
      width="32"
      height="20"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={className}
    >
      <g clipPath="url(#clip0_43_1117)">
        <path
          d="M0.805664 1.6C0.805664 0.72 1.52566 0 2.40566 0H15.2057C15.63 0 16.037 0.168571 16.337 0.468629C16.6371 0.768687 16.8057 1.17565 16.8057 1.6V3.2H0.805664V1.6ZM1.60566 4H16.0057V14.4C16.0057 14.8243 15.8371 15.2313 15.537 15.5314C15.237 15.8314 14.83 16 14.4057 16H3.20566C2.78132 16 2.37435 15.8314 2.07429 15.5314C1.77424 15.2313 1.60566 14.8243 1.60566 14.4V4ZM6.40566 5.6V7.2H11.2057V5.6H6.40566Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_43_1117">
          <rect width="16" height="16" fill="white" transform="translate(0.805664)" />
        </clipPath>
      </defs>
    </svg>
  )
}
