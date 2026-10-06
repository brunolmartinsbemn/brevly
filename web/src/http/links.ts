import { api } from '../lib/api'

export type Link = {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: string
}

export type LinksPage = {
  links: Link[]
  nextCursor: string | null
}

export const LINKS_QUERY_KEY = ['links'] as const

const PAGE_SIZE = '20'

function linkPath(shortUrl: string) {
  return `/links/${encodeURIComponent(shortUrl)}`
}

export async function createLink(input: { originalUrl: string; shortUrl: string }) {
  const { link } = await api<{ link: Link }>('/links', { method: 'POST', body: input })
  return link
}

export function getLinks(cursor?: string) {
  const query = new URLSearchParams({ pageSize: PAGE_SIZE })
  if (cursor) {
    query.set('cursor', cursor)
  }
  return api<LinksPage>(`/links?${query}`)
}

export async function getLink(shortUrl: string) {
  const { link } = await api<{ link: Link }>(linkPath(shortUrl))
  return link
}

export function incrementLinkAccess(shortUrl: string) {
  return api<{ accessCount: number }>(`${linkPath(shortUrl)}/access`, { method: 'PATCH' })
}

export function deleteLink(shortUrl: string) {
  return api<void>(linkPath(shortUrl), { method: 'DELETE' })
}

export async function exportLinks() {
  const { reportUrl } = await api<{ reportUrl: string }>('/links/exports', { method: 'POST' })
  return reportUrl
}
