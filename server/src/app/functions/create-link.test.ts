import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { makeLink } from '../../test/factories/make-link'
import { LinkAlreadyExistsError } from '../errors/link-already-exists'
import { createLink } from './create-link'

describe('createLink', () => {
  it('creates a link with zero accesses', async () => {
    const shortUrl = `c-${randomUUID().slice(0, 8)}`

    const link = await createLink({ originalUrl: 'https://rocketseat.com.br', shortUrl })

    expect(link).toMatchObject({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl,
      accessCount: 0,
    })
    expect(link.id).toEqual(expect.any(String))
    expect(link.createdAt).toBeInstanceOf(Date)
  })

  it('rejects an existing short url', async () => {
    const existing = await makeLink()

    await expect(
      createLink({ originalUrl: 'https://other.com', shortUrl: existing.shortUrl }),
    ).rejects.toBeInstanceOf(LinkAlreadyExistsError)
  })
})
