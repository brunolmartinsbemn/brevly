import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import { makeLink } from '../../test/factories/make-link'
import { LinkNotFoundError } from '../errors/link-not-found'
import { deleteLink } from './delete-link'
import { getLink } from './get-link'
import { incrementLinkAccess } from './increment-link-access'

describe('getLink', () => {
  it('returns the link for a short url', async () => {
    const created = await makeLink({ originalUrl: 'https://github.com' })

    const link = await getLink(created.shortUrl)

    expect(link.originalUrl).toBe('https://github.com')
  })

  it('throws when the short url does not exist', async () => {
    await expect(getLink('does-not-exist')).rejects.toBeInstanceOf(LinkNotFoundError)
  })
})

describe('incrementLinkAccess', () => {
  it('increments the access count by one each call', async () => {
    const created = await makeLink()

    await incrementLinkAccess(created.shortUrl)
    const result = await incrementLinkAccess(created.shortUrl)

    expect(result).toEqual({ accessCount: 2 })
  })

  it('handles concurrent increments without losing updates', async () => {
    const created = await makeLink()

    await Promise.all(Array.from({ length: 10 }, () => incrementLinkAccess(created.shortUrl)))

    const [row] = await db.select().from(links).where(eq(links.id, created.id))
    expect(row.accessCount).toBe(10)
  })

  it('throws when the short url does not exist', async () => {
    await expect(incrementLinkAccess('does-not-exist')).rejects.toBeInstanceOf(
      LinkNotFoundError,
    )
  })
})

describe('deleteLink', () => {
  it('removes the link', async () => {
    const created = await makeLink()

    await deleteLink(created.shortUrl)

    const rows = await db.select().from(links).where(eq(links.id, created.id))
    expect(rows).toHaveLength(0)
  })

  it('throws when the short url does not exist', async () => {
    await expect(deleteLink('does-not-exist')).rejects.toBeInstanceOf(LinkNotFoundError)
  })
})
