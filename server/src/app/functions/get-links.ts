import { desc, sql } from 'drizzle-orm'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import { InvalidCursorError } from '../errors/invalid-cursor'

type GetLinksInput = {
  cursor?: string
  pageSize: number
}

type Cursor = {
  createdAt: string
  id: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function encodeCursor(cursor: Cursor) {
  return Buffer.from(`${cursor.createdAt}|${cursor.id}`).toString('base64url')
}

function decodeCursor(value: string): Cursor {
  const [createdAt, id] = Buffer.from(value, 'base64url').toString('utf8').split('|')

  if (!createdAt || !id || Number.isNaN(Date.parse(createdAt)) || !UUID_REGEX.test(id)) {
    throw new InvalidCursorError()
  }

  return { createdAt, id }
}

export async function getLinks({ cursor, pageSize }: GetLinksInput) {
  const after = cursor ? decodeCursor(cursor) : undefined

  const rows = await db
    .select()
    .from(links)
    .where(
      after
        ? sql`(${links.createdAt}, ${links.id}) < (${after.createdAt}::timestamptz, ${after.id}::uuid)`
        : undefined,
    )
    .orderBy(desc(links.createdAt), desc(links.id))
    .limit(pageSize + 1)

  const hasMore = rows.length > pageSize
  const page = hasMore ? rows.slice(0, pageSize) : rows
  const last = page.at(-1)

  return {
    links: page,
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
        : null,
  }
}
