import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Aucun element" description="Ajoute ton premier element." />)

    expect(screen.getByText('Aucun element')).toBeInTheDocument()
    expect(screen.getByText('Ajoute ton premier element.')).toBeInTheDocument()
  })
})
