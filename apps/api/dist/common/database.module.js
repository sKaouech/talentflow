"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_1 = require("@talentflow/database");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: database_1.PrismaClient,
                useFactory: (config) => {
                    const prisma = new database_1.PrismaClient({
                        datasources: {
                            db: {
                                url: config.get('DATABASE_URL'),
                            },
                        },
                        log: config.get('NODE_ENV') === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
                    });
                    prisma.$use(async (params, next) => {
                        const tenantId = global.currentTenantId;
                        if (tenantId && params.model) {
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
                            ];
                            if (modelsWithTenant.includes(params.model)) {
                                if (params.action === 'findMany' || params.action === 'findFirst') {
                                    if (params.args.where) {
                                        params.args.where.tenantId = tenantId;
                                    }
                                    else {
                                        params.args.where = { tenantId };
                                    }
                                }
                                if (params.action === 'create') {
                                    if (params.args.data) {
                                        params.args.data.tenantId = tenantId;
                                    }
                                }
                                if (params.action === 'createMany') {
                                    if (params.args.data && Array.isArray(params.args.data)) {
                                        params.args.data = params.args.data.map((item) => ({
                                            ...item,
                                            tenantId,
                                        }));
                                    }
                                }
                                if (params.action === 'update' || params.action === 'updateMany') {
                                    if (params.args.where) {
                                        params.args.where.tenantId = tenantId;
                                    }
                                    else {
                                        params.args.where = { tenantId };
                                    }
                                }
                                if (params.action === 'delete' || params.action === 'deleteMany') {
                                    if (params.args.where) {
                                        params.args.where.tenantId = tenantId;
                                    }
                                    else {
                                        params.args.where = { tenantId };
                                    }
                                }
                            }
                        }
                        return next(params);
                    });
                    return prisma;
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [database_1.PrismaClient],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map