"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = await bcrypt.hash('demo123', 10);
    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'demo@qoder.team' },
            update: {},
            create: { email: 'demo@qoder.team', name: '雪辰', password: hash, role: 'admin', avatar: '❄️' },
        }),
        prisma.user.upsert({
            where: { email: 'wangchen@qoder.team' },
            update: {},
            create: { email: 'wangchen@qoder.team', name: '王辰', password: hash, role: 'member', avatar: '👑' },
        }),
        prisma.user.upsert({
            where: { email: 'jianchuan@qoder.team' },
            update: {},
            create: { email: 'jianchuan@qoder.team', name: '鉴川', password: hash, role: 'member', avatar: '🔍' },
        }),
        prisma.user.upsert({
            where: { email: 'guangling@qoder.team' },
            update: {},
            create: { email: 'guangling@qoder.team', name: '广苓', password: hash, role: 'member', avatar: '📊' },
        }),
        prisma.user.upsert({
            where: { email: 'xubai@qoder.team' },
            update: {},
            create: { email: 'xubai@qoder.team', name: '叙白', password: hash, role: 'member', avatar: '🎨' },
        }),
        prisma.user.upsert({
            where: { email: 'mengyu@qoder.team' },
            update: {},
            create: { email: 'mengyu@qoder.team', name: '孟雨', password: hash, role: 'member', avatar: '🌧️' },
        }),
    ]);
    const me = users[0];
    const team = await prisma.team.upsert({
        where: { slug: 'qoder-demo' },
        update: {},
        create: {
            name: 'Qoder Demo Team',
            slug: 'qoder-demo',
            members: {
                create: users.map((u, i) => ({ userId: u.id, role: i === 0 ? 'owner' : 'member' })),
            },
            channels: {
                create: [
                    { name: '全员群聊', type: 'group', members: users.map(u => u.id) },
                    { name: 'AI Agent 协作', type: 'myagent', members: [me.id] },
                ],
            },
        },
        include: { channels: true },
    });
    const groupChannel = team.channels[0];
    await prisma.chatMessage.createMany({
        data: [
            { channelId: groupChannel.id, senderId: me.id, senderType: 'human', content: '大家好，这是 Qoder Team 的 Demo 频道 🚀' },
            { channelId: groupChannel.id, senderId: me.id, senderType: 'agent', content: '已为您整理今日项目进展：推荐系统 v2.3 开发中，PRD 已更新。' },
        ],
    });
    await prisma.document.createMany({
        data: [
            { teamId: team.id, authorId: users[2].id, title: '推荐系统 API 接口规范 v2', content: 'RESTful API 文档，包含数据输入、模型推理、结果缓存端点', source: 'agent', tags: ['api', 'agent'] },
            { teamId: team.id, authorId: users[1].id, title: 'RecommendCard.tsx 组件', content: '推荐卡片组件，含虚拟列表和 HTML 渲染', source: 'agent', tags: ['component', 'agent'] },
            { teamId: team.id, authorId: users[3].id, title: '模型 v2.1 推理性能报告', content: 'P99=118ms，批量 20 条=350ms', source: 'agent', tags: ['model', 'agent'] },
            { teamId: team.id, authorId: me.id, title: 'Prompt 工程最佳实践', content: '整理了各 Agent 常用的 Prompt 模板和优化技巧', source: 'human', tags: ['practice'] },
            { teamId: team.id, authorId: users[2].id, title: 'React 性能优化指南', content: 'React 性能优化最佳实践，含代码示例和测试数据', source: 'human', tags: ['practice'] },
            { teamId: team.id, authorId: me.id, title: 'PRD v2.3 — 推荐系统重构', content: '推荐系统重构需求文档', source: 'collab', tags: ['prd', 'collab'] },
            { teamId: team.id, authorId: users[1].id, title: 'useLazyImage Hook', content: '基于 Intersection Observer 的图片懒加载 Hook', source: 'agent', tags: ['hook', 'agent'] },
        ],
    });
    const project = await prisma.project.create({
        data: {
            teamId: team.id,
            name: '推荐系统重构 v2',
            slug: 'recommend-v2',
            status: 'active',
            progress: 60,
            desc: '推荐系统全链路重构，含前端组件、后端接口、算法模型',
            deadline: '6/5',
        },
    });
    await prisma.milestone.createMany({
        data: [
            { projectId: project.id, name: '需求评审', status: 'done', date: '5/15', owner: '雪辰' },
            { projectId: project.id, name: '技术方案', status: 'done', date: '5/18', owner: '鉴川' },
            { projectId: project.id, name: '接口开发', status: 'running', date: '5/22', owner: '鉴川' },
            { projectId: project.id, name: '前端开发', status: 'running', date: '5/24', owner: '王辰' },
            { projectId: project.id, name: '模型训练', status: 'done', date: '5/20', owner: '广苓' },
            { projectId: project.id, name: '设计验收', status: 'running', date: '5/26', owner: '叙白' },
            { projectId: project.id, name: '联调测试', status: 'waiting', date: '5/28', owner: '孟雨' },
            { projectId: project.id, name: '灰度发布', status: 'waiting', date: '6/1', owner: '鉴川' },
            { projectId: project.id, name: '全量上线', status: 'waiting', date: '6/5', owner: '全员' },
        ],
    });
    await prisma.todo.createMany({
        data: [
            { projectId: project.id, teamId: team.id, title: '确认 Redis 缓存策略', assignee: '雪辰', priority: 'high', status: 'todo', due: '5/27', type: 'human', background: '鉴川的 Agent 设计了缓存方案：TTL=10min, 命中率约 85%。需产品确认是否符合业务需求。', materials: ['缓存策略文档', '性能测试报告'], actions: ['审阅方案', '确认 TTL', '确认降级策略'] },
            { projectId: project.id, teamId: team.id, title: '审阅推荐卡片交互设计', assignee: '雪辰', priority: 'medium', status: 'todo', due: '5/28', type: 'human', background: '王辰的 Agent 已生成组件初版，需确认交互细节和视觉规范。', materials: ['RecommendCard.tsx', 'Figma 设计稿'], actions: ['检查渲染效果', '确认封面尺寸', '验收文案展示'] },
            { projectId: project.id, teamId: team.id, title: '确认灰度发布计划', assignee: '鉴川', priority: 'high', status: 'todo', due: '5/28', type: 'human', background: '广苓的 Agent 打包了 v2.1 模型，P99=118ms，需工程确认灰度方案和回滚机制。', materials: ['模型性能报告', '灰度方案', '回滚手册'], actions: ['确认流量比例', '准备回滚预案'] },
            { projectId: project.id, teamId: team.id, title: '更新 PRD 验收标准', assignee: '雪辰', priority: 'medium', status: 'done', due: '5/24', type: 'human', background: '根据多 Agent 讨论结果更新 PRD 验收标准。', materials: ['PRD v2.2'], actions: ['更新标准', '同步团队'] },
            { projectId: project.id, teamId: team.id, title: '推荐卡片组件开发', assignee: '王辰', priority: 'high', status: 'in-progress', due: '5/26', type: 'agent', agent: '🎨 王辰的 Agent', agentIcon: '🎨', progress: '组件初版已生成，优化虚拟列表中' },
            { projectId: project.id, teamId: team.id, title: '接口文档 + SDK 生成', assignee: '鉴川', priority: 'high', status: 'todo', due: '5/27', type: 'agent', agent: '⚙️ 鉴川的 Agent', agentIcon: '⚙️', progress: '接口已设计，待生成 SDK' },
            { projectId: project.id, teamId: team.id, title: '模型 v2.1 上线灰度', assignee: '广苓', priority: 'medium', status: 'todo', due: '5/28', type: 'agent', agent: '🧠 广苓的 Agent', agentIcon: '🧠' },
            { projectId: project.id, teamId: team.id, title: '前端性能测试报告', assignee: '王辰', priority: 'low', status: 'todo', due: '5/30', type: 'agent', agent: '🎨 王辰的 Agent', agentIcon: '🎨' },
        ],
    });
    await prisma.pendingItem.createMany({
        data: [
            { teamId: team.id, title: '缓存策略确认', desc: 'TTL=10min, 命中率 85%', assigner: '鉴川的 Agent', assignerType: 'agent', assignerIcon: '⚙️', status: 'pending', context: '鉴川的后端 Agent 设计了 Redis 缓存方案。批量推荐接口 P99=350ms，加缓存后可降至 50ms。需要你确认 TTL 10分钟是否满足业务实时性要求。', relatedMember: users[2].id },
            { teamId: team.id, title: '推荐理由格式', desc: '返回 HTML 还是 Markdown', assigner: '雪辰（你）', assignerType: 'human', status: 'pending', context: '前端需要渲染推荐理由文案，王辰的前端 Agent 建议用 HTML 直接渲染，但广苓的算法 Agent 输出是纯文本。需要你决定统一格式。', relatedMember: users[1].id },
            { teamId: team.id, title: '模型灰度比例', desc: '建议 10% 流量 A/B 验证', assigner: '广苓的 Agent', assignerType: 'agent', assignerIcon: '🧠', status: 'pending', context: '广苓的算法 Agent 完成了 v2.1 模型打包（准确率 +3.2%），建议灰度 10% 流量做 A/B 测试。核心指标为 CTR 提升 >2%。需要你确认灰度方案和时间安排。', relatedMember: users[3].id },
            { teamId: team.id, title: '组件命名规范', desc: 'RecommendCard vs RecommendationCard', assigner: '雪辰的 Agent', assignerType: 'agent', assignerIcon: '📋', status: 'approved', context: '团队讨论后统一使用 RecommendCard 命名，已同步至设计规范文档。', relatedMember: me.id },
        ],
    });
    await prisma.dailyReport.createMany({
        data: [
            { teamId: team.id, memberId: me.id, date: '今天', done: ['更新 PRD v2.3 缓存策略章节', '确认推荐理由格式为 HTML', '评审接口设计方案'], todo: ['组织设计走查会', '确认灰度方案时间安排'], blockers: [], humanFocus: ['确认灰度比例与时间安排', '组织设计走查会对齐视觉规范'], agentFocus: ['自动拆解需求为子任务', '跟踪各角色里程碑进度'] },
            { teamId: team.id, memberId: users[1].id, date: '今天', done: ['完成 RecommendCard 组件开发', '封装 useLazyImage Hook', '组件代码已入库'], todo: ['等待视觉规范最终稿', '联调适配接口'], blockers: ['视觉规范未最终确认'], humanFocus: ['确认视觉规范最终稿', '联调接口字段对齐'], agentFocus: ['生成 RecommendCard.tsx 组件代码', '封装 useLazyImage 懒加载 Hook'] },
            { teamId: team.id, memberId: users[2].id, date: '今天', done: ['完成 recommend-api.yaml', 'Redis 缓存层集成', '缓存降级策略设计'], todo: ['完成 SDK 包封装', '编写接口联调文档'], blockers: [], humanFocus: ['评审缓存降级策略', '确认联调时间节点'], agentFocus: ['设计 recommend-api.yaml 接口规范', '编写 Redis 缓存层与降级策略代码'] },
            { teamId: team.id, memberId: users[3].id, date: '今天', done: ['模型 v2.1 推理性能评估', 'INT8 量化验证', 'A/B 实验方案撰写'], todo: ['等待灰度审批确认', '准备全量切换方案'], blockers: ['灰度比例需产品确认'], humanFocus: ['确认灰度比例与实验指标', '评估全量切换风险'], agentFocus: ['完成 v2.1 推理性能评估报告', 'INT8 量化验证与 A/B 实验方案'] },
            { teamId: team.id, memberId: users[4].id, date: '今天', done: ['视觉规范文档初版', '推荐卡片尺寸标注'], todo: ['完成交互走查报告', 'Figma 最终稿'], blockers: [], humanFocus: ['走查交互细节', '确认研发还原度'], agentFocus: ['生成视觉规范文档初版', '自动标注推荐卡片尺寸'] },
            { teamId: team.id, memberId: users[5].id, date: '今天', done: ['自动化测试脚本 85% 覆盖', '接口用例编写'], todo: ['补充边界条件用例', '性能压测方案'], blockers: [], humanFocus: ['评审边界条件覆盖度', '确认性能压测基准'], agentFocus: ['自动生成接口测试用例', '编写自动化回归脚本'] },
        ],
    });
    await prisma.activityItem.createMany({
        data: [
            { teamId: team.id, icon: '📋', text: '雪辰的 Agent 更新了 PRD v2.3', time: '10 分钟前', type: 'agent' },
            { teamId: team.id, icon: '🎨', text: '王辰的 Agent 生成了 RecommendCard.tsx', time: '30 分钟前', type: 'agent' },
            { teamId: team.id, icon: '⚙️', text: '鉴川的 Agent 设计了 recommend-api.yaml', time: '1 小时前', type: 'agent' },
            { teamId: team.id, icon: '🧠', text: '广苓的 Agent 打包了 model-v2.1.tar.gz', time: '2 小时前', type: 'agent' },
            { teamId: team.id, icon: '👤', text: '雪辰确认了推荐理由格式为 HTML', time: '3 小时前', type: 'human' },
        ],
    });
    for (const user of users) {
        const agentNameMap = {
            '雪辰': '产品 Agent',
            '王辰': '前端 Agent',
            '鉴川': '后端 Agent',
            '广苓': '算法 Agent',
            '叙白': '设计 Agent',
            '孟雨': '测试 Agent',
        };
        const iconMap = {
            '雪辰': '📋',
            '王辰': '🎨',
            '鉴川': '⚙️',
            '广苓': '🧠',
            '叙白': '🎯',
            '孟雨': '🧪',
        };
        await prisma.agent.create({
            data: {
                userId: user.id,
                teamId: team.id,
                name: agentNameMap[user.name] || 'Agent',
                icon: iconMap[user.name] || '🤖',
                systemPrompt: `你是 ${user.name} 的专业 Agent。`,
                skills: {
                    create: [
                        { name: '任务处理', desc: '自动处理分配的任务' },
                        { name: '文档生成', desc: '生成技术文档和报告' },
                    ],
                },
                memory: {
                    create: [
                        { key: '技术栈', value: 'React 18 + TypeScript + NestJS', updatedAt: new Date() },
                    ],
                },
                faq: {
                    create: [
                        { question: '如何与团队其他 Agent 协作？', answer: '通过群聊频道和私聊频道进行协作。', likes: 2, dislikes: 0 },
                    ],
                },
                workflows: {
                    create: [
                        { name: '标准流程', steps: ['接收任务', '分析需求', '执行', '输出结果'] },
                    ],
                },
            },
        });
    }
    console.log('Seeded full demo data:', { teamId: team.id, userCount: users.length });
}
main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map