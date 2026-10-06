import { Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'

const uploadParams: Record<string, unknown>[] = []

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: class {
    constructor({ params }: { params: Record<string, unknown> }) {
      uploadParams.push(params)
    }
    done() {
      return Promise.resolve({})
    }
  },
}))

const { uploadFileToStorage } = await import('./upload-file-to-storage')

describe('uploadFileToStorage', () => {
  it('stores the file as an attachment so browsers download it instead of rendering it', async () => {
    const { url } = await uploadFileToStorage({
      folder: 'downloads',
      fileName: 'report.csv',
      contentType: 'text/csv',
      contentStream: Readable.from(['a,b\n']),
    })

    expect(uploadParams[0]).toMatchObject({
      Key: 'downloads/report.csv',
      ContentType: 'text/csv',
      ContentDisposition: 'attachment; filename="report.csv"',
    })
    expect(url).toBe('http://localhost:9000/brevly/downloads/report.csv')
  })
})
