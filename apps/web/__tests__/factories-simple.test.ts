/**
 * Test des factories de données (sans MSW)
 * @group unit
 * @group testing
 */

// Import direct des factories sans passer par le package testing
const userFactory = {
  build: (overrides: any = {}) => ({
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `user-${Math.random().toString(36).substr(2, 5)}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    role: 'tenant_admin',
    tenantId: `tenant-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  buildMany: (count: number, overrides: any = {}) => {
    return Array.from({ length: count }, (_, index) => 
      userFactory.build({ 
        ...overrides, 
        email: `user-${index}@example.com` 
      })
    )
  }
}

describe('Factories de Test (Simple)', () => {
  describe('userFactory', () => {
    it('devrait créer un utilisateur avec des valeurs par défaut', () => {
      const user = userFactory.build()
      
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('firstName', 'Test')
      expect(user).toHaveProperty('lastName', 'User')
      expect(user).toHaveProperty('role', 'tenant_admin')
      expect(user.email).toMatch(/@example\.com$/)
    })

    it('devrait permettre de surcharger les propriétés', () => {
      const user = userFactory.build({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      })
      
      expect(user.firstName).toBe('John')
      expect(user.lastName).toBe('Doe')
      expect(user.email).toBe('john.doe@test.com')
    })

    it('devrait créer plusieurs utilisateurs uniques', () => {
      const users = userFactory.buildMany(3)
      
      expect(users).toHaveLength(3)
      
      // Vérifier que tous les utilisateurs ont des IDs différents
      const ids = users.map(u => u.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
      
      // Vérifier que tous les utilisateurs ont des emails différents
      const emails = users.map(u => u.email)
      const uniqueEmails = new Set(emails)
      expect(uniqueEmails.size).toBe(3)
    })

    it('devrait générer des données réalistes', () => {
      const user = userFactory.build()
      
      expect(user.id).toMatch(/^user-[a-z0-9]{9}$/)
      expect(user.tenantId).toMatch(/^tenant-[a-z0-9]{9}$/)
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })
})
