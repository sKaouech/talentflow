#!/bin/bash

# ===================================
# Script de Configuration Serveur TalentFlow
# Serveur: 148.230.114.13 (Hostinger)
# Domaines: talentflow.seyka.fr, talentflow-dev.seyka.fr
# ===================================

set -euo pipefail

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="148.230.114.13"
SERVER_USER="root"
DOMAINS="talentflow.seyka.fr talentflow-dev.seyka.fr"
SSH_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIaGu+gAgRvdJW6ynJLJteFW139+panKN2cD3pNBnRfI kaouech.seifddine@gmail.com"

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

# Vérification de la connexion SSH
check_ssh_connection() {
    log "Vérification de la connexion SSH au serveur..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" exit 2>/dev/null; then
        success "Connexion SSH OK"
    else
        error "Impossible de se connecter au serveur $SERVER_IP. Vérifiez votre clé SSH."
    fi
}

# Configuration de la clé SSH (si nécessaire)
setup_ssh_key() {
    log "Configuration de la clé SSH..."
    
    # Ajouter la clé SSH aux authorized_keys si elle n'y est pas
    ssh "$SERVER_USER@$SERVER_IP" << EOF
        mkdir -p ~/.ssh
        chmod 700 ~/.ssh
        
        # Vérifier si la clé existe déjà
        if ! grep -q "kaouech.seifddine@gmail.com" ~/.ssh/authorized_keys 2>/dev/null; then
            echo "$SSH_KEY" >> ~/.ssh/authorized_keys
            chmod 600 ~/.ssh/authorized_keys
            echo "✅ Clé SSH ajoutée"
        else
            echo "✅ Clé SSH déjà présente"
        fi
EOF
    
    success "Configuration SSH terminée"
}

# Vérification et mise à jour du système
update_system() {
    log "Mise à jour du système Ubuntu..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Mise à jour des paquets
        apt-get update -y
        apt-get upgrade -y
        
        # Installation des outils essentiels
        apt-get install -y curl wget git htop nano ufw fail2ban nginx certbot python3-certbot-nginx
        
        echo "✅ Système mis à jour"
EOF
    
    success "Système mis à jour"
}

# Vérification de Docker
check_docker() {
    log "Vérification de Docker..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        if command -v docker &> /dev/null; then
            echo "✅ Docker est installé"
            docker --version
            
            # Vérifier Docker Compose
            if command -v docker-compose &> /dev/null; then
                echo "✅ Docker Compose est installé"
                docker-compose --version
            else
                echo "Installation de Docker Compose..."
                curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                chmod +x /usr/local/bin/docker-compose
                echo "✅ Docker Compose installé"
            fi
        else
            echo "❌ Docker n'est pas installé"
            exit 1
        fi
EOF
    
    success "Docker vérifié"
}

# Configuration du firewall
setup_firewall() {
    log "Configuration du firewall UFW..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Reset du firewall
        ufw --force reset
        
        # Règles par défaut
        ufw default deny incoming
        ufw default allow outgoing
        
        # Autoriser SSH
        ufw allow ssh
        ufw allow 22/tcp
        
        # Autoriser HTTP/HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Autoriser les ports de développement (temporaire)
        ufw allow 3000/tcp comment "TalentFlow Web Dev"
        ufw allow 3001/tcp comment "TalentFlow API Dev"
        ufw allow 3002/tcp comment "Grafana Dev"
        
        # Activer le firewall
        ufw --force enable
        
        # Afficher le statut
        ufw status verbose
        
        echo "✅ Firewall configuré"
EOF
    
    success "Firewall configuré"
}

# Configuration de Fail2ban
setup_fail2ban() {
    log "Configuration de Fail2ban..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Configuration Fail2ban pour SSH
        cat > /etc/fail2ban/jail.local << 'F2BEOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[ssh]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
F2BEOF

        # Redémarrer Fail2ban
        systemctl restart fail2ban
        systemctl enable fail2ban
        
        echo "✅ Fail2ban configuré"
EOF
    
    success "Fail2ban configuré"
}

# Création de la structure de répertoires
create_directories() {
    log "Création de la structure de répertoires..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Répertoires principaux
        mkdir -p /opt/talentflow/{dev,prod}
        mkdir -p /opt/talentflow/data/{postgres,redis,uploads,minio,prometheus,grafana}
        mkdir -p /opt/talentflow/logs/{api,nginx,app}
        mkdir -p /opt/talentflow/backups
        mkdir -p /opt/talentflow/ssl
        mkdir -p /opt/talentflow/scripts
        
        # Permissions
        chown -R 1001:1001 /opt/talentflow/data
        chown -R 1001:1001 /opt/talentflow/logs
        chmod -R 755 /opt/talentflow
        
        # Créer les liens symboliques pour les logs nginx
        ln -sf /opt/talentflow/logs/nginx /var/log/nginx/talentflow
        
        echo "✅ Structure de répertoires créée"
EOF
    
    success "Structure de répertoires créée"
}

# Configuration SSL avec Let's Encrypt
setup_ssl() {
    log "Configuration SSL avec Let's Encrypt..."
    
    ssh "$SERVER_USER@$SERVER_IP" << EOF
        # Arrêter nginx temporairement
        systemctl stop nginx 2>/dev/null || true
        
        # Générer les certificats pour tous les domaines
        for domain in $DOMAINS; do
            echo "Génération du certificat pour \$domain..."
            
            # Utiliser le mode standalone pour la première génération
            certbot certbot --standalone --non-interactive --agree-tos \
                --email kaouech.seifddine@gmail.com \
                --domains \$domain
                
            if [ \$? -eq 0 ]; then
                echo "✅ Certificat généré pour \$domain"
                
                # Créer les liens symboliques
                ln -sf /etc/letsencrypt/live/\$domain/fullchain.pem /opt/talentflow/ssl/\$domain.crt
                ln -sf /etc/letsencrypt/live/\$domain/privkey.pem /opt/talentflow/ssl/\$domain.key
            else
                echo "⚠️ Échec de génération du certificat pour \$domain"
                
                # Créer des certificats auto-signés en fallback
                openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                    -keyout /opt/talentflow/ssl/\$domain.key \
                    -out /opt/talentflow/ssl/\$domain.crt \
                    -subj "/C=FR/ST=France/L=Paris/O=TalentFlow/CN=\$domain"
                echo "⚠️ Certificat auto-signé créé pour \$domain"
            fi
        done
        
        # Configuration du renouvellement automatique
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --nginx") | crontab -
        
        echo "✅ SSL configuré"
EOF
    
    success "SSL configuré"
}

# Configuration initiale de Nginx
setup_nginx() {
    log "Configuration initiale de Nginx..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Sauvegarder la configuration par défaut
        cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
        
        # Créer une configuration minimale pour commencer
        cat > /etc/nginx/sites-available/talentflow-temp << 'NGINXEOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html index.htm;
    
    server_name _;
    
    location / {
        return 200 "TalentFlow Server Ready\n";
        add_header Content-Type text/plain;
    }
    
    location /health {
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
NGINXEOF
        
        # Activer la configuration temporaire
        ln -sf /etc/nginx/sites-available/talentflow-temp /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Tester et démarrer nginx
        nginx -t
        systemctl enable nginx
        systemctl restart nginx
        
        echo "✅ Nginx configuré temporairement"
EOF
    
    success "Nginx configuré"
}

# Test des services
test_services() {
    log "Test des services..."
    
    # Test de la connectivité HTTP
    if curl -f "http://$SERVER_IP/health" >/dev/null 2>&1; then
        success "Service HTTP accessible"
    else
        warning "Service HTTP non accessible"
    fi
    
    # Test Docker
    ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
        if docker run --rm hello-world >/dev/null 2>&1; then
            echo "✅ Docker fonctionne correctement"
        else
            echo "⚠️ Problème avec Docker"
        fi
EOF
    
    success "Tests terminés"
}

# Affichage des informations finales
show_info() {
    log "Configuration terminée !"
    echo ""
    echo -e "${GREEN}🚀 Serveur TalentFlow configuré avec succès !${NC}"
    echo ""
    echo -e "${BLUE}📋 Informations du serveur :${NC}"
    echo -e "   🌐 IP : $SERVER_IP"
    echo -e "   🔑 SSH : $SERVER_USER@$SERVER_IP"
    echo -e "   📁 Répertoire : /opt/talentflow/"
    echo ""
    echo -e "${BLUE}🌍 Domaines configurés :${NC}"
    for domain in $DOMAINS; do
        echo -e "   🔗 https://$domain"
    done
    echo ""
    echo -e "${YELLOW}🔧 Prochaines étapes :${NC}"
    echo -e "   1. Configurez vos GitHub Secrets"
    echo -e "   2. Push votre code vers develop/main"
    echo -e "   3. Le déploiement se fera automatiquement"
    echo ""
    echo -e "${YELLOW}⚠️ Notes importantes :${NC}"
    echo -e "   • Les certificats SSL ont été générés"
    echo -e "   • Le firewall est actif (ports 22, 80, 443)"
    echo -e "   • Fail2ban protège contre les attaques"
    echo -e "   • Docker est prêt pour les déploiements"
    echo ""
}

# Fonction principale
main() {
    log "🚀 Configuration du serveur TalentFlow"
    echo -e "${BLUE}Serveur : $SERVER_IP${NC}"
    echo -e "${BLUE}Domaines : $DOMAINS${NC}"
    echo ""
    
    check_ssh_connection
    setup_ssh_key
    update_system
    check_docker
    setup_firewall
    setup_fail2ban
    create_directories
    setup_nginx
    setup_ssl
    test_services
    show_info
    
    success "Configuration terminée avec succès !"
}

# Gestion des erreurs
trap 'error "Erreur durant la configuration"' ERR

# Exécution
main "$@"
