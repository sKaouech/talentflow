# Dockerfile pour l'application Next.js
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
COPY packages/ui/package.json ./packages/ui/
COPY packages/validation/package.json ./packages/validation/
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

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
COPY apps/web/ ./apps/web/

# Build de l'application
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm turbo build --filter=@talentflow/web

# Étape 3: Runtime
FROM node:18-alpine AS runtime
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers Next.js
COPY --from=builder /app/apps/web/next.config.js ./
COPY --from=builder /app/apps/web/package.json ./package.json

# Copier les dépendances de production
COPY --from=builder /app/node_modules ./node_modules

# Copier les fichiers buildés
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["node", "server.js"]
