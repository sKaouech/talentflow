import { PrismaClient, Tender } from '@talentflow/database';
import { CreateTenderInput, UpdateTenderInput, SearchTendersInput } from '@talentflow/validation';
import { PaginatedResponse } from '@talentflow/shared';
export declare class TendersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaClient);
    create(data: CreateTenderInput, tenantId: string): Promise<Tender>;
    findById(id: string, tenantId: string): Promise<Tender>;
    search(params: SearchTendersInput, tenantId: string): Promise<PaginatedResponse<Tender>>;
    update(id: string, data: UpdateTenderInput, tenantId: string): Promise<Tender>;
    delete(id: string, tenantId: string): Promise<void>;
    publish(id: string, tenantId: string): Promise<Tender>;
    archive(id: string, tenantId: string): Promise<Tender>;
    getStats(tenantId: string): Promise<{
        total: number;
        active: number;
        draft: number;
        closed: number;
        published: number;
        applicationsCount: number;
        averageApplicationsPerTender: number;
    }>;
}
