/**
 * Test simple pour valider la configuration Jest
 * @group unit
 */

describe('Configuration Jest', () => {
  it('devrait exécuter un test simple', () => {
    expect(1 + 1).toBe(2)
  })

  it('devrait avoir accès aux utilitaires de test', () => {
    expect(typeof jest).toBe('object')
    expect(typeof describe).toBe('function')
    expect(typeof it).toBe('function')
    expect(typeof expect).toBe('function')
  })

  it('devrait pouvoir mocker une fonction', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})
