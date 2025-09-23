import { z } from 'zod'

/**
 * User validation schemas
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  tenantId: z.string().uuid(),
})

export const createUserSchema = userSchema.omit({ id: true })
export const updateUserSchema = userSchema.partial().omit({ id: true })

/**
 * Authentication schemas
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  tenantName: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
})

/**
 * Tenant schemas
 */
export const tenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  domain: z.string().optional(),
})

export const createTenantSchema = tenantSchema.omit({ id: true, slug: true })

/**
 * Common schemas
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

export const idSchema = z.object({
  id: z.string().uuid(),
})
