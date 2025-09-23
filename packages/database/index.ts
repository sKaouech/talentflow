export * from '@prisma/client'
export { PrismaClient } from '@prisma/client'

// Re-export des types générés
export type {
  Tenant,
  User,
  Membership,
  Permission,
  RolePermission,
  Tender,
  Publication,
  Candidate,
  Experience,
  Education,
  CandidateSkill,
  Application,
  CVTemplate,
  CVExport,
  LinkedInAccount,
  Workflow,
  IntegrationEvent,
  Plan,
  Subscription,
  FileObject,
  AuditLog,
} from '@prisma/client'
