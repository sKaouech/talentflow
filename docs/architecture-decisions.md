# Architecture Decision Records (ADR)

Ce document recense les principales décisions d'architecture prises pour TalentFlow et leur justification.

## ADR-001 : API Architecture - REST vs tRPC

**Date** : 2024-01-15  
**Statut** : ✅ Accepté  
**Décideurs** : Équipe Architecture

### Contexte

Le choix entre REST et tRPC pour l'architecture API, dans un contexte de monorepo TypeScript avec multi-tenancy.

### Décision

**Choix : REST + OpenAPI**

### Justification

| Critère | tRPC | REST + OpenAPI | Gagnant |
|---------|------|----------------|---------|
| **DX (Developer Experience)** | ⭐⭐⭐⭐⭐ Type safety end-to-end | ⭐⭐⭐ Bonne avec codegen | tRPC |
| **Intégrations tierces** | ⭐⭐ Limité aux clients TypeScript | ⭐⭐⭐⭐⭐ Universel | **REST** |
| **n8n Compatibility** | ⭐⭐ Nécessite des adaptateurs | ⭐⭐⭐⭐⭐ Support natif | **REST** |
| **Future-proof** | ⭐⭐⭐ Dépendant de l'adoption | ⭐⭐⭐⭐⭐ Standard universel | **REST** |
| **Équipes mixtes** | ⭐⭐ Expertise TypeScript requise | ⭐⭐⭐⭐ Plus accessible | **REST** |

### Conséquences

- **Positives** :
  - Compatibilité native avec n8n pour l'automatisation
  - Facilité d'intégration pour les clients externes
  - Documentation automatique avec Swagger
  - Monitoring standard avec Prometheus

- **Négatives** :
  - Plus de boilerplate pour la validation
  - Type safety moins stricte entre frontend/backend
  - Nécessité de maintenir les schémas OpenAPI

### Implémentation

- NestJS avec décorateurs Swagger
- Validation Zod partagée entre frontend/backend
- Génération automatique de la documentation API
- Client TypeScript généré pour le frontend

---

## ADR-002 : Authentification - Keycloak vs Auth0

**Date** : 2024-01-15  
**Statut** : ✅ Accepté  
**Décideurs** : Équipe Architecture, Product Owner

### Contexte

Choix de la solution d'authentification pour une plateforme SaaS multi-tenant avec besoins de customisation.

### Décision

**Choix : Keycloak**

### Justification

| Critère | Keycloak | Auth0 | Gagnant |
|---------|----------|-------|---------|
| **Coût** | ⭐⭐⭐⭐⭐ Open source | ⭐⭐ $23/mois + $0.02/MAU | **Keycloak** |
| **Data sovereignty** | ⭐⭐⭐⭐⭐ Contrôle total | ⭐⭐ Données chez un tiers | **Keycloak** |
| **Customisation** | ⭐⭐⭐⭐⭐ Flexibilité totale | ⭐⭐⭐ Options limitées | **Keycloak** |
| **Multi-tenant** | ⭐⭐⭐⭐ Realms + custom claims | ⭐⭐⭐⭐ Organizations + metadata | Égalité |
| **Simplicité** | ⭐⭐ Configuration complexe | ⭐⭐⭐⭐⭐ Plug & play | Auth0 |

### Conséquences

- **Positives** :
  - Économies significatives à l'échelle (> 1000 utilisateurs)
  - Contrôle total des données d'authentification
  - Customisation complète des flows d'authentification
  - Injection facile de claims personnalisés (tenant_id, role)

- **Négatives** :
  - Complexité de configuration initiale
  - Maintenance et mises à jour manuelles
  - Courbe d'apprentissage plus élevée

### Implémentation

- Realm `talentflow` avec clients séparés (api, web, mobile)
- Custom claims : `tenant_id`, `role`, `permissions`
- Intégration NestJS via `nest-keycloak-connect`
- Mappers personnalisés pour les rôles tenant-specific

---

## ADR-003 : Multi-tenancy Strategy - Database per Tenant vs Shared Database

**Date** : 2024-01-15  
**Statut** : ✅ Accepté  
**Décideurs** : Équipe Architecture, DBA

### Contexte

Stratégie de multi-tenancy pour isoler les données des différents clients tout en maintenant la performance.

### Décision

**Choix : Shared Database avec Row Level Security (RLS)**

### Justification

| Approche | Avantages | Inconvénients | Score |
|----------|-----------|---------------|-------|
| **Database per Tenant** | Isolation totale, backup granulaire | Coût élevé, maintenance complexe | ⭐⭐ |
| **Schema per Tenant** | Isolation logique, coût modéré | Migrations complexes, limite PostgreSQL | ⭐⭐⭐ |
| **Shared DB + RLS** | Performance, simplicité, économique | Configuration initiale, risque de fuite | ⭐⭐⭐⭐⭐ |

### Implémentation

```sql
-- Exemple de politique RLS
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON tenders
    USING (tenant_id = current_setting('app.current_tenant_id'));
```

```typescript
// Middleware Prisma pour injection automatique
prisma.$use(async (params, next) => {
  if (tenantId && TENANT_MODELS.includes(params.model)) {
    if (params.action === 'findMany') {
      params.args.where = { ...params.args.where, tenantId }
    }
  }
  return next(params)
})
```

### Conséquences

- **Positives** :
  - Performance optimale (une seule base)
  - Coût d'infrastructure réduit
  - Simplicité des migrations
  - Backup et monitoring unifiés

- **Négatives** :
  - Risque théorique de fuite de données
  - Nécessité de tests rigoureux de l'isolation
  - Complexité de debug en cas de problème

---

## ADR-004 : State Management Frontend - Redux vs Zustand vs TanStack Query

**Date** : 2024-01-15  
**Statut** : ✅ Accepté  
**Décideurs** : Équipe Frontend

### Contexte

Gestion du state dans l'application Next.js, avec focus sur les données serveur et l'expérience développeur.

### Décision

**Choix : TanStack Query (React Query) pour le server state + useState/useReducer pour le client state**

### Justification

- **Server State** (95% des besoins) : TanStack Query excelle
- **Client State** (5% des besoins) : React hooks natifs suffisent
- **Performance** : Caching intelligent, background refetch
- **DX** : DevTools excellents, API simple
- **Maintenance** : Standard de l'industrie, communauté active

### Implémentation

```typescript
// Hook personnalisé pour les tenders
export function useTenders(filters: SearchTendersInput) {
  return useQuery({
    queryKey: ['tenders', filters],
    queryFn: () => tendersApi.search(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation avec optimistic updates
export function useCreateTender() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tendersApi.create,
    onSuccess: (newTender) => {
      queryClient.setQueryData(['tenders', newTender.id], newTender)
      queryClient.invalidateQueries(['tenders'])
    },
  })
}
```

---

## ADR-005 : Monorepo Tool - Lerna vs Nx vs Turborepo

**Date** : 2024-01-15  
**Statut** : ✅ Accepté  
**Décideurs** : Équipe DevOps

### Décision

**Choix : Turborepo**

### Justification

| Outil | Performance | DX | Écosystème | Simplicité | Score |
|-------|-------------|----|-----------|-----------:|-------|
| **Lerna** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Nx** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Turborepo** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### Avantages Turborepo

- **Performance** : Cache distribué, builds parallèles
- **Simplicité** : Configuration minimale
- **TypeScript-first** : Support natif excellent
- **Remote Caching** : Accélération CI/CD
- **Vercel Integration** : Déploiement optimisé

---

## ADR-006 : PDF Generation - Puppeteer vs Playwright vs PDFKit

**Date** : 2024-01-15  
**Statut** : ✅ Accepté  
**Décideurs** : Équipe Backend

### Contexte

Génération de CV PDF avec des designs complexes et personnalisables.

### Décision

**Choix : Puppeteer**

### Justification

| Solution | Qualité Rendu | Performance | Flexibilité | Maintenance |
|----------|---------------|-------------|-------------|-------------|
| **PDFKit** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **jsPDF** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Playwright** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Puppeteer** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### Implémentation

```typescript
@Injectable()
export class PDFGenerationService {
  async generateCV(candidate: Candidate, template: CVTemplate): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    
    const html = await this.renderTemplate(candidate, template)
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in' }
    })
    
    await browser.close()
    return pdf
  }
}
```

---

## ADR-007 : Deployment Strategy - Docker Compose vs Kubernetes

**Date** : 2024-01-15  
**Statut** : ✅ Accepté  
**Décideurs** : Équipe DevOps, CTO

### Décision

**Choix : Kubernetes pour production, Docker Compose pour développement**

### Justification

**Production** : Kubernetes
- Scalabilité automatique
- High availability
- Service mesh (Istio)
- Monitoring intégré
- Rolling deployments

**Développement** : Docker Compose
- Simplicité de setup
- Développement local rapide
- Coût réduit
- Debug facilité

### Implémentation

```yaml
# k8s/production/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: registry.gitlab.com/talentflow/api:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## Résumé des Décisions

| ADR | Décision | Statut | Impact |
|-----|----------|--------|--------|
| ADR-001 | REST + OpenAPI | ✅ | Architecture API |
| ADR-002 | Keycloak | ✅ | Authentification |
| ADR-003 | Shared DB + RLS | ✅ | Multi-tenancy |
| ADR-004 | TanStack Query | ✅ | State Management |
| ADR-005 | Turborepo | ✅ | Monorepo |
| ADR-006 | Puppeteer | ✅ | PDF Generation |
| ADR-007 | K8s + Docker Compose | ✅ | Déploiement |

---

## Process de Décision

### Template ADR

```markdown
# ADR-XXX : [Titre]

**Date** : YYYY-MM-DD  
**Statut** : [Proposé/Accepté/Rejeté/Supersédé]  
**Décideurs** : [Liste]

### Contexte
[Description du problème]

### Options Considérées
- Option 1
- Option 2
- Option 3

### Décision
[Choix final avec justification]

### Conséquences
**Positives** :
- [Liste]

**Négatives** :
- [Liste]
```

### Critères d'Évaluation

1. **Performance** : Impact sur les performances
2. **Maintenabilité** : Facilité de maintenance long terme
3. **Coût** : Impact financier (licences, infrastructure)
4. **Risque** : Niveau de risque technique
5. **Équipe** : Adéquation avec les compétences
6. **Évolutivité** : Capacité à évoluer avec les besoins

---

Cette documentation sera mise à jour au fur et à mesure des nouvelles décisions architecturales.
