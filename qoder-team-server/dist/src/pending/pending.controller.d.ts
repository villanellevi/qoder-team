import { PendingService } from './pending.service';
export declare class PendingController {
    private pending;
    constructor(pending: PendingService);
    list(teamId: string): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }[]>;
    create(dto: any): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }>;
    update(id: string, dto: any): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        teamId: string | null;
        title: string;
        desc: string;
        assigner: string;
        assignerType: string;
        assignerIcon: string | null;
        status: string;
        context: string | null;
        relatedMember: string | null;
        createdAt: Date;
    }>;
}
