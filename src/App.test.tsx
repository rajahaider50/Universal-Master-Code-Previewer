import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the project workspace and preview action', () => {
    render(<App />)
    expect(screen.getByText('PROJECT EXPLORER')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /run preview/i })).toHaveLength(2)
    expect(screen.getByLabelText('Editor for index.html')).toBeInTheDocument()
  })
})
