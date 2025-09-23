import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock session pour les tests
interface MockSession {
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    tenantId?: string
    role?: string
    permissions?: string[]
  }
  expires?: string
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: MockSession | null
  queryClient?: QueryClient
}

// Provider personnalisé pour les tests
function TestProvider({ 
  children, 
  session = null,
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}: {
  children: React.ReactNode
  session?: MockSession | null
  queryClient?: QueryClient
}) {
  // Mock useSession
  jest.doMock('next-auth/react', () => ({
    ...jest.requireActual('next-auth/react'),
    useSession: () => ({
      data: session,
      status: session ? 'authenticated' : 'unauthenticated'
    })
  }))

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

// Fonction de rendu personnalisée
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { session, queryClient, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProvider session={session} queryClient={queryClient}>
        {children}
      </TestProvider>
    ),
    ...renderOptions
  })
}

// Factory pour créer des utilisateurs de test
export const createMockUser = (overrides: Partial<MockSession['user']> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  tenantId: 'test-tenant-id',
  role: 'tenant_admin',
  permissions: ['tenders.read', 'tenders.write'],
  ...overrides
})

// Factory pour créer des sessions de test
export const createMockSession = (userOverrides: Partial<MockSession['user']> = {}): MockSession => ({
  user: createMockUser(userOverrides),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
})

// Utilitaires pour les tests d'API
export const createMockRequest = (options: {
  method?: string
  body?: any
  headers?: Record<string, string>
} = {}) => {
  const { method = 'GET', body, headers = {} } = options
  
  return {
    method,
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(headers),
    url: 'http://localhost:3000/test'
  } as any
}

// Utilitaires pour les mocks Prisma
export const createMockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  },
  tenant: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  },
  $transaction: jest.fn()
})

// Re-export des utilitaires de testing-library
export * from '@testing-library/react'
export { customRender as render }
