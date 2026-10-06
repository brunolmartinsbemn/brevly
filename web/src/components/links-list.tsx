import { CircleNotch } from '@phosphor-icons/react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import downloadIcon from '../assets/download-simple.svg'
import linkIcon from '../assets/link.svg'
import * as http from '../http/links'
import * as download from '../lib/download'
import { LinkRow } from './link-row'
import { ListState } from './list-state'
import { Button } from './ui/button'

export function LinksList() {
  const query = useInfiniteQuery({
    queryKey: http.LINKS_QUERY_KEY,
    queryFn: ({ pageParam }) => http.getLinks(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const exportMutation = useMutation({
    mutationFn: () => http.exportLinks(),
    onSuccess: (reportUrl) => download.downloadFile(reportUrl),
    onError: () =>
      toast.error('Erro ao exportar', {
        description: 'Não foi possível gerar o CSV. Tente novamente.',
      }),
  })

  const links = query.data?.pages.flatMap((page) => page.links) ?? []
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query
  const sentinelRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchNextPageError) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) {
        fetchNextPage()
      }
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage])

  return (
    <section className="flex w-full min-w-0 flex-col gap-4 rounded-lg bg-gray-100 p-6 lg:gap-5 lg:p-8">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-600">Meus links</h2>
        <Button
          variant="secondary"
          onClick={() => exportMutation.mutate()}
          disabled={links.length === 0 || exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <CircleNotch className="size-4 animate-spin text-gray-600" aria-hidden />
          ) : (
            <img src={downloadIcon} alt="" width={16} height={16} />
          )}
          Baixar CSV
        </Button>
      </header>

      {query.isPending ? (
        <div className="flex flex-col gap-4">
          <hr className="m-0 -mb-px border-0 border-t border-gray-200" />
          <ListState icon={<CircleNotch className="size-8 animate-spin text-gray-400" aria-hidden />}>
            Carregando links...
          </ListState>
        </div>
      ) : query.isError && !query.data ? (
        <div className="flex flex-col gap-4">
          <hr className="m-0 -mb-px border-0 border-t border-gray-200" />
          <ListState icon={<img src={linkIcon} alt="" width={32} height={32} />}>
            Não foi possível carregar os links.{' '}
            <button
              type="button"
              onClick={() => query.refetch()}
              className="cursor-pointer font-bold text-blue-base uppercase underline"
            >
              Tentar novamente
            </button>
          </ListState>
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col gap-4">
          <hr className="m-0 -mb-px border-0 border-t border-gray-200" />
          <ListState icon={<img src={linkIcon} alt="" width={32} height={32} />}>
            Ainda não existem links cadastrados
          </ListState>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:gap-4">
          {links.map((link) => (
            <LinkRow key={link.id} link={link} />
          ))}
          <li ref={sentinelRef} aria-hidden className="-mt-3 h-0 lg:-mt-4" />
          {isFetchNextPageError && !isFetchingNextPage && (
            <li className="flex justify-center py-2">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                className="cursor-pointer text-xs font-bold text-blue-base uppercase underline"
              >
                Tentar novamente
              </button>
            </li>
          )}
          {isFetchingNextPage && (
            <li className="flex justify-center py-2">
              <CircleNotch className="size-5 animate-spin text-gray-400" aria-label="Carregando mais links" />
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
