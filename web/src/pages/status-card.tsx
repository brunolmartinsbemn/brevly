import type { ReactNode } from 'react'

type StatusCardProps = {
  illustration: ReactNode
  title: string
  children: ReactNode
}

export function StatusCard({ illustration, title, children }: StatusCardProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-3">
      <div className="flex w-full max-w-[580px] flex-col items-center gap-6 rounded-lg bg-gray-100 px-5 py-12 text-center lg:px-12 lg:py-16">
        {illustration}
        <h1 className="text-xl font-bold text-gray-600">{title}</h1>
        <div className="flex w-full flex-col items-center gap-1 text-md font-semibold text-gray-500">
          {children}
        </div>
      </div>
    </main>
  )
}
