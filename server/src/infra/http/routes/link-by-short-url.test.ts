import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { makeLink } from '../../../test/factories/make-link'
import { buildApp } from '../app'

describe('routes by short url', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /links/:shortUrl returns 200 with the link', async () => {
    const created = await makeLink({ originalUrl: 'https://github.com' })

    const response = await app.inject({ method: 'GET', url: `/links/${created.shortUrl}` })

    expect(response.statusCode).toBe(200)
    expect(response.json().link.originalUrl).toBe('https://github.com')
  })

  it('PATCH /links/:shortUrl/access returns 200 with the new count', async () => {
    const created = await makeLink()

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${created.shortUrl}/access`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ accessCount: 1 })
  })

  it('DELETE /links/:shortUrl returns 204 and the link is gone', async () => {
    const created = await makeLink()

    const response = await app.inject({ method: 'DELETE', url: `/links/${created.shortUrl}` })
    const after = await app.inject({ method: 'GET', url: `/links/${created.shortUrl}` })

    expect(response.statusCode).toBe(204)
    expect(after.statusCode).toBe(404)
  })

  it.each([
    ['GET', '/links/does-not-exist'],
    ['PATCH', '/links/does-not-exist/access'],
    ['DELETE', '/links/does-not-exist'],
  ] as const)('%s %s returns 404', async (method, url) => {
    const response = await app.inject({ method, url })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({ message: 'Link não encontrado.' })
  })
})
