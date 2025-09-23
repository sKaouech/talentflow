# 🚀 Guide de Déploiement TalentFlow

## 📋 **Vue d'ensemble**

Ce guide décrit le processus de déploiement automatisé de TalentFlow sur le serveur Hostinger (148.230.114.13) avec une approche DevOps moderne incluant CI/CD, Docker, et monitoring.

## 🏗️ **Architecture de Déploiement**

### **Environnements**
- **Développement** : `develop` branch → Port 3000/3001
- **Production** : `main` branch → Port 80/443 (via Nginx)

### **Services Déployés**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Web App       │    │   API Backend   │
│   (Port 80/443) │────│   (Port 3000)   │────│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │     MinIO       │
│   (Port 5432)   │    │   (Port 6379)   │    │   (Port 9000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Prérequis**

### **Serveur Hostinger**
- **OS** : Ubuntu 20.04+ ou CentOS 8+
- **RAM** : Minimum 4GB (recommandé 8GB)
- **Stockage** : Minimum 50GB SSD
- **Accès** : SSH root ou utilisateur sudo

### **GitHub Repository**
- Repository configuré avec les secrets nécessaires
- Actions GitHub activées

### **Domaines (Optionnel)**
- `talentflow.com` → Production
- `dev.talentflow.com` → Développement
- `api.talentflow.com` → API
- `files.talentflow.com` → MinIO

## ⚙️ **Configuration GitHub Secrets**

Configurez ces secrets dans votre repository GitHub (`Settings > Secrets and Variables > Actions`) :

### **Secrets SSH**
```bash
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----

SERVER_USER=root
DEV_SERVER_HOST=148.230.114.13
PROD_SERVER_HOST=148.230.114.13
```

### **URLs d'environnement**
```bash
DEV_URL=http://148.230.114.13:3000
PROD_URL=https://talentflow.com
```

### **Tokens et Services**
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
CODECOV_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx
```

## 🐳 **Structure Docker**

### **Images Multi-Stage**
```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS base
FROM base AS deps          # Dépendances
FROM base AS packages-builder  # Build packages
FROM base AS api-builder   # Build API
FROM base AS web-builder   # Build Web
FROM base AS api-runtime   # Runtime API
FROM base AS web-runtime   # Runtime Web (final)
```

### **Optimisations**
- **Multi-stage builds** : Réduction taille image
- **Non-root user** : Sécurité renforcée
- **Layer caching** : Build plus rapide
- **Health checks** : Monitoring intégré

## 🚀 **Processus de Déploiement**

### **1. Déploiement Automatique (Recommandé)**

Le déploiement se fait automatiquement via GitHub Actions :

```bash
# Push vers develop → Déploiement DEV
git push origin develop

# Push vers main → Déploiement PROD
git push origin main
```

### **2. Déploiement Manuel**

Si nécessaire, utilisez le script de déploiement :

```bash
# Déploiement développement
./scripts/deploy.sh dev

# Déploiement production
./scripts/deploy.sh prod
```

### **3. Pipeline CI/CD**

```mermaid
graph LR
    A[Push Code] --> B[Tests Unitaires]
    B --> C[Tests E2E]
    C --> D[Build Docker]
    D --> E[Security Scan]
    E --> F[Deploy DEV/PROD]
    F --> G[Smoke Tests]
    G --> H[Notification]
```

## 📊 **Monitoring et Logs**

### **Services de Monitoring**
- **Prometheus** : Métriques système
- **Grafana** : Dashboards et alertes
- **Logs** : Centralisés via Docker

### **Accès Monitoring**
```bash
# Grafana (si activé)
http://148.230.114.13:3002
# Admin: admin / [voir GRAFANA_PASSWORD]

# Prometheus (si activé)
http://148.230.114.13:9090
```

### **Commandes de Monitoring**
```bash
# Se connecter au serveur
ssh root@148.230.114.13

# Voir les logs en temps réel
cd /opt/talentflow/dev  # ou prod
docker-compose logs -f

# Statut des services
docker-compose ps

# Métriques système
docker stats

# Espace disque
df -h
```

## 🔒 **Sécurité**

### **Mesures Implémentées**
- **Firewall UFW** : Ports 22, 80, 443 ouverts
- **Fail2ban** : Protection brute force
- **Non-root containers** : Isolation sécurisée
- **SSL/TLS** : Certificats Let's Encrypt
- **Rate limiting** : Protection DDoS
- **Headers sécurité** : HSTS, CSP, etc.

### **SSL/TLS Configuration**
```bash
# Installation Certbot (automatique via script)
sudo apt install certbot python3-certbot-nginx

# Génération certificats (manuel si domaines configurés)
sudo certbot --nginx -d talentflow.com -d www.talentflow.com

# Renouvellement automatique (cron configuré)
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📁 **Structure des Répertoires**

```
/opt/talentflow/
├── dev/                          # Environnement développement
│   ├── docker-compose.yml
│   ├── .env
│   └── logs/
├── prod/                         # Environnement production
│   ├── docker-compose.yml
│   ├── .env
│   ├── nginx/
│   └── ssl/
├── data/                         # Données persistantes
│   ├── postgres/
│   ├── redis/
│   ├── uploads/
│   └── minio/
├── logs/                         # Logs applicatifs
│   ├── api/
│   └── nginx/
└── backups/                      # Sauvegardes DB
```

## 🔧 **Commandes Utiles**

### **Gestion des Services**
```bash
# Démarrer tous les services
docker-compose up -d

# Redémarrer un service spécifique
docker-compose restart web-prod

# Voir les logs d'un service
docker-compose logs -f api-prod

# Mise à jour des images
docker-compose pull
docker-compose up -d --remove-orphans

# Nettoyage
docker system prune -f
docker image prune -f
```

### **Base de Données**
```bash
# Backup manuel
docker-compose exec postgres-prod pg_dump -U talentflow_prod talentflow_prod > backup.sql

# Restauration
cat backup.sql | docker-compose exec -T postgres-prod psql -U talentflow_prod talentflow_prod

# Accès psql
docker-compose exec postgres-prod psql -U talentflow_prod talentflow_prod
```

### **Debug et Maintenance**
```bash
# Entrer dans un conteneur
docker-compose exec web-prod sh

# Vérifier la santé des services
docker-compose exec api-prod curl http://localhost:3001/api/health

# Surveiller les ressources
htop
docker stats
```

## 🚨 **Résolution de Problèmes**

### **Problèmes Courants**

#### **Service ne démarre pas**
```bash
# Vérifier les logs
docker-compose logs service-name

# Vérifier la configuration
docker-compose config

# Redémarrer le service
docker-compose restart service-name
```

#### **Base de données inaccessible**
```bash
# Vérifier PostgreSQL
docker-compose exec postgres-prod pg_isready -U talentflow_prod

# Vérifier les connexions
docker-compose exec api-prod nc -zv postgres-prod 5432
```

#### **Problème de mémoire**
```bash
# Vérifier l'utilisation
free -h
docker stats

# Redémarrer les services gourmands
docker-compose restart web-prod api-prod
```

### **Rollback d'urgence**
```bash
# Via script automatique
./scripts/deploy.sh prod --rollback

# Manuel
cd /opt/talentflow/prod
mv docker-compose.yml docker-compose.failed.yml
mv docker-compose.backup.yml docker-compose.yml
docker-compose up -d --remove-orphans
```

## 📋 **Checklist de Déploiement**

### **Avant le Premier Déploiement**
- [ ] Serveur configuré avec Docker
- [ ] Secrets GitHub configurés
- [ ] Domaines pointés (si applicable)
- [ ] Certificats SSL générés
- [ ] Firewall configuré

### **Pour Chaque Déploiement**
- [ ] Tests passent en CI
- [ ] Images Docker buildées
- [ ] Variables d'environnement à jour
- [ ] Backup de la base de données
- [ ] Notification équipe

### **Après Déploiement**
- [ ] Services démarrés correctement
- [ ] Health checks OK
- [ ] Tests de fumée passent
- [ ] Monitoring opérationnel
- [ ] Logs sans erreurs

## 🎯 **Prochaines Améliorations**

### **Court Terme**
- [ ] Backup automatique base de données
- [ ] Alertes Slack/Email
- [ ] Dashboard Grafana personnalisé

### **Moyen Terme**
- [ ] Déploiement Blue-Green
- [ ] Auto-scaling horizontal
- [ ] CDN pour assets statiques

### **Long Terme**
- [ ] Migration vers Kubernetes
- [ ] Multi-région deployment
- [ ] Disaster recovery

---

## 📞 **Support**

Pour toute question ou problème :
1. Consultez les logs : `docker-compose logs -f`
2. Vérifiez le monitoring : Grafana dashboard
3. Contactez l'équipe DevOps

**🚀 TalentFlow est maintenant prêt pour un déploiement professionnel !**
