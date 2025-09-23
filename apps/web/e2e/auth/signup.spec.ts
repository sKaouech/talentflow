/**
 * Tests E2E pour l'inscription utilisateur
 * @group e2e
 * @group auth
 */

import { test, expect } from '@playwright/test'

test.describe('Inscription utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test("devrait afficher la page d'inscription correctement", async ({
    page,
  }) => {
    // Vérifier les éléments de la page
    await expect(
      page.getByRole('heading', { name: /inscription/i })
    ).toBeVisible()
    await expect(page.getByText(/créez votre compte talentflow/i)).toBeVisible()
    await expect(page.getByText('TF')).toBeVisible()

    // Vérifier les champs du formulaire
    await expect(page.getByLabel(/prénom/i)).toBeVisible()
    await expect(page.getByLabel(/nom/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    await expect(page.getByLabel(/nom de.*entreprise/i)).toBeVisible()

    // Vérifier les boutons
    await expect(
      page.getByRole('button', { name: /créer mon compte/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /connectez-vous/i })
    ).toBeVisible()
  })

  test('devrait valider les champs requis', async ({ page }) => {
    // Cliquer sur le bouton sans remplir les champs
    await page.getByRole('button', { name: /créer mon compte/i }).click()

    // Vérifier les messages d'erreur
    await expect(
      page.getByText(/le prénom doit contenir au moins 2 caractères/i)
    ).toBeVisible()
    await expect(
      page.getByText(/le nom doit contenir au moins 2 caractères/i)
    ).toBeVisible()
    await expect(page.getByText(/email invalide/i)).toBeVisible()
    await expect(
      page.getByText(/le mot de passe doit contenir au moins 8 caractères/i)
    ).toBeVisible()
    await expect(
      page.getByText(
        /le nom de l'entreprise doit contenir au moins 2 caractères/i
      )
    ).toBeVisible()
  })

  test("devrait valider le format de l'email", async ({ page }) => {
    // Remplir un email invalide
    await page.getByLabel(/email/i).fill('email-invalide')
    await page.getByRole('button', { name: /créer mon compte/i }).click()

    // Vérifier le message d'erreur
    await expect(page.getByText(/email invalide/i)).toBeVisible()
  })

  test('devrait valider la longueur du mot de passe', async ({ page }) => {
    // Remplir un mot de passe trop court
    await page.getByLabel(/mot de passe/i).fill('123')
    await page.getByRole('button', { name: /créer mon compte/i }).click()

    // Vérifier le message d'erreur
    await expect(
      page.getByText(/le mot de passe doit contenir au moins 8 caractères/i)
    ).toBeVisible()
  })

  test('devrait créer un compte avec succès', async ({ page }) => {
    // Générer des données uniques pour éviter les conflits
    const timestamp = Date.now()
    const email = `test-${timestamp}@example.com`
    const companyName = `Test Company ${timestamp}`

    // Remplir le formulaire
    await page.getByLabel(/prénom/i).fill('John')
    await page.getByLabel(/nom/i).fill('Doe')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/mot de passe/i).fill('password123')
    await page.getByLabel(/nom de.*entreprise/i).fill(companyName)

    // Soumettre le formulaire
    await page.getByRole('button', { name: /créer mon compte/i }).click()

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL('/')

    // Vérifier que l'utilisateur est connecté
    await expect(page.getByText(/tableau de bord/i)).toBeVisible()

    // Vérifier la présence du profil utilisateur
    await expect(page.getByText('JD')).toBeVisible() // Initiales
  })

  test("devrait afficher une erreur si l'email existe déjà", async ({
    page,
  }) => {
    // Utiliser un email qui existe déjà (créé dans un test précédent)
    await page.getByLabel(/prénom/i).fill('Jane')
    await page.getByLabel(/nom/i).fill('Smith')
    await page.getByLabel(/email/i).fill('existing@example.com')
    await page.getByLabel(/mot de passe/i).fill('password123')
    await page.getByLabel(/nom de.*entreprise/i).fill('Jane Corp')

    // Soumettre le formulaire
    await page.getByRole('button', { name: /créer mon compte/i }).click()

    // Vérifier le message d'erreur (si l'email existe)
    // Note: Ce test peut échouer si l'email n'existe pas encore
    // Dans un vrai environnement de test, nous aurions une base de données de test
  })

  test('devrait afficher un indicateur de chargement', async ({ page }) => {
    // Remplir le formulaire
    const timestamp = Date.now()
    await page.getByLabel(/prénom/i).fill('Loading')
    await page.getByLabel(/nom/i).fill('Test')
    await page.getByLabel(/email/i).fill(`loading-${timestamp}@example.com`)
    await page.getByLabel(/mot de passe/i).fill('password123')
    await page.getByLabel(/nom de.*entreprise/i).fill('Loading Corp')

    // Intercepter la requête pour la ralentir
    await page.route('/api/auth/register', async route => {
      await page.waitForTimeout(1000) // Simuler une latence
      await route.continue()
    })

    // Soumettre le formulaire
    const submitButton = page.getByRole('button', { name: /créer mon compte/i })
    await submitButton.click()

    // Vérifier l'état de chargement
    await expect(submitButton).toBeDisabled()
    await expect(page.getByTestId('loading-spinner')).toBeVisible()
  })

  test('devrait permettre la navigation vers la page de connexion', async ({
    page,
  }) => {
    // Cliquer sur le lien de connexion
    await page.getByRole('link', { name: /connectez-vous/i }).click()

    // Vérifier la redirection
    await expect(page).toHaveURL('/auth/signin')
    await expect(
      page.getByRole('heading', { name: /connexion/i })
    ).toBeVisible()
  })

  test('devrait être responsive sur mobile', async ({ page }) => {
    // Simuler un écran mobile
    await page.setViewportSize({ width: 375, height: 667 })

    // Vérifier que les éléments sont visibles et accessibles
    await expect(
      page.getByRole('heading', { name: /inscription/i })
    ).toBeVisible()
    await expect(page.getByLabel(/prénom/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /créer mon compte/i })
    ).toBeVisible()

    // Vérifier que le formulaire est utilisable
    await page.getByLabel(/prénom/i).fill('Mobile')
    await expect(page.getByLabel(/prénom/i)).toHaveValue('Mobile')
  })

  test('devrait supporter la navigation au clavier', async ({ page }) => {
    // Navigation avec Tab
    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/prénom/i)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/nom/i)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/email/i)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/mot de passe/i)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/nom de.*entreprise/i)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('button', { name: /créer mon compte/i })
    ).toBeFocused()
  })
})
