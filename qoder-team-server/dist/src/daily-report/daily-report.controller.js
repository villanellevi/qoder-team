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
exports.DailyReportController = void 0;
const common_1 = require("@nestjs/common");
const daily_report_service_1 = require("./daily-report.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let DailyReportController = class DailyReportController {
    constructor(dailyReport) {
        this.dailyReport = dailyReport;
    }
    list(teamId) {
        return this.dailyReport.findByTeam(teamId);
    }
    create(dto) {
        return this.dailyReport.create(dto);
    }
};
exports.DailyReportController = DailyReportController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Query)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DailyReportController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DailyReportController.prototype, "create", null);
exports.DailyReportController = DailyReportController = __decorate([
    (0, common_1.Controller)('daily-reports'),
    __metadata("design:paramtypes", [daily_report_service_1.DailyReportService])
], DailyReportController);
//# sourceMappingURL=daily-report.controller.js.map