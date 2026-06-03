/* ============================================
   Qoder Team — 统一类型定义层
   ============================================ */

/* ===== 基础枚举 ===== */
export type ColorVariant = 'purple' | 'green' | 'orange' | 'blue' | 'pink' | 'cyan'
export type TagVariant = ColorVariant | 'red' | 'gray'
export type Status = 'done' | 'running' | 'waiting'
export type Priority = 'high' | 'medium' | 'low'
export type DocSource = 'agent' | 'human' | 'collab'
export type ArtifactType = 'doc' | 'code' | 'design' | 'model' | 'test' | 'config'
export type ConvType = 'group' | 'direct' | 'myagent'
export type ConvGroup = 'team' | 'direct' | 'myagent'
export type Sender = 'human' | 'agent'
export type PendingStatus = 'pending' | 'approved' | 'rejected'
export type ProjectStatus = 'active' | 'planning'
export type SidebarTab = 'code' | 'issues' | 'pr' | 'team'
export type TeamView = 'progress' | 'todo' | 'chat' | 'kb' | 'config'
export type ProgressView = 'milestone' | 'swimlane' | 'daily'
export type ConfigTab = 'assets' | 'permissions' | 'skills'
export type SegFilter = 'all' | 'mine' | 'human' | 'agent'

/* ===== 团队成员 & Agent ===== */
export interface AgentCompat {
  id: string
  name: string
  icon: string
  owner: string
  ownerRole: string
  color: ColorVariant
  online: boolean
}

export interface AgentDef {
  name: string
  icon: string
  online: boolean
  capabilities: string[]
  autonomous: string[]
  needApproval: string[]
}

export interface MemberDef {
  id: string
  name: string
  role: string
  color: ColorVariant
  isMe?: boolean
  agent: AgentDef
}

/* ===== 项目 ===== */
export interface ProjectDef {
  id: string
  name: string
  status: ProjectStatus
  members: number
  progress: number
  desc: string
  deadline: string
  milestones: string
  todos: number
}

/* ===== 里程碑系统 ===== */
export interface MilestoneArtifact {
  name: string
  type: ArtifactType
  docId?: string
  status: 'done' | 'missing'
  author?: string
  completedAt?: string
}

export interface MilestoneGate {
  name: string
  passed: boolean
}

export interface Milestone {
  id: string
  name: string
  status: Status
  date: string
  owner: string
  requiredArtifacts: MilestoneArtifact[]
  gate?: MilestoneGate
}

/* ===== 泳道系统 ===== */
export interface SwimlanePhase {
  id: string
  name: string
  status: Status
}

export interface SwimlaneRole {
  id: string
  name: string
  icon: string
  color: ColorVariant
}

export interface SwimlaneCell {
  task: string
  agent: boolean
  status: Status | 'na'
}

/* ===== 日报系统 ===== */
export interface DailyReport {
  memberId: string
  date: string
  done: string[]
  todo: string[]
  blockers: string[]
  humanFocus?: string[]
  agentFocus?: string[]
}

/* ===== 待办系统 ===== */
export interface TodoBase {
  id: string
  title: string
  assignee: string
  priority: Priority
  status: 'done' | 'in-progress' | 'todo'
  due: string
}

export interface HumanTodo extends TodoBase {
  type: 'human'
  background: string
  materials: string[]
  actions: string[]
}

export interface AgentTodo extends TodoBase {
  type: 'agent'
  agent: string
  agentIcon: string
  progress?: string
}

export type TodoItem = HumanTodo | AgentTodo

/* ===== 知识库 ===== */
export interface KBDocument {
  id: string
  title: string
  desc: string
  content: string
  category: string
  source: DocSource
  author: { name: string; role: string; color: ColorVariant }
  agentId?: string
  agentName?: string
  updatedAt: string
  contributors: number
  version: string
  milestoneId?: string
  milestoneName?: string
  dualDoc?: { type: 'human' | 'machine'; pairedTitle: string }
  refCount?: number
  verifiedAt?: string
  relatedDocs?: string[]
}

/* ===== 对话系统 ===== */
export interface ChatArtifact {
  type: string
  name: string
  preview: string
  kbSynced?: boolean
}

export interface ChatAttachment {
  name: string
  size: string
  kbTarget?: 'personal' | 'team'
}

export interface ChatMessage {
  id: string
  sender: Sender
  senderMemberId?: string
  agentId?: string
  agentName?: string
  content: string
  time: string
  artifact?: ChatArtifact
  targetAgent?: string
  thinking?: string
  isThinking?: boolean
  attachment?: ChatAttachment
  feedback?: 'like' | 'dislike'
  feedbackType?: 'question' | 'error'
  kbRefs?: string[]
}

export interface Conversation {
  id: string
  type: ConvType
  name: string
  icon: string
  memberId?: string
  lastMsg: string
  unread: number
  group: ConvGroup
}

/* ===== 待确认事项 ===== */
export interface PendingItem {
  id: string
  title: string
  desc: string
  assigner: string
  assignerType: Sender
  assignerIcon?: string
  status: PendingStatus
  context?: string
  relatedMember?: string
}

/* ===== Agent 配置 ===== */
export interface SkillItem {
  name: string
  desc: string
}

export interface WorkflowItem {
  name: string
  steps: string[]
}

export interface MemoryItem {
  key: string
  value: string
  updatedAt: string
}

export interface AgentFAQItem {
  id: string
  question: string
  answer: string
  likes: number
  dislikes: number
  feedbackType?: 'question' | 'error'
  aiSuggestion?: string
}

export interface AgentAsset {
  systemPrompt: string
  skills: SkillItem[]
  workflows: WorkflowItem[]
  memory: MemoryItem[]
  faq: AgentFAQItem[]
  linkedDocs?: string[]
}

/* ===== 权限规则 ===== */
export interface PermRule {
  op: string
  agent: string
  mode: '自主' | '审批'
  approver: string
}

/* ===== 文件树 ===== */
export interface FileNode {
  name: string
  type: 'file' | 'folder'
  icon?: string
  children?: FileNode[]
}

/* ===== 活动 & 动态 ===== */
export interface ActivityItem {
  icon: string
  text: string
  time: string
  type: Sender
}

/* ===== Agent 质检 ===== */
export interface AgentQARecord {
  id: string
  name: string
  icon: string
  owner: string
  metrics: {
    tasks: number
    completed: number
    errors: number
    avgTime: string
    accuracy: string
  }
  recent: { task: string; quality: 'pass' | 'warn'; time: string }[]
}

export interface CollabLogItem {
  from: string
  fromName: string
  to: string
  toName: string
  type: string
  status: string
  time: string
}

/* ===== 右侧面板 ===== */
export interface AgentActivity {
  doing: string
  lastOutput?: string
  outputTime?: string
}
