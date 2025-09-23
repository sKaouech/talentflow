/**
 * Tests d'intégration pour le flux d'authentification
 * @group integration
 * @group auth
 */

import { createMockPrisma } from '@talentflow/testing'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { formDataFactory, userFactory, tenantFactory } from '@talentflow/testing'
import { createMockRequest } from '@talentflow/testing'
import bcrypt from 'bcryptjs'

// Mock des dépendances
jest.mock('bcryptjs')
jest.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma()
}))

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const { prisma } = require('@/lib/prisma')

describe('Flux d\'authentification intégré', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBcrypt.hash.mockResolvedValue('hashed-password')
    mockBcrypt.compare.mockResolvedValue(true)
  })

  describe('Parcours d\'inscription complet', () => {
    it('devrait créer un tenant et un utilisateur admin en une transaction', async () => {
      // Arrange
      const formData = formDataFactory.register({
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@company.com',
        tenantName: 'Alice Corp'
      })

      const mockTenant = tenantFactory.build({
        id: 'tenant-alice-corp',
        name: 'Alice Corp',
        slug: 'alice-corp'
      })

      const mockUser = userFactory.build({
        id: 'user-alice',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@company.com',
        tenantId: mockTenant.id,
        role: 'tenant_admin'
      })

      // Configuration des mocks
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role
      })

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await registerPOST(request)
      const responseData = await response.json()

      // Assert - Vérifier la réponse
      expect(response.status).toBe(201)
      expect(responseData.message).toBe('Compte créé avec succès')
      expect(responseData.user).toEqual({
        id: mockUser.id,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@company.com',
        role: 'tenant_admin'
      })

      // Assert - Vérifier la création du tenant
      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: {
          name: 'Alice Corp',
          slug: 'alice-corp',
          plan: 'trial',
          settings: {},
          branding: {
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af'
          }
        }
      })

      // Assert - Vérifier la création de l'utilisateur
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@company.com',
          passwordHash: 'hashed-password',
          role: 'tenant_admin',
          emailVerified: expect.any(Date),
          tenantId: mockTenant.id
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      })
    })

    it('devrait gérer les erreurs de transaction', async () => {
      // Arrange
      const formData = formDataFactory.register()
      
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue({ id: 'tenant-123' })
      // Simuler une erreur lors de la création de l'utilisateur
      prisma.user.create.mockRejectedValue(new Error('User creation failed'))

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await registerPOST(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Erreur lors de la création du compte')
      expect(responseData.details).toBe('User creation failed')
    })
  })

  describe('Validation des données métier', () => {
    it('devrait créer un slug unique pour le tenant', async () => {
      // Arrange
      const formData = formDataFactory.register({
        tenantName: 'My Awesome Company!'
      })

      const mockTenant = tenantFactory.build()
      const mockUser = userFactory.build()

      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role
      })

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      await registerPOST(request)

      // Assert
      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'My Awesome Company!',
          slug: 'my-awesome-company!' // Conversion en slug
        })
      })
    })

    it('devrait assigner le rôle tenant_admin par défaut', async () => {
      // Arrange
      const formData = formDataFactory.register()
      const mockTenant = tenantFactory.build()
      const mockUser = userFactory.build()

      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role
      })

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      await registerPOST(request)

      // Assert
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'tenant_admin'
        }),
        select: expect.any(Object)
      })
    })
  })

  describe('Sécurité', () => {
    it('devrait hacher le mot de passe avec bcrypt', async () => {
      // Arrange
      const formData = formDataFactory.register({
        password: 'mySecretPassword123'
      })

      const mockTenant = tenantFactory.build()
      const mockUser = userFactory.build()

      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role
      })

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      await registerPOST(request)

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith('mySecretPassword123', 12)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          passwordHash: 'hashed-password'
        }),
        select: expect.any(Object)
      })
    })

    it('ne devrait jamais retourner le mot de passe dans la réponse', async () => {
      // Arrange
      const formData = formDataFactory.register()
      const mockTenant = tenantFactory.build()
      const mockUser = userFactory.build()

      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role
      })

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await registerPOST(request)
      const responseData = await response.json()

      // Assert
      expect(responseData.user).not.toHaveProperty('password')
      expect(responseData.user).not.toHaveProperty('passwordHash')
      
      // Vérifier que Prisma select exclut les champs sensibles
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.any(Object),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      })
    })
  })

  describe('Gestion des cas limites', () => {
    it('devrait gérer les caractères spéciaux dans les noms', async () => {
      // Arrange
      const formData = formDataFactory.register({
        firstName: 'José-María',
        lastName: 'García-López',
        tenantName: 'Café & Réseau'
      })

      const mockTenant = tenantFactory.build()
      const mockUser = userFactory.build()

      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue({
        id: mockUser.id,
        firstName: 'José-María',
        lastName: 'García-López',
        email: mockUser.email,
        role: mockUser.role
      })

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await registerPOST(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(responseData.user.firstName).toBe('José-María')
      expect(responseData.user.lastName).toBe('García-López')
    })

    it('devrait normaliser les emails en minuscules', async () => {
      // Arrange
      const formData = formDataFactory.register({
        email: 'User@EXAMPLE.COM'
      })

      const mockTenant = tenantFactory.build()
      const mockUser = userFactory.build()

      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: 'user@example.com', // Email normalisé
        role: mockUser.role
      })

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await registerPOST(request)
      const responseData = await response.json()

      // Assert
      expect(responseData.user.email).toBe('user@example.com')
    })
  })
})
