"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const bull_1 = require("@nestjs/bull");
const nest_winston_1 = require("nest-winston");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const core_1 = require("@nestjs/core");
const winston = __importStar(require("winston"));
const database_module_1 = require("./common/database.module");
const auth_module_1 = require("./auth/auth.module");
const tenders_module_1 = require("./tenders/tenders.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            nest_winston_1.WinstonModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    transports: [
                        new winston.transports.Console({
                            format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
                        }),
                        ...(config.get('NODE_ENV') === 'production'
                            ? [
                                new winston.transports.File({
                                    filename: 'logs/error.log',
                                    level: 'error',
                                    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                                }),
                                new winston.transports.File({
                                    filename: 'logs/combined.log',
                                    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                                }),
                            ]
                            : []),
                    ],
                }),
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ([{
                        ttl: 60000,
                        limit: config.get('RATE_LIMIT_MAX', 100),
                    }]),
            }),
            cache_manager_1.CacheModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    store: 'memory',
                    ttl: 300000,
                }),
            }),
            bull_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                        password: config.get('REDIS_PASSWORD'),
                    },
                }),
            }),
            nest_keycloak_connect_1.KeycloakConnectModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    authServerUrl: config.get('KEYCLOAK_AUTH_SERVER_URL'),
                    realm: config.get('KEYCLOAK_REALM'),
                    clientId: config.get('KEYCLOAK_CLIENT_ID'),
                    secret: config.get('KEYCLOAK_CLIENT_SECRET'),
                    cookieKey: 'KEYCLOAK_JWT',
                    logLevels: ['verbose'],
                    useNestLogger: true,
                }),
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            tenders_module_1.TendersModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.AuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.ResourceGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.RoleGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map