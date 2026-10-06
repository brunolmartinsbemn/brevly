import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import { makeLink } from '../../test/factories/make-link'
import { InvalidCursorError } from '../errors/invalid-cursor'
import { getLinks } from './get-links'

describe('getLinks', () => {
  beforeEach(async () => {
    await db.delete(links)
  })

  it('returns an empty page when there are no links', async () => {
    const result = await getLinks({ pageSize: 20 })

    expect(result).toEqual({ links: [], nextCursor: null })
  })

  it('returns links newest first and a cursor for the next page', async () => {
    const first = await makeLink({ createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const second = await makeLink({ createdAt: new Date('2026-01-02T00:00:00.000Z') })
    const third = await makeLink({ createdAt: new Date('2026-01-03T00:00:00.000Z') })

    const page1 = await getLinks({ pageSize: 2 })
    expect(page1.links.map((l) => l.id)).toEqual([third.id, second.id])
    expect(page1.nextCursor).toEqual(expect.any(String))

    const page2 = await getLinks({ pageSize: 2, cursor: page1.nextCursor! })
    expect(page2.links.map((l) => l.id)).toEqual([first.id])
    expect(page2.nextCursor).toBeNull()
  })

  it('returns every link exactly once when many share the same timestamp', async () => {
    const sameInstant = new Date('2026-02-01T10:00:00.123Z')
    const created = await Promise.all(
      Array.from({ length: 7 }, () => makeLink({ createdAt: sameInstant })),
    )
    await Promise.all(Array.from({ length: 5 }, () => makeLink()))

    const seen: string[] = []
    let cursor: string | undefined
    do {
      const page = await getLinks({ pageSize: 3, cursor })
      seen.push(...page.links.map((l) => l.id))
      cursor = page.nextCursor ?? undefined
    } while (cursor)

    expect(seen).toHaveLength(12)
    expect(new Set(seen).size).toBe(12)
    for (const link of created) {
      expect(seen).toContain(link.id)
    }
  })

  it.each([
    'not-base64-!!',
    Buffer.from('garbage').toString('base64url'),
    Buffer.from('1|00000000-0000-0000-0000-000000000000').toString('base64url'),
  ])(
    'rejects an invalid cursor (%s)',
    async (cursor) => {
      await expect(getLinks({ pageSize: 20, cursor })).rejects.toBeInstanceOf(
        InvalidCursorError,
      )
    },
  )
})
