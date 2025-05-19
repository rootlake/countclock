import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the timer display', () => {
    render(<App />)
    // Default time should be 5 minutes = 05:00
    expect(screen.getByText('05:00')).toBeInTheDocument()
  })

  it('renders timer control buttons', () => {
    render(<App />)
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })
})
