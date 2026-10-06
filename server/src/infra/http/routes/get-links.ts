import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getLinks } from '../../../app/functions/get-links'
import { linkSchema } from '../../../app/schemas/link'

export const getLinksRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/links',
    {
      schema: {
        summary: 'List links (cursor pagination, newest first)',
        tags: ['links'],
        querystring: z.object({
          cursor: z.string().optional(),
          pageSize: z.coerce.number().int().min(1).max(100).default(20),
        }),
        response: {
          200: z.object({
            links: z.array(linkSchema),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
    async (request) => {
      return getLinks(request.query)
    },
  )
}
