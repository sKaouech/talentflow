#!/bin/bash

# ===================================
# Script de Déploiement TalentFlow
# Serveur: 148.230.114.13 (Hostinger)
# ===================================

set -euo pipefail

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_IP="${SERVER_IP:-148.230.114.13}"
SERVER_USER="${SERVER_USER:-root}"
ENVIRONMENT="${1:-dev}"

# Validation de l'environnement
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    echo -e "${RED}❌ Environnement invalide. Utilisez: dev ou prod${NC}"
    exit 1
fi

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier SSH
    if ! command -v ssh &> /dev/null; then
        error "SSH n'est pas installé"
    fi
    
    # Vérifier la connectivité au serveur
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" exit 2>/dev/null; then
        error "Impossible de se connecter au serveur $SERVER_IP"
    fi
    
    success "Prérequis validés"
}

# Installation des dépendances sur le serveur
install_server_dependencies() {
    log "Installation des dépendances sur le serveur..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Mise à jour du système
        apt-get update
        
        # Installation de Docker
        if ! command -v docker &> /dev/null; then
            echo "Installation de Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            usermod -aG docker $USER
            rm get-docker.sh
        fi
        
        # Installation de Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            echo "Installation de Docker Compose..."
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Installation d'autres outils utiles
        apt-get install -y curl wget git htop nano ufw fail2ban
        
        # Configuration du firewall
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        
        echo "✅ Dépendances installées avec succès"
EOF
    
    success "Dépendances installées sur le serveur"
}

# Préparation de l'environnement
setup_environment() {
    log "Préparation de l'environnement $ENVIRONMENT..."
    
    ssh "$SERVER_USER@$SERVER_IP" << EOF
        # Création des répertoires
        mkdir -p /opt/talentflow/$ENVIRONMENT
        mkdir -p /opt/talentflow/data/{postgres,redis,uploads,minio}
        mkdir -p /opt/talentflow/logs/{api,nginx}
        mkdir -p /opt/talentflow/backups
        mkdir -p /opt/talentflow/ssl
        
        # Permissions
        chown -R 1001:1001 /opt/talentflow/data
        chown -R 1001:1001 /opt/talentflow/logs
        chmod -R 755 /opt/talentflow
        
        cd /opt/talentflow/$ENVIRONMENT
EOF
    
    success "Environnement $ENVIRONMENT préparé"
}

# Copie des fichiers de configuration
copy_configs() {
    log "Copie des fichiers de configuration..."
    
    # Copie du docker-compose
    scp "$PROJECT_ROOT/docker/docker-compose.$ENVIRONMENT.yml" \
        "$SERVER_USER@$SERVER_IP:/opt/talentflow/$ENVIRONMENT/docker-compose.yml"
    
    # Copie des scripts
    scp -r "$PROJECT_ROOT/scripts/" \
        "$SERVER_USER@$SERVER_IP:/opt/talentflow/$ENVIRONMENT/"
    
    # Copie des configurations nginx (si prod)
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        scp -r "$PROJECT_ROOT/nginx/" \
            "$SERVER_USER@$SERVER_IP:/opt/talentflow/$ENVIRONMENT/"
    fi
    
    success "Fichiers de configuration copiés"
}

# Génération du fichier .env
generate_env_file() {
    log "Génération du fichier .env pour $ENVIRONMENT..."
    
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        ENV_TEMPLATE="$PROJECT_ROOT/.env.dev.example"
        PORT_WEB=3000
        PORT_API=3001
    else
        ENV_TEMPLATE="$PROJECT_ROOT/.env.prod.example"
        PORT_WEB=3000
        PORT_API=3001
    fi
    
    # Génération de mots de passe sécurisés
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    NEXTAUTH_SECRET=$(openssl rand -base64 64)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    
    # Création du fichier .env sur le serveur
    ssh "$SERVER_USER@$SERVER_IP" << EOF
        cd /opt/talentflow/$ENVIRONMENT
        
        cat > .env << 'ENVEOF'
# ===================================
# TalentFlow - Environnement $ENVIRONMENT
# Généré automatiquement le $(date)
# ===================================

# Base de données
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DATABASE_URL=postgresql://talentflow_$ENVIRONMENT:$POSTGRES_PASSWORD@postgres-$ENVIRONMENT:5432/talentflow_$ENVIRONMENT

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@redis-$ENVIRONMENT:6379

# Sécurité
JWT_SECRET=$JWT_SECRET
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# URLs
NEXTAUTH_URL=http://$SERVER_IP:$PORT_WEB
NEXT_PUBLIC_API_URL=http://$SERVER_IP:$PORT_API/api

# MinIO
MINIO_ROOT_USER=talentflow_$ENVIRONMENT
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)

# Email (à configurer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@talentflow.com

# OAuth (à configurer)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Monitoring
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Image Docker
IMAGE_TAG=ghcr.io/your-org/talentflow:${ENVIRONMENT}
ENVEOF

        chmod 600 .env
        echo "✅ Fichier .env généré"
EOF
    
    success "Fichier .env généré pour $ENVIRONMENT"
}

# Déploiement de l'application
deploy_application() {
    log "Déploiement de l'application..."
    
    ssh "$SERVER_USER@$SERVER_IP" << EOF
        cd /opt/talentflow/$ENVIRONMENT
        
        # Login au registry GitHub (si nécessaire)
        # echo \$GITHUB_TOKEN | docker login ghcr.io -u \$GITHUB_USERNAME --password-stdin
        
        # Pull des images
        docker-compose pull
        
        # Arrêt des anciens conteneurs
        docker-compose down --remove-orphans
        
        # Démarrage des nouveaux conteneurs
        docker-compose up -d
        
        # Attendre que les services soient prêts
        echo "⏳ Attente du démarrage des services..."
        sleep 60
        
        # Vérification de l'état des services
        docker-compose ps
        
        # Health checks
        echo "🔍 Vérification de la santé des services..."
        
        # Vérifier PostgreSQL
        if docker-compose exec -T postgres-$ENVIRONMENT pg_isready -U talentflow_$ENVIRONMENT; then
            echo "✅ PostgreSQL OK"
        else
            echo "❌ PostgreSQL KO"
        fi
        
        # Vérifier l'API
        if curl -f http://localhost:$PORT_API/api/health; then
            echo "✅ API OK"
        else
            echo "❌ API KO"
        fi
        
        # Vérifier l'application web
        if curl -f http://localhost:$PORT_WEB/; then
            echo "✅ Web App OK"
        else
            echo "❌ Web App KO"
        fi
EOF
    
    success "Application déployée"
}

# Fonction de rollback
rollback() {
    warning "Rollback en cours..."
    
    ssh "$SERVER_USER@$SERVER_IP" << EOF
        cd /opt/talentflow/$ENVIRONMENT
        
        # Restaurer la version précédente si disponible
        if [[ -f docker-compose.backup.yml ]]; then
            mv docker-compose.yml docker-compose.failed.yml
            mv docker-compose.backup.yml docker-compose.yml
            docker-compose up -d --remove-orphans
            echo "✅ Rollback effectué"
        else
            echo "❌ Aucune version de sauvegarde trouvée"
        fi
EOF
}

# Configuration SSL (pour prod)
setup_ssl() {
    if [[ "$ENVIRONMENT" != "prod" ]]; then
        return 0
    fi
    
    log "Configuration SSL pour la production..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Installation de Certbot
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
        
        # Génération des certificats SSL (à adapter selon vos domaines)
        # certbot --nginx -d talentflow.com -d www.talentflow.com
        
        # Cron job pour le renouvellement automatique
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        echo "✅ Configuration SSL préparée (certificats à générer manuellement)"
EOF
    
    success "Configuration SSL préparée"
}

# Affichage des informations de déploiement
show_deployment_info() {
    log "Informations de déploiement:"
    echo ""
    echo -e "${GREEN}🚀 Déploiement $ENVIRONMENT terminé avec succès!${NC}"
    echo ""
    echo -e "${BLUE}📋 Informations d'accès:${NC}"
    echo -e "   🌐 Application Web: http://$SERVER_IP:3000"
    echo -e "   🔌 API Backend:     http://$SERVER_IP:3001"
    echo -e "   📊 Monitoring:      http://$SERVER_IP:3002 (si activé)"
    echo ""
    echo -e "${YELLOW}🔧 Commandes utiles:${NC}"
    echo -e "   ssh $SERVER_USER@$SERVER_IP"
    echo -e "   cd /opt/talentflow/$ENVIRONMENT"
    echo -e "   docker-compose ps"
    echo -e "   docker-compose logs -f"
    echo ""
    echo -e "${YELLOW}⚠️  Configuration manuelle requise:${NC}"
    echo -e "   • Configurer les variables SMTP dans .env"
    echo -e "   • Configurer OAuth Google/GitHub"
    echo -e "   • Générer les certificats SSL (prod)"
    echo ""
}

# Fonction principale
main() {
    log "🚀 Début du déploiement TalentFlow - Environnement: $ENVIRONMENT"
    
    check_prerequisites
    install_server_dependencies
    setup_environment
    copy_configs
    generate_env_file
    
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        setup_ssl
    fi
    
    deploy_application
    show_deployment_info
    
    success "Déploiement terminé!"
}

# Gestion des erreurs
trap rollback ERR

# Exécution
main "$@"
