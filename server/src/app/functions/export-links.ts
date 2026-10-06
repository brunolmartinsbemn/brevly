import { randomUUID } from 'node:crypto'
import { PassThrough, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stringify } from 'csv-stringify'
import { desc } from 'drizzle-orm'
import { db, pg } from '../../infra/db'
import { links } from '../../infra/db/schemas/links'
import * as storage from '../../infra/storage/upload-file-to-storage'

const CURSOR_BATCH_SIZE = 50

type ExportRow = {
  original_url: string
  short_url: string
  access_count: number
  created_at: string | Date
}

export async function exportLinks() {
  const { sql, params } = db
    .select({
      originalUrl: links.originalUrl,
      shortUrl: links.shortUrl,
      accessCount: links.accessCount,
      createdAt: links.createdAt,
    })
    .from(links)
    .orderBy(desc(links.createdAt), desc(links.id))
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(CURSOR_BATCH_SIZE)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'original_url', header: 'URL original' },
      { key: 'short_url', header: 'URL encurtada' },
      { key: 'access_count', header: 'Contagem de acessos' },
      { key: 'created_at', header: 'Data de criação' },
    ],
  })

  const uploadStream = new PassThrough()

  const convertToCsv = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(rows: ExportRow[], _encoding, callback) {
        for (const row of rows) {
          this.push({ ...row, created_at: new Date(row.created_at).toISOString() })
        }
        callback()
      },
    }),
    csv,
    uploadStream,
  )

  const fileName = `${randomUUID()}-${Date.now()}.csv`

  const upload = storage.uploadFileToStorage({
    folder: 'downloads',
    fileName,
    contentType: 'text/csv',
    contentStream: uploadStream,
  })

  const [{ url }] = await Promise.all([upload, convertToCsv])

  return { reportUrl: url }
}
