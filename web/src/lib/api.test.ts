import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './api'

function jsonResponse(status: number, data?: unknown) {
  return new Response(data === undefined ? null : JSON.stringify(data), {
    status,
    headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
  })
}

describe('api', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('prefixes the backend url and parses JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }))

    const data = await api<{ ok: boolean }>('/links')

    expect(data).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3333/links', expect.any(Object))
  })

  it.each(['PATCH', 'DELETE', 'POST'] as const)(
    'does not send a JSON content-type on a bodyless %s',
    async (method) => {
      fetchMock.mockResolvedValue(jsonResponse(200, {}))

      await api('/links/abc', { method })

      const init = fetchMock.mock.calls[0][1] as RequestInit
      expect(new Headers(init.headers).has('Content-Type')).toBe(false)
      expect(init.body).toBeUndefined()
    },
  )

  it('sends JSON with content-type when there is a body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { link: {} }))

    await api('/links', { method: 'POST', body: { shortUrl: 'abc' } })

    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({ shortUrl: 'abc' }))
  })

  it('returns undefined for 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(api('/links/abc', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('throws ApiError with status and server message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, { message: 'Essa URL encurtada já existe.' }))

    const error = await api('/links', { method: 'POST', body: {} }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 409, message: 'Essa URL encurtada já existe.' })
  })

  it('throws ApiError with a fallback message when the body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }))

    await expect(api('/links')).rejects.toMatchObject({
      status: 500,
      message: 'Erro inesperado. Tente novamente.',
    })
  })
})
