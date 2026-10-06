import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { InvalidCursorError } from '../../app/errors/invalid-cursor'
import { LinkAlreadyExistsError } from '../../app/errors/link-already-exists'
import { LinkNotFoundError } from '../../app/errors/link-not-found'

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Dados inválidos.',
      issues: error.validation,
    })
  }

  if (error instanceof LinkAlreadyExistsError) {
    return reply.status(409).send({ message: error.message })
  }

  if (error instanceof LinkNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof InvalidCursorError) {
    return reply.status(400).send({ message: error.message })
  }

  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ message: error.message })
  }

  request.log.error({ err: error }, 'Unhandled error')
  return reply.status(500).send({ message: 'Erro interno do servidor.' })
}
