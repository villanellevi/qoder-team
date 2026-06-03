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
exports.AgentConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AgentConfigService = class AgentConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByTeam(teamId) {
        return this.prisma.agent.findMany({
            where: { teamId },
            include: {
                skills: true,
                memory: true,
                faq: true,
                workflows: true,
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.agent.findMany({
            where: { userId },
            include: {
                skills: true,
                memory: true,
                faq: true,
                workflows: true,
            },
        });
    }
    async updateAgent(id, data) {
        return this.prisma.agent.update({
            where: { id },
            data,
            include: { skills: true, memory: true, faq: true, workflows: true },
        });
    }
    async upsertSkill(agentId, data) {
        if (data.id) {
            return this.prisma.agentSkill.update({ where: { id: data.id }, data: { name: data.name, desc: data.desc } });
        }
        return this.prisma.agentSkill.create({ data: { agentId, name: data.name, desc: data.desc } });
    }
    async removeSkill(id) {
        return this.prisma.agentSkill.delete({ where: { id } });
    }
    async upsertMemory(agentId, data) {
        if (data.id) {
            return this.prisma.agentMemory.update({ where: { id: data.id }, data: { key: data.key, value: data.value } });
        }
        return this.prisma.agentMemory.create({ data: { agentId, key: data.key, value: data.value } });
    }
    async removeMemory(id) {
        return this.prisma.agentMemory.delete({ where: { id } });
    }
    async upsertFAQ(agentId, data) {
        if (data.id) {
            return this.prisma.agentFAQ.update({
                where: { id: data.id },
                data: { question: data.question, answer: data.answer, likes: data.likes, dislikes: data.dislikes },
            });
        }
        return this.prisma.agentFAQ.create({
            data: { agentId, question: data.question, answer: data.answer, likes: data.likes || 0, dislikes: data.dislikes || 0 },
        });
    }
    async removeFAQ(id) {
        return this.prisma.agentFAQ.delete({ where: { id } });
    }
    async upsertWorkflow(agentId, data) {
        if (data.id) {
            return this.prisma.agentWorkflow.update({ where: { id: data.id }, data: { name: data.name, steps: data.steps } });
        }
        return this.prisma.agentWorkflow.create({ data: { agentId, name: data.name, steps: data.steps } });
    }
    async removeWorkflow(id) {
        return this.prisma.agentWorkflow.delete({ where: { id } });
    }
};
exports.AgentConfigService = AgentConfigService;
exports.AgentConfigService = AgentConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgentConfigService);
//# sourceMappingURL=agent-config.service.js.map