import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@talentflow/database'

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: (config: ConfigService) => {
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: config.get('DATABASE_URL'),
            },
          },
          log:
            config.get('NODE_ENV') === 'development'
              ? ['query', 'info', 'warn', 'error']
              : ['error'],
        })

        // Middleware pour Row Level Security (RLS)
        prisma.$use(async (params, next) => {
          // Récupérer le tenant_id depuis le contexte (sera injecté par le guard)
          const tenantId = (global as any).currentTenantId

          if (tenantId && params.model) {
            // Ajouter automatiquement le filtre tenant_id pour les modèles qui l'ont
            const modelsWithTenant = [
              'Tenant',
              'Tender',
              'Candidate',
              'CVTemplate',
              'CVExport',
              'LinkedInAccount',
              'Subscription',
              'FileObject',
              'AuditLog',
              'Workflow',
            ]

            if (modelsWithTenant.includes(params.model)) {
              if (
                params.action === 'findMany' ||
                params.action === 'findFirst'
              ) {
                if (params.args.where) {
                  params.args.where.tenantId = tenantId
                } else {
                  params.args.where = { tenantId }
                }
              }

              if (params.action === 'create') {
                if (params.args.data) {
                  params.args.data.tenantId = tenantId
                }
              }

              if (params.action === 'createMany') {
                if (params.args.data && Array.isArray(params.args.data)) {
                  params.args.data = params.args.data.map((item: any) => ({
                    ...item,
                    tenantId,
                  }))
                }
              }

              if (
                params.action === 'update' ||
                params.action === 'updateMany'
              ) {
                if (params.args.where) {
                  params.args.where.tenantId = tenantId
                } else {
                  params.args.where = { tenantId }
                }
              }

              if (
                params.action === 'delete' ||
                params.action === 'deleteMany'
              ) {
                if (params.args.where) {
                  params.args.where.tenantId = tenantId
                } else {
                  params.args.where = { tenantId }
                }
              }
            }
          }

          return next(params)
        })

        return prisma
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaClient],
})
export class DatabaseModule {}
