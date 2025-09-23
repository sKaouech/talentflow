# Dockerfile pour l'API NestJS
FROM node:18-alpine AS base

# Installation de pnpm
RUN npm install -g pnpm

# Étape 1: Installation des dépendances
FROM base AS deps
WORKDIR /app

# Copier les fichiers de configuration du monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copier les package.json de tous les packages
COPY packages/database/package.json ./packages/database/
COPY packages/validation/package.json ./packages/validation/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Étape 2: Build
FROM base AS builder
WORKDIR /app

# Copier les dépendances installées
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/turbo.json ./turbo.json

# Copier le code source
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Générer le client Prisma
RUN pnpm turbo db:generate

# Build de l'application
RUN pnpm turbo build --filter=@talentflow/api

# Étape 3: Runtime
FROM node:18-alpine AS runtime
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copier les fichiers nécessaires
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Créer le dossier logs
RUN mkdir -p logs && chown nestjs:nodejs logs

# Changer vers l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Commande de démarrage
CMD ["node", "dist/main.js"]
