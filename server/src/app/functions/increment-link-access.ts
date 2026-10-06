import { eq, sql } from 'drizzle-orm'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import { LinkNotFoundError } from '../errors/link-not-found'

export async function incrementLinkAccess(shortUrl: string) {
  const [row] = await db
    .update(links)
    .set({ accessCount: sql`${links.accessCount} + 1` })
    .where(eq(links.shortUrl, shortUrl))
    .returning({ accessCount: links.accessCount })

  if (!row) {
    throw new LinkNotFoundError()
  }

  return row
}
