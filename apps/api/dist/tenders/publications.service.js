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
var PublicationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@talentflow/database");
const validation_1 = require("@talentflow/validation");
const shared_1 = require("@talentflow/shared");
let PublicationsService = PublicationsService_1 = class PublicationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PublicationsService_1.name);
    }
    async create(tenderId, data, tenantId, user) {
        this.logger.log(`Creating publication for tender ${tenderId}`);
        const tender = await this.prisma.tender.findFirst({
            where: {
                id: tenderId,
                tenantId,
                deletedAt: null,
            },
        });
        if (!tender) {
            throw new shared_1.NotFoundError('Tender', tenderId);
        }
        const validatedData = validation_1.createPublicationSchema.parse(data);
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
            });
            this.logger.log(`Publication created with ID: ${publication.id}`);
            return publication;
        }
        catch (error) {
            this.logger.error(`Failed to create publication: ${error.message}`);
            throw new shared_1.ValidationError('Failed to create publication', error);
        }
    }
    async findByTenderId(tenderId, tenantId) {
        this.logger.log(`Finding publications for tender ${tenderId}`);
        const tender = await this.prisma.tender.findFirst({
            where: {
                id: tenderId,
                tenantId,
                deletedAt: null,
            },
        });
        if (!tender) {
            throw new shared_1.NotFoundError('Tender', tenderId);
        }
        const publications = await this.prisma.publication.findMany({
            where: {
                tenderId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return publications;
    }
    async publish(publicationId, tenantId) {
        this.logger.log(`Publishing publication ${publicationId}`);
        const publication = await this.prisma.publication.findFirst({
            where: {
                id: publicationId,
                tender: {
                    tenantId,
                    deletedAt: null,
                },
            },
        });
        if (!publication) {
            throw new shared_1.NotFoundError('Publication', publicationId);
        }
        if (publication.status === 'published') {
            throw new shared_1.ValidationError('Publication already published');
        }
        try {
            const updatedPublication = await this.prisma.publication.update({
                where: { id: publicationId },
                data: {
                    status: 'published',
                    publishedAt: new Date(),
                    platformId: `sim_${Date.now()}`,
                    engagement: {
                        likes: 0,
                        shares: 0,
                        comments: 0,
                        views: 0,
                    },
                },
            });
            this.logger.log(`Publication ${publicationId} published successfully`);
            return updatedPublication;
        }
        catch (error) {
            this.logger.error(`Failed to publish publication ${publicationId}: ${error.message}`);
            await this.prisma.publication.update({
                where: { id: publicationId },
                data: {
                    status: 'failed',
                    errorMessage: error.message,
                },
            });
            throw new shared_1.ValidationError('Failed to publish publication', error);
        }
    }
    async delete(publicationId, tenantId) {
        this.logger.log(`Deleting publication ${publicationId}`);
        const publication = await this.prisma.publication.findFirst({
            where: {
                id: publicationId,
                tender: {
                    tenantId,
                    deletedAt: null,
                },
            },
        });
        if (!publication) {
            throw new shared_1.NotFoundError('Publication', publicationId);
        }
        try {
            await this.prisma.publication.delete({
                where: { id: publicationId },
            });
            this.logger.log(`Publication ${publicationId} deleted successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to delete publication ${publicationId}: ${error.message}`);
            throw new shared_1.ValidationError('Failed to delete publication', error);
        }
    }
    async updateEngagement(publicationId, engagement) {
        this.logger.log(`Updating engagement for publication ${publicationId}`);
        try {
            const publication = await this.prisma.publication.update({
                where: { id: publicationId },
                data: {
                    engagement,
                    updatedAt: new Date(),
                },
            });
            return publication;
        }
        catch (error) {
            this.logger.error(`Failed to update engagement: ${error.message}`);
            throw new shared_1.ValidationError('Failed to update engagement', error);
        }
    }
    async getStats(tenantId) {
        this.logger.log(`Getting publication stats for tenant ${tenantId}`);
        try {
            const [total, published, pending, failed,] = await Promise.all([
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
            ]);
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
            };
        }
        catch (error) {
            this.logger.error(`Failed to get publication stats: ${error.message}`);
            throw new shared_1.ValidationError('Failed to get publication stats', error);
        }
    }
};
exports.PublicationsService = PublicationsService;
exports.PublicationsService = PublicationsService = PublicationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], PublicationsService);
//# sourceMappingURL=publications.service.js.map