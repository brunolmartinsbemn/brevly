import { LinksList } from '../components/links-list'
import { NewLinkForm } from '../components/new-link-form'
import { Logo } from '../components/ui/logo'

export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-6 px-3 pt-8 pb-8 lg:items-start lg:gap-8 lg:px-0 lg:pt-[88px]">
      <Logo />
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
        <NewLinkForm />
        <LinksList />
      </div>
    </main>
  )
}
