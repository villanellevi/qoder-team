-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "desc" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "date" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilestoneArtifact" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'missing',
    "author" TEXT,
    "completedAt" TEXT,
    "docId" TEXT,

    CONSTRAINT "MilestoneArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilestoneGate" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MilestoneGate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "teamId" TEXT,
    "title" TEXT NOT NULL,
    "assignee" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'todo',
    "due" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'human',
    "background" TEXT,
    "materials" TEXT[],
    "actions" TEXT[],
    "agent" TEXT,
    "agentIcon" TEXT,
    "progress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingItem" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "assigner" TEXT NOT NULL,
    "assignerType" TEXT NOT NULL DEFAULT 'human',
    "assignerIcon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "context" TEXT,
    "relatedMember" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "memberId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "done" TEXT[],
    "todo" TEXT[],
    "blockers" TEXT[],
    "humanFocus" TEXT[],
    "agentFocus" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityItem" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "icon" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'human',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentQARecord" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "tasks" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "avgTime" TEXT NOT NULL DEFAULT '0',
    "accuracy" TEXT NOT NULL DEFAULT '0%',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentQARecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollabLogItem" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "fromId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabLogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneGate_milestoneId_key" ON "MilestoneGate"("milestoneId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneArtifact" ADD CONSTRAINT "MilestoneArtifact_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneGate" ADD CONSTRAINT "MilestoneGate_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
