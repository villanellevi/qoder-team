"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentConfigModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("../prisma/prisma.module");
const agent_config_service_1 = require("./agent-config.service");
const agent_config_controller_1 = require("./agent-config.controller");
let AgentConfigModule = class AgentConfigModule {
};
exports.AgentConfigModule = AgentConfigModule;
exports.AgentConfigModule = AgentConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, jwt_1.JwtModule],
        controllers: [agent_config_controller_1.AgentConfigController],
        providers: [agent_config_service_1.AgentConfigService],
        exports: [agent_config_service_1.AgentConfigService],
    })
], AgentConfigModule);
//# sourceMappingURL=agent-config.module.js.map