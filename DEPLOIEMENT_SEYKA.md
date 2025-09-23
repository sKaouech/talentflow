# 🚀 Guide de Déploiement TalentFlow - Configuration Seyka.fr

## ✅ **Configuration Adaptée**

L'infrastructure CI/CD a été **entièrement adaptée** pour votre environnement :

- **🌐 Serveur** : `148.230.114.13` (Ubuntu + Docker)
- **🔑 SSH** : Clé ED25519 configurée
- **🌍 Domaines** :
  - **DEV** : `talentflow-dev.seyka.fr`
  - **PROD** : `talentflow.seyka.fr`
- **🗄️ Base de données** : PostgreSQL sur le même serveur

## 🎯 **Étapes de Déploiement**

### **1. Configuration Initiale du Serveur** ⚡

Exécutez le script de configuration automatique :

```bash
# Depuis votre machine locale
./scripts/setup-server.sh
```

**Ce script va automatiquement :**

- ✅ Configurer votre clé SSH
- ✅ Mettre à jour Ubuntu
- ✅ Vérifier Docker et Docker Compose
- ✅ Configurer le firewall UFW
- ✅ Installer et configurer Fail2ban
- ✅ Créer la structure de répertoires
- ✅ Générer les certificats SSL Let's Encrypt
- ✅ Configurer Nginx temporairement

### **2. Configuration GitHub Secrets** 🔐

Dans votre repository GitHub, allez dans `Settings > Secrets and Variables > Actions` et ajoutez :

```bash
# SSH Configuration
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
MIIEowIBAAIBAAIBAQC2hrrxgIEb3SVusrySybXhVtd/fqWpyjdnA96TQZ0Xyi...
-----END OPENSSH PRIVATE KEY-----

SERVER_USER=root
DEV_SERVER_HOST=148.230.114.13
PROD_SERVER_HOST=148.230.114.13

# URLs
DEV_URL=https://talentflow-dev.seyka.fr
PROD_URL=https://talentflow.seyka.fr

# Optional: Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx
CODECOV_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### **3. Déploiement Automatique** 🚀

```bash
# Déploiement DEV
git add .
git commit -m "feat: configuration pour seyka.fr"
git push origin develop
# → Déploiement automatique sur talentflow-dev.seyka.fr

# Déploiement PROD (quand prêt)
git checkout main
git merge develop
git push origin main
# → Déploiement automatique sur talentflow.seyka.fr
```

## 🌍 **Accès aux Services**

### **Développement**

- 🌐 **Application** : `https://talentflow-dev.seyka.fr`
- 🔌 **API** : `https://talentflow-dev.seyka.fr/api`
- 📊 **Grafana** : `https://talentflow-dev.seyka.fr/grafana`

### **Production**

- 🌐 **Application** : `https://talentflow.seyka.fr`
- 🔌 **API** : `https://talentflow.seyka.fr/api`

## 📁 **Fichiers Adaptés**

### **Configuration Docker**

```
docker/
├── docker-compose.dev.yml     # ✅ URLs seyka.fr configurées
└── docker-compose.prod.yml    # ✅ URLs seyka.fr configurées
```

### **Configuration Nginx**

```
nginx/
├── nginx.conf                 # ✅ Domaines seyka.fr
└── sites-enabled/
    └── talentflow-dev.conf     # ✅ Config développement
```

### **Scripts**

```
scripts/
├── setup-server.sh           # ✅ Configuration automatique serveur
├── deploy.sh                 # ✅ Déploiement personnalisé
└── backup.sh                 # ✅ Sauvegarde automatique
```

## 🔧 **Commandes de Gestion**

### **Connexion au Serveur**

```bash
ssh root@148.230.114.13
```

### **Navigation**

```bash
# Environnement développement
cd /opt/talentflow/dev

# Environnement production
cd /opt/talentflow/prod
```

### **Gestion des Services**

```bash
# Statut des conteneurs
docker-compose ps

# Logs en temps réel
docker-compose logs -f

# Redémarrer un service
docker-compose restart web-dev

# Voir l'utilisation des ressources
docker stats

# Backup manuel
./scripts/backup.sh dev  # ou prod
```

### **Monitoring**

```bash
# Vérifier la santé des services
curl https://talentflow-dev.seyka.fr/health
curl https://talentflow-dev.seyka.fr/api/health

# Logs système
journalctl -u nginx -f
tail -f /opt/talentflow/logs/api/app.log
```

## 🔒 **Sécurité Configurée**

### **Firewall UFW**

```bash
# Ports ouverts :
22/tcp    # SSH
80/tcp    # HTTP (redirection HTTPS)
443/tcp   # HTTPS
3000/tcp  # Dev Web (temporaire)
3001/tcp  # Dev API (temporaire)
3002/tcp  # Dev Grafana (temporaire)
```

### **SSL/TLS**

- ✅ **Certificats Let's Encrypt** générés automatiquement
- ✅ **Renouvellement automatique** configuré
- ✅ **TLS 1.2/1.3** uniquement
- ✅ **HSTS** activé

### **Protection**

- ✅ **Fail2ban** contre les attaques brute force
- ✅ **Rate limiting** Nginx
- ✅ **Headers sécurisés** (XSS, CSRF, etc.)
- ✅ **Containers non-root**

## 📊 **Pipeline CI/CD**

### **Workflow GitHub Actions**

```
Push develop → Tests → Build → Deploy DEV → Tests Smoke
Push main    → Tests → Build → Deploy PROD → Tests Smoke
```

### **Jobs Exécutés**

1. **Tests & Quality** : Lint, TypeScript, Tests unitaires/intégration
2. **E2E Tests** : Tests Playwright
3. **Docker Build** : Images optimisées
4. **Security Scan** : Trivy vulnerability scanner
5. **Deploy DEV/PROD** : Déploiement automatique
6. **Smoke Tests** : Validation post-déploiement
7. **Notifications** : Slack (si configuré)

## 🎯 **Environnements Configurés**

### **Développement** (`talentflow-dev.seyka.fr`)

- 🔧 **Branch** : `develop`
- 🌐 **URL** : `https://talentflow-dev.seyka.fr`
- 📊 **Monitoring** : Grafana accessible
- 🔍 **Logs** : Niveau debug
- 🚫 **Rate limiting** : Permissif (50 req/s)

### **Production** (`talentflow.seyka.fr`)

- 🏭 **Branch** : `main`
- 🌐 **URL** : `https://talentflow.seyka.fr`
- 📊 **Monitoring** : Sécurisé
- 🔍 **Logs** : Niveau info
- 🚫 **Rate limiting** : Strict (10 req/s)

## 🚨 **Résolution de Problèmes**

### **Problèmes SSL**

```bash
# Vérifier les certificats
certbot certificates

# Renouveler manuellement
certbot renew --nginx

# Tester la configuration
nginx -t
```

### **Problèmes Docker**

```bash
# Vérifier les logs
docker-compose logs service-name

# Redémarrer tous les services
docker-compose down && docker-compose up -d

# Nettoyer les images
docker system prune -f
```

### **Problèmes de Déploiement**

```bash
# Vérifier les GitHub Actions
# → Aller dans l'onglet Actions de votre repo

# Déploiement manuel d'urgence
./scripts/deploy.sh dev  # ou prod

# Rollback
cd /opt/talentflow/prod
mv docker-compose.yml docker-compose.failed.yml
mv docker-compose.backup.yml docker-compose.yml
docker-compose up -d
```

## 📈 **Métriques et Monitoring**

### **Dashboards Disponibles**

- 📊 **Grafana** : Métriques système et application
- 🔍 **Logs** : Centralisés dans `/opt/talentflow/logs/`
- 📈 **Prometheus** : Métriques temps réel
- 🚨 **Alertes** : Notifications automatiques

### **KPIs Surveillés**

- ⚡ **Performance** : Temps de réponse API/Web
- 💾 **Ressources** : CPU, RAM, Disque
- 🌐 **Réseau** : Bande passante, latence
- 🔒 **Sécurité** : Tentatives d'intrusion
- 📊 **Business** : Utilisateurs actifs, erreurs

## 🎉 **Configuration Complète !**

### ✅ **Prêt à Déployer**

Votre infrastructure TalentFlow est maintenant :

1. **🔧 Configurée** pour vos domaines seyka.fr
2. **🔐 Sécurisée** avec SSL, firewall, et protection
3. **🚀 Automatisée** avec CI/CD GitHub Actions
4. **📊 Monitorée** avec Prometheus/Grafana
5. **📝 Documentée** avec guides détaillés

### 🚀 **Prochaines Étapes**

1. **Exécutez** `./scripts/setup-server.sh`
2. **Configurez** les GitHub Secrets
3. **Poussez** votre code vers `develop`
4. **Vérifiez** le déploiement sur `https://talentflow-dev.seyka.fr`
5. **Déployez** en production via `main`

---

## 📞 **Support**

**En cas de problème :**

1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez GitHub Actions pour les erreurs CI/CD
3. Testez la connectivité : `curl https://talentflow-dev.seyka.fr/health`

**🎯 Votre plateforme TalentFlow est maintenant prête pour un déploiement professionnel sur vos domaines seyka.fr !**

**Souhaitez-vous que je lance le script de configuration du serveur maintenant ?**
