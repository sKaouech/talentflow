/**
 * Test simple pour valider React Testing Library
 * @group unit
 * @group components
 */

import { render, screen } from '@testing-library/react'

// Composant simple pour tester
function TestComponent({ message }: { message: string }) {
  return (
    <div>
      <h1>Test Component</h1>
      <p>{message}</p>
    </div>
  )
}

describe('TestComponent', () => {
  it('devrait afficher le composant correctement', () => {
    render(<TestComponent message="Hello World" />)
    
    expect(screen.getByRole('heading', { name: /test component/i })).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('devrait afficher différents messages', () => {
    render(<TestComponent message="Custom Message" />)
    
    expect(screen.getByText('Custom Message')).toBeInTheDocument()
  })
})
