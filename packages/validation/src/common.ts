import { z } from 'zod'

// Schémas de base réutilisables
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email()
export const phoneSchema = z.string().regex(/^[+]?[0-9\s\-()]+$/).optional()
export const urlSchema = z.string().url().optional()
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// Recherche
export const searchSchema = z.object({
  q: z.string().min(1).optional(),
  filters: z.record(z.any()).optional(),
})

export type SearchInput = z.infer<typeof searchSchema>

// Réponse paginée
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
  })

// Dates
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type DateRangeInput = z.infer<typeof dateRangeSchema>
