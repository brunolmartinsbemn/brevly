import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { exportLinks } from '../../../app/functions/export-links'

export const exportLinksRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/links/exports',
    {
      schema: {
        summary: 'Export links to a CSV file in storage',
        tags: ['links'],
        response: {
          200: z.object({ reportUrl: z.string().url() }),
        },
      },
    },
    async () => {
      return exportLinks()
    },
  )
}
