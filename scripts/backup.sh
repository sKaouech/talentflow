#!/bin/bash

# ===================================
# Script de Sauvegarde TalentFlow
# Backup automatique PostgreSQL + fichiers
# ===================================

set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ENVIRONMENT="${1:-prod}"

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR/$ENVIRONMENT"

# Backup PostgreSQL
log "Début de la sauvegarde PostgreSQL..."
pg_dump -h postgres-$ENVIRONMENT -U talentflow_$ENVIRONMENT -d talentflow_$ENVIRONMENT \
    --no-password --verbose --format=custom \
    --file="$BACKUP_DIR/$ENVIRONMENT/db_backup_$TIMESTAMP.dump"

if [ $? -eq 0 ]; then
    log "✅ Sauvegarde PostgreSQL terminée"
else
    error "Échec de la sauvegarde PostgreSQL"
fi

# Backup des uploads
log "Sauvegarde des fichiers uploads..."
if [ -d "/app/uploads" ]; then
    tar -czf "$BACKUP_DIR/$ENVIRONMENT/uploads_backup_$TIMESTAMP.tar.gz" -C /app uploads/
    log "✅ Sauvegarde uploads terminée"
fi

# Nettoyage des anciennes sauvegardes
log "Nettoyage des sauvegardes anciennes (> $RETENTION_DAYS jours)..."
find "$BACKUP_DIR/$ENVIRONMENT" -type f -mtime +$RETENTION_DAYS -delete
log "✅ Nettoyage terminé"

# Vérification de l'espace disque
DISK_USAGE=$(df /backups | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    warning "Espace disque faible: ${DISK_USAGE}%"
fi

log "🎉 Sauvegarde terminée avec succès"
