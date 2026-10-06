import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../app'
import * as http from '../http/links'
import { ApiError } from '../lib/api'
import * as navigation from '../lib/navigation'

function renderRoute(route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
}

const link: http.Link = {
  id: '1',
  originalUrl: 'https://rocketseat.com.br',
  shortUrl: 'rocket',
  accessCount: 0,
  createdAt: '2026-10-06T00:00:00.000Z',
}

describe('routes', () => {
  beforeEach(() => {
    vi.spyOn(navigation, 'navigateTo').mockImplementation(() => {})
    vi.spyOn(http, 'getLinks').mockResolvedValue({ links: [], nextCursor: null })
  })

  it('/ shows the form and the list', async () => {
    renderRoute('/')

    expect(screen.getByRole('heading', { name: 'Novo link' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Meus links' })).toBeInTheDocument()
  })

  it('/:shortUrl increments exactly once (even in StrictMode) and redirects', async () => {
    vi.spyOn(http, 'getLink').mockResolvedValue(link)
    vi.spyOn(http, 'incrementLinkAccess').mockResolvedValue({ accessCount: 1 })

    renderRoute('/rocket')

    expect(screen.getByRole('heading', { name: 'Redirecionando...' })).toBeInTheDocument()
    await waitFor(() =>
      expect(navigation.navigateTo).toHaveBeenCalledWith('https://rocketseat.com.br'),
    )
    expect(http.getLink).toHaveBeenCalledWith('rocket')
    expect(http.incrementLinkAccess).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('link', { name: 'Acesse aqui' })).toHaveAttribute(
      'href',
      'https://rocketseat.com.br',
    )
  })

  it('/:shortUrl still redirects when counting the access fails', async () => {
    vi.spyOn(http, 'getLink').mockResolvedValue(link)
    vi.spyOn(http, 'incrementLinkAccess').mockRejectedValue(new ApiError(500, 'boom'))

    renderRoute('/rocket')

    await waitFor(() =>
      expect(navigation.navigateTo).toHaveBeenCalledWith('https://rocketseat.com.br'),
    )
  })

  it('/:shortUrl shows "Link não encontrado" for an unknown short url', async () => {
    vi.spyOn(http, 'getLink').mockRejectedValue(new ApiError(404, 'Link não encontrado.'))
    vi.spyOn(http, 'incrementLinkAccess')

    renderRoute('/nao-existe')

    expect(await screen.findByRole('heading', { name: 'Link não encontrado' })).toBeInTheDocument()
    expect(http.incrementLinkAccess).not.toHaveBeenCalled()
    expect(navigation.navigateTo).not.toHaveBeenCalled()
  })

  it('any other path shows "Link não encontrado" with a link home', () => {
    renderRoute('/a/b/c')

    expect(screen.getByRole('heading', { name: 'Link não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'brev.ly' })).toHaveAttribute('href', '/')
  })
})
