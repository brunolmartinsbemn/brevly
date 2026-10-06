import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteLink } from '../../../app/functions/delete-link'

export const deleteLinkRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/links/:shortUrl',
    {
      schema: {
        summary: 'Delete a link',
        tags: ['links'],
        params: z.object({ shortUrl: z.string() }),
      },
    },
    async (request, reply) => {
      await deleteLink(request.params.shortUrl)
      return reply.status(204).send()
    },
  )
}
