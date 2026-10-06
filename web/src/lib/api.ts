import { env } from '../env'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

const baseUrl = env.VITE_BACKEND_URL.replace(/\/+$/, '')

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}) {
  const hasBody = body !== undefined

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(response.status, data?.message ?? 'Erro inesperado. Tente novamente.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
