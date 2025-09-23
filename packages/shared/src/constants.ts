// Plans et limites
export const PLANS = {
  FREE: {
    name: 'free',
    limits: {
      tenders: 10,
      candidates: 50,
      users: 2,
      cvExports: 10,
      storage: 100, // MB
    },
    features: [
      'tender_management',
      'candidate_management',
      'basic_cv_generation',
      'email_support',
    ],
  },
  PRO: {
    name: 'pro',
    limits: {
      tenders: 100,
      candidates: 1000,
      users: 10,
      cvExports: 500,
      storage: 1000, // MB
    },
    features: [
      'tender_management',
      'candidate_management',
      'advanced_cv_generation',
      'linkedin_integration',
      'n8n_workflows',
      'priority_support',
      'analytics',
    ],
  },
  ENTERPRISE: {
    name: 'enterprise',
    limits: {
      tenders: -1, // Unlimited
      candidates: -1,
      users: -1,
      cvExports: -1,
      storage: -1,
    },
    features: [
      'tender_management',
      'candidate_management',
      'advanced_cv_generation',
      'linkedin_integration',
      'n8n_workflows',
      'custom_branding',
      'api_access',
      'sso',
      'dedicated_support',
      'analytics',
      'audit_logs',
    ],
  },
} as const

// Rôles et permissions
export const ROLES = {
  TENANT_ADMIN: 'tenant_admin',
  MANAGER: 'manager',
  RECRUITER: 'recruiter',
  VIEWER: 'viewer',
} as const

export const PERMISSIONS = {
  // Tenders
  'tenders.create': 'Créer des appels d\'offres',
  'tenders.read': 'Voir les appels d\'offres',
  'tenders.update': 'Modifier les appels d\'offres',
  'tenders.delete': 'Supprimer les appels d\'offres',
  'tenders.publish': 'Publier les appels d\'offres',
  
  // Candidates
  'candidates.create': 'Créer des candidats',
  'candidates.read': 'Voir les candidats',
  'candidates.update': 'Modifier les candidats',
  'candidates.delete': 'Supprimer les candidats',
  'candidates.export_cv': 'Générer des CV',
  
  // Users
  'users.invite': 'Inviter des utilisateurs',
  'users.read': 'Voir les utilisateurs',
  'users.update': 'Modifier les utilisateurs',
  'users.delete': 'Supprimer les utilisateurs',
  
  // Billing
  'billing.read': 'Voir la facturation',
  'billing.update': 'Modifier l\'abonnement',
  
  // Settings
  'settings.read': 'Voir les paramètres',
  'settings.update': 'Modifier les paramètres',
  
  // Analytics
  'analytics.read': 'Voir les statistiques',
  
  // Audit
  'audit.read': 'Voir les logs d\'audit',
} as const

// Mapping rôles -> permissions
export const ROLE_PERMISSIONS = {
  [ROLES.TENANT_ADMIN]: Object.keys(PERMISSIONS),
  [ROLES.MANAGER]: [
    'tenders.create',
    'tenders.read',
    'tenders.update',
    'tenders.delete',
    'tenders.publish',
    'candidates.create',
    'candidates.read',
    'candidates.update',
    'candidates.delete',
    'candidates.export_cv',
    'users.invite',
    'users.read',
    'users.update',
    'analytics.read',
  ],
  [ROLES.RECRUITER]: [
    'tenders.create',
    'tenders.read',
    'tenders.update',
    'tenders.publish',
    'candidates.create',
    'candidates.read',
    'candidates.update',
    'candidates.export_cv',
    'users.read',
  ],
  [ROLES.VIEWER]: [
    'tenders.read',
    'candidates.read',
    'users.read',
  ],
} as const

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const

// API
export const API = {
  VERSION: 'v1',
  RATE_LIMITS: {
    DEFAULT: 100, // requests per minute
    AUTH: 5, // login attempts per minute
    UPLOAD: 10, // file uploads per minute
  },
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// Date formats
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
  DATE: 'yyyy-MM-dd',
  DATETIME: 'yyyy-MM-dd HH:mm',
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_DATETIME: 'dd/MM/yyyy HH:mm',
} as const
