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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const database_1 = require("@talentflow/database");
const config_1 = require("@nestjs/config");
let HealthController = class HealthController {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async check() {
        const startTime = Date.now();
        let dbStatus = 'healthy';
        let dbResponseTime = 0;
        let dbError = null;
        try {
            const dbStart = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            dbResponseTime = Date.now() - dbStart;
        }
        catch (error) {
            dbStatus = 'down';
            dbError = error.message;
        }
        let redisStatus = 'healthy';
        const redisHost = this.config.get('REDIS_HOST');
        if (!redisHost) {
            redisStatus = 'not_configured';
        }
        const responseTime = Date.now() - startTime;
        const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded';
        const healthData = {
            status: overallStatus,
            services: {
                database: {
                    status: dbStatus,
                    responseTime: dbResponseTime,
                    lastCheck: new Date().toISOString(),
                    ...(dbError && { error: dbError }),
                },
                redis: {
                    status: redisStatus,
                    lastCheck: new Date().toISOString(),
                },
                api: {
                    status: 'healthy',
                    responseTime,
                    lastCheck: new Date().toISOString(),
                },
            },
            uptime: process.uptime(),
            version: this.config.get('npm_package_version', '1.0.0'),
            environment: this.config.get('NODE_ENV', 'development'),
            timestamp: new Date().toISOString(),
        };
        return healthData;
    }
    async ready() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new Error('Database connection failed');
        }
    }
    async live() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier la santé de l\'application' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application en bonne santé' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service indisponible' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier si l\'application est prête' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application prête' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Application non prête' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier si l\'application est vivante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application vivante' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "live", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    (0, nest_keycloak_connect_1.Public)(),
    __metadata("design:paramtypes", [database_1.PrismaClient,
        config_1.ConfigService])
], HealthController);
//# sourceMappingURL=health.controller.js.map