import { z } from 'zod'
import {
  idSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
  paginationSchema,
  searchSchema,
} from './common'
import { remoteSchema } from './tender'

// Énumérations
export const candidateTypeSchema = z.enum(['internal', 'external', 'freelance'])
export const candidateStatusSchema = z.enum(['active', 'inactive', 'archived'])
export const skillLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
])
export const applicationStatusSchema = z.enum([
  'applied',
  'shortlisted',
  'interviewed',
  'rejected',
  'hired',
])

// Candidat
export const candidateSchema = z.object({
  id: idSchema,
  type: candidateTypeSchema,

  // Informations personnelles
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: emailSchema,
  phone: phoneSchema,
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  portfolioUrl: urlSchema,

  // Localisation
  location: z.string().optional(),
  remote: remoteSchema.default('hybrid'),
  mobility: z.array(z.string()).default([]),

  // Profil professionnel
  title: z.string().max(100).optional(),
  summary: z.string().max(1000).optional(),
  availability: z.string().max(50).optional(),
  desiredSalary: z.number().positive().optional(),
  currency: z.string().length(3).default('EUR'),

  // Métadonnées
  status: candidateStatusSchema.default('active'),
  source: z.string().default('manual'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),

  // Relations
  tenantId: idSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Candidate = z.infer<typeof candidateSchema>

// Création d'un candidat
export const createCandidateSchema = candidateSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>

// Mise à jour d'un candidat
export const updateCandidateSchema = createCandidateSchema.partial()

export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>

// Recherche de candidats
export const searchCandidatesSchema = searchSchema
  .extend({
    type: candidateTypeSchema.optional(),
    status: candidateStatusSchema.optional(),
    remote: remoteSchema.optional(),
    location: z.string().optional(),
    skills: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    availability: z.string().optional(),
  })
  .merge(paginationSchema)

export type SearchCandidatesInput = z.infer<typeof searchCandidatesSchema>

// Expérience professionnelle
export const experienceSchema = z.object({
  id: idSchema,
  company: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().default(false),
  technologies: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  candidateId: idSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Experience = z.infer<typeof experienceSchema>

export const createExperienceSchema = experienceSchema.omit({
  id: true,
  candidateId: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>

// Formation
export const educationSchema = z.object({
  id: idSchema,
  institution: z.string().min(1).max(100),
  degree: z.string().min(1).max(100),
  field: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().default(false),
  candidateId: idSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Education = z.infer<typeof educationSchema>

export const createEducationSchema = educationSchema.omit({
  id: true,
  candidateId: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateEducationInput = z.infer<typeof createEducationSchema>

// Compétences
export const candidateSkillSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(50),
  category: z.string().max(50).optional(),
  level: skillLevelSchema.default('intermediate'),
  yearsExp: z.number().int().min(0).max(50).optional(),
  candidateId: idSchema,
})

export type CandidateSkill = z.infer<typeof candidateSkillSchema>

export const createCandidateSkillSchema = candidateSkillSchema.omit({
  id: true,
  candidateId: true,
})

export type CreateCandidateSkillInput = z.infer<
  typeof createCandidateSkillSchema
>

// Candidature
export const applicationSchema = z.object({
  id: idSchema,
  status: applicationStatusSchema.default('applied'),
  coverLetter: z.string().max(2000).optional(),
  proposal: z.string().max(2000).optional(),
  rate: z.number().positive().optional(),
  appliedAt: z.string().datetime(),
  respondedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  tenderId: idSchema,
  candidateId: idSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Application = z.infer<typeof applicationSchema>

export const createApplicationSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
  proposal: z.string().max(2000).optional(),
  rate: z.number().positive().optional(),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
