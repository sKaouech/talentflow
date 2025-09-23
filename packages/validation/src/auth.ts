import { z } from 'zod'
import { idSchema, emailSchema } from './common'
import { membershipRoleSchema } from './tenant'

// JWT Payload (ce qui est dans le token Keycloak)
export const jwtPayloadSchema = z.object({
  sub: z.string(), // Keycloak user ID
  email: emailSchema,
  given_name: z.string(),
  family_name: z.string(),
  preferred_username: z.string(),
  
  // Custom claims ajoutés par Keycloak
  tenant_id: idSchema.optional(),
  tenant_slug: z.string().optional(),
  role: membershipRoleSchema.optional(),
  permissions: z.array(z.string()).default([]),
  
  // Standard JWT claims
  iat: z.number(),
  exp: z.number(),
  iss: z.string(),
  aud: z.string(),
})

export type JWTPayload = z.infer<typeof jwtPayloadSchema>

// Context utilisateur authentifié
export const authContextSchema = z.object({
  userId: idSchema,
  keycloakId: z.string(),
  email: emailSchema,
  firstName: z.string(),
  lastName: z.string(),
  
  // Tenant actuel
  tenantId: idSchema.optional(),
  tenantSlug: z.string().optional(),
  role: membershipRoleSchema.optional(),
  permissions: z.array(z.string()).default([]),
  
  // Métadonnées
  lastLoginAt: z.string().datetime().optional(),
})

export type AuthContext = z.infer<typeof authContextSchema>

// Login request
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  tenantSlug: z.string().optional(), // Si l'utilisateur veut se connecter à un tenant spécifique
})

export type LoginInput = z.infer<typeof loginSchema>

// Register request
export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  
  // Création du tenant (optionnel, si pas d'invitation)
  tenantName: z.string().min(1).max(100).optional(),
  tenantSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  
  // Code d'invitation (si l'utilisateur rejoint un tenant existant)
  inviteToken: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

// Changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// Reset password
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Confirm reset password
export const confirmResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
})

export type ConfirmResetPasswordInput = z.infer<typeof confirmResetPasswordSchema>

// Switch tenant
export const switchTenantSchema = z.object({
  tenantId: idSchema,
})

export type SwitchTenantInput = z.infer<typeof switchTenantSchema>
