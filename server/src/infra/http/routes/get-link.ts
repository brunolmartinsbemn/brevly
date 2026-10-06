import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getLink } from '../../../app/functions/get-link'
import { linkSchema } from '../../../app/schemas/link'

export const getLinkRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/links/:shortUrl',
    {
      schema: {
        summary: 'Get a link by short url',
        tags: ['links'],
        params: z.object({ shortUrl: z.string() }),
        response: {
          200: z.object({ link: linkSchema }),
        },
      },
    },
    async (request) => {
      const link = await getLink(request.params.shortUrl)
      return { link }
    },
  )
}
