import { Injectable, Logger } from '@nestjs/common'
import { PrismaClient, Tender } from '@talentflow/database'
import {
  CreateTenderInput,
  UpdateTenderInput,
  SearchTendersInput,
  createTenderSchema,
  updateTenderSchema,
  searchTendersSchema,
} from '@talentflow/validation'
import { PaginatedResponse } from '@talentflow/shared'
import { NotFoundError, ValidationError } from '@talentflow/shared'

@Injectable()
export class TendersService {
  private readonly logger = new Logger(TendersService.name)

  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Créer un nouvel appel d'offres
   */
  async create(data: CreateTenderInput, tenantId: string): Promise<Tender> {
    this.logger.log(`Creating tender for tenant ${tenantId}`)

    // Validation Zod
    const validatedData = createTenderSchema.parse(data)

    try {
      const tender = await this.prisma.tender.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          content: validatedData.content,
          source: validatedData.source,
          sourceUrl: validatedData.sourceUrl,
          type: validatedData.type,
          domain: validatedData.domain,
          skills: validatedData.skills,
          location: validatedData.location,
          remote: validatedData.remote,
          dailyRate: validatedData.dailyRate,
          currency: validatedData.currency,
          clientName: validatedData.clientName,
          clientIndustry: validatedData.clientIndustry,
          status: validatedData.status,
          priority: validatedData.priority,
          assignedTo: validatedData.assignedTo,
          duration: validatedData.duration,
          tenantId,
          // Convertir les dates si nécessaire
          startDate: validatedData.startDate
            ? new Date(validatedData.startDate)
            : null,
          endDate: validatedData.endDate
            ? new Date(validatedData.endDate)
            : null,
          publishedAt: validatedData.status === 'active' ? new Date() : null,
          expiresAt: validatedData.expiresAt
            ? new Date(validatedData.expiresAt)
            : null,
        },
        include: {
          publications: true,
          applications: {
            include: {
              candidate: true,
            },
          },
        },
      })

      this.logger.log(`Tender created with ID: ${tender.id}`)
      return tender
    } catch (error) {
      this.logger.error(`Failed to create tender: ${error.message}`)
      throw new ValidationError('Failed to create tender', error)
    }
  }

  /**
   * Récupérer un appel d'offres par ID
   */
  async findById(id: string, tenantId: string): Promise<Tender> {
    this.logger.log(`Finding tender ${id} for tenant ${tenantId}`)

    const tender = await this.prisma.tender.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      include: {
        publications: true,
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!tender) {
      throw new NotFoundError('Tender', id)
    }

    return tender
  }

  /**
   * Rechercher des appels d'offres avec pagination et filtres
   */
  async search(
    params: SearchTendersInput,
    tenantId: string
  ): Promise<PaginatedResponse<Tender>> {
    this.logger.log(`Searching tenders for tenant ${tenantId}`)

    // Validation Zod
    const validatedParams = searchTendersSchema.parse(params)
    const { page, limit, sortBy, sortOrder, q, filters, ...searchFilters } =
      validatedParams

    // Construction de la clause WHERE
    const where: any = {
      tenantId,
      deletedAt: null,
    }

    // Recherche textuelle
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { clientName: { contains: q, mode: 'insensitive' } },
      ]
    }

    // Filtres spécifiques
    if (searchFilters.type) where.type = searchFilters.type
    if (searchFilters.status) where.status = searchFilters.status
    if (searchFilters.priority) where.priority = searchFilters.priority
    if (searchFilters.remote) where.remote = searchFilters.remote
    if (searchFilters.location)
      where.location = { contains: searchFilters.location, mode: 'insensitive' }
    if (searchFilters.assignedTo) where.assignedTo = searchFilters.assignedTo

    // Filtres par compétences
    if (searchFilters.skills && searchFilters.skills.length > 0) {
      where.skills = {
        hasSome: searchFilters.skills,
      }
    }

    // Filtres par dates
    if (searchFilters.startDate || searchFilters.endDate) {
      where.createdAt = {}
      if (searchFilters.startDate) {
        where.createdAt.gte = new Date(searchFilters.startDate)
      }
      if (searchFilters.endDate) {
        where.createdAt.lte = new Date(searchFilters.endDate)
      }
    }

    // Filtres personnalisés
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          where[key] = value
        }
      })
    }

    // Tri
    const orderBy: any = {}
    if (sortBy) {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.createdAt = 'desc'
    }

    // Pagination
    const skip = (page - 1) * limit

    try {
      const [items, total] = await Promise.all([
        this.prisma.tender.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            publications: {
              select: {
                id: true,
                platform: true,
                status: true,
                publishedAt: true,
              },
            },
            applications: {
              select: {
                id: true,
                status: true,
                appliedAt: true,
              },
            },
          },
        }),
        this.prisma.tender.count({ where }),
      ])

      const pages = Math.ceil(total / limit)

      this.logger.log(`Found ${total} tenders for tenant ${tenantId}`)

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      }
    } catch (error) {
      this.logger.error(`Failed to search tenders: ${error.message}`)
      throw new ValidationError('Failed to search tenders', error)
    }
  }

  /**
   * Mettre à jour un appel d'offres
   */
  async update(
    id: string,
    data: UpdateTenderInput,
    tenantId: string
  ): Promise<Tender> {
    this.logger.log(`Updating tender ${id} for tenant ${tenantId}`)

    // Vérifier que le tender existe
    await this.findById(id, tenantId)

    // Validation Zod
    const validatedData = updateTenderSchema.parse(data)

    try {
      const updateData: any = { ...validatedData }

      // Convertir les dates si nécessaire
      if (validatedData.startDate)
        updateData.startDate = new Date(validatedData.startDate)
      if (validatedData.endDate)
        updateData.endDate = new Date(validatedData.endDate)

      // Si le statut passe à 'active', définir publishedAt
      if (validatedData.status === 'active') {
        updateData.publishedAt = new Date()
      }

      const tender = await this.prisma.tender.update({
        where: { id },
        data: updateData,
        include: {
          publications: true,
          applications: {
            include: {
              candidate: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
        },
      })

      this.logger.log(`Tender ${id} updated successfully`)
      return tender
    } catch (error) {
      this.logger.error(`Failed to update tender ${id}: ${error.message}`)
      throw new ValidationError('Failed to update tender', error)
    }
  }

  /**
   * Supprimer un appel d'offres (soft delete)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    this.logger.log(`Deleting tender ${id} for tenant ${tenantId}`)

    // Vérifier que le tender existe
    await this.findById(id, tenantId)

    try {
      await this.prisma.tender.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      })

      this.logger.log(`Tender ${id} deleted successfully`)
    } catch (error) {
      this.logger.error(`Failed to delete tender ${id}: ${error.message}`)
      throw new ValidationError('Failed to delete tender', error)
    }
  }

  /**
   * Publier un appel d'offres (change le statut à 'active')
   */
  async publish(id: string, tenantId: string): Promise<Tender> {
    this.logger.log(`Publishing tender ${id} for tenant ${tenantId}`)

    return this.update(id, { status: 'active' }, tenantId)
  }

  /**
   * Archiver un appel d'offres
   */
  async archive(id: string, tenantId: string): Promise<Tender> {
    this.logger.log(`Archiving tender ${id} for tenant ${tenantId}`)

    return this.update(id, { status: 'archived' }, tenantId)
  }

  /**
   * Obtenir les statistiques des appels d'offres pour un tenant
   */
  async getStats(tenantId: string) {
    this.logger.log(`Getting tender stats for tenant ${tenantId}`)

    try {
      const [total, active, draft, closed, published, applicationsCount] =
        await Promise.all([
          this.prisma.tender.count({
            where: { tenantId, deletedAt: null },
          }),
          this.prisma.tender.count({
            where: { tenantId, status: 'active', deletedAt: null },
          }),
          this.prisma.tender.count({
            where: { tenantId, status: 'draft', deletedAt: null },
          }),
          this.prisma.tender.count({
            where: { tenantId, status: 'closed', deletedAt: null },
          }),
          this.prisma.tender.count({
            where: { tenantId, publishedAt: { not: null }, deletedAt: null },
          }),
          this.prisma.application.count({
            where: {
              tender: { tenantId, deletedAt: null },
            },
          }),
        ])

      return {
        total,
        active,
        draft,
        closed,
        published,
        applicationsCount,
        averageApplicationsPerTender:
          total > 0 ? Math.round(applicationsCount / total) : 0,
      }
    } catch (error) {
      this.logger.error(`Failed to get tender stats: ${error.message}`)
      throw new ValidationError('Failed to get tender stats', error)
    }
  }
}
