import { z } from 'zod'
import { idSchema, emailSchema, paginationSchema, searchSchema } from './common'

// Profil utilisateur
export const userProfileSchema = z.object({
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

export type UserProfile = z.infer<typeof userProfileSchema>

// Mise à jour du profil
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.record(z.any()).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Recherche d'utilisateurs
export const searchUsersSchema = searchSchema.extend({
  role: z.string().optional(),
  status: z.string().optional(),
  lastLoginBefore: z.string().datetime().optional(),
  lastLoginAfter: z.string().datetime().optional(),
}).merge(paginationSchema)

export type SearchUsersInput = z.infer<typeof searchUsersSchema>

// Notification preferences
export const notificationPreferencesSchema = z.object({
  email: z.object({
    tenderUpdates: z.boolean().default(true),
    candidateUpdates: z.boolean().default(true),
    systemUpdates: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
  }),
  push: z.object({
    tenderUpdates: z.boolean().default(true),
    candidateUpdates: z.boolean().default(true),
    systemUpdates: z.boolean().default(true),
  }),
  inApp: z.object({
    tenderUpdates: z.boolean().default(true),
    candidateUpdates: z.boolean().default(true),
    systemUpdates: z.boolean().default(true),
  }),
})

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>
