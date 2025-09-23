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
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { TendersService } from './tenders.service'
import {
  CreateTenderInput,
  UpdateTenderInput,
  SearchTendersInput,
} from '@talentflow/validation'

@ApiTags('tenders')
@Controller('tenders')
export class TendersDevController {
  constructor(private readonly tendersService: TendersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouvel appel d\'offres' })
  @ApiResponse({ status: 201, description: 'Appel d\'offres créé avec succès' })
  async create(@Body() createTenderDto: CreateTenderInput): Promise<any> {
    // Utiliser un tenant ID fixe pour le développement
    return this.tendersService.create(createTenderDto, 'dev-tenant-id')
  }

  @Get()
  @ApiOperation({ summary: 'Rechercher des appels d\'offres' })
  @ApiResponse({ status: 200, description: 'Liste des appels d\'offres' })
  async search(@Query() searchParams: SearchTendersInput): Promise<any> {
    return this.tendersService.search(searchParams, 'dev-tenant-id')
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques des appels d\'offres' })
  @ApiResponse({ status: 200, description: 'Statistiques des appels d\'offres' })
  async getStats(): Promise<any> {
    return this.tendersService.getStats('dev-tenant-id')
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un appel d\'offres par ID' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres trouvé' })
  async findById(@Param('id') id: string): Promise<any> {
    return this.tendersService.findById(id, 'dev-tenant-id')
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres mis à jour avec succès' })
  async update(
    @Param('id') id: string,
    @Body() updateTenderDto: UpdateTenderInput
  ): Promise<any> {
    return this.tendersService.update(id, updateTenderDto, 'dev-tenant-id')
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un appel d\'offres' })
  @ApiResponse({ status: 204, description: 'Appel d\'offres supprimé avec succès' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.tendersService.delete(id, 'dev-tenant-id')
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publier un appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres publié avec succès' })
  async publish(@Param('id') id: string): Promise<any> {
    return this.tendersService.publish(id, 'dev-tenant-id')
  }
}
