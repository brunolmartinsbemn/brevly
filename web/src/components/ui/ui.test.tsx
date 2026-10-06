import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'
import { IconButton } from './icon-button'
import { Input } from './input'
import { Logo } from './logo'

describe('Input', () => {
  it('associates the label with the field', () => {
    render(<Input label="Link original" />)

    expect(screen.getByLabelText('Link original')).toBeInTheDocument()
  })

  it('renders the prefix next to the field', () => {
    render(<Input label="Link encurtado" prefix="brev.ly/" />)

    expect(screen.getByText('brev.ly/')).toBeInTheDocument()
  })

  it('exposes the error message to assistive tech', () => {
    render(<Input label="Link encurtado" error="Informe uma URL válida." />)

    const field = screen.getByLabelText('Link encurtado')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Informe uma URL válida.')
  })

  it('is not marked invalid without an error', () => {
    render(<Input label="Link original" />)

    expect(screen.getByLabelText('Link original')).toHaveAttribute('aria-invalid', 'false')
  })
})

describe('Button', () => {
  it('renders a disabled primary button', () => {
    render(<Button disabled>Salvar link</Button>)

    expect(screen.getByRole('button', { name: 'Salvar link' })).toBeDisabled()
  })

  it('defaults to type="button" so it never submits by accident', () => {
    render(<Button variant="secondary">Baixar CSV</Button>)

    expect(screen.getByRole('button', { name: 'Baixar CSV' })).toHaveAttribute('type', 'button')
  })
})

describe('IconButton', () => {
  it('uses the aria-label as its accessible name', () => {
    render(<IconButton aria-label="Apagar link">x</IconButton>)

    expect(screen.getByRole('button', { name: 'Apagar link' })).toBeInTheDocument()
  })
})

describe('Logo', () => {
  it('renders the brand name', () => {
    render(<Logo />)

    expect(screen.getByText('brev.ly')).toBeInTheDocument()
  })
})
