import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva('btn', {
  variants: {
    variant: {
      default: 'btn-default',
      download: 'btn-download',
      copy: 'btn-copy',
      link: 'btn-link',
      outline:
        'btn-default border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      destructive: 'btn-default bg-destructive hover:bg-destructive/90',
      ghost:
        'btn-default bg-transparent border-transparent hover:bg-accent hover:text-accent-foreground',
    },
    size: {
      default: '',
      sm: 'text-[1.2rem] px-3 py-1',
      lg: 'text-[1.6rem] px-6 py-2',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const NButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          'border-[1px] bg-gray-100 border-black'
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
NButton.displayName = 'NButton'

export { NButton, buttonVariants }
