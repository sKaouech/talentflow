// Factories pour créer des données de test

export interface TestUser {
  id: string
  email: string
  firstName: string
  lastName: string
  passwordHash?: string
  role: string
  tenantId: string
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

export interface TestTenant {
  id: string
  name: string
  slug: string
  plan: string
  settings: Record<string, any>
  branding: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Factory pour créer des utilisateurs de test
export const userFactory = {
  build: (overrides: Partial<TestUser> = {}): TestUser => ({
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `user-${Math.random().toString(36).substr(2, 5)}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    passwordHash: '$2b$12$hashed.password.example',
    role: 'tenant_admin',
    tenantId: `tenant-${Math.random().toString(36).substr(2, 9)}`,
    emailVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  buildMany: (count: number, overrides: Partial<TestUser> = []): TestUser[] => {
    return Array.from({ length: count }, (_, index) => 
      userFactory.build({ 
        ...overrides, 
        email: `user-${index}@example.com` 
      })
    )
  }
}

// Factory pour créer des tenants de test
export const tenantFactory = {
  build: (overrides: Partial<TestTenant> = {}): TestTenant => ({
    id: `tenant-${Math.random().toString(36).substr(2, 9)}`,
    name: `Test Company ${Math.random().toString(36).substr(2, 5)}`,
    slug: `test-company-${Math.random().toString(36).substr(2, 5)}`,
    plan: 'trial',
    settings: {},
    branding: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  buildMany: (count: number, overrides: Partial<TestTenant> = {}): TestTenant[] => {
    return Array.from({ length: count }, (_, index) => 
      tenantFactory.build({ 
        ...overrides, 
        name: `Test Company ${index}`,
        slug: `test-company-${index}`
      })
    )
  }
}

// Factory pour créer des données de formulaire
export const formDataFactory = {
  register: (overrides: any = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    tenantName: 'Acme Corporation',
    ...overrides
  }),

  signin: (overrides: any = {}) => ({
    email: 'john.doe@example.com',
    password: 'password123',
    ...overrides
  })
}

// Factory pour créer des réponses API
export const apiResponseFactory = {
  success: (data: any = {}) => ({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(data)
  }),

  error: (status: number = 400, message: string = 'Error') => ({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ error: message })
  }),

  validationError: (errors: any[] = []) => ({
    ok: false,
    status: 400,
    json: jest.fn().mockResolvedValue({
      error: 'Données invalides',
      details: errors
    })
  })
}
