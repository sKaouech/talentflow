"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TendersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const tenders_service_1 = require("./tenders.service");
const publications_service_1 = require("./publications.service");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../common/guards/permissions.guard");
let TendersController = class TendersController {
    constructor(tendersService, publicationsService) {
        this.tendersService = tendersService;
        this.publicationsService = publicationsService;
    }
    async create(createTenderDto, tenantId) {
        return this.tendersService.create(createTenderDto, tenantId);
    }
    async search(searchParams, tenantId) {
        return this.tendersService.search(searchParams, tenantId);
    }
    async getStats(tenantId) {
        return this.tendersService.getStats(tenantId);
    }
    async findById(id, tenantId) {
        return this.tendersService.findById(id, tenantId);
    }
    async update(id, updateTenderDto, tenantId) {
        return this.tendersService.update(id, updateTenderDto, tenantId);
    }
    async delete(id, tenantId) {
        return this.tendersService.delete(id, tenantId);
    }
    async publish(id, tenantId) {
        return this.tendersService.publish(id, tenantId);
    }
    async archive(id, tenantId) {
        return this.tendersService.archive(id, tenantId);
    }
    async getPublications(tenderId, tenantId) {
        return this.publicationsService.findByTenderId(tenderId, tenantId);
    }
    async createPublication(tenderId, createPublicationDto, tenantId, user) {
        return this.publicationsService.create(tenderId, createPublicationDto, tenantId, user);
    }
    async publishPublication(tenderId, publicationId, tenantId) {
        return this.publicationsService.publish(publicationId, tenantId);
    }
    async deletePublication(tenderId, publicationId, tenantId) {
        return this.publicationsService.delete(publicationId, tenantId);
    }
};
exports.TendersController = TendersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouvel appel d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Appel d\'offres créé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permissions insuffisantes' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter', 'viewer'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Rechercher des appels d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des appels d\'offres' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager'] }),
    (0, permissions_decorator_1.RequirePermissions)('analytics.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les statistiques des appels d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques des appels d\'offres' }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter', 'viewer'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un appel d\'offres par ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appel d\'offres trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appel d\'offres non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un appel d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appel d\'offres mis à jour avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appel d\'offres non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un appel d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Appel d\'offres supprimé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appel d\'offres non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publier un appel d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appel d\'offres publié avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appel d\'offres non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Archiver un appel d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appel d\'offres archivé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appel d\'offres non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "archive", null);
__decorate([
    (0, common_1.Get)(':id/publications'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter', 'viewer'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les publications d\'un appel d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des publications' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "getPublications", null);
__decorate([
    (0, common_1.Post)(':id/publications'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une publication pour un appel d\'offres' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Publication créée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __param(3, (0, tenant_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "createPublication", null);
__decorate([
    (0, common_1.Post)(':tenderId/publications/:publicationId/publish'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager', 'recruiter'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publier une publication sur la plateforme' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Publication publiée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Publication non trouvée' }),
    __param(0, (0, common_1.Param)('tenderId')),
    __param(1, (0, common_1.Param)('publicationId')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "publishPublication", null);
__decorate([
    (0, common_1.Delete)(':tenderId/publications/:publicationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['tenant_admin', 'manager'] }),
    (0, permissions_decorator_1.RequirePermissions)('tenders.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une publication' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Publication supprimée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Publication non trouvée' }),
    __param(0, (0, common_1.Param)('tenderId')),
    __param(1, (0, common_1.Param)('publicationId')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "deletePublication", null);
exports.TendersController = TendersController = __decorate([
    (0, swagger_1.ApiTags)('tenders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tenders'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [tenders_service_1.TendersService,
        publications_service_1.PublicationsService])
], TendersController);
//# sourceMappingURL=tenders.controller.js.map