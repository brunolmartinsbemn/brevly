import type { ReactNode } from 'react'

type ListStateProps = {
  icon: ReactNode
  children: ReactNode
}

export function ListState({ icon, children }: ListStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-4 pb-6">
      {icon}
      <p className="py-0.5 text-center text-xs text-gray-500 uppercase">{children}</p>
    </div>
  )
}
