// In-memory invite map (for MVP). 
// In production, this should be in Redis or a Prisma Invite model.
export const inviteTokens = new Map<string, { orgId: string; role: string; expires: number }>();
