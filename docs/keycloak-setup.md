# Configuration Keycloak pour TalentFlow

## 🎯 Objectif

Préparer l'infrastructure Keycloak pour une migration future depuis NextAuth.js vers une solution d'authentification enterprise.

## 🚀 Démarrage Rapide

### 1. Lancer Keycloak

```bash
docker-compose up -d keycloak
```

### 2. Accès Admin

- **URL** : http://localhost:8080
- **Username** : admin
- **Password** : admin

## 🏗️ Configuration Initiale

### 1. Créer le Realm TalentFlow

1. Aller dans **Master** → **Add realm**
2. Nom : `talentflow`
3. Activer : **Enabled**

### 2. Créer les Clients

#### Client API (Backend)

- **Client ID** : `talentflow-api`
- **Client Protocol** : `openid-connect`
- **Access Type** : `confidential`
- **Valid Redirect URIs** : `http://localhost:3001/*`
- **Web Origins** : `http://localhost:3001`

#### Client Web (Frontend)

- **Client ID** : `talentflow-web`
- **Client Protocol** : `openid-connect`
- **Access Type** : `public`
- **Valid Redirect URIs** : `http://localhost:3000/*`
- **Web Origins** : `http://localhost:3000`

### 3. Configurer les Rôles

#### Rôles Realm

- `tenant_admin` : Administration complète du tenant
- `manager` : Gestion des équipes et projets
- `recruiter` : Gestion des candidats et appels d'offres
- `viewer` : Lecture seule

#### Rôles Client (talentflow-api)

- `api.read` : Lecture des données
- `api.write` : Écriture des données
- `api.admin` : Administration

### 4. Mapper les Attributs Utilisateur

#### Mappers à créer

- **tenant_id** : Attribut personnalisé pour le multi-tenant
- **permissions** : Liste des permissions granulaires
- **preferences** : Préférences utilisateur

## 🔧 Configuration Technique

### Variables d'Environnement

```env
# Keycloak Configuration
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=talentflow
KEYCLOAK_CLIENT_ID=talentflow-api
KEYCLOAK_CLIENT_SECRET=your-client-secret-from-keycloak
KEYCLOAK_WEB_CLIENT_ID=talentflow-web

# NextAuth.js avec Keycloak (future migration)
NEXTAUTH_KEYCLOAK_ID=talentflow-web
NEXTAUTH_KEYCLOAK_SECRET=your-web-client-secret
NEXTAUTH_KEYCLOAK_ISSUER=http://localhost:8080/realms/talentflow
```

### Configuration NextAuth.js (Migration Future)

```typescript
import KeycloakProvider from 'next-auth/providers/keycloak'

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXTAUTH_KEYCLOAK_ID!,
      clientSecret: process.env.NEXTAUTH_KEYCLOAK_SECRET!,
      issuer: process.env.NEXTAUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
}
```

## 🔄 Plan de Migration

### Phase 1 : Préparation (Actuelle)

- ✅ Infrastructure Keycloak prête
- ✅ Configuration de base documentée
- ✅ NextAuth.js opérationnel

### Phase 2 : Migration Utilisateurs

1. **Export des utilisateurs** depuis la base Prisma
2. **Import dans Keycloak** avec script automatisé
3. **Mapping des rôles** et permissions
4. **Tests de connexion** parallèles

### Phase 3 : Migration Code

1. **Mise à jour NextAuth.js** avec provider Keycloak
2. **Adaptation de l'API** NestJS pour JWT Keycloak
3. **Tests d'intégration** complets
4. **Déploiement progressif**

### Phase 4 : Nettoyage

1. **Suppression de l'ancien système** d'auth
2. **Cleanup de la base** de données
3. **Documentation mise à jour**

## 🧪 Tests de Validation

### Tests Keycloak

```bash
# Test de connexion admin
curl -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli"

# Test du realm talentflow
curl http://localhost:8080/realms/talentflow/.well-known/openid_configuration
```

### Tests d'Intégration

- **Connexion utilisateur** via Keycloak
- **Récupération des tokens** JWT
- **Validation des permissions** dans l'API
- **Refresh tokens** automatique

## 🚨 Points d'Attention

### Sécurité

- **Secrets clients** à générer et sécuriser
- **HTTPS obligatoire** en production
- **Rotation des tokens** configurée
- **Rate limiting** sur les endpoints auth

### Performance

- **Connection pooling** vers Keycloak
- **Cache des tokens** JWT
- **Monitoring** des temps de réponse
- **Fallback** en cas d'indisponibilité

### Multi-tenant

- **Isolation des données** par tenant
- **Mapping tenant_id** dans les claims JWT
- **Permissions granulaires** par tenant

## 📚 Ressources

- [Keycloak Admin Console](http://localhost:8080)
- [Documentation Keycloak](https://www.keycloak.org/documentation)
- [NextAuth.js Keycloak Provider](https://next-auth.js.org/providers/keycloak)
- [NestJS Keycloak Integration](https://github.com/ferrerojosh/nest-keycloak-connect)

---

**Note** : Cette configuration est préparée mais **non active**. Le système actuel utilise NextAuth.js avec credentials. La migration vers Keycloak se fera lors d'une phase ultérieure du projet.
