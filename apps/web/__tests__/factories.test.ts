/**
 * Test des factories de données
 * @group unit
 * @group testing
 */

import { userFactory, tenantFactory, formDataFactory } from '@talentflow/testing'

describe('Factories de Test', () => {
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

    it('devrait créer plusieurs utilisateurs', () => {
      const users = userFactory.buildMany(3)
      
      expect(users).toHaveLength(3)
      expect(users[0].email).not.toBe(users[1].email)
      expect(users[1].email).not.toBe(users[2].email)
    })
  })

  describe('tenantFactory', () => {
    it('devrait créer un tenant avec des valeurs par défaut', () => {
      const tenant = tenantFactory.build()
      
      expect(tenant).toHaveProperty('id')
      expect(tenant).toHaveProperty('name')
      expect(tenant).toHaveProperty('slug')
      expect(tenant).toHaveProperty('plan', 'trial')
      expect(tenant.name).toMatch(/^Test Company/)
    })

    it('devrait permettre de surcharger les propriétés', () => {
      const tenant = tenantFactory.build({
        name: 'Custom Corp',
        plan: 'premium'
      })
      
      expect(tenant.name).toBe('Custom Corp')
      expect(tenant.plan).toBe('premium')
    })
  })

  describe('formDataFactory', () => {
    it('devrait créer des données de formulaire d\'inscription', () => {
      const formData = formDataFactory.register()
      
      expect(formData).toHaveProperty('firstName', 'John')
      expect(formData).toHaveProperty('lastName', 'Doe')
      expect(formData).toHaveProperty('email', 'john.doe@example.com')
      expect(formData).toHaveProperty('password', 'password123')
      expect(formData).toHaveProperty('tenantName', 'Acme Corporation')
    })

    it('devrait créer des données de formulaire de connexion', () => {
      const formData = formDataFactory.signin()
      
      expect(formData).toHaveProperty('email', 'john.doe@example.com')
      expect(formData).toHaveProperty('password', 'password123')
    })

    it('devrait permettre de surcharger les données', () => {
      const formData = formDataFactory.register({
        email: 'custom@test.com',
        tenantName: 'Custom Company'
      })
      
      expect(formData.email).toBe('custom@test.com')
      expect(formData.tenantName).toBe('Custom Company')
    })
  })
})
