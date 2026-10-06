import { z } from 'zod'

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i

function isHttpUrl(value: string) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export const newLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, 'Informe a URL original.')
    .transform((value) => (HAS_SCHEME.test(value) && value.includes('://') ? value : `https://${value}`))
    .pipe(z.string().refine(isHttpUrl, 'Informe uma URL válida.')),
  shortUrl: z
    .string()
    .trim()
    .min(3, 'A URL encurtada deve ter no mínimo 3 caracteres.')
    .max(50, 'A URL encurtada deve ter no máximo 50 caracteres.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Use apenas letras, números, "-" e "_", sem espaços.'),
})

export type NewLinkFormInput = z.input<typeof newLinkSchema>
export type NewLinkFormOutput = z.output<typeof newLinkSchema>
