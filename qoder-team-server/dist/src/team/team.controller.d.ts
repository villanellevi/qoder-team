import { TeamService } from './team.service';
export declare class CreateTeamDto {
    name: string;
    slug: string;
}
export declare class TeamController {
    private team;
    constructor(team: TeamService);
    create(dto: CreateTeamDto, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
    list(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }[]>;
    get(slug: string, userId: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatar: string;
            };
        } & {
            id: string;
            role: string;
            userId: string;
            teamId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
    }>;
    members(teamId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        role: string;
        userId: string;
        teamId: string;
    })[]>;
}
