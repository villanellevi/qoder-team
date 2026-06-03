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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentConfigController = void 0;
const common_1 = require("@nestjs/common");
const agent_config_service_1 = require("./agent-config.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let AgentConfigController = class AgentConfigController {
    constructor(agentConfig) {
        this.agentConfig = agentConfig;
    }
    list(teamId, userId) {
        if (teamId)
            return this.agentConfig.findByTeam(teamId);
        if (userId)
            return this.agentConfig.findByUser(userId);
        return [];
    }
    updateAgent(id, dto) {
        return this.agentConfig.updateAgent(id, dto);
    }
    upsertSkill(agentId, dto) {
        return this.agentConfig.upsertSkill(agentId, dto);
    }
    removeSkill(id) {
        return this.agentConfig.removeSkill(id);
    }
    upsertMemory(agentId, dto) {
        return this.agentConfig.upsertMemory(agentId, dto);
    }
    removeMemory(id) {
        return this.agentConfig.removeMemory(id);
    }
    upsertFAQ(agentId, dto) {
        return this.agentConfig.upsertFAQ(agentId, dto);
    }
    removeFAQ(id) {
        return this.agentConfig.removeFAQ(id);
    }
    upsertWorkflow(agentId, dto) {
        return this.agentConfig.upsertWorkflow(agentId, dto);
    }
    removeWorkflow(id) {
        return this.agentConfig.removeWorkflow(id);
    }
};
exports.AgentConfigController = AgentConfigController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Query)('teamId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "updateAgent", null);
__decorate([
    (0, common_1.Post)(':id/skills'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "upsertSkill", null);
__decorate([
    (0, common_1.Delete)('skills/:skillId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('skillId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "removeSkill", null);
__decorate([
    (0, common_1.Post)(':id/memory'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "upsertMemory", null);
__decorate([
    (0, common_1.Delete)('memory/:memoryId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('memoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "removeMemory", null);
__decorate([
    (0, common_1.Post)(':id/faq'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "upsertFAQ", null);
__decorate([
    (0, common_1.Delete)('faq/:faqId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('faqId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "removeFAQ", null);
__decorate([
    (0, common_1.Post)(':id/workflows'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "upsertWorkflow", null);
__decorate([
    (0, common_1.Delete)('workflows/:workflowId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('workflowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgentConfigController.prototype, "removeWorkflow", null);
exports.AgentConfigController = AgentConfigController = __decorate([
    (0, common_1.Controller)('agents'),
    __metadata("design:paramtypes", [agent_config_service_1.AgentConfigService])
], AgentConfigController);
//# sourceMappingURL=agent-config.controller.js.map