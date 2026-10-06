import { Warning } from '@phosphor-icons/react'
import { useId, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type InputProps = ComponentProps<'input'> & {
  label: string
  prefix?: string
  error?: string
}

export function Input({ label, prefix, error, id, className, placeholder, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hasError = Boolean(error)

  return (
    <div className={cn('group flex w-full flex-col gap-2', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'text-xs uppercase',
          hasError
            ? 'font-bold text-danger'
            : 'text-gray-500 group-focus-within:font-bold group-focus-within:text-blue-base',
        )}
      >
        {label}
      </label>

      <div
        className={cn(
          'flex h-12 w-full items-center rounded-lg px-4 text-md',
          '[&:has(input:placeholder-shown)>span]:text-gray-400',
          hasError
            ? 'border-[1.5px] border-danger'
            : 'border border-gray-300 focus-within:border-[1.5px] focus-within:border-blue-base',
        )}
      >
        {prefix && <span className="text-gray-600">{prefix}</span>}
        <input
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          placeholder={placeholder ?? (prefix ? ' ' : undefined)}
          className="h-full min-w-0 flex-1 bg-transparent text-gray-600 outline-none placeholder:text-gray-400"
          {...props}
        />
      </div>

      {hasError && (
        <p id={errorId} className="flex items-center gap-2 text-sm text-gray-500">
          <Warning className="size-4 shrink-0 text-danger" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
