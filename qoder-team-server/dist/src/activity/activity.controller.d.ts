import { ActivityService } from './activity.service';
export declare class ActivityController {
    private activity;
    constructor(activity: ActivityService);
    list(teamId: string): Promise<{
        id: string;
        teamId: string | null;
        icon: string;
        text: string;
        time: string;
        type: string;
        createdAt: Date;
    }[]>;
    create(dto: any): Promise<{
        id: string;
        teamId: string | null;
        icon: string;
        text: string;
        time: string;
        type: string;
        createdAt: Date;
    }>;
}
