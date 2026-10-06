import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { incrementLinkAccess } from '../../../app/functions/increment-link-access'

export const incrementLinkAccessRoute: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/links/:shortUrl/access',
    {
      schema: {
        summary: 'Increment the access count of a link',
        tags: ['links'],
        params: z.object({ shortUrl: z.string() }),
        response: {
          200: z.object({ accessCount: z.number() }),
        },
      },
    },
    async (request) => {
      return incrementLinkAccess(request.params.shortUrl)
    },
  )
}
