import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import * as storage from '../../infra/storage/upload-file-to-storage'
import { makeLink } from '../../test/factories/make-link'
import { exportLinks } from './export-links'

describe('exportLinks', () => {
  let uploaded: { folder: string; fileName: string; contentType: string; content: string }[]

  beforeEach(async () => {
    await db.delete(links)
    uploaded = []

    vi.spyOn(storage, 'uploadFileToStorage').mockImplementation(
      async ({ folder, fileName, contentType, contentStream }) => {
        let content = ''
        for await (const chunk of contentStream) {
          content += chunk.toString()
        }
        uploaded.push({ folder, fileName, contentType, content })
        return {
          key: `${folder}/${fileName}`,
          url: `http://storage.test/${folder}/${fileName}`,
        }
      },
    )
  })

  it('uploads a CSV with the expected header and rows', async () => {
    await makeLink({
      originalUrl: 'https://example.com/a,b',
      shortUrl: 'csv-comma',
      accessCount: 5,
      createdAt: new Date('2026-03-01T12:00:00.000Z'),
    })

    const { reportUrl } = await exportLinks()

    expect(uploaded).toHaveLength(1)
    const [file] = uploaded
    expect(file.folder).toBe('downloads')
    expect(file.contentType).toBe('text/csv')
    expect(reportUrl).toBe(`http://storage.test/downloads/${file.fileName}`)

    const lines = file.content.trim().split('\n')
    expect(lines[0]).toBe('URL original,URL encurtada,Contagem de acessos,Data de criação')
    expect(lines[1]).toBe('"https://example.com/a,b",csv-comma,5,2026-03-01T12:00:00.000Z')
  })

  it('includes every link (more than one cursor batch)', async () => {
    await Promise.all(Array.from({ length: 120 }, () => makeLink()))

    await exportLinks()

    const lines = uploaded[0].content.trim().split('\n')
    expect(lines).toHaveLength(121)
  })

  it('generates a unique random file name per export', async () => {
    await makeLink()

    await exportLinks()
    await exportLinks()

    const [a, b] = uploaded.map((file) => file.fileName)
    expect(a).toMatch(/^[0-9a-f-]{36}-\d+\.csv$/)
    expect(a).not.toBe(b)
  })
})
