import { AgentConfigService } from './agent-config.service';
export declare class AgentConfigController {
    private agentConfig;
    constructor(agentConfig: AgentConfigService);
    list(teamId: string, userId: string): any[] | Promise<({
        skills: {
            id: string;
            name: string;
            agentId: string;
            desc: string;
        }[];
        memory: {
            id: string;
            agentId: string;
            key: string;
            value: string;
            updatedAt: Date;
        }[];
        faq: {
            id: string;
            agentId: string;
            question: string;
            answer: string;
            likes: number;
            dislikes: number;
        }[];
        workflows: {
            id: string;
            name: string;
            agentId: string;
            steps: string[];
        }[];
    } & {
        id: string;
        userId: string;
        teamId: string | null;
        name: string;
        icon: string;
        systemPrompt: string;
        createdAt: Date;
    })[]>;
    updateAgent(id: string, dto: any): Promise<{
        skills: {
            id: string;
            name: string;
            agentId: string;
            desc: string;
        }[];
        memory: {
            id: string;
            agentId: string;
            key: string;
            value: string;
            updatedAt: Date;
        }[];
        faq: {
            id: string;
            agentId: string;
            question: string;
            answer: string;
            likes: number;
            dislikes: number;
        }[];
        workflows: {
            id: string;
            name: string;
            agentId: string;
            steps: string[];
        }[];
    } & {
        id: string;
        userId: string;
        teamId: string | null;
        name: string;
        icon: string;
        systemPrompt: string;
        createdAt: Date;
    }>;
    upsertSkill(agentId: string, dto: any): Promise<{
        id: string;
        name: string;
        agentId: string;
        desc: string;
    }>;
    removeSkill(id: string): Promise<{
        id: string;
        name: string;
        agentId: string;
        desc: string;
    }>;
    upsertMemory(agentId: string, dto: any): Promise<{
        id: string;
        agentId: string;
        key: string;
        value: string;
        updatedAt: Date;
    }>;
    removeMemory(id: string): Promise<{
        id: string;
        agentId: string;
        key: string;
        value: string;
        updatedAt: Date;
    }>;
    upsertFAQ(agentId: string, dto: any): Promise<{
        id: string;
        agentId: string;
        question: string;
        answer: string;
        likes: number;
        dislikes: number;
    }>;
    removeFAQ(id: string): Promise<{
        id: string;
        agentId: string;
        question: string;
        answer: string;
        likes: number;
        dislikes: number;
    }>;
    upsertWorkflow(agentId: string, dto: any): Promise<{
        id: string;
        name: string;
        agentId: string;
        steps: string[];
    }>;
    removeWorkflow(id: string): Promise<{
        id: string;
        name: string;
        agentId: string;
        steps: string[];
    }>;
}
