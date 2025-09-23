import { z } from 'zod'
import { idSchema, paginationSchema, searchSchema, dateRangeSchema } from './common'

// Énumérations
export const tenderTypeSchema = z.enum(['mission', 'cdi', 'freelance', 'stage'])
export const tenderStatusSchema = z.enum(['draft', 'active', 'paused', 'closed', 'archived'])
export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export const remoteSchema = z.enum(['onsite', 'remote', 'hybrid'])

// Schéma de base pour un tender
export const tenderSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.string().min(1),
  source: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  
  // Classification
  type: tenderTypeSchema,
  domain: z.string().optional(),
  skills: z.array(z.string()).default([]),
  location: z.string().optional(),
  remote: remoteSchema.default('hybrid'),
  
  // Détails mission
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  duration: z.string().optional(),
  dailyRate: z.number().positive().optional(),
  currency: z.string().length(3).default('EUR'),
  clientName: z.string().optional(),
  clientIndustry: z.string().optional(),
  
  // Workflow
  status: tenderStatusSchema.default('draft'),
  priority: prioritySchema.default('medium'),
  assignedTo: idSchema.optional(),
  
  // Publication
  publishedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  
  // Métadonnées
  tenantId: idSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Tender = z.infer<typeof tenderSchema>

// Création d'un tender
export const createTenderSchema = tenderSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateTenderInput = z.infer<typeof createTenderSchema>

// Mise à jour d'un tender
export const updateTenderSchema = createTenderSchema.partial()

export type UpdateTenderInput = z.infer<typeof updateTenderSchema>

// Recherche de tenders
export const searchTendersSchema = searchSchema.extend({
  type: tenderTypeSchema.optional(),
  status: tenderStatusSchema.optional(),
  priority: prioritySchema.optional(),
  remote: remoteSchema.optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  assignedTo: idSchema.optional(),
  ...dateRangeSchema.shape,
}).merge(paginationSchema)

export type SearchTendersInput = z.infer<typeof searchTendersSchema>

// Publication
export const publicationStatusSchema = z.enum(['pending', 'published', 'failed', 'deleted'])
export const platformSchema = z.enum(['linkedin', 'indeed', 'apec', 'leboncoin'])

export const publicationSchema = z.object({
  id: idSchema,
  platform: platformSchema,
  platformId: z.string().optional(),
  status: publicationStatusSchema.default('pending'),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  publishedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),
  errorMessage: z.string().optional(),
  engagement: z.record(z.any()).default({}),
  tenderId: idSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Publication = z.infer<typeof publicationSchema>

// Création d'une publication
export const createPublicationSchema = z.object({
  platform: platformSchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  scheduledAt: z.string().datetime().optional(),
})

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>
