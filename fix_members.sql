INSERT INTO "TeamMember" (id, "userId", "teamId", role)
SELECT gen_random_uuid(), id, 'a44f08a4-cb1b-46ad-a86b-aa622904853e', 'member'
FROM "User"
WHERE email != 'demo@qoder.team'
ON CONFLICT ("userId", "teamId") DO NOTHING;
