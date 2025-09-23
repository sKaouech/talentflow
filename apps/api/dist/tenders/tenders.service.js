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
var TendersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TendersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@talentflow/database");
const validation_1 = require("@talentflow/validation");
const shared_1 = require("@talentflow/shared");
let TendersService = TendersService_1 = class TendersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TendersService_1.name);
    }
    async create(data, tenantId) {
        this.logger.log(`Creating tender for tenant ${tenantId}`);
        const validatedData = validation_1.createTenderSchema.parse(data);
        try {
            const tender = await this.prisma.tender.create({
                data: {
                    ...validatedData,
                    tenantId,
                    startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
                    endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
                    publishedAt: validatedData.status === 'active' ? new Date() : null,
                },
                include: {
                    publications: true,
                    applications: {
                        include: {
                            candidate: true,
                        },
                    },
                },
            });
            this.logger.log(`Tender created with ID: ${tender.id}`);
            return tender;
        }
        catch (error) {
            this.logger.error(`Failed to create tender: ${error.message}`);
            throw new shared_1.ValidationError('Failed to create tender', error);
        }
    }
    async findById(id, tenantId) {
        this.logger.log(`Finding tender ${id} for tenant ${tenantId}`);
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
        });
        if (!tender) {
            throw new shared_1.NotFoundError('Tender', id);
        }
        return tender;
    }
    async search(params, tenantId) {
        this.logger.log(`Searching tenders for tenant ${tenantId}`);
        const validatedParams = validation_1.searchTendersSchema.parse(params);
        const { page, limit, sortBy, sortOrder, q, filters, ...searchFilters } = validatedParams;
        const where = {
            tenantId,
            deletedAt: null,
        };
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { clientName: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (searchFilters.type)
            where.type = searchFilters.type;
        if (searchFilters.status)
            where.status = searchFilters.status;
        if (searchFilters.priority)
            where.priority = searchFilters.priority;
        if (searchFilters.remote)
            where.remote = searchFilters.remote;
        if (searchFilters.location)
            where.location = { contains: searchFilters.location, mode: 'insensitive' };
        if (searchFilters.assignedTo)
            where.assignedTo = searchFilters.assignedTo;
        if (searchFilters.skills && searchFilters.skills.length > 0) {
            where.skills = {
                hasSome: searchFilters.skills,
            };
        }
        if (searchFilters.startDate || searchFilters.endDate) {
            where.createdAt = {};
            if (searchFilters.startDate) {
                where.createdAt.gte = new Date(searchFilters.startDate);
            }
            if (searchFilters.endDate) {
                where.createdAt.lte = new Date(searchFilters.endDate);
            }
        }
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    where[key] = value;
                }
            });
        }
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const skip = (page - 1) * limit;
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
            ]);
            const pages = Math.ceil(total / limit);
            this.logger.log(`Found ${total} tenders for tenant ${tenantId}`);
            return {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to search tenders: ${error.message}`);
            throw new shared_1.ValidationError('Failed to search tenders', error);
        }
    }
    async update(id, data, tenantId) {
        this.logger.log(`Updating tender ${id} for tenant ${tenantId}`);
        await this.findById(id, tenantId);
        const validatedData = validation_1.updateTenderSchema.parse(data);
        try {
            const updateData = { ...validatedData };
            if (validatedData.startDate)
                updateData.startDate = new Date(validatedData.startDate);
            if (validatedData.endDate)
                updateData.endDate = new Date(validatedData.endDate);
            if (validatedData.status === 'active') {
                updateData.publishedAt = new Date();
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
            });
            this.logger.log(`Tender ${id} updated successfully`);
            return tender;
        }
        catch (error) {
            this.logger.error(`Failed to update tender ${id}: ${error.message}`);
            throw new shared_1.ValidationError('Failed to update tender', error);
        }
    }
    async delete(id, tenantId) {
        this.logger.log(`Deleting tender ${id} for tenant ${tenantId}`);
        await this.findById(id, tenantId);
        try {
            await this.prisma.tender.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
            this.logger.log(`Tender ${id} deleted successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to delete tender ${id}: ${error.message}`);
            throw new shared_1.ValidationError('Failed to delete tender', error);
        }
    }
    async publish(id, tenantId) {
        this.logger.log(`Publishing tender ${id} for tenant ${tenantId}`);
        return this.update(id, { status: 'active' }, tenantId);
    }
    async archive(id, tenantId) {
        this.logger.log(`Archiving tender ${id} for tenant ${tenantId}`);
        return this.update(id, { status: 'archived' }, tenantId);
    }
    async getStats(tenantId) {
        this.logger.log(`Getting tender stats for tenant ${tenantId}`);
        try {
            const [total, active, draft, closed, published, applicationsCount,] = await Promise.all([
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
            ]);
            return {
                total,
                active,
                draft,
                closed,
                published,
                applicationsCount,
                averageApplicationsPerTender: total > 0 ? Math.round(applicationsCount / total) : 0,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get tender stats: ${error.message}`);
            throw new shared_1.ValidationError('Failed to get tender stats', error);
        }
    }
};
exports.TendersService = TendersService;
exports.TendersService = TendersService = TendersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], TendersService);
//# sourceMappingURL=tenders.service.js.map