import { eq } from 'drizzle-orm'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import { LinkNotFoundError } from '../errors/link-not-found'

export async function deleteLink(shortUrl: string) {
  const deleted = await db
    .delete(links)
    .where(eq(links.shortUrl, shortUrl))
    .returning({ id: links.id })

  if (deleted.length === 0) {
    throw new LinkNotFoundError()
  }
}
