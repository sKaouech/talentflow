# 🚀 Guide de Démarrage Rapide - TalentFlow

## ✅ Problèmes Résolus

- ✅ **Turborepo** : Configuration corrigée (`pipeline` → `tasks`)
- ✅ **PostgreSQL** : Port modifié vers 5433 pour éviter les conflits
- ✅ **Structure** : Tous les packages détectés correctement

## 📋 Étapes de Démarrage

### 1. Configuration de l'Environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Configuration de base de données (port modifié)
DATABASE_URL="postgresql://talentflow:talentflow_dev@localhost:5433/talentflow"

# Configuration Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Configuration Keycloak
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=talentflow
KEYCLOAK_CLIENT_ID=talentflow-api
KEYCLOAK_CLIENT_SECRET=dev-client-secret

# Configuration MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=talentflow
MINIO_SECRET_KEY=talentflow_dev

# Configuration API
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000

# Configuration Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# JWT Secret pour développement
JWT_SECRET=dev-jwt-secret-key-not-for-production
```

### 2. Démarrage de l'Infrastructure

```bash
# Démarrer PostgreSQL, Redis, Keycloak et MinIO
docker-compose up -d postgres redis keycloak minio

# Vérifier que les services sont démarrés
docker-compose ps
```

### 3. Configuration de la Base de Données

```bash
# Générer le client Prisma
pnpm turbo db:generate

# Créer la base de données et exécuter les migrations
pnpm turbo db:migrate
```

### 4. Démarrage du Développement

```bash
# Démarrer tous les services en mode développement
pnpm dev
```

## 🌐 URLs d'Accès

Une fois tout démarré, vous aurez accès à :

| Service               | URL                            | Identifiants              |
| --------------------- | ------------------------------ | ------------------------- |
| **Application Web**   | http://localhost:3000          | -                         |
| **API Documentation** | http://localhost:3001/api/docs | -                         |
| **Keycloak Admin**    | http://localhost:8080          | admin/admin               |
| **MinIO Console**     | http://localhost:9001          | talentflow/talentflow_dev |
| **n8n**               | http://localhost:5678          | admin/admin               |

## 🛠️ Commandes Utiles

### Développement

```bash
# Démarrer seulement l'API
pnpm turbo dev --filter=@talentflow/api

# Démarrer seulement le frontend
pnpm turbo dev --filter=@talentflow/web

# Linting
pnpm turbo lint

# Tests
pnpm turbo test

# Build
pnpm turbo build
```

### Base de Données

```bash
# Interface graphique Prisma Studio
pnpm turbo db:studio

# Reset de la base de données
pnpm turbo db:push --force-reset

# Voir les migrations
pnpm turbo db:migrate status
```

### Docker

```bash
# Voir les logs
docker-compose logs -f postgres
docker-compose logs -f keycloak

# Redémarrer un service
docker-compose restart postgres

# Nettoyer tout
docker-compose down -v
```

## 🔧 Configuration Keycloak (Première fois)

1. **Accéder à Keycloak** : http://localhost:8080
2. **Se connecter** : admin/admin
3. **Créer un realm** :
   - Nom : `talentflow`
   - Enabled : ON

4. **Créer un client** :
   - Client ID : `talentflow-api`
   - Client Protocol : `openid-connect`
   - Access Type : `confidential`
   - Valid Redirect URIs : `http://localhost:3001/*`

5. **Créer les rôles** :
   - `tenant_admin`
   - `manager`
   - `recruiter`
   - `viewer`

6. **Créer un utilisateur de test** :
   - Username : `test@talentflow.com`
   - Email : `test@talentflow.com`
   - Assign roles : `tenant_admin`

## 🐛 Dépannage

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres

# Vérifier les logs
docker-compose logs postgres

# Tester la connexion
psql postgresql://talentflow:talentflow_dev@localhost:5433/talentflow
```

### Erreur Turborepo

```bash
# Nettoyer le cache
pnpm turbo clean

# Réinstaller les dépendances
rm -rf node_modules
pnpm install
```

### Port déjà utilisé

```bash
# Vérifier les ports occupés
lsof -i :3000  # Frontend
lsof -i :3001  # API
lsof -i :5433  # PostgreSQL
```

## 📊 État des Packages

Tous les packages sont correctement configurés :

- ✅ `@talentflow/api` - API NestJS
- ✅ `@talentflow/web` - Application Next.js
- ✅ `@talentflow/database` - Client Prisma
- ✅ `@talentflow/validation` - Schémas Zod
- ✅ `@talentflow/shared` - Utilitaires communs
- ✅ `@talentflow/ui` - Composants UI

## 🎯 Prochaines Étapes

1. **Configurer Keycloak** (voir section ci-dessus)
2. **Tester l'API** : http://localhost:3001/api/docs
3. **Développer les fonctionnalités** métier
4. **Ajouter les tests** unitaires et d'intégration

---

**Projet prêt pour le développement !** 🚀

Pour toute question, consultez le [README principal](./README.md) ou la [documentation d'architecture](./docs/).
