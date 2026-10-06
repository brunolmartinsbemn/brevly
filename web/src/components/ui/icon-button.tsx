import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export function IconButton({ type = 'button', className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-transparent bg-gray-200 transition-colors enabled:hover:border-blue-base disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
