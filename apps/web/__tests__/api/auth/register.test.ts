/**
 * Tests unitaires pour l'API d'inscription
 * @group unit
 * @group auth
 */

import { POST } from '@/app/api/auth/register/route'
import { createMockRequest, createMockPrisma } from '@talentflow/testing'
import { formDataFactory } from '@talentflow/testing'
import bcrypt from 'bcryptjs'

// Mock des dépendances
jest.mock('bcryptjs')
jest.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma()
}))

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const { prisma } = require('@/lib/prisma')

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBcrypt.hash.mockResolvedValue('hashed-password')
  })

  describe('Cas de succès', () => {
    it('devrait créer un utilisateur avec succès', async () => {
      // Arrange
      const formData = formDataFactory.register()
      const mockTenant = { id: 'tenant-123' }
      const mockUser = { 
        id: 'user-123',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: 'tenant_admin'
      }

      prisma.user.findUnique.mockResolvedValue(null) // Utilisateur n'existe pas
      prisma.tenant.create.mockResolvedValue(mockTenant)
      prisma.user.create.mockResolvedValue(mockUser)

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await POST(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(responseData.message).toBe('Compte créé avec succès')
      expect(responseData.user).toEqual(mockUser)
      
      // Vérifier que le mot de passe a été haché
      expect(mockBcrypt.hash).toHaveBeenCalledWith(formData.password, 12)
      
      // Vérifier la création du tenant
      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: {
          name: formData.tenantName,
          slug: formData.tenantName.toLowerCase().replace(/\s+/g, '-'),
          plan: 'trial',
          settings: {},
          branding: {
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af'
          }
        }
      })

      // Vérifier la création de l'utilisateur
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
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
  })

  describe('Cas d\'erreur', () => {
    it('devrait retourner une erreur si l\'utilisateur existe déjà', async () => {
      // Arrange
      const formData = formDataFactory.register()
      const existingUser = { id: 'existing-user' }
      
      prisma.user.findUnique.mockResolvedValue(existingUser)

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await POST(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(409)
      expect(responseData.message).toBe('Un utilisateur avec cet email existe déjà.')
      expect(prisma.tenant.create).not.toHaveBeenCalled()
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('devrait valider les données d\'entrée', async () => {
      // Arrange
      const invalidData = {
        firstName: '', // Trop court
        lastName: 'D',  // Trop court
        email: 'invalid-email', // Email invalide
        password: '123', // Trop court
        tenantName: 'A' // Trop court
      }

      const request = createMockRequest({
        method: 'POST',
        body: invalidData
      })

      // Act
      const response = await POST(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Données invalides')
      expect(responseData.details).toHaveLength(5) // 5 erreurs de validation
    })

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const formData = formDataFactory.register()
      
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.create.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest({
        method: 'POST',
        body: formData
      })

      // Act
      const response = await POST(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Erreur lors de la création du compte')
    })
  })

  describe('Validation des champs', () => {
    it.each([
      ['firstName', 'A', 'Le prénom doit contenir au moins 2 caractères'],
      ['lastName', 'B', 'Le nom doit contenir au moins 2 caractères'],
      ['email', 'invalid', 'Email invalide'],
      ['password', '1234567', 'Le mot de passe doit contenir au moins 8 caractères'],
      ['tenantName', 'X', 'Le nom de l\'entreprise doit contenir au moins 2 caractères']
    ])('devrait valider le champ %s', async (field, value, expectedError) => {
      // Arrange
      const invalidData = {
        ...formDataFactory.register(),
        [field]: value
      }

      const request = createMockRequest({
        method: 'POST',
        body: invalidData
      })

      // Act
      const response = await POST(request)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.details.some((error: any) => 
        error.path.includes(field) && error.message.includes(expectedError.split(' ')[0])
      )).toBe(true)
    })
  })
})
