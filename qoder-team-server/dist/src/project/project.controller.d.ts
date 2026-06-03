import { ProjectService } from './project.service';
export declare class ProjectController {
    private project;
    constructor(project: ProjectService);
    list(teamId: string): Promise<({
        milestones: ({
            requiredArtifacts: {
                id: string;
                name: string;
                status: string;
                milestoneId: string;
                type: string;
                author: string | null;
                completedAt: string | null;
                docId: string | null;
            }[];
            gate: {
                id: string;
                name: string;
                milestoneId: string;
                passed: boolean;
            };
        } & {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            projectId: string;
            date: string;
            owner: string;
        })[];
        _count: {
            todos: number;
        };
    } & {
        id: string;
        teamId: string;
        name: string;
        slug: string;
        status: string;
        progress: number;
        desc: string;
        deadline: string;
        createdAt: Date;
    })[]>;
    create(dto: {
        teamId: string;
        name: string;
        slug: string;
        desc: string;
        deadline: string;
    }): Promise<{
        id: string;
        teamId: string;
        name: string;
        slug: string;
        status: string;
        progress: number;
        desc: string;
        deadline: string;
        createdAt: Date;
    }>;
    updateProgress(id: string, dto: {
        progress: number;
    }): Promise<{
        id: string;
        teamId: string;
        name: string;
        slug: string;
        status: string;
        progress: number;
        desc: string;
        deadline: string;
        createdAt: Date;
    }>;
}
