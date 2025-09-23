import { PrismaClient } from '@talentflow/database';
import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaClient, config: ConfigService);
    check(): Promise<{
        status: string;
        services: {
            database: {
                error: any;
                status: string;
                responseTime: number;
                lastCheck: string;
            };
            redis: {
                status: string;
                lastCheck: string;
            };
            api: {
                status: string;
                responseTime: number;
                lastCheck: string;
            };
        };
        uptime: number;
        version: any;
        environment: any;
        timestamp: string;
    }>;
    ready(): Promise<{
        status: string;
        timestamp: string;
    }>;
    live(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    }>;
}
