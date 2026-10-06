import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import logoIcon from '../assets/logo-icon.svg'
import * as http from '../http/links'
import * as navigation from '../lib/navigation'
import { NotFoundPage } from './not-found'
import { StatusCard } from './status-card'

export function RedirectPage() {
  const { shortUrl = '' } = useParams()
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const startedFor = useRef<string | null>(null)

  useEffect(() => {
    if (startedFor.current === shortUrl) {
      return
    }
    startedFor.current = shortUrl

    async function redirect() {
      try {
        const link = await http.getLink(shortUrl)
        setOriginalUrl(link.originalUrl)
        await http.incrementLinkAccess(shortUrl).catch(() => undefined)
        navigation.navigateTo(link.originalUrl)
      } catch {
        setNotFound(true)
      }
    }

    redirect()
  }, [shortUrl])

  if (notFound) {
    return <NotFoundPage />
  }

  return (
    <StatusCard
      title="Redirecionando..."
      illustration={<img src={logoIcon} alt="" width={48} height={48} />}
    >
      <p className="m-0">O link será aberto automaticamente em alguns instantes.</p>
      <p className="m-0">
        Não foi redirecionado?{' '}
        <a href={originalUrl ?? undefined} className="text-blue-base underline">
          Acesse aqui
        </a>
      </p>
    </StatusCard>
  )
}
