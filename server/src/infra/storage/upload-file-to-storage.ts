import type { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { env } from '../../env'
import { r2 } from './client'
import { buildPublicUrl } from './public-url'

type UploadFileToStorageInput = {
  folder: string
  fileName: string
  contentType: string
  contentStream: Readable
}

export async function uploadFileToStorage({
  folder,
  fileName,
  contentType,
  contentStream,
}: UploadFileToStorageInput) {
  const key = `${folder}/${fileName}`

  const upload = new Upload({
    client: r2,
    params: {
      Bucket: env.CLOUDFLARE_BUCKET,
      Key: key,
      Body: contentStream,
      ContentType: contentType,
      ContentDisposition: `attachment; filename="${fileName}"`,
    },
  })

  await upload.done()

  return { key, url: buildPublicUrl(env.CLOUDFLARE_PUBLIC_URL, key) }
}
