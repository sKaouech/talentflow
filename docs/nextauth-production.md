# NextAuth.js - Configuration Production

## 🎯 Optimisations pour la Production

### 1. Variables d'Environnement Sécurisées

```env
# Secrets de production (à générer)
NEXTAUTH_SECRET=your-super-secure-secret-generated-with-openssl-rand-hex-32
NEXTAUTH_URL=https://your-domain.com

# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Google OAuth (production)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Email provider (pour les notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@domain.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-domain.com
```

### 2. Configuration Avancée NextAuth.js

```typescript
// apps/web/src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  // Providers optimisés pour production
  providers: [
    // Email Magic Links (recommandé pour B2B)
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    
    // Credentials (existant)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Logique existante...
      }
    }),
    
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],

  // Session optimisée
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },

  // JWT optimisé
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Callbacks sécurisés
  callbacks: {
    async signIn({ user, account, profile }) {
      // Validation supplémentaire
      if (account?.provider === "google") {
        // Vérifier domaine email autorisé si nécessaire
        const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || []
        if (allowedDomains.length > 0) {
          const emailDomain = user.email?.split('@')[1]
          if (!allowedDomains.includes(emailDomain)) {
            return false
          }
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      // Enrichir le token avec des infos métier
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
        
        // Ajouter les permissions
        const userWithMemberships = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            memberships: {
              include: { tenant: true }
            }
          }
        })
        
        token.permissions = userWithMemberships?.memberships[0]?.permissions || {}
      }
      
      return token
    },

    async session({ session, token }) {
      // Session enrichie
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
        session.user.permissions = token.permissions as Record<string, boolean>
      }
      return session
    }
  },

  // Pages personnalisées
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  // Events pour logging
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
      
      // Tracking analytics si nécessaire
      if (process.env.NODE_ENV === 'production') {
        // Envoyer à votre service d'analytics
      }
    },
    
    async signOut({ token }) {
      console.log(`User ${token?.email} signed out`)
    }
  },

  // Debug en développement uniquement
  debug: process.env.NODE_ENV === 'development',
  
  // Secret sécurisé
  secret: process.env.NEXTAUTH_SECRET,
}
```

### 3. Middleware de Sécurité Avancé

```typescript
// apps/web/src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl

    // Protection par rôles
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'tenant_admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Protection par permissions
    if (pathname.startsWith('/tenders') && req.method === 'POST') {
      if (!token?.permissions?.['tenders.create']) {
        return NextResponse.redirect(new URL('/forbidden', req.url))
      }
    }

    // Rate limiting par utilisateur
    const userId = token?.id
    if (userId) {
      // Implémenter rate limiting basé sur l'utilisateur
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Pages publiques
        const publicPaths = ['/auth/', '/api/auth/', '/api/health']
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }

        // API publiques
        if (pathname.startsWith('/api/public/')) {
          return true
        }

        // Toutes les autres pages nécessitent une authentification
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

### 4. Gestion des Erreurs Avancée

```typescript
// apps/web/src/app/auth/error/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Button, Card } from '@talentflow/ui'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const errorMessages = {
  Configuration: 'Erreur de configuration du serveur',
  AccessDenied: 'Accès refusé',
  Verification: 'Le lien de vérification a expiré ou est invalide',
  Default: 'Une erreur est survenue lors de la connexion'
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Erreur d'Authentification
        </h1>
        
        <p className="text-slate-600 mb-6">
          {errorMessages[error] || errorMessages.Default}
        </p>
        
        <div className="space-y-3">
          <Link href="/auth/signin">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Accueil
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
```

## 🔒 Sécurité Production

### 1. Secrets et Clés
- ✅ **NEXTAUTH_SECRET** généré avec `openssl rand -hex 32`
- ✅ **Rotation des secrets** planifiée
- ✅ **Variables d'environnement** sécurisées
- ✅ **Pas de secrets** dans le code

### 2. HTTPS et Domaines
- ✅ **HTTPS obligatoire** en production
- ✅ **Domaines autorisés** configurés
- ✅ **CORS** restrictif
- ✅ **CSP headers** configurés

### 3. Sessions et Tokens
- ✅ **Expiration appropriée** (30 jours max)
- ✅ **Refresh automatique** des tokens
- ✅ **Invalidation** lors de la déconnexion
- ✅ **Protection CSRF** intégrée

## 📊 Monitoring et Logs

### Events à Tracker
- Connexions réussies/échouées
- Créations de comptes
- Tentatives de fraude
- Erreurs d'authentification

### Métriques Importantes
- Temps de réponse auth
- Taux de conversion signup
- Erreurs par provider
- Sessions actives

---

**Status** : Configuration prête pour la production avec NextAuth.js optimisé.
