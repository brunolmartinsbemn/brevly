import { eq } from 'drizzle-orm'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import { LinkNotFoundError } from '../errors/link-not-found'

export async function getLink(shortUrl: string) {
  const [link] = await db.select().from(links).where(eq(links.shortUrl, shortUrl))

  if (!link) {
    throw new LinkNotFoundError()
  }

  return link
}
