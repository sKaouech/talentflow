/**
 * Tests unitaires pour la page d'inscription
 * @group unit
 * @group auth
 * @group components
 */

import { render, screen, fireEvent, waitFor } from '@talentflow/testing'
import { setupTestServer, server } from '@talentflow/testing'
import { rest } from 'msw'
import SignUpPage from '@/app/auth/signup/page'
import { signIn } from 'next-auth/react'

// Mock NextAuth
jest.mock('next-auth/react')
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock fetch global
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Configuration du serveur de test
setupTestServer()

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
  })

  describe('Rendu de la page', () => {
    it("devrait afficher le formulaire d'inscription", () => {
      // Act
      render(<SignUpPage />)

      // Assert
      expect(
        screen.getByRole('heading', { name: /inscription/i })
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nom de.*entreprise/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /créer mon compte/i })
      ).toBeInTheDocument()
    })

    it('devrait afficher le logo et la description', () => {
      // Act
      render(<SignUpPage />)

      // Assert
      expect(screen.getByText('TF')).toBeInTheDocument()
      expect(
        screen.getByText(/créez votre compte talentflow/i)
      ).toBeInTheDocument()
    })

    it('devrait afficher le lien vers la connexion', () => {
      // Act
      render(<SignUpPage />)

      // Assert
      expect(screen.getByText(/déjà un compte/i)).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /connectez-vous/i })
      ).toHaveAttribute('href', '/auth/signin')
    })
  })

  describe('Validation du formulaire', () => {
    it('devrait valider tous les champs requis', async () => {
      // Arrange
      render(<SignUpPage />)
      const submitButton = screen.getByRole('button', {
        name: /créer mon compte/i,
      })

      // Act
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/le prénom doit contenir au moins 2 caractères/i)
        ).toBeInTheDocument()
        expect(
          screen.getByText(/le nom doit contenir au moins 2 caractères/i)
        ).toBeInTheDocument()
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
        expect(
          screen.getByText(
            /le mot de passe doit contenir au moins 8 caractères/i
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /le nom de l'entreprise doit contenir au moins 2 caractères/i
          )
        ).toBeInTheDocument()
      })
    })

    it("devrait valider le format de l'email", async () => {
      // Arrange
      render(<SignUpPage />)
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', {
        name: /créer mon compte/i,
      })

      // Act
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      })
    })

    it('devrait valider la longueur du mot de passe', async () => {
      // Arrange
      render(<SignUpPage />)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', {
        name: /créer mon compte/i,
      })

      // Act
      fireEvent.change(passwordInput, { target: { value: '1234567' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /le mot de passe doit contenir au moins 8 caractères/i
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('Soumission du formulaire', () => {
    it('devrait créer un compte avec des données valides', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({
          message: 'Compte créé avec succès',
          user: {
            id: 'test-user-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'tenant_admin',
          },
        }),
      } as any)

      render(<SignUpPage />)

      // Remplir le formulaire
      fireEvent.change(screen.getByLabelText(/prénom/i), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText(/nom/i), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText(/nom de.*entreprise/i), {
        target: { value: 'Acme Corp' },
      })

      // Act
      fireEvent.click(screen.getByRole('button', { name: /créer mon compte/i }))

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            tenantName: 'Acme Corp',
          }),
        })
      })

      // Vérifier la connexion automatique
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          redirect: false,
          email: 'john.doe@example.com',
          password: 'password123',
        })
      })

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it("devrait afficher une erreur si l'email existe déjà", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({
          message: 'Un utilisateur avec cet email existe déjà.',
        }),
      } as any)

      render(<SignUpPage />)

      // Remplir le formulaire
      fireEvent.change(screen.getByLabelText(/prénom/i), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText(/nom/i), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'existing@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText(/nom de.*entreprise/i), {
        target: { value: 'Acme Corp' },
      })

      // Act
      fireEvent.click(screen.getByRole('button', { name: /créer mon compte/i }))

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/un utilisateur avec cet email existe déjà/i)
        ).toBeInTheDocument()
      })
    })

    it("devrait afficher un indicateur de chargement pendant l'inscription", async () => {
      // Arrange
      mockFetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 201,
                  json: jest.fn().mockResolvedValue({ message: 'Success' }),
                } as any),
              100
            )
          )
      )

      render(<SignUpPage />)

      // Remplir le formulaire avec des données valides
      fireEvent.change(screen.getByLabelText(/prénom/i), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText(/nom/i), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText(/nom de.*entreprise/i), {
        target: { value: 'Acme Corp' },
      })

      const submitButton = screen.getByRole('button', {
        name: /créer mon compte/i,
      })

      // Act
      fireEvent.click(submitButton)

      // Assert
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      await waitFor(
        () => {
          expect(
            screen.queryByTestId('loading-spinner')
          ).not.toBeInTheDocument()
        },
        { timeout: 200 }
      )
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir les labels appropriés pour tous les champs', () => {
      // Act
      render(<SignUpPage />)

      // Assert
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nom de.*entreprise/i)).toBeInTheDocument()
    })

    it("devrait avoir les types d'input appropriés", () => {
      // Act
      render(<SignUpPage />)

      // Assert
      expect(screen.getByLabelText(/prénom/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/nom/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText(/mot de passe/i)).toHaveAttribute(
        'type',
        'password'
      )
      expect(screen.getByLabelText(/nom de.*entreprise/i)).toHaveAttribute(
        'type',
        'text'
      )
    })
  })
})
