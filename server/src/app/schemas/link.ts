import { z } from 'zod'

export const shortUrlSchema = z
  .string()
  .min(3, 'A URL encurtada deve ter no mínimo 3 caracteres.')
  .max(50, 'A URL encurtada deve ter no máximo 50 caracteres.')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'A URL encurtada deve conter apenas letras, números, "-" e "_".',
  )

export const originalUrlSchema = z
  .string()
  .url('Informe uma URL válida.')
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  }, 'A URL deve começar com http:// ou https://.')

export const linkSchema = z.object({
  id: z.string(),
  originalUrl: z.string(),
  shortUrl: z.string(),
  accessCount: z.number(),
  createdAt: z.date(),
})
