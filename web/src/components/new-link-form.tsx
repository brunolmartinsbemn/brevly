import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as http from '../http/links'
import { ApiError } from '../lib/api'
import { newLinkSchema, type NewLinkFormOutput } from '../lib/new-link-schema'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function NewLinkForm() {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newLinkSchema),
    defaultValues: { originalUrl: '', shortUrl: '' },
  })

  const [originalUrl, shortUrl] = watch(['originalUrl', 'shortUrl'])
  const canSubmit = originalUrl.trim() !== '' && shortUrl.trim() !== '' && !isSubmitting

  async function handleCreateLink(data: NewLinkFormOutput) {
    try {
      await http.createLink(data)
      reset()
      await queryClient.invalidateQueries({ queryKey: http.LINKS_QUERY_KEY })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError('shortUrl', { message: error.message })
        return
      }
      toast.error('Erro no cadastro', {
        description:
          error instanceof ApiError ? error.message : 'Não foi possível criar o link. Tente novamente.',
      })
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleCreateLink)}
      className="flex w-full flex-col gap-5 rounded-lg bg-gray-100 p-6 lg:w-[380px] lg:shrink-0 lg:gap-6 lg:p-8"
    >
      <h2 className="text-lg font-bold text-gray-600">Novo link</h2>

      <div className="flex flex-col gap-4">
        <Input
          label="Link original"
          placeholder="www.exemplo.com.br"
          autoComplete="off"
          error={errors.originalUrl?.message}
          {...register('originalUrl')}
        />
        <Input
          label="Link encurtado"
          prefix="brev.ly/"
          autoComplete="off"
          error={errors.shortUrl?.message}
          {...register('shortUrl')}
        />
      </div>

      <Button type="submit" disabled={!canSubmit}>
        {isSubmitting ? 'Salvando...' : 'Salvar link'}
      </Button>
    </form>
  )
}
