import { S3Client } from '@aws-sdk/client-s3'
import { env } from '../../env'

const customEndpoint = env.CLOUDFLARE_ENDPOINT

export const r2 = new S3Client({
  region: customEndpoint ? 'us-east-1' : 'auto',
  endpoint: customEndpoint ?? `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: Boolean(customEndpoint),
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
})
