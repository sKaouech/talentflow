# 🧪 Stratégie de Tests TalentFlow

## 🎯 Philosophie de Tests

TalentFlow adopte une approche **Test-Driven Development (TDD)** avec une pyramide de tests équilibrée :

- **70% Tests Unitaires** : Rapides, isolés, haute couverture
- **20% Tests d'Intégration** : Interaction entre composants
- **10% Tests E2E** : Parcours utilisateur critiques

## 📊 Types de Tests

### 1. Tests Unitaires

**Objectif** : Tester des fonctions/composants isolés
**Outils** : Jest + Testing Library
**Localisation** : `__tests__/` dans chaque package

```typescript
// Exemple de test unitaire
describe('userFactory', () => {
  it('devrait créer un utilisateur avec les bonnes propriétés', () => {
    const user = userFactory.build({ email: 'test@example.com' })
    expect(user.email).toBe('test@example.com')
    expect(user.role).toBe('tenant_admin')
  })
})
```

### 2. Tests d'Intégration

**Objectif** : Tester l'interaction entre modules
**Outils** : Jest + Supertest + MSW
**Localisation** : `__tests__/integration/`

```typescript
// Exemple de test d'intégration
describe("Flux d'authentification", () => {
  it('devrait créer un tenant et utilisateur en transaction', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUserData)

    expect(response.status).toBe(201)
    expect(response.body.user.tenantId).toBeDefined()
  })
})
```

### 3. Tests End-to-End (E2E)

**Objectif** : Tester les parcours utilisateur complets
**Outils** : Playwright
**Localisation** : `e2e/`

```typescript
// Exemple de test E2E
test("devrait permettre l'inscription complète", async ({ page }) => {
  await page.goto('/auth/signup')
  await page.fill('[data-testid="email"]', 'user@example.com')
  await page.click('[data-testid="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## 🏗️ Structure des Tests

```
apps/web/
├── __tests__/
│   ├── api/
│   │   └── auth/
│   │       ├── register.test.ts
│   │       └── signin.test.ts
│   ├── components/
│   │   └── auth/
│   │       ├── signin-page.test.tsx
│   │       └── signup-page.test.tsx
│   └── integration/
│       └── auth-flow.test.ts
├── e2e/
│   └── auth/
│       ├── signin.spec.ts
│       └── signup.spec.ts
└── playwright.config.ts

packages/testing/
├── src/
│   ├── test-utils.tsx
│   ├── mocks.ts
│   └── factories.ts
├── jest.config.js
├── jest.setup.js
└── package.json
```

## 🔧 Configuration des Tests

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

## 📋 Standards de Tests

### Nomenclature

- **Fichiers de tests** : `*.test.ts` (unitaires), `*.spec.ts` (E2E)
- **Groupes** : `@group unit`, `@group integration`, `@group e2e`
- **Descriptions** : Français, format "devrait [action attendue]"

### Structure des Tests

```typescript
describe('Composant/Fonctionnalité', () => {
  beforeEach(() => {
    // Configuration avant chaque test
  })

  describe('Cas de succès', () => {
    it('devrait [comportement attendu]', async () => {
      // Arrange
      const input = createTestData()

      // Act
      const result = await functionUnderTest(input)

      // Assert
      expect(result).toEqual(expectedOutput)
    })
  })

  describe("Cas d'erreur", () => {
    it("devrait gérer [cas d'erreur]", async () => {
      // Test des cas d'erreur
    })
  })
})
```

### Mocks et Factories

```typescript
// Utiliser des factories pour les données de test
const user = userFactory.build({ email: 'specific@test.com' })

// Mocker les dépendances externes
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: mockSession })),
}))
```

## 🚀 Processus TDD pour Nouvelles Fonctionnalités

### 1. **Red** - Écrire le Test qui Échoue

```typescript
// 1. Créer le test d'abord
describe('TenderService', () => {
  it("devrait créer un appel d'offres", async () => {
    const tender = await tenderService.create(validTenderData)
    expect(tender.status).toBe('draft')
  })
})
```

### 2. **Green** - Écrire le Code Minimal

```typescript
// 2. Implémenter le code minimal pour passer le test
class TenderService {
  async create(data) {
    return { status: 'draft' }
  }
}
```

### 3. **Refactor** - Améliorer le Code

```typescript
// 3. Refactoriser sans casser les tests
class TenderService {
  async create(data: CreateTenderInput): Promise<Tender> {
    const validatedData = validateTenderInput(data)
    return await this.repository.create(validatedData)
  }
}
```

## 📊 Couverture de Code

### Seuils Requis

- **Branches** : 80%
- **Fonctions** : 80%
- **Lignes** : 80%
- **Statements** : 80%

### Commandes

```bash
# Tests unitaires avec couverture
pnpm test:coverage

# Tests E2E
pnpm test:e2e

# Tests complets
pnpm test:all
```

## 🔍 Tests par Fonctionnalité

### Authentification ✅

- [x] **API Register** : Validation, création utilisateur/tenant
- [x] **API Signin** : Authentification, gestion erreurs
- [x] **Pages Auth** : Formulaires, validation, UX
- [x] **Flux complets** : Inscription → Connexion → Dashboard

### Appels d'Offres (À implémenter)

- [ ] **CRUD Tenders** : Création, lecture, mise à jour, suppression
- [ ] **Validation** : Données métier, permissions
- [ ] **Workflow** : Brouillon → Actif → Publié → Fermé
- [ ] **Interface** : Formulaires, listes, détails

### Candidats (À implémenter)

- [ ] **Gestion CV** : Upload, parsing, templates
- [ ] **Matching** : Algorithme de correspondance
- [ ] **Communication** : Messages, notifications
- [ ] **Rapports** : Statistiques, exports

## 🛠️ Outils et Utilitaires

### Factories de Test

```typescript
// Créer des données cohérentes
const user = userFactory.build()
const tenant = tenantFactory.build()
const tender = tenderFactory.build({ tenantId: tenant.id })
```

### Mocks MSW

```typescript
// Intercepter les requêtes HTTP
const server = setupServer(
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(ctx.json({ success: true }))
  })
)
```

### Utilitaires de Rendu

```typescript
// Render avec providers
render(<Component />, {
  session: createMockSession(),
  queryClient: new QueryClient()
})
```

## 🚦 CI/CD et Tests

### Pipeline de Tests

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm test:unit

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm test:e2e
```

### Quality Gates

- ✅ **Tests passent** : 100% des tests doivent passer
- ✅ **Couverture** : Minimum 80% sur toutes les métriques
- ✅ **Performance** : Tests E2E < 30s
- ✅ **Pas de régression** : Comparaison avec baseline

## 📚 Ressources et Formation

### Documentation

- [Jest Documentation](https://jestjs.io/docs)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [MSW (Mock Service Worker)](https://mswjs.io/)

### Bonnes Pratiques

- **AAA Pattern** : Arrange, Act, Assert
- **Test Isolation** : Chaque test est indépendant
- **Noms descriptifs** : Tests auto-documentés
- **Un seul concept** : Un test = une assertion principale
- **Données réalistes** : Factories avec données cohérentes

---

**🎯 Objectif** : Chaque nouvelle fonctionnalité doit avoir ses tests avant d'être mergée en production.

**📈 Évolution** : Cette stratégie évoluera avec les besoins du projet et les retours de l'équipe.
