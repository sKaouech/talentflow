import { Injectable, Logger } from '@nestjs/common'
import { PrismaClient, Publication } from '@talentflow/database'
import {
  CreatePublicationInput,
  createPublicationSchema,
} from '@talentflow/validation'
import { NotFoundError, ValidationError } from '@talentflow/shared'

@Injectable()
export class PublicationsService {
  private readonly logger = new Logger(PublicationsService.name)

  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Créer une publication pour un appel d'offres
   */
  async create(
    tenderId: string,
    data: CreatePublicationInput,
    tenantId: string,
    user: any
  ): Promise<Publication> {
    this.logger.log(`Creating publication for tender ${tenderId}`)

    // Vérifier que le tender existe et appartient au tenant
    const tender = await this.prisma.tender.findFirst({
      where: {
        id: tenderId,
        tenantId,
        deletedAt: null,
      },
    })

    if (!tender) {
      throw new NotFoundError('Tender', tenderId)
    }

    // Validation Zod
    const validatedData = createPublicationSchema.parse(data)

    try {
      const publication = await this.prisma.publication.create({
        data: {
          title: validatedData.title,
          content: validatedData.content,
          platform: validatedData.platform,
          hashtags: validatedData.hashtags || [],
          tenderId,
          scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        },
      })

      this.logger.log(`Publication created with ID: ${publication.id}`)
      return publication
    } catch (error) {
      this.logger.error(`Failed to create publication: ${error.message}`)
      throw new ValidationError('Failed to create publication', error)
    }
  }

  /**
   * Récupérer les publications d'un appel d'offres
   */
  async findByTenderId(tenderId: string, tenantId: string): Promise<Publication[]> {
    this.logger.log(`Finding publications for tender ${tenderId}`)

    // Vérifier que le tender existe et appartient au tenant
    const tender = await this.prisma.tender.findFirst({
      where: {
        id: tenderId,
        tenantId,
        deletedAt: null,
      },
    })

    if (!tender) {
      throw new NotFoundError('Tender', tenderId)
    }

    const publications = await this.prisma.publication.findMany({
      where: {
        tenderId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return publications
  }

  /**
   * Publier une publication sur la plateforme (simulation)
   */
  async publish(publicationId: string, tenantId: string): Promise<Publication> {
    this.logger.log(`Publishing publication ${publicationId}`)

    // Vérifier que la publication existe
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: publicationId,
        tender: {
          tenantId,
          deletedAt: null,
        },
      },
    })

    if (!publication) {
      throw new NotFoundError('Publication', publicationId)
    }

    if (publication.status === 'published') {
      throw new ValidationError('Publication already published')
    }

    try {
      // Simulation de la publication
      // Dans un vrai scénario, ici on appellerait l'API LinkedIn, n8n, etc.
      const updatedPublication = await this.prisma.publication.update({
        where: { id: publicationId },
        data: {
          status: 'published',
          publishedAt: new Date(),
          platformId: `sim_${Date.now()}`, // ID simulé de la plateforme
          engagement: {
            likes: 0,
            shares: 0,
            comments: 0,
            views: 0,
          },
        },
      })

      this.logger.log(`Publication ${publicationId} published successfully`)
      return updatedPublication
    } catch (error) {
      this.logger.error(`Failed to publish publication ${publicationId}: ${error.message}`)
      
      // Marquer comme échouée
      await this.prisma.publication.update({
        where: { id: publicationId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      })

      throw new ValidationError('Failed to publish publication', error)
    }
  }

  /**
   * Supprimer une publication
   */
  async delete(publicationId: string, tenantId: string): Promise<void> {
    this.logger.log(`Deleting publication ${publicationId}`)

    // Vérifier que la publication existe
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: publicationId,
        tender: {
          tenantId,
          deletedAt: null,
        },
      },
    })

    if (!publication) {
      throw new NotFoundError('Publication', publicationId)
    }

    try {
      await this.prisma.publication.delete({
        where: { id: publicationId },
      })

      this.logger.log(`Publication ${publicationId} deleted successfully`)
    } catch (error) {
      this.logger.error(`Failed to delete publication ${publicationId}: ${error.message}`)
      throw new ValidationError('Failed to delete publication', error)
    }
  }

  /**
   * Mettre à jour les métriques d'engagement d'une publication
   */
  async updateEngagement(publicationId: string, engagement: any): Promise<Publication> {
    this.logger.log(`Updating engagement for publication ${publicationId}`)

    try {
      const publication = await this.prisma.publication.update({
        where: { id: publicationId },
        data: {
          engagement,
          updatedAt: new Date(),
        },
      })

      return publication
    } catch (error) {
      this.logger.error(`Failed to update engagement: ${error.message}`)
      throw new ValidationError('Failed to update engagement', error)
    }
  }

  /**
   * Obtenir les statistiques de publication pour un tenant
   */
  async getStats(tenantId: string) {
    this.logger.log(`Getting publication stats for tenant ${tenantId}`)

    try {
      const [
        total,
        published,
        pending,
        failed,
      ] = await Promise.all([
        this.prisma.publication.count({
          where: {
            tender: { tenantId, deletedAt: null },
          },
        }),
        this.prisma.publication.count({
          where: {
            tender: { tenantId, deletedAt: null },
            status: 'published',
          },
        }),
        this.prisma.publication.count({
          where: {
            tender: { tenantId, deletedAt: null },
            status: 'pending',
          },
        }),
        this.prisma.publication.count({
          where: {
            tender: { tenantId, deletedAt: null },
            status: 'failed',
          },
        }),
      ])

      return {
        total,
        published,
        pending,
        failed,
        successRate: total > 0 ? Math.round((published / total) * 100) : 0,
        platforms: {
          linkedin: await this.prisma.publication.count({
            where: {
              tender: { tenantId, deletedAt: null },
              platform: 'linkedin',
            },
          }),
          indeed: await this.prisma.publication.count({
            where: {
              tender: { tenantId, deletedAt: null },
              platform: 'indeed',
            },
          }),
        },
      }
    } catch (error) {
      this.logger.error(`Failed to get publication stats: ${error.message}`)
      throw new ValidationError('Failed to get publication stats', error)
    }
  }
}
