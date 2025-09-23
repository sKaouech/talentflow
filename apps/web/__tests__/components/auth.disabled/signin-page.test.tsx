/**
 * Tests unitaires pour la page de connexion
 * @group unit
 * @group auth
 * @group components
 */

import { render, screen, fireEvent, waitFor } from '@talentflow/testing'
import { setupTestServer, mockApiResponses } from '@talentflow/testing'
import SignInPage from '@/app/auth/signin/page'
import { signIn } from 'next-auth/react'

// Mock NextAuth
jest.mock('next-auth/react')
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Configuration du serveur de test
setupTestServer()

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignIn.mockResolvedValue({ ok: true, error: null } as any)
  })

  describe('Rendu de la page', () => {
    it('devrait afficher le formulaire de connexion', () => {
      // Act
      render(<SignInPage />)

      // Assert
      expect(
        screen.getByRole('heading', { name: /connexion/i })
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /se connecter/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/continuer avec google/i)).toBeInTheDocument()
    })

    it('devrait afficher le logo TalentFlow', () => {
      // Act
      render(<SignInPage />)

      // Assert
      expect(screen.getByText('TF')).toBeInTheDocument()
      expect(
        screen.getByText(/connectez-vous à votre compte talentflow/i)
      ).toBeInTheDocument()
    })

    it("devrait afficher le lien vers l'inscription", () => {
      // Act
      render(<SignInPage />)

      // Assert
      expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /inscrivez-vous/i })
      ).toHaveAttribute('href', '/auth/signup')
    })
  })

  describe('Validation du formulaire', () => {
    it('devrait valider les champs requis', async () => {
      // Arrange
      render(<SignInPage />)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      // Act
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
        expect(
          screen.getByText(/le mot de passe est requis/i)
        ).toBeInTheDocument()
      })
    })

    it("devrait valider le format de l'email", async () => {
      // Arrange
      render(<SignInPage />)
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      // Act
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      })
    })
  })

  describe('Soumission du formulaire', () => {
    it('devrait se connecter avec des identifiants valides', async () => {
      // Arrange
      render(<SignInPage />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      // Act
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          redirect: false,
          email: 'test@example.com',
          password: 'password123',
        })
      })

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it("devrait afficher une erreur en cas d'échec de connexion", async () => {
      // Arrange
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'CredentialsSignin',
      } as any)

      render(<SignInPage />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      // Act
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrong-password' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument()
      })
    })

    it('devrait afficher un indicateur de chargement pendant la connexion', async () => {
      // Arrange
      mockSignIn.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ ok: true, error: null } as any), 100)
          )
      )

      render(<SignInPage />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      // Act
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      // Assert
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })
  })

  describe('Connexion Google', () => {
    it('devrait initier la connexion Google', async () => {
      // Arrange
      render(<SignInPage />)
      const googleButton = screen.getByText(/continuer avec google/i)

      // Act
      fireEvent.click(googleButton)

      // Assert
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/' })
      })
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir les labels appropriés', () => {
      // Act
      render(<SignInPage />)

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    })

    it('devrait supporter la navigation au clavier', () => {
      // Act
      render(<SignInPage />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      const submitButton = screen.getByRole('button', { name: /se connecter/i })

      // Assert
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })
})
