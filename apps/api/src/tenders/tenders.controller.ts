import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'nest-keycloak-connect'
import { TendersService } from './tenders.service'
import { PublicationsService } from './publications.service'
import { CurrentTenant, CurrentUser } from '../common/decorators/tenant.decorator'
import { RequirePermissions } from '../common/decorators/permissions.decorator'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import {
  CreateTenderInput,
  UpdateTenderInput,
  SearchTendersInput,
  CreatePublicationInput,
} from '@talentflow/validation'

@ApiTags('tenders')
@ApiBearerAuth()
@Controller('tenders')
@UseGuards(PermissionsGuard)
export class TendersController {
  constructor(
    private readonly tendersService: TendersService,
    private readonly publicationsService: PublicationsService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter'] })
  @RequirePermissions('tenders.create')
  @ApiOperation({ summary: 'Créer un nouvel appel d\'offres' })
  @ApiResponse({ status: 201, description: 'Appel d\'offres créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes' })
  async create(
    @Body() createTenderDto: CreateTenderInput,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.tendersService.create(createTenderDto, tenantId)
  }

  @Get()
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter', 'viewer'] })
  @RequirePermissions('tenders.read')
  @ApiOperation({ summary: 'Rechercher des appels d\'offres' })
  @ApiResponse({ status: 200, description: 'Liste des appels d\'offres' })
  async search(
    @Query() searchParams: SearchTendersInput,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.tendersService.search(searchParams, tenantId)
  }

  @Get('stats')
  @Roles({ roles: ['tenant_admin', 'manager'] })
  @RequirePermissions('analytics.read')
  @ApiOperation({ summary: 'Obtenir les statistiques des appels d\'offres' })
  @ApiResponse({ status: 200, description: 'Statistiques des appels d\'offres' })
  async getStats(@CurrentTenant() tenantId: string) {
    return this.tendersService.getStats(tenantId)
  }

  @Get(':id')
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter', 'viewer'] })
  @RequirePermissions('tenders.read')
  @ApiOperation({ summary: 'Récupérer un appel d\'offres par ID' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres trouvé' })
  @ApiResponse({ status: 404, description: 'Appel d\'offres non trouvé' })
  async findById(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.tendersService.findById(id, tenantId)
  }

  @Put(':id')
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter'] })
  @RequirePermissions('tenders.update')
  @ApiOperation({ summary: 'Mettre à jour un appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Appel d\'offres non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() updateTenderDto: UpdateTenderInput,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.tendersService.update(id, updateTenderDto, tenantId)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles({ roles: ['tenant_admin', 'manager'] })
  @RequirePermissions('tenders.delete')
  @ApiOperation({ summary: 'Supprimer un appel d\'offres' })
  @ApiResponse({ status: 204, description: 'Appel d\'offres supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Appel d\'offres non trouvé' })
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string
  ) {
    return this.tendersService.delete(id, tenantId)
  }

  @Post(':id/publish')
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter'] })
  @RequirePermissions('tenders.publish')
  @ApiOperation({ summary: 'Publier un appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres publié avec succès' })
  @ApiResponse({ status: 404, description: 'Appel d\'offres non trouvé' })
  async publish(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.tendersService.publish(id, tenantId)
  }

  @Post(':id/archive')
  @Roles({ roles: ['tenant_admin', 'manager'] })
  @RequirePermissions('tenders.update')
  @ApiOperation({ summary: 'Archiver un appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres archivé avec succès' })
  @ApiResponse({ status: 404, description: 'Appel d\'offres non trouvé' })
  async archive(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.tendersService.archive(id, tenantId)
  }

  // Publications
  @Get(':id/publications')
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter', 'viewer'] })
  @RequirePermissions('tenders.read')
  @ApiOperation({ summary: 'Récupérer les publications d\'un appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Liste des publications' })
  async getPublications(
    @Param('id') tenderId: string,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.publicationsService.findByTenderId(tenderId, tenantId)
  }

  @Post(':id/publications')
  @HttpCode(HttpStatus.CREATED)
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter'] })
  @RequirePermissions('tenders.publish')
  @ApiOperation({ summary: 'Créer une publication pour un appel d\'offres' })
  @ApiResponse({ status: 201, description: 'Publication créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createPublication(
    @Param('id') tenderId: string,
    @Body() createPublicationDto: CreatePublicationInput,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any
  ): Promise<any> {
    return this.publicationsService.create(tenderId, createPublicationDto, tenantId, user)
  }

  @Post(':tenderId/publications/:publicationId/publish')
  @Roles({ roles: ['tenant_admin', 'manager', 'recruiter'] })
  @RequirePermissions('tenders.publish')
  @ApiOperation({ summary: 'Publier une publication sur la plateforme' })
  @ApiResponse({ status: 200, description: 'Publication publiée avec succès' })
  @ApiResponse({ status: 404, description: 'Publication non trouvée' })
  async publishPublication(
    @Param('tenderId') tenderId: string,
    @Param('publicationId') publicationId: string,
    @CurrentTenant() tenantId: string
  ): Promise<any> {
    return this.publicationsService.publish(publicationId, tenantId)
  }

  @Delete(':tenderId/publications/:publicationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles({ roles: ['tenant_admin', 'manager'] })
  @RequirePermissions('tenders.delete')
  @ApiOperation({ summary: 'Supprimer une publication' })
  @ApiResponse({ status: 204, description: 'Publication supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Publication non trouvée' })
  async deletePublication(
    @Param('tenderId') tenderId: string,
    @Param('publicationId') publicationId: string,
    @CurrentTenant() tenantId: string
  ) {
    return this.publicationsService.delete(publicationId, tenantId)
  }
}
