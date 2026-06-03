"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeamService = class TeamService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(name, slug, userId) {
        return this.prisma.team.create({
            data: {
                name,
                slug,
                members: { create: { userId, role: 'owner' } },
                channels: {
                    create: { name: '全员群聊', type: 'group', members: [userId] },
                },
            },
        });
    }
    async findForUser(userId) {
        const memberships = await this.prisma.teamMember.findMany({
            where: { userId },
            include: { team: true },
        });
        return memberships.map(m => m.team);
    }
    async findBySlug(slug, userId) {
        const team = await this.prisma.team.findUnique({
            where: { slug },
            include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } },
        });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        const isMember = team.members.some(m => m.userId === userId);
        if (!isMember)
            throw new common_1.NotFoundException('Team not found');
        return team;
    }
    async getMembers(teamId) {
        const members = await this.prisma.teamMember.findMany({
            where: { teamId },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
        return members;
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamService);
//# sourceMappingURL=team.service.js.map