/**
 * Test data factories
 */

export const userFactory = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  keycloakId: null,
  avatar: null,
  phone: null,
  locale: 'fr',
  timezone: 'Europe/Paris',
  emailVerified: null,
  passwordHash: 'hashed-password',
  role: 'viewer',
  preferences: {},
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  tenantId: 'test-tenant-id',
  ...overrides,
})

export const tenantFactory = (overrides: any = {}) => ({
  id: 'test-tenant-id',
  name: 'Test Company',
  slug: 'test-company',
  domain: 'test.com',
  plan: 'starter',
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
})

export const formDataFactory = (data: Record<string, any>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}