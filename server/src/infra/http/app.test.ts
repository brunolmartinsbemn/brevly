import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from './app'

describe('app', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('allows CORS preflight for DELETE and PATCH from another origin', async () => {
    for (const method of ['DELETE', 'PATCH']) {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/links/abc',
        headers: {
          origin: 'http://localhost:5173',
          'access-control-request-method': method,
        },
      })

      expect(response.statusCode).toBe(204)
      expect(response.headers['access-control-allow-origin']).toBe('*')
      expect(String(response.headers['access-control-allow-methods'])).toContain(method)
    }
  })

  it('serves the API docs', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveProperty('openapi')
  })
})
