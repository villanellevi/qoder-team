import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import type { MemberDef, AgentCompat, ProjectDef, PendingItem, KBDocument, AgentAsset, TodoItem, DailyReport, ActivityItem } from '../types'

interface TeamDataState {
  teamId: string | null
  members: MemberDef[]
  agents: AgentCompat[]
  projects: ProjectDef[]
  pendingItems: PendingItem[]
  kbDocs: KBDocument[]
  agentAssets: Record<string, AgentAsset>
  todos: TodoItem[]
  dailyReports: DailyReport[]
  activities: ActivityItem[]
  channels: any[]
  loading: boolean
  refresh: () => void
}

const TeamDataContext = createContext<TeamDataState>({
  teamId: null,
  members: [],
  agents: [],
  projects: [],
  pendingItems: [],
  kbDocs: [],
  agentAssets: {},
  todos: [],
  dailyReports: [],
  activities: [],
  channels: [],
  loading: true,
  refresh: () => {},
})

export function useTeamData() {
  return useContext(TeamDataContext)
}

const COLOR_MAP: Record<string, any> = {
  '雪辰': 'purple', '王辰': 'green', '鉴川': 'blue',
  '广苓': 'orange', '叙白': 'pink', '孟雨': 'cyan',
}

const AGENT_NAME_MAP: Record<string, string> = {
  '雪辰': '产品 Agent', '王辰': '前端 Agent', '鉴川': '后端 Agent',
  '广苓': '算法 Agent', '叙白': '设计 Agent', '孟雨': '测试 Agent',
}

const AGENT_ICON_MAP: Record<string, string> = {
  '雪辰': '📋', '王辰': '🎨', '鉴川': '⚙️',
  '广苓': '🧠', '叙白': '🎯', '孟雨': '🧪',
}

function mapUserToMember(u: any, isMe: boolean): MemberDef {
  const color = COLOR_MAP[u.name] || 'purple'
  return {
    id: u.id,
    name: u.name,
    role: u.role === 'admin' ? '产品经理' : u.role === 'owner' ? '负责人' : '工程师',
    color,
    isMe,
    agent: {
      name: AGENT_NAME_MAP[u.name] || 'Agent',
      icon: AGENT_ICON_MAP[u.name] || '🤖',
      online: true,
      capabilities: ['任务处理', '文档生成', '协作沟通'],
      autonomous: ['自动分析', '生成报告', '同步信息'],
      needApproval: ['删除数据', '修改配置', '发布上线'],
    },
  }
}

export function TeamDataProvider({ children }: { children: React.ReactNode }) {
  const [teamId, setTeamId] = useState<string | null>(null)
  const [members, setMembers] = useState<MemberDef[]>([])
  const [agents, setAgents] = useState<AgentCompat[]>([])
  const [projects, setProjects] = useState<ProjectDef[]>([])
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [kbDocs, setKbDocs] = useState<KBDocument[]>([])
  const [agentAssets, setAgentAssets] = useState<Record<string, AgentAsset>>({})
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const teams = await api.listTeams()
      if (!teams.length) { setLoading(false); return }
      const team = teams[0]
      setTeamId(team.id)

      const [membersRes, channelsRes, docsRes, projectsRes, todosRes, pendingRes, reportsRes, activitiesRes, agentsRes] = await Promise.all([
        api.getTeamMembers(team.id),
        api.listChannels(team.id),
        api.listDocs(team.id),
        api.listProjects(team.id),
        api.listTodos(team.id),
        api.listPending(team.id),
        api.listDailyReports(team.id),
        api.listActivities(team.id),
        api.listAgents(team.id),
      ])

      const currentUser = await api.me().catch(() => null)
      const mappedMembers = membersRes.map((u: any) => mapUserToMember(u.user || u, u.user?.id === currentUser?.id))
      setMembers(mappedMembers)

      setAgents(mappedMembers.map((m: MemberDef) => ({
        id: m.id,
        name: m.agent.name,
        icon: m.agent.icon,
        owner: m.name,
        ownerRole: m.role,
        color: m.color,
        online: m.agent.online,
      })))

      setChannels(channelsRes)

      setProjects(projectsRes.map((p: any) => ({
        id: p.slug || p.id,
        name: p.name,
        status: p.status,
        members: p._count?.todos || 4,
        progress: p.progress,
        desc: p.desc,
        deadline: p.deadline,
        milestones: `${p.milestones?.filter((m: any) => m.status === 'done').length || 0}/${p.milestones?.length || 0}`,
        todos: p._count?.todos || 0,
      })))

      setPendingItems(pendingRes.map((p: any) => ({
        id: p.id,
        title: p.title,
        desc: p.desc,
        assigner: p.assigner,
        assignerType: p.assignerType,
        assignerIcon: p.assignerIcon,
        status: p.status,
        context: p.context,
        relatedMember: p.relatedMember,
      })))

      setKbDocs(docsRes.map((d: any) => ({
        id: d.id,
        title: d.title,
        desc: d.desc || d.content?.slice(0, 100) || '',
        content: d.content,
        category: d.tags?.[0] || 'doc',
        source: d.source,
        author: { name: d.author?.name || '未知', role: '成员', color: 'purple' as any },
        agentId: d.source === 'agent' ? d.authorId : undefined,
        agentName: d.source === 'agent' ? `${d.author?.name || ''}的 Agent` : undefined,
        updatedAt: '刚刚',
        contributors: 1,
        version: 'v1.0',
        refCount: 0,
      })))

      setTodos(todosRes.map((t: any) => t.type === 'agent' ? {
        id: t.id,
        type: 'agent',
        title: t.title,
        assignee: t.assignee,
        priority: t.priority,
        status: t.status,
        due: t.due,
        agent: t.agent,
        agentIcon: t.agentIcon,
        progress: t.progress,
      } : {
        id: t.id,
        type: 'human',
        title: t.title,
        assignee: t.assignee,
        priority: t.priority,
        status: t.status,
        due: t.due,
        background: t.background,
        materials: t.materials,
        actions: t.actions,
      }))

      setDailyReports(reportsRes.map((r: any) => ({
        memberId: r.memberId,
        date: r.date,
        done: r.done,
        todo: r.todo,
        blockers: r.blockers,
        humanFocus: r.humanFocus,
        agentFocus: r.agentFocus,
      })))

      setActivities(activitiesRes.map((a: any) => ({
        icon: a.icon,
        text: a.text,
        time: a.time,
        type: a.type,
      })))

      const assets: Record<string, AgentAsset> = {}
      for (const agent of agentsRes) {
        assets[agent.userId] = {
          systemPrompt: agent.systemPrompt,
          skills: agent.skills?.map((s: any) => ({ name: s.name, desc: s.desc })) || [],
          workflows: agent.workflows?.map((w: any) => ({ name: w.name, steps: w.steps })) || [],
          memory: agent.memory?.map((m: any) => ({ key: m.key, value: m.value, updatedAt: '刚刚' })) || [],
          faq: agent.faq?.map((f: any) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            likes: f.likes,
            dislikes: f.dislikes,
          })) || [],
          linkedDocs: [],
        }
      }
      setAgentAssets(assets)
    } catch (e) {
      console.error('TeamData load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <TeamDataContext.Provider value={{
      teamId, members, agents, projects, pendingItems, kbDocs, agentAssets,
      todos, dailyReports, activities, channels, loading, refresh: load,
    }}>
      {children}
    </TeamDataContext.Provider>
  )
}
