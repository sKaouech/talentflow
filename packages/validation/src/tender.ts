import { z } from 'zod'

/**
 * Tender validation schemas
 */
export const tenderSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  content: z.string().min(1, 'Le contenu est requis'),
  source: z.string().default('manual'),
  sourceUrl: z.string().url().optional(),
  
  // Classification
  type: z.string().default('freelance'),
  domain: z.string().optional(),
  skills: z.array(z.string()).default([]),
  location: z.string().optional(),
  remote: z.string().default('hybrid'),
  
  // Détails mission
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  duration: z.string().optional(),
  dailyRate: z.number().positive().optional(),
  currency: z.string().default('EUR'),
  clientName: z.string().optional(),
  clientIndustry: z.string().optional(),
  
  // Workflow
  status: z.string().default('draft'),
  priority: z.string().default('medium'),
  assignedTo: z.string().optional(),
  
  // Publication
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  
  // Relations
  tenantId: z.string().uuid(),
  
  // Métadonnées
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
})

export const createTenderSchema = tenderSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const updateTenderSchema = createTenderSchema.partial()

export const searchTendersSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  minBudget: z.number().positive().optional(),
  maxBudget: z.number().positive().optional(),
  skills: z.array(z.string()).optional(),
  priority: z.string().optional(),
  remote: z.string().optional(),
  assignedTo: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  filters: z.record(z.unknown()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

/**
 * Publication validation schemas
 */
export const publicationSchema = z.object({
  id: z.string().uuid(),
  tenderId: z.string().uuid(),
  platform: z.enum(['LINKEDIN', 'INDEED', 'LEBONCOIN', 'FREELANCE', 'MALT']),
  platformJobId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  scheduledAt: z.date().optional(),
  publishedAt: z.date().optional(),
  status: z.enum(['PENDING', 'PUBLISHED', 'FAILED', 'EXPIRED']).default('PENDING'),
  url: z.string().url().optional(),
  metrics: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createPublicationSchema = publicationSchema.omit({
  id: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * Remote work validation schema
 */
export const remoteSchema = z.enum(['REMOTE', 'HYBRID', 'ON_SITE']).default('ON_SITE')

/**
 * Inferred types
 */
export type Tender = z.infer<typeof tenderSchema>
export type CreateTenderInput = z.infer<typeof createTenderSchema>
export type UpdateTenderInput = z.infer<typeof updateTenderSchema>
export type SearchTendersInput = z.infer<typeof searchTendersSchema>

export type Publication = z.infer<typeof publicationSchema>
export type CreatePublicationInput = z.infer<typeof createPublicationSchema>