import { DocumentService } from './document.service';
export declare class CreateDocDto {
    teamId: string;
    title: string;
    content: string;
    source: string;
    tags?: string[];
}
export declare class UpdateDocDto {
    title?: string;
    content?: string;
    source?: string;
    tags?: string[];
}
export declare class DocumentController {
    private doc;
    constructor(doc: DocumentService);
    list(teamId: string, source?: string): Promise<({
        author: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    })[]>;
    get(id: string): Promise<{
        author: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
    create(dto: CreateDocDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
    update(id: string, dto: UpdateDocDto): Promise<{
        author: {
            id: string;
            name: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        content: string;
        title: string;
        source: string;
        tags: string[];
        updatedAt: Date;
        authorId: string;
    }>;
}
