import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '../../env'
import { errorHandler } from './error-handler'
import { createLinkRoute } from './routes/create-link'
import { deleteLinkRoute } from './routes/delete-link'
import { getLinkRoute } from './routes/get-link'
import { incrementLinkAccessRoute } from './routes/increment-link-access'

export async function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setErrorHandler(errorHandler)

  await app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'brev.ly API', version: '1.0.0' },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(fastifySwaggerUi, { routePrefix: '/docs' })

  await app.register(createLinkRoute)
  await app.register(getLinkRoute)
  await app.register(incrementLinkAccessRoute)
  await app.register(deleteLinkRoute)

  return app
}
