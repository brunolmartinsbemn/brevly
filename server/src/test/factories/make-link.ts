import { randomUUID } from 'node:crypto'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'

export async function makeLink(overrides: Partial<typeof links.$inferInsert> = {}) {
  const [link] = await db
    .insert(links)
    .values({
      originalUrl: `https://example.com/${randomUUID()}`,
      shortUrl: `t-${randomUUID().slice(0, 8)}`,
      ...overrides,
    })
    .returning()

  return link
}
