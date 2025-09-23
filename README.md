# TalentFlow - Plateforme SaaS Multi-tenant

TalentFlow est une plateforme SaaS B2B conçue pour les ESN, cabinets de conseil et recruteurs. Elle centralise la gestion des appels d'offres et du vivier de candidats, avec des fonctionnalités d'automatisation et de génération de CV.

## 🏗️ Architecture

### Stack Technique

| Composant            | Technologie                | Justification                                                              |
| -------------------- | -------------------------- | -------------------------------------------------------------------------- |
| **Monorepo**         | Turborepo                  | Gestion unifiée du code, partage de types et dépendances                   |
| **Backend**          | NestJS + TypeScript        | Framework structuré, injection de dépendances, excellent pour l'entreprise |
| **Base de données**  | PostgreSQL + Prisma        | Fiabilité, performance, ORM type-safe                                      |
| **Validation**       | Zod                        | Validation de schémas end-to-end, partageable frontend/backend             |
| **Cache & Queues**   | Redis + BullMQ             | Performance, tâches asynchrones (génération PDF, webhooks)                 |
| **Frontend**         | Next.js 14 (App Router)    | Performance (RSC), SEO, framework unifié                                   |
| **UI**               | shadcn/ui + TailwindCSS    | Composants accessibles, design system cohérent                             |
| **State Management** | TanStack Query             | Gestion du state serveur, caching, optimistic updates                      |
| **Authentification** | Keycloak                   | Solution open-source, contrôle total, multi-tenant                         |
| **Stockage**         | MinIO/S3                   | Stockage distribué, compatible S3                                          |
| **Monitoring**       | OpenTelemetry + Prometheus | Observabilité complète (traces, logs, métriques)                           |
| **Déploiement**      | Docker + Kubernetes        | Scalabilité, reproductibilité                                              |

### Architecture Multi-tenant

- **Row Level Security (RLS)** : Isolation des données au niveau PostgreSQL
- **JWT avec claims personnalisés** : `tenant_id` et `role` injectés dans le token
- **Middleware Prisma** : Filtrage automatique par `tenant_id`
- **Guards NestJS** : Vérification des permissions par rôle

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd talentflow

# Installer les dépendances
pnpm install

# Copier la configuration
cp env.example .env.local

# Démarrer l'infrastructure avec Docker
docker-compose up -d postgres redis keycloak minio

# Générer le client Prisma
pnpm turbo db:generate

# Exécuter les migrations
pnpm turbo db:migrate

# Démarrer en mode développement
pnpm dev
```

### URLs d'accès

- **Application Web** : http://localhost:3000
- **API** : http://localhost:3001
- **Documentation API** : http://localhost:3001/api/docs
- **Keycloak Admin** : http://localhost:8080 (admin/admin)
- **MinIO Console** : http://localhost:9001 (talentflow/talentflow_dev)
- **n8n** : http://localhost:5678 (admin/admin)

## 📁 Structure du Projet

```
talentflow/
├── apps/
│   ├── api/                    # API NestJS
│   ├── web/                    # Application Next.js
│   └── mobile/                 # Application React Native (futur)
├── packages/
│   ├── database/               # Schéma Prisma et client
│   ├── validation/             # Schémas Zod partagés
│   ├── shared/                 # Utilitaires communs
│   └── ui/                     # Composants UI réutilisables
├── k8s/                        # Manifests Kubernetes
├── scripts/                    # Scripts d'automatisation
└── monitoring/                 # Configuration monitoring
```

## 🔐 Authentification & Autorisation

### **Stratégie Hybride : NextAuth.js → Keycloak**

**🚀 Phase Actuelle : NextAuth.js (Production Ready)**

- ✅ **Authentification complète** : Credentials + Google OAuth
- ✅ **Multi-tenant sécurisé** : Isolation par tenant avec Prisma
- ✅ **RBAC intégré** : Rôles et permissions granulaires
- ✅ **Interface moderne** : Pages `/auth/signin` et `/auth/signup`
- ✅ **Session management** : JWT sécurisés avec NextAuth.js

**🔄 Phase Future : Keycloak (Enterprise)**

- 🏗️ **Infrastructure préparée** : Docker + configuration de base
- 🏗️ **Migration planifiée** : Documentation complète disponible
- 🏗️ **Standards OpenID** : Intégrations enterprise futures

### Configuration Actuelle (NextAuth.js)

**Rôles Disponibles** :

- `tenant_admin` : Administration complète du tenant
- `manager` : Gestion des AO et candidats
- `recruiter` : Création/modification des AO
- `viewer` : Lecture seule

### Configuration Future (Keycloak)

**Realm** : `talentflow`
**Clients** :

- `talentflow-api` (backend)
- `talentflow-web` (frontend)

### Custom Claims JWT

```json
{
  "sub": "user-keycloak-id",
  "email": "user@example.com",
  "tenant_id": "tenant-cuid",
  "tenant_slug": "company-slug",
  "role": "manager",
  "permissions": ["tenders.create", "candidates.read", ...]
}
```

## 🛠️ Développement

### Commandes Utiles

```bash
# Développement
pnpm dev                        # Démarrer tous les services
pnpm dev --filter=@talentflow/api  # API seulement
pnpm dev --filter=@talentflow/web  # Web seulement

# Build
pnpm build                      # Build toutes les applications
pnpm turbo build --filter=api   # Build API seulement

# Tests
pnpm test                       # Tous les tests
pnpm test:watch                 # Mode watch
pnpm test:coverage              # Avec couverture

# Base de données
pnpm db:migrate                 # Migrations
pnpm db:generate                # Générer le client
pnpm db:studio                  # Interface graphique
pnpm db:seed                    # Données de test

# Linting
pnpm lint                       # ESLint
pnpm lint:fix                   # Correction automatique
pnpm type-check                 # Vérification TypeScript
```

### Ajout d'une Nouvelle Fonctionnalité

1. **Backend** :

   ```bash
   # Créer un nouveau module
   cd apps/api/src
   nest g module candidates
   nest g service candidates
   nest g controller candidates
   ```

2. **Frontend** :

   ```bash
   # Créer une nouvelle page
   mkdir apps/web/src/app/candidates
   touch apps/web/src/app/candidates/page.tsx
   ```

3. **Validation** :
   ```bash
   # Ajouter les schémas Zod
   touch packages/validation/src/candidate.ts
   ```

## 🔄 Intégrations

### n8n Workflows

Les workflows n8n permettent d'automatiser :

- Publication d'AO sur LinkedIn
- Scraping d'AO depuis des sites
- Notifications par email/Slack
- Synchronisation avec des CRM externes

#### Configuration d'un Workflow

1. **Créer un workflow dans n8n** (http://localhost:5678)
2. **Configurer le webhook trigger** :

   ```
   URL: http://localhost:5678/webhook/tender-publish
   Method: POST
   ```

3. **Exemple de payload** :

   ```json
   {
     "event": "tender.published",
     "data": {
       "id": "tender-id",
       "title": "Développeur Full-Stack",
       "content": "Description de la mission...",
       "skills": ["React", "Node.js"],
       "location": "Paris"
     },
     "tenant": {
       "id": "tenant-id",
       "name": "Mon Entreprise"
     }
   }
   ```

4. **Enregistrer le workflow dans l'API** :
   ```typescript
   // apps/api/src/tenders/tenders.service.ts
   async publish(id: string, tenantId: string) {
     const tender = await this.update(id, { status: 'active' }, tenantId)

     // Déclencher le workflow n8n
     await this.webhookService.trigger('tender.published', {
       tender,
       tenant: await this.getTenanttById(tenantId)
     })

     return tender
   }
   ```

### LinkedIn API

Pour publier automatiquement sur LinkedIn :

1. **Créer une application LinkedIn** (https://developer.linkedin.com)
2. **Configurer OAuth** dans Keycloak
3. **Stocker les tokens** dans `LinkedInAccount`
4. **Utiliser l'API LinkedIn** via n8n ou directement

## 🚢 Déploiement

### Environnements

- **Development** : Local avec Docker Compose
- **Staging** : Kubernetes sur cluster de test
- **Production** : Kubernetes sur cluster de production

### Pipeline CI/CD

Le pipeline GitLab CI/CD comprend :

1. **Install** : Installation des dépendances
2. **Lint** : Vérification du code (ESLint, TypeScript)
3. **Test** : Tests unitaires et d'intégration
4. **Build** : Build des applications et images Docker
5. **Security** : Scan de sécurité avec Trivy
6. **Deploy** : Déploiement sur Kubernetes

### Variables d'Environnement

Configurer dans GitLab CI/CD :

```bash
# Registry Docker
CI_REGISTRY=registry.gitlab.com/your-project
CI_REGISTRY_USER=gitlab-ci-token
CI_REGISTRY_PASSWORD=<token>

# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/db

# Keycloak
KEYCLOAK_AUTH_SERVER_URL=https://auth.yourcompany.com
KEYCLOAK_REALM=talentflow
KEYCLOAK_CLIENT_SECRET=<secret>

# Kubernetes
KUBE_CONTEXT_STAGING=staging-context
KUBE_CONTEXT_PRODUCTION=production-context

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## 📊 Monitoring

### Métriques Collectées

- **API** : Temps de réponse, taux d'erreur, throughput
- **Base de données** : Connexions, requêtes lentes, taille
- **Cache** : Hit rate, utilisation mémoire
- **Business** : Nombre d'AO, candidatures, publications

### Dashboards Grafana

- **Overview** : Vue d'ensemble du système
- **API Performance** : Métriques de l'API
- **Database** : Performance PostgreSQL
- **Business Metrics** : KPIs métier

## 🧪 Tests

### Types de Tests

- **Unitaires** : Services, utilitaires
- **Intégration** : Controllers, base de données
- **E2E** : Parcours utilisateur complets

### Stratégie de Test

```typescript
// Test unitaire d'un service
describe('TendersService', () => {
  it('should create a tender', async () => {
    const tender = await service.create(createTenderDto, 'tenant-id')
    expect(tender).toBeDefined()
    expect(tender.tenantId).toBe('tenant-id')
  })
})

// Test d'intégration d'un controller
describe('TendersController (e2e)', () => {
  it('/tenders (POST)', () => {
    return request(app.getHttpServer())
      .post('/tenders')
      .set('Authorization', `Bearer ${jwt}`)
      .send(createTenderDto)
      .expect(201)
  })
})
```

## 🤝 Contribution

### Workflow de Développement

1. **Créer une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
2. **Développer** : Implémenter la fonctionnalité
3. **Tester** : `pnpm test`
4. **Linter** : `pnpm lint:fix`
5. **Commit** : Messages conventionnels (feat, fix, docs, etc.)
6. **Push** : `git push origin feature/nouvelle-fonctionnalite`
7. **Merge Request** : Créer une MR vers `develop`

### Standards de Code

- **TypeScript strict** : Tous les types doivent être définis
- **ESLint + Prettier** : Formatage automatique
- **Commits conventionnels** : `feat:`, `fix:`, `docs:`, etc.
- **Tests obligatoires** : Couverture minimum 80%

## 📚 Ressources

### Documentation Technique

- [Architecture Decision Records](./docs/adr/)
- [API Documentation](http://localhost:3001/api/docs)
- [Database Schema](./packages/database/prisma/schema.prisma)

### Liens Utiles

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [n8n Documentation](https://docs.n8n.io/)

## 🆘 Support

### Problèmes Courants

**Base de données non accessible**

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres
# Recréer le container si nécessaire
docker-compose up -d --force-recreate postgres
```

**Erreur de génération Prisma**

```bash
# Regénérer le client
pnpm db:generate
# Vérifier la connexion
pnpm db:studio
```

**Problème d'authentification**

```bash
# Vérifier Keycloak
curl http://localhost:8080/realms/talentflow/.well-known/openid_configuration
```

### Contact

- **Email** : dev@talentflow.com
- **Slack** : #talentflow-dev
- **Issues** : [GitLab Issues](https://gitlab.com/your-project/issues)

---

**Version** : 1.0.0  
**Dernière mise à jour** : $(date)  
**Équipe** : TalentFlow Development Team

## 🚀 Premier Déploiement Automatique Testé

Infrastructure TalentFlow entièrement configurée et prête pour la production !

### ✅ Fonctionnalités Déployées

- Authentification NextAuth.js + Prisma
- Tests automatisés (Jest + Playwright)
- CI/CD GitHub Actions (8 jobs)
- Docker multi-stage optimisé
- Monitoring Prometheus + Grafana
- Sécurité enterprise (SSL + Firewall)

### 🌐 URLs

- **DEV** : https://talentflow-dev.seyka.fr
- **PROD** : https://talentflow.seyka.fr

Date: Tue Sep 23 23:40:49 CEST 2025
