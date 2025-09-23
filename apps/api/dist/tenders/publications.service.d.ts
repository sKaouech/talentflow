import { PrismaClient, Publication } from '@talentflow/database';
import { CreatePublicationInput } from '@talentflow/validation';
export declare class PublicationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaClient);
    create(tenderId: string, data: CreatePublicationInput, tenantId: string, user: any): Promise<Publication>;
    findByTenderId(tenderId: string, tenantId: string): Promise<Publication[]>;
    publish(publicationId: string, tenantId: string): Promise<Publication>;
    delete(publicationId: string, tenantId: string): Promise<void>;
    updateEngagement(publicationId: string, engagement: any): Promise<Publication>;
    getStats(tenantId: string): Promise<{
        total: number;
        published: number;
        pending: number;
        failed: number;
        successRate: number;
        platforms: {
            linkedin: number;
            indeed: number;
        };
    }>;
}
