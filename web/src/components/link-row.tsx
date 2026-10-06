import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import copyIcon from '../assets/copy.svg'
import trashIcon from '../assets/trash.svg'
import { env } from '../env'
import * as http from '../http/links'
import { formatAccessCount, formatOriginalUrl } from '../lib/format'
import { IconButton } from './ui/icon-button'

type LinkRowProps = {
  link: http.Link
}

const frontendUrl = env.VITE_FRONTEND_URL.replace(/\/+$/, '')

export function LinkRow({ link }: LinkRowProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => http.deleteLink(link.shortUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: http.LINKS_QUERY_KEY }),
    onError: () =>
      toast.error('Erro ao apagar', {
        description: 'Não foi possível apagar o link. Tente novamente.',
      }),
  })

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${frontendUrl}/${link.shortUrl}`)
      toast.info('Link copiado com sucesso', {
        description: `O link ${link.shortUrl} foi copiado para a área de transferência.`,
      })
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  function handleDelete() {
    if (window.confirm(`Você realmente quer apagar o link ${link.shortUrl}?`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <li className="flex flex-col gap-3 lg:gap-4">
      <hr className="m-0 -mb-px border-0 border-t border-gray-200" />
      <div className="flex items-center gap-4 py-0.5 lg:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <a
            href={`/${link.shortUrl}`}
            target="_blank"
            rel="noreferrer"
            className="truncate text-md font-semibold text-blue-base hover:underline"
          >
            brev.ly/{link.shortUrl}
          </a>
          <span className="truncate text-sm text-gray-500">{formatOriginalUrl(link.originalUrl)}</span>
        </div>

        <span className="shrink-0 text-right text-sm whitespace-nowrap text-gray-500">
          {formatAccessCount(link.accessCount)}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton aria-label={`Copiar link ${link.shortUrl}`} onClick={handleCopy}>
            <img src={copyIcon} alt="" width={16} height={16} />
          </IconButton>
          <IconButton
            aria-label={`Apagar link ${link.shortUrl}`}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <img src={trashIcon} alt="" width={16} height={16} />
          </IconButton>
        </div>
      </div>
    </li>
  )
}
