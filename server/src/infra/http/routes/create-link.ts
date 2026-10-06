import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { createLink } from '../../../app/functions/create-link'
import { linkSchema, originalUrlSchema, shortUrlSchema } from '../../../app/schemas/link'

export const createLinkRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/links',
    {
      schema: {
        summary: 'Create a link',
        tags: ['links'],
        body: z.object({
          originalUrl: originalUrlSchema,
          shortUrl: shortUrlSchema,
        }),
        response: {
          201: z.object({ link: linkSchema }),
        },
      },
    },
    async (request, reply) => {
      const link = await createLink(request.body)
      return reply.status(201).send({ link })
    },
  )
}
