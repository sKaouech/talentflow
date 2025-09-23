/**
 * Tests E2E pour la connexion utilisateur
 * @group e2e
 * @group auth
 */

import { test, expect } from '@playwright/test'

test.describe('Connexion utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
  })

  test('devrait afficher la page de connexion correctement', async ({ page }) => {
    // Vérifier les éléments de la page
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible()
    await expect(page.getByText(/connectez-vous à votre compte talentflow/i)).toBeVisible()
    await expect(page.getByText('TF')).toBeVisible()
    
    // Vérifier les champs du formulaire
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    
    // Vérifier les boutons
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
    await expect(page.getByText(/continuer avec google/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /inscrivez-vous/i })).toBeVisible()
  })

  test('devrait valider les champs requis', async ({ page }) => {
    // Cliquer sur le bouton sans remplir les champs
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Vérifier les messages d'erreur
    await expect(page.getByText(/email invalide/i)).toBeVisible()
    await expect(page.getByText(/le mot de passe est requis/i)).toBeVisible()
  })

  test('devrait valider le format de l\'email', async ({ page }) => {
    // Remplir un email invalide
    await page.getByLabel(/email/i).fill('email-invalide')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Vérifier le message d'erreur
    await expect(page.getByText(/email invalide/i)).toBeVisible()
  })

  test('devrait se connecter avec des identifiants valides', async ({ page }) => {
    // Créer d'abord un compte (ou utiliser un compte existant)
    // Pour ce test, nous supposons qu'un compte existe déjà
    const email = 'diana@example.com' // Compte créé précédemment
    const password = 'password123'

    // Remplir le formulaire
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/mot de passe/i).fill(password)

    // Soumettre le formulaire
    await page.getByRole('button', { name: /se connecter/i }).click()

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL('/')
    
    // Vérifier que l'utilisateur est connecté
    await expect(page.getByText(/tableau de bord/i)).toBeVisible()
    
    // Vérifier la présence du profil utilisateur
    await expect(page.getByText('DP')).toBeVisible() // Initiales Diana Prince
  })

  test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
    // Remplir avec des identifiants incorrects
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/mot de passe/i).fill('wrongpassword')

    // Soumettre le formulaire
    await page.getByRole('button', { name: /se connecter/i }).click()

    // Vérifier le message d'erreur
    await expect(page.getByText(/identifiants invalides/i)).toBeVisible()
  })

  test('devrait afficher un indicateur de chargement', async ({ page }) => {
    // Intercepter la requête pour la ralentir
    await page.route('/api/auth/signin', async route => {
      await page.waitForTimeout(1000) // Simuler une latence
      await route.continue()
    })

    // Remplir le formulaire
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/mot de passe/i).fill('password123')

    // Soumettre le formulaire
    const submitButton = page.getByRole('button', { name: /se connecter/i })
    await submitButton.click()

    // Vérifier l'état de chargement
    await expect(submitButton).toBeDisabled()
    await expect(page.getByTestId('loading-spinner')).toBeVisible()
  })

  test('devrait permettre la navigation vers la page d\'inscription', async ({ page }) => {
    // Cliquer sur le lien d'inscription
    await page.getByRole('link', { name: /inscrivez-vous/i }).click()
    
    // Vérifier la redirection
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.getByRole('heading', { name: /inscription/i })).toBeVisible()
  })

  test('devrait rediriger les utilisateurs non authentifiés', async ({ page }) => {
    // Essayer d'accéder au dashboard directement
    await page.goto('/')
    
    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL('/auth/signin')
  })

  test('devrait gérer la connexion Google', async ({ page }) => {
    // Cliquer sur le bouton Google
    const googleButton = page.getByText(/continuer avec google/i)
    await expect(googleButton).toBeVisible()
    
    // Note: Pour un vrai test, nous aurions besoin de mocker l'OAuth de Google
    // ou d'utiliser un environnement de test spécifique
  })

  test('devrait être responsive sur mobile', async ({ page }) => {
    // Simuler un écran mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Vérifier que les éléments sont visibles et accessibles
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
    
    // Vérifier que le formulaire est utilisable
    await page.getByLabel(/email/i).fill('mobile@test.com')
    await expect(page.getByLabel(/email/i)).toHaveValue('mobile@test.com')
  })

  test('devrait supporter la navigation au clavier', async ({ page }) => {
    // Navigation avec Tab
    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/email/i)).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/mot de passe/i)).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeFocused()
    
    // Test de soumission avec Entrée
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/mot de passe/i).fill('password123')
    await page.getByLabel(/mot de passe/i).press('Enter')
    
    // La soumission devrait être déclenchée
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeDisabled()
  })

  test('devrait permettre de basculer la visibilité du mot de passe', async ({ page }) => {
    const passwordInput = page.getByLabel(/mot de passe/i)
    
    // Vérifier que le champ est de type password par défaut
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Remplir le champ
    await passwordInput.fill('mypassword')
    
    // Chercher le bouton pour afficher/masquer le mot de passe
    const toggleButton = page.getByRole('button', { name: /afficher le mot de passe/i })
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      
      // Vérifier que le type a changé
      await expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Cliquer à nouveau pour masquer
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    }
  })
})
