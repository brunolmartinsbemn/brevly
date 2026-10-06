import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import { LinkAlreadyExistsError } from '../errors/link-already-exists'

type CreateLinkInput = {
  originalUrl: string
  shortUrl: string
}

const UNIQUE_VIOLATION = '23505'

function isUniqueViolation(error: unknown) {
  const err = error as { code?: string; cause?: { code?: string } }
  return err?.code === UNIQUE_VIOLATION || err?.cause?.code === UNIQUE_VIOLATION
}

export async function createLink(input: CreateLinkInput) {
  try {
    const [link] = await db.insert(links).values(input).returning()
    return link
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new LinkAlreadyExistsError()
    }
    throw error
  }
}
