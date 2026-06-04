const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getToken() {
  return localStorage.getItem('qoder_token')
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `API error: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string }) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => fetchApi('/auth/me'),

  // Teams
  createTeam: (data: { name: string; slug: string }) =>
    fetchApi('/teams', { method: 'POST', body: JSON.stringify(data) }),
  listTeams: () => fetchApi('/teams'),
  getTeam: (slug: string) => fetchApi(`/teams/${slug}`),
  getTeamMembers: (teamId: string) => fetchApi(`/teams/${teamId}/members`),
  myInvitations: () => fetchApi('/teams/invitations/me'),
  acceptInvitation: (code: string) => fetchApi(`/teams/invitations/${code}/accept`, { method: 'POST' }),

  // Channels
  listChannels: (teamId: string) => fetchApi(`/channels?teamId=${teamId}`),
  getChannel: (id: string) => fetchApi(`/channels/${id}`),
  createChannel: (data: { teamId: string; name: string; type: string; members?: string[] }) =>
    fetchApi('/channels', { method: 'POST', body: JSON.stringify(data) }),

  // Messages
  listMessages: (channelId: string, skip = 0, take = 50) =>
    fetchApi(`/messages?channelId=${channelId}&skip=${skip}&take=${take}`),
  createMessage: (data: { channelId: string; senderId: string; senderType: string; content: string; kbRefs?: string[]; artifact?: any }) =>
    fetchApi('/messages', { method: 'POST', body: JSON.stringify(data) }),

  // Documents
  listDocs: (teamId: string, source?: string) =>
    fetchApi(`/documents?teamId=${teamId}${source ? `&source=${source}` : ''}`),
  getDoc: (id: string) => fetchApi(`/documents/${id}`),
  createDoc: (data: { teamId: string; title: string; content: string; source: string; tags?: string[] }) =>
    fetchApi('/documents', { method: 'POST', body: JSON.stringify(data) }),
  updateDoc: (id: string, data: Partial<{ title: string; content: string; source: string; tags: string[] }>) =>
    fetchApi(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDoc: (id: string) => fetchApi(`/documents/${id}`, { method: 'DELETE' }),

  // Projects
  listProjects: (teamId: string) => fetchApi(`/projects?teamId=${teamId}`),
  createProject: (data: { teamId: string; name: string; slug: string; desc: string; deadline: string }) =>
    fetchApi('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProjectProgress: (id: string, progress: number) =>
    fetchApi(`/projects/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ progress }) }),

  // Todos
  listTodos: (teamId: string) => fetchApi(`/todos?teamId=${teamId}`),
  listProjectTodos: (projectId: string) => fetchApi(`/todos?projectId=${projectId}`),
  createTodo: (data: any) => fetchApi('/todos', { method: 'POST', body: JSON.stringify(data) }),
  updateTodo: (id: string, data: any) => fetchApi(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTodo: (id: string) => fetchApi(`/todos/${id}`, { method: 'DELETE' }),

  // Pending
  listPending: (teamId: string) => fetchApi(`/pending?teamId=${teamId}`),
  createPending: (data: any) => fetchApi('/pending', { method: 'POST', body: JSON.stringify(data) }),
  updatePending: (id: string, data: any) => fetchApi(`/pending/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePending: (id: string) => fetchApi(`/pending/${id}`, { method: 'DELETE' }),

  // Daily Reports
  listDailyReports: (teamId: string) => fetchApi(`/daily-reports?teamId=${teamId}`),
  createDailyReport: (data: any) => fetchApi('/daily-reports', { method: 'POST', body: JSON.stringify(data) }),

  // Activities
  listActivities: (teamId: string) => fetchApi(`/activities?teamId=${teamId}`),
  createActivity: (data: any) => fetchApi('/activities', { method: 'POST', body: JSON.stringify(data) }),

  // Agent Config
  listAgents: (teamId?: string, userId?: string) =>
    fetchApi(`/agents?${teamId ? `teamId=${teamId}` : ''}${userId ? `userId=${userId}` : ''}`),
  updateAgent: (id: string, data: any) => fetchApi(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  upsertSkill: (agentId: string, data: any) => fetchApi(`/agents/${agentId}/skills`, { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (id: string) => fetchApi(`/agents/skills/${id}`, { method: 'DELETE' }),
  upsertMemory: (agentId: string, data: any) => fetchApi(`/agents/${agentId}/memory`, { method: 'POST', body: JSON.stringify(data) }),
  deleteMemory: (id: string) => fetchApi(`/agents/memory/${id}`, { method: 'DELETE' }),
  upsertFAQ: (agentId: string, data: any) => fetchApi(`/agents/${agentId}/faq`, { method: 'POST', body: JSON.stringify(data) }),
  deleteFAQ: (id: string) => fetchApi(`/agents/faq/${id}`, { method: 'DELETE' }),
  upsertWorkflow: (agentId: string, data: any) => fetchApi(`/agents/${agentId}/workflows`, { method: 'POST', body: JSON.stringify(data) }),
  deleteWorkflow: (id: string) => fetchApi(`/agents/workflows/${id}`, { method: 'DELETE' }),
}
