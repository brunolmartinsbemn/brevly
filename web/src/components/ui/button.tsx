import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'
}

const variants = {
  primary:
    'h-12 w-full gap-2 rounded-lg bg-blue-base px-5 text-md font-semibold text-white enabled:hover:bg-blue-dark',
  secondary:
    'h-8 gap-1.5 rounded-sm border border-transparent bg-gray-200 px-2 text-sm font-semibold text-gray-500 enabled:hover:border-blue-base',
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
