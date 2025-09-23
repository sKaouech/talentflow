import { z } from 'zod'
import {
  userSchema,
  createUserSchema,
  updateUserSchema,
  loginSchema,
  registerSchema,
  tenantSchema,
  createTenantSchema,
  paginationSchema,
  idSchema,
} from './schemas'

/**
 * Inferred types from Zod schemas
 */
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>

export type Tenant = z.infer<typeof tenantSchema>
export type CreateTenant = z.infer<typeof createTenantSchema>

export type PaginationParams = z.infer<typeof paginationSchema>
export type IdParams = z.infer<typeof idSchema>
