import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock des réponses API
export const mockApiResponses = {
  register: {
    success: {
      message: "Compte créé avec succès",
      user: {
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role: "tenant_admin",
        tenantId: "test-tenant-id"
      }
    },
    error: {
      error: "Email déjà utilisé"
    },
    validationError: {
      error: "Données invalides",
      details: [
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["email"],
          message: "Required"
        }
      ]
    }
  },
  signin: {
    success: {
      user: {
        id: "test-user-id",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User"
      }
    },
    error: {
      error: "CredentialsSignin"
    }
  }
}

// Serveur MSW pour les tests
export const server = setupServer(
  // Mock de l'API d'inscription
  http.post('/api/auth/register', () => {
    return HttpResponse.json(mockApiResponses.register.success)
  }),

  // Mock de l'API de connexion
  http.post('/api/auth/signin', () => {
    return HttpResponse.json(mockApiResponses.signin.success)
  }),

  // Mock de l'API de session
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: mockApiResponses.signin.success.user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  })
)

// Configuration du serveur pour les tests
export const setupTestServer = () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
}

// Mocks pour les modules externes
export const mockBcrypt = {
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}

export const mockNextAuth = {
  signIn: jest.fn().mockResolvedValue({ ok: true, error: null }),
  signOut: jest.fn().mockResolvedValue({ url: '/auth/signin' }),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  }))
}
