import { describe, expect, it } from 'vitest'
import { buildPublicUrl } from './public-url'

describe('buildPublicUrl', () => {
  it.each([
    ['http://localhost:9000/brevly', 'http://localhost:9000/brevly/downloads/a.csv'],
    ['http://localhost:9000/brevly/', 'http://localhost:9000/brevly/downloads/a.csv'],
    ['https://pub-123.r2.dev', 'https://pub-123.r2.dev/downloads/a.csv'],
  ])('joins %s with the key', (baseUrl, expected) => {
    expect(buildPublicUrl(baseUrl, 'downloads/a.csv')).toBe(expected)
  })
})
