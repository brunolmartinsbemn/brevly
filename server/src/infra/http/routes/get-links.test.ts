import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db'
import { links } from '../../db/schemas/links'
import { makeLink } from '../../../test/factories/make-link'
import { buildApp } from '../app'

describe('GET /links', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await db.delete(links)
  })

  it('returns links and nextCursor', async () => {
    await makeLink()
    await makeLink()

    const response = await app.inject({ method: 'GET', url: '/links?pageSize=1' })

    expect(response.statusCode).toBe(200)
    expect(response.json().links).toHaveLength(1)
    expect(response.json().nextCursor).toEqual(expect.any(String))
  })

  it('defaults pageSize to 20', async () => {
    await Promise.all(Array.from({ length: 21 }, () => makeLink()))

    const response = await app.inject({ method: 'GET', url: '/links' })

    expect(response.json().links).toHaveLength(20)
  })

  it.each(['/links?pageSize=0', '/links?pageSize=101', '/links?cursor=lixo'])(
    'returns 400 for %s',
    async (url) => {
      const response = await app.inject({ method: 'GET', url })

      expect(response.statusCode).toBe(400)
    },
  )
})
