import { describe, expect, it } from 'vitest'
import { newLinkSchema } from './new-link-schema'

describe('newLinkSchema', () => {
  it('adds https:// when the original url has no protocol', () => {
    const result = newLinkSchema.parse({ originalUrl: 'www.exemplo.com.br', shortUrl: 'exemplo' })

    expect(result.originalUrl).toBe('https://www.exemplo.com.br')
  })

  it('keeps an explicit http:// url and trims spaces', () => {
    const result = newLinkSchema.parse({
      originalUrl: '  http://site.com/a  ',
      shortUrl: ' Portfolio-Dev ',
    })

    expect(result).toEqual({ originalUrl: 'http://site.com/a', shortUrl: 'Portfolio-Dev' })
  })

  it.each(['javascript:alert(1)', 'ftp://files.example.com', 'não é url', ''])(
    'rejects original url %j',
    (originalUrl) => {
      expect(newLinkSchema.safeParse({ originalUrl, shortUrl: 'valido' }).success).toBe(false)
    },
  )

  it.each(['tem espaco', 'a/b', 'ab', 'ação', 'x'.repeat(51)])(
    'rejects short url %j',
    (shortUrl) => {
      expect(
        newLinkSchema.safeParse({ originalUrl: 'https://site.com', shortUrl }).success,
      ).toBe(false)
    },
  )
})
