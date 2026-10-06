import { Link } from 'react-router'
import notFoundArt from '../assets/not-found-404.svg'
import { StatusCard } from './status-card'

export function NotFoundPage() {
  return (
    <StatusCard
      title="Link não encontrado"
      illustration={
        <div className="flex h-[72px] w-[164px] items-center justify-center lg:h-[85px] lg:w-[194px]">
          <img src={notFoundArt} alt="404" className="h-auto w-[91%]" />
        </div>
      }
    >
      <p className="m-0">
        O link que você está tentando acessar não existe, foi removido ou é uma URL inválida. Saiba
        mais em{' '}
        <Link to="/" className="text-blue-base underline">
          brev.ly
        </Link>
        .
      </p>
    </StatusCard>
  )
}
