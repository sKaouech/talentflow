/**
 * Test data factories for generating mock data
 */

export interface MockUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface MockTenant {
  id: string
  name: string
  slug: string
  domain?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const now = new Date().toISOString()
  
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
    name: `Test User ${Math.random().toString(36).substr(2, 5)}`,
    role: 'USER',
    tenantId: `tenant-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Create a mock tenant for testing
 */
export function createMockTenant(overrides: Partial<MockTenant> = {}): MockTenant {
  const now = new Date().toISOString()
  const randomId = Math.random().toString(36).substr(2, 9)
  
  return {
    id: `tenant-${randomId}`,
    name: `Test Company ${randomId}`,
    slug: `test-company-${randomId}`,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}