# 🧪 Guide des Tests TalentFlow

## 🚀 Infrastructure de Tests Mise en Place

### ✅ **Configuration Complète**

L'infrastructure de tests TalentFlow est maintenant entièrement configurée avec :

- **🔧 Jest + Testing Library** : Tests unitaires et d'intégration
- **🎭 Playwright** : Tests End-to-End
- **🏭 MSW (Mock Service Worker)** : Mock des APIs
- **📊 Coverage Reports** : Couverture de code
- **🎯 Factories** : Génération de données de test

## 📁 **Structure Créée**

```
talentflow/
├── packages/testing/              # ✅ Package de test partagé
│   ├── src/
│   │   ├── test-utils.tsx         # Utilitaires de rendu
│   │   ├── mocks.ts               # Mocks MSW
│   │   └── factories.ts           # Factories de données
│   ├── jest.config.js             # Configuration Jest
│   └── jest.setup.js              # Setup global
│
├── apps/web/
│   ├── __tests__/                 # ✅ Tests unitaires
│   │   ├── api/auth/
│   │   │   └── register.test.ts   # Tests API register
│   │   └── components/auth/
│   │       ├── signin-page.test.tsx
│   │       └── signup-page.test.tsx
│   ├── __tests__/integration/     # ✅ Tests d'intégration
│   │   └── auth-flow.test.ts      # Flux d'authentification
│   ├── e2e/                       # ✅ Tests E2E
│   │   └── auth/
│   │       ├── signin.spec.ts
│   │       └── signup.spec.ts
│   ├── jest.config.js             # Config Jest Next.js
│   ├── jest.setup.js              # Setup spécifique web
│   └── playwright.config.ts       # Config Playwright
│
└── docs/
    └── testing-strategy.md        # ✅ Stratégie complète
```

## 🧪 **Tests Créés pour l'Authentification**

### **Tests Unitaires**
- ✅ **API Register** : Validation, création utilisateur/tenant, gestion erreurs
- ✅ **Page SignIn** : Rendu, validation, soumission, UX
- ✅ **Page SignUp** : Formulaire, validation, création de compte

### **Tests d'Intégration**
- ✅ **Flux d'authentification** : Transaction complète, sécurité, cas limites

### **Tests E2E**
- ✅ **Parcours d'inscription** : Validation, création, redirection
- ✅ **Parcours de connexion** : Authentication, erreurs, responsive

## 🚀 **Commandes de Tests**

### Installation et Démarrage
```bash
# Installer les dépendances (déjà fait)
pnpm install

# Lancer tous les tests
pnpm test:all

# Tests par type
pnpm test:unit        # Tests unitaires
pnpm test:integration # Tests d'intégration  
pnpm test:e2e         # Tests End-to-End

# Développement
pnpm test:watch       # Mode watch
pnpm test:coverage    # Avec couverture
```

### Tests Spécifiques
```bash
# Tests d'authentification uniquement
cd apps/web
pnpm test auth

# Tests avec pattern
pnpm test -- --testNamePattern="register"

# Tests E2E spécifiques
pnpm test:e2e auth/signin.spec.ts
```

## 📊 **Couverture de Code**

### **Seuils Configurés**
- **Branches** : 70-80%
- **Fonctions** : 70-80%
- **Lignes** : 70-80%
- **Statements** : 70-80%

### **Rapports**
```bash
# Générer rapport de couverture
pnpm test:coverage

# Ouvrir le rapport HTML
open apps/web/coverage/lcov-report/index.html
```

## 🎯 **Stratégie TDD pour Nouvelles Fonctionnalités**

### **Processus à Suivre**

#### 1. **Red** - Écrire le Test qui Échoue
```typescript
// Exemple pour nouvelle fonctionnalité Tenders
describe('TenderService', () => {
  it('devrait créer un appel d\'offres', async () => {
    const tender = await tenderService.create(validData)
    expect(tender.status).toBe('draft')
  })
})
```

#### 2. **Green** - Code Minimal qui Passe
```typescript
class TenderService {
  async create(data: CreateTenderInput) {
    return { status: 'draft' }
  }
}
```

#### 3. **Refactor** - Améliorer sans Casser
```typescript
class TenderService {
  async create(data: CreateTenderInput): Promise<Tender> {
    const validated = validateInput(data)
    return await this.repository.create(validated)
  }
}
```

### **Templates de Tests**

#### **Test Unitaire API**
```typescript
describe('POST /api/nouvelle-fonctionnalite', () => {
  it('devrait créer avec succès', async () => {
    // Arrange
    const mockData = factory.build()
    
    // Act
    const response = await POST(mockRequest)
    
    // Assert
    expect(response.status).toBe(201)
  })
})
```

#### **Test Composant React**
```typescript
describe('NouveauComposant', () => {
  it('devrait afficher correctement', () => {
    render(<NouveauComposant />)
    expect(screen.getByText(/attendu/i)).toBeInTheDocument()
  })
})
```

#### **Test E2E**
```typescript
test('devrait permettre la nouvelle action', async ({ page }) => {
  await page.goto('/nouvelle-page')
  await page.click('[data-testid="action"]')
  await expect(page).toHaveURL('/resultat')
})
```

## 🔧 **Utilitaires Disponibles**

### **Factories de Données**
```typescript
import { userFactory, tenantFactory } from '@talentflow/testing'

const user = userFactory.build({ email: 'test@example.com' })
const tenant = tenantFactory.build({ name: 'Test Corp' })
```

### **Mocks MSW**
```typescript
import { server, setupTestServer } from '@talentflow/testing'

setupTestServer() // Dans describe()

// Override pour test spécifique
server.use(
  rest.post('/api/endpoint', (req, res, ctx) => {
    return res(ctx.json({ custom: 'response' }))
  })
)
```

### **Render avec Providers**
```typescript
import { render, createMockSession } from '@talentflow/testing'

render(<Component />, {
  session: createMockSession({ role: 'admin' })
})
```

## 📚 **Prochaines Étapes**

### **Pour Chaque Nouvelle Fonctionnalité**

1. **📝 Écrire les tests d'abord** (TDD)
2. **🧪 Tests unitaires** : API + composants
3. **🔗 Tests d'intégration** : Flux métier
4. **🎭 Tests E2E** : Parcours critiques
5. **📊 Vérifier la couverture** : Minimum 70%

### **Exemples à Implémenter**

#### **Gestion des Appels d'Offres**
```bash
# Tests à créer
__tests__/api/tenders/
├── create.test.ts
├── update.test.ts
├── publish.test.ts
└── search.test.ts

__tests__/components/tenders/
├── tender-form.test.tsx
├── tender-list.test.tsx
└── tender-details.test.tsx

e2e/tenders/
├── create-tender.spec.ts
├── manage-tenders.spec.ts
└── publish-tender.spec.ts
```

#### **Gestion des Candidats**
```bash
# Tests à créer
__tests__/api/candidates/
├── create.test.ts
├── upload-cv.test.ts
└── matching.test.ts

e2e/candidates/
├── add-candidate.spec.ts
└── cv-management.spec.ts
```

## 🎯 **Objectifs de Qualité**

- ✅ **Chaque API** doit avoir ses tests unitaires
- ✅ **Chaque composant** doit avoir ses tests de rendu
- ✅ **Chaque flux métier** doit avoir ses tests d'intégration
- ✅ **Chaque parcours critique** doit avoir ses tests E2E
- ✅ **Couverture minimale** : 70% sur toutes les métriques

## 🚀 **Tests en Production**

### **CI/CD Pipeline**
```yaml
# Exemple GitHub Actions
- name: Tests Unitaires
  run: pnpm test:unit
- name: Tests d'Intégration  
  run: pnpm test:integration
- name: Tests E2E
  run: pnpm test:e2e
```

### **Quality Gates**
- 🚫 **Pas de merge** sans tests passants
- 🚫 **Pas de déploiement** sans couverture minimale
- 🚫 **Pas de régression** détectée

---

## 🎉 **Infrastructure de Tests Prête !**

**L'infrastructure de tests TalentFlow est maintenant complètement opérationnelle.**

**✅ Prêt pour le développement TDD de toutes les futures fonctionnalités !**

**📝 Suivez la stratégie documentée pour maintenir une qualité de code élevée.**
