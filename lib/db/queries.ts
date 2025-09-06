// lib/queries.ts
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from './drizzle';
import {
  organizations,
  organizationMembers,
  recordings,
  recordingResults,
  users
} from './schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to get current user from session
async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

// User queries
export async function getUserById(userId: number) {
  'use cache';

  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

export async function getUserByEmail(email: string) {
  'use cache';

  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function getUserByUsername(username: string) {
  'use cache';

  return db.query.users.findFirst({
    where: eq(users.username, username),
  });
}

// Organization queries
export async function getUserOrganizations(userId?: number) {
  'use cache';

  const currentUserId = userId || await getCurrentUserId();
  if (!currentUserId) return [];

  const memberships = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      isPersonal: organizations.isPersonal,
      ownerId: organizations.ownerId,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      memberCount: sql<number>`(
                                   SELECT COUNT(*)::int
                                   FROM ${organizationMembers} om
                                   WHERE om.organization_id = ${organizations.id}
                               )`,
      recordingCount: sql<number>`(
                                      SELECT COUNT(*)::int
                                      FROM ${recordings} r
                                      WHERE r.organization_id = ${organizations.id}
                                  )`,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, currentUserId))
    .orderBy(desc(organizations.isPersonal), organizations.name);

  return memberships;
}

export async function getOrganizationBySlug(slug: string) {
  'use cache';

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, slug),
  });

  if (!org) return null;

  // Get member count and recording count
  const stats = await db
    .select({
      memberCount: sql<number>`COUNT(DISTINCT ${organizationMembers.userId})::int`,
      recordingCount: sql<number>`COUNT(DISTINCT ${recordings.id})::int`,
    })
    .from(organizations)
    .leftJoin(organizationMembers, eq(organizations.id, organizationMembers.organizationId))
    .leftJoin(recordings, eq(organizations.id, recordings.organizationId))
    .where(eq(organizations.id, org.id))
    .groupBy(organizations.id);

  return {
    ...org,
    memberCount: stats[0]?.memberCount || 0,
    recordingCount: stats[0]?.recordingCount || 0,
  };
}

export async function getOrganizationMembers(organizationId: number) {
  'use cache';

  return db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      image: users.image,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, organizationId))
    .orderBy(organizationMembers.role, users.firstName);
}

export async function checkUserOrgAccess(userId: number, organizationId: number) {
  'use cache';

  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId)
    ),
  });

  return membership;
}

// Recording queries
export async function getOrganizationRecordings(organizationId: number) {
  'use cache';

  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return [];

  // Check if user has access to this organization
  const hasAccess = await checkUserOrgAccess(currentUserId, organizationId);
  if (!hasAccess) return [];

  return db
    .select({
      id: recordings.id,
      name: recordings.name,
      state: recordings.state,
      createdAt: recordings.createdAt,
      updatedAt: recordings.updatedAt,
      hasResult: sql<boolean>`${recordings.resultId} IS NOT NULL`,
      createdBy: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        image: users.image,
      },
    })
    .from(recordings)
    .innerJoin(users, eq(recordings.createdBy, users.id))
    .where(eq(recordings.organizationId, organizationId))
    .orderBy(desc(recordings.createdAt));
}

export async function getRecordingById(recordingId: number) {
  'use cache';

  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return null;

  const recording = await db.query.recordings.findFirst({
    where: eq(recordings.id, recordingId),
    with: {
      organization: true,
      createdByUser: true,
      result: true,
    },
  });

  if (!recording) return null;

  // Check if user has access to this recording's organization
  const hasAccess = await checkUserOrgAccess(currentUserId, recording.organizationId);
  if (!hasAccess) return null;

  return recording;
}

export async function getRecordingsByState(state: 'queued' | 'processing' | 'processed') {
  'use cache';

  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return [];

  // Get user's organizations
  const userOrgs = await getUserOrganizations(currentUserId);
  const orgIds = userOrgs.map(org => org.id);

  if (orgIds.length === 0) return [];

  return db
    .select({
      id: recordings.id,
      name: recordings.name,
      state: recordings.state,
      createdAt: recordings.createdAt,
      updatedAt: recordings.updatedAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      },
      createdBy: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
      },
    })
    .from(recordings)
    .innerJoin(organizations, eq(recordings.organizationId, organizations.id))
    .innerJoin(users, eq(recordings.createdBy, users.id))
    .where(
      and(
        eq(recordings.state, state),
        sql`${recordings.organizationId} = ANY(${orgIds})`
      )
    )
    .orderBy(desc(recordings.createdAt));
}

export async function searchRecordings(query: string) {
  'use cache';

  const currentUserId = await getCurrentUserId();
  if (!currentUserId || !query) return [];

  // Get user's organizations
  const userOrgs = await getUserOrganizations(currentUserId);
  const orgIds = userOrgs.map(org => org.id);

  if (orgIds.length === 0) return [];

  return db
    .select({
      id: recordings.id,
      name: recordings.name,
      state: recordings.state,
      createdAt: recordings.createdAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      },
      createdBy: {
        firstName: users.firstName,
        lastName: users.lastName,
      },
    })
    .from(recordings)
    .innerJoin(organizations, eq(recordings.organizationId, organizations.id))
    .innerJoin(users, eq(recordings.createdBy, users.id))
    .where(
      and(
        sql`${recordings.organizationId} = ANY(${orgIds})`,
        or(
          ilike(recordings.name, `%${query}%`),
          ilike(organizations.name, `%${query}%`)
        )
      )
    )
    .orderBy(desc(recordings.createdAt))
    .limit(20);
}

// Dashboard stats
export async function getDashboardStats() {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return null;

  // Get user's organizations
  const userOrgs = await getUserOrganizations(currentUserId);
  const orgIds = userOrgs.map(org => org.id);

  if (orgIds.length === 0) {
    return {
      totalOrganizations: 0,
      totalRecordings: 0,
      queuedRecordings: 0,
      processingRecordings: 0,
      processedRecordings: 0,
      recentRecordings: [],
    };
  }

  // Get recording counts by state
  const recordingStats = await db
    .select({
      state: recordings.state,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(recordings)
    .where(sql`${recordings.organizationId} = ANY(${orgIds})`)
    .groupBy(recordings.state);

  const statsByState = recordingStats.reduce((acc, stat) => {
    acc[stat.state] = stat.count;
    return acc;
  }, {} as Record<string, number>);

  // Get recent recordings
  const recentRecordings = await db
    .select({
      id: recordings.id,
      name: recordings.name,
      state: recordings.state,
      createdAt: recordings.createdAt,
      organization: {
        name: organizations.name,
        slug: organizations.slug,
      },
    })
    .from(recordings)
    .innerJoin(organizations, eq(recordings.organizationId, organizations.id))
    .where(sql`${recordings.organizationId} = ANY(${orgIds})`)
    .orderBy(desc(recordings.createdAt))
    .limit(5);

  return {
    totalOrganizations: userOrgs.length,
    totalRecordings: (statsByState.queued || 0) + (statsByState.processing || 0) + (statsByState.processed || 0),
    queuedRecordings: statsByState.queued || 0,
    processingRecordings: statsByState.processing || 0,
    processedRecordings: statsByState.processed || 0,
    recentRecordings,
  };
}
