import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as http from '../http/links'
import { ApiError } from '../lib/api'
import { renderWithProviders } from '../test/render'
import { NewLinkForm } from './new-link-form'

describe('NewLinkForm', () => {
  beforeEach(() => {
    vi.spyOn(http, 'createLink').mockResolvedValue({
      id: '1',
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocket',
      accessCount: 0,
      createdAt: '2026-10-06T00:00:00.000Z',
    })
  })

  it('keeps "Salvar link" disabled until both fields have a value', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewLinkForm />)
    const submit = screen.getByRole('button', { name: 'Salvar link' })

    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Link original'), 'rocketseat.com.br')
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Link encurtado'), 'rocket')
    expect(submit).toBeEnabled()
  })

  it('creates the link with https:// added and clears the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewLinkForm />)

    await user.type(screen.getByLabelText('Link original'), 'rocketseat.com.br')
    await user.type(screen.getByLabelText('Link encurtado'), 'rocket')
    await user.click(screen.getByRole('button', { name: 'Salvar link' }))

    await waitFor(() =>
      expect(http.createLink).toHaveBeenCalledWith({
        originalUrl: 'https://rocketseat.com.br',
        shortUrl: 'rocket',
      }),
    )
    await waitFor(() => expect(screen.getByLabelText('Link original')).toHaveValue(''))
  })

  it('shows the validation message and does not call the API for a malformed short url', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewLinkForm />)

    await user.type(screen.getByLabelText('Link original'), 'rocketseat.com.br')
    await user.type(screen.getByLabelText('Link encurtado'), 'tem espaco')
    await user.click(screen.getByRole('button', { name: 'Salvar link' }))

    expect(
      await screen.findByText('Use apenas letras, números, "-" e "_", sem espaços.'),
    ).toBeInTheDocument()
    expect(http.createLink).not.toHaveBeenCalled()
  })

  it('shows a field error when the short url already exists', async () => {
    vi.mocked(http.createLink).mockRejectedValue(
      new ApiError(409, 'Essa URL encurtada já existe.'),
    )
    const user = userEvent.setup()
    renderWithProviders(<NewLinkForm />)

    await user.type(screen.getByLabelText('Link original'), 'rocketseat.com.br')
    await user.type(screen.getByLabelText('Link encurtado'), 'rocket')
    await user.click(screen.getByRole('button', { name: 'Salvar link' }))

    expect(await screen.findByText('Essa URL encurtada já existe.')).toBeInTheDocument()
    expect(screen.getByLabelText('Link encurtado')).toHaveAttribute('aria-invalid', 'true')
  })

  it('disables the submit button while saving (no double submit)', async () => {
    let resolve: (value: http.Link) => void = () => {}
    vi.mocked(http.createLink).mockReturnValue(new Promise((r) => (resolve = r)))
    const user = userEvent.setup()
    renderWithProviders(<NewLinkForm />)

    await user.type(screen.getByLabelText('Link original'), 'rocketseat.com.br')
    await user.type(screen.getByLabelText('Link encurtado'), 'rocket')
    await user.click(screen.getByRole('button', { name: 'Salvar link' }))

    const saving = await screen.findByRole('button', { name: 'Salvando...' })
    expect(saving).toBeDisabled()
    await user.click(saving)
    expect(http.createLink).toHaveBeenCalledTimes(1)

    resolve({
      id: '1',
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocket',
      accessCount: 0,
      createdAt: '2026-10-06T00:00:00.000Z',
    })
  })
})
