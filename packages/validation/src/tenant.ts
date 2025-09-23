import { z } from 'zod'
import { idSchema, emailSchema, slugSchema } from './common'

// Énumérations
export const planSchema = z.enum(['free', 'pro', 'enterprise'])
export const membershipRoleSchema = z.enum([
  'tenant_admin',
  'manager',
  'recruiter',
  'viewer',
])
export const membershipStatusSchema = z.enum(['active', 'suspended', 'pending'])

// Tenant
export const tenantSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100),
  slug: slugSchema,
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().max(50).optional(),
  size: z.string().max(20).optional(),

  // Configuration
  settings: z.record(z.any()).default({}),
  branding: z.record(z.any()).default({}),

  // Abonnement
  plan: planSchema.default('free'),
  stripeCustomerId: z.string().optional(),
  subscriptionId: z.string().optional(),
  trialEndsAt: z.string().datetime().optional(),

  // Métadonnées
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Tenant = z.infer<typeof tenantSchema>

// Création d'un tenant
export const createTenantSchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema,
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().max(50).optional(),
  size: z.string().max(20).optional(),
  settings: z.record(z.any()).default({}),
  branding: z.record(z.any()).default({}),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>

// Mise à jour d'un tenant
export const updateTenantSchema = createTenantSchema.partial()

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>

// Utilisateur
export const userSchema = z.object({
  id: idSchema,
  keycloakId: z.string(),
  email: emailSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  locale: z.string().default('fr'),
  timezone: z.string().default('Europe/Paris'),
  preferences: z.record(z.any()).default({}),
  lastLoginAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof userSchema>

// Création d'un utilisateur
export const createUserSchema = z.object({
  keycloakId: z.string(),
  email: emailSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  locale: z.string().default('fr'),
  timezone: z.string().default('Europe/Paris'),
  preferences: z.record(z.any()).default({}),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// Membership
export const membershipSchema = z.object({
  id: idSchema,
  role: membershipRoleSchema,
  status: membershipStatusSchema.default('active'),
  tenantId: idSchema,
  userId: idSchema,
  joinedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Membership = z.infer<typeof membershipSchema>

// Invitation d'un membre
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: membershipRoleSchema,
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

// Mise à jour d'un membership
export const updateMembershipSchema = z.object({
  role: membershipRoleSchema.optional(),
  status: membershipStatusSchema.optional(),
})

export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>
