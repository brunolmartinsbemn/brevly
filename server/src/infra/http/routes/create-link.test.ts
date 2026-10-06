import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { makeLink } from '../../../test/factories/make-link'
import { buildApp } from '../app'

describe('POST /links', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns 201 with the created link', async () => {
    const shortUrl = `r-${randomUUID().slice(0, 8)}`

    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: { originalUrl: 'https://rocketseat.com.br', shortUrl },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().link).toMatchObject({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl,
      accessCount: 0,
    })
    expect(new Date(response.json().link.createdAt).toString()).not.toBe('Invalid Date')
  })

  it.each([
    ['com espaço', 'tem espaco'],
    ['com barra', 'a/b'],
    ['curto demais', 'ab'],
    ['com acento', 'ação'],
    ['vazio', ''],
  ])('returns 400 for a malformed short url (%s)', async (_label, shortUrl) => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: { originalUrl: 'https://rocketseat.com.br', shortUrl },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toHaveProperty('message')
  })

  it.each([
    ['não é URL', 'rocketseat'],
    ['javascript:', 'javascript:alert(1)'],
    ['ftp:', 'ftp://files.example.com'],
  ])('returns 400 for an invalid original url (%s)', async (_label, originalUrl) => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: { originalUrl, shortUrl: `v-${randomUUID().slice(0, 8)}` },
    })

    expect(response.statusCode).toBe(400)
  })

  it('returns 409 when the short url already exists', async () => {
    const existing = await makeLink()

    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: { originalUrl: 'https://other.com', shortUrl: existing.shortUrl },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json()).toEqual({ message: 'Essa URL encurtada já existe.' })
  })
})
