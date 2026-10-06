import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as http from '../http/links'
import * as download from '../lib/download'
import { renderWithProviders } from '../test/render'
import { LinksList } from './links-list'

function makeLink(overrides: Partial<http.Link> = {}): http.Link {
  return {
    id: crypto.randomUUID(),
    originalUrl: 'https://devsite.portfolio.com.br/devname-123456',
    shortUrl: 'Portfolio-Dev',
    accessCount: 30,
    createdAt: '2026-10-06T00:00:00.000Z',
    ...overrides,
  }
}

let observerCallback: IntersectionObserverCallback | null = null

class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('LinksList', () => {
  beforeEach(() => {
    observerCallback = null
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    vi.spyOn(download, 'downloadFile').mockImplementation(() => {})
  })

  it('shows a loading state while fetching', () => {
    vi.spyOn(http, 'getLinks').mockReturnValue(new Promise(() => {}))

    renderWithProviders(<LinksList />)

    expect(screen.getByText('Carregando links...')).toBeInTheDocument()
  })

  it('shows the empty state and disables "Baixar CSV" when there are no links', async () => {
    vi.spyOn(http, 'getLinks').mockResolvedValue({ links: [], nextCursor: null })

    renderWithProviders(<LinksList />)

    expect(await screen.findByText('Ainda não existem links cadastrados')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Baixar CSV' })).toBeDisabled()
  })

  it('renders each link like the Figma row', async () => {
    vi.spyOn(http, 'getLinks').mockResolvedValue({
      links: [makeLink(), makeLink({ shortUrl: 'Solo', accessCount: 1, originalUrl: 'http://a.com' })],
      nextCursor: null,
    })

    renderWithProviders(<LinksList />)

    expect(await screen.findByRole('link', { name: 'brev.ly/Portfolio-Dev' })).toHaveAttribute(
      'href',
      '/Portfolio-Dev',
    )
    expect(screen.getByText('devsite.portfolio.com.br/devname-123456')).toBeInTheDocument()
    expect(screen.getByText('30 acessos')).toBeInTheDocument()
    expect(screen.getByText('1 acesso')).toBeInTheDocument()
    expect(screen.getByText('a.com')).toBeInTheDocument()
  })

  it('copies the full short link to the clipboard', async () => {
    vi.spyOn(http, 'getLinks').mockResolvedValue({ links: [makeLink()], nextCursor: null })
    const user = userEvent.setup()
    renderWithProviders(<LinksList />)

    await user.click(await screen.findByRole('button', { name: 'Copiar link Portfolio-Dev' }))

    await expect(navigator.clipboard.readText()).resolves.toBe('http://localhost:5173/Portfolio-Dev')
  })

  it('deletes after confirmation and refetches the list', async () => {
    const getLinks = vi
      .spyOn(http, 'getLinks')
      .mockResolvedValueOnce({ links: [makeLink()], nextCursor: null })
      .mockResolvedValue({ links: [], nextCursor: null })
    vi.spyOn(http, 'deleteLink').mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderWithProviders(<LinksList />)

    await user.click(await screen.findByRole('button', { name: 'Apagar link Portfolio-Dev' }))

    expect(window.confirm).toHaveBeenCalledWith(
      'Você realmente quer apagar o link Portfolio-Dev?',
    )
    expect(http.deleteLink).toHaveBeenCalledWith('Portfolio-Dev')
    expect(await screen.findByText('Ainda não existem links cadastrados')).toBeInTheDocument()
    expect(getLinks).toHaveBeenCalledTimes(2)
  })

  it('does not delete when the confirmation is cancelled', async () => {
    vi.spyOn(http, 'getLinks').mockResolvedValue({ links: [makeLink()], nextCursor: null })
    vi.spyOn(http, 'deleteLink').mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    renderWithProviders(<LinksList />)

    await user.click(await screen.findByRole('button', { name: 'Apagar link Portfolio-Dev' }))

    expect(http.deleteLink).not.toHaveBeenCalled()
  })

  it('exports the CSV once and downloads the report url', async () => {
    vi.spyOn(http, 'getLinks').mockResolvedValue({ links: [makeLink()], nextCursor: null })
    let resolve: (url: string) => void = () => {}
    vi.spyOn(http, 'exportLinks').mockReturnValue(new Promise((r) => (resolve = r)))
    const user = userEvent.setup()
    renderWithProviders(<LinksList />)

    const button = await screen.findByRole('button', { name: 'Baixar CSV' })
    await user.click(button)
    expect(button).toBeDisabled()
    await user.click(button)
    expect(http.exportLinks).toHaveBeenCalledTimes(1)

    resolve('http://localhost:9000/brevly/downloads/report.csv')
    await waitFor(() =>
      expect(download.downloadFile).toHaveBeenCalledWith(
        'http://localhost:9000/brevly/downloads/report.csv',
      ),
    )
  })

  it('loads the next page when the end of the list becomes visible', async () => {
    vi.spyOn(http, 'getLinks').mockImplementation(async (cursor?: string) =>
      cursor === 'page-2'
        ? { links: [makeLink({ shortUrl: 'Second-Page' })], nextCursor: null }
        : { links: [makeLink()], nextCursor: 'page-2' },
    )
    renderWithProviders(<LinksList />)
    await screen.findByText('brev.ly/Portfolio-Dev')

    await waitFor(() => expect(observerCallback).not.toBeNull())
    act(() => {
      observerCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(await screen.findByText('brev.ly/Second-Page')).toBeInTheDocument()
    expect(http.getLinks).toHaveBeenCalledWith('page-2')
  })

  it('keeps the loaded links when loading the next page fails', async () => {
    vi.spyOn(http, 'getLinks').mockImplementation(async (cursor?: string) => {
      if (cursor === 'page-2') {
        throw new Error('network')
      }
      return { links: [makeLink()], nextCursor: 'page-2' }
    })
    renderWithProviders(<LinksList />)
    await screen.findByText('brev.ly/Portfolio-Dev')

    await waitFor(() => expect(observerCallback).not.toBeNull())
    act(() => {
      observerCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(await screen.findByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
    expect(screen.getByText('brev.ly/Portfolio-Dev')).toBeInTheDocument()
  })
})
