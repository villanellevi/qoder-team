import { DailyReportService } from './daily-report.service';
export declare class DailyReportController {
    private dailyReport;
    constructor(dailyReport: DailyReportService);
    list(teamId: string): Promise<{
        id: string;
        teamId: string | null;
        memberId: string;
        date: string;
        done: string[];
        todo: string[];
        blockers: string[];
        humanFocus: string[];
        agentFocus: string[];
        createdAt: Date;
    }[]>;
    create(dto: any): Promise<{
        id: string;
        teamId: string | null;
        memberId: string;
        date: string;
        done: string[];
        todo: string[];
        blockers: string[];
        humanFocus: string[];
        agentFocus: string[];
        createdAt: Date;
    }>;
}
