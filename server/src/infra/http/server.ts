import { env } from '../../env'
import { buildApp } from './app'

const app = await buildApp()

await app.listen({ port: env.PORT, host: '0.0.0.0' })

console.log(`HTTP server running on port ${env.PORT}`)
