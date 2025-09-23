/**
 * Test E2E simple pour valider Playwright
 * @group e2e
 */

import { test, expect } from '@playwright/test'

test.describe('Configuration Playwright', () => {
  test('devrait pouvoir accéder à la page d\'inscription', async ({ page }) => {
    // Aller à la page d'inscription
    await page.goto('/auth/signup')
    
    // Vérifier que la page se charge
    await expect(page).toHaveTitle(/TalentFlow/)
    
    // Vérifier la présence du logo
    await expect(page.getByText('TF')).toBeVisible()
    
    // Vérifier la présence du titre
    await expect(page.getByRole('heading', { name: /inscription/i })).toBeVisible()
    
    // Vérifier la présence des champs du formulaire
    await expect(page.getByLabel(/prénom/i)).toBeVisible()
    await expect(page.getByLabel(/nom/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    await expect(page.getByLabel(/nom de.*entreprise/i)).toBeVisible()
    
    // Vérifier la présence du bouton
    await expect(page.getByRole('button', { name: /créer mon compte/i })).toBeVisible()
  })

  test('devrait pouvoir accéder à la page de connexion', async ({ page }) => {
    // Aller à la page de connexion
    await page.goto('/auth/signin')
    
    // Vérifier que la page se charge
    await expect(page).toHaveTitle(/TalentFlow/)
    
    // Vérifier la présence du titre
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible()
    
    // Vérifier la présence des champs du formulaire
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    
    // Vérifier la présence du bouton
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('devrait rediriger vers signin quand on accède au dashboard sans être connecté', async ({ page }) => {
    // Essayer d'accéder au dashboard
    await page.goto('/')
    
    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL(/\/auth\/signin/)
    
    // Vérifier que c'est bien la page de connexion
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible()
  })
})
