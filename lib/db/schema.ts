import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'member']);
export const recordingStateEnum = pgEnum('recording_state', ['queued', 'processing', 'processed']);

// Users table - for authentication
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    emailVerified: timestamp('email_verified'),
    image: varchar('image', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex('users_email_idx').on(table.email),
      usernameIndex: uniqueIndex('users_username_idx').on(table.username),
    };
  },
);

// Accounts table - for OAuth providers
export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (table) => {
    return {
      userIdIndex: index('accounts_user_id_idx').on(table.userId),
      providerProviderAccountIdIndex: uniqueIndex('accounts_provider_provider_account_id_idx').on(
        table.provider,
        table.providerAccountId
      ),
    };
  },
);

// Sessions table - for NextAuth sessions
export const sessions = pgTable(
  'sessions',
  {
    id: serial('id').primaryKey(),
    sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => {
    return {
      userIdIndex: index('sessions_user_id_idx').on(table.userId),
      sessionTokenIndex: uniqueIndex('sessions_session_token_idx').on(table.sessionToken),
    };
  },
);

// Verification tokens for email verification
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expires: timestamp('expires').notNull(),
  },
  (table) => {
    return {
      identifierTokenIndex: uniqueIndex('verification_tokens_identifier_token_idx').on(
        table.identifier,
        table.token
      ),
    };
  },
);

// Organizations table
export const organizations = pgTable(
  'organizations',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    isPersonal: boolean('is_personal').default(false).notNull(), // true for user's default org
    ownerId: integer('owner_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      slugIndex: uniqueIndex('organizations_slug_idx').on(table.slug),
      ownerIdIndex: index('organizations_owner_id_idx').on(table.ownerId),
    };
  },
);

// Organization members table (many-to-many relationship)
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    role: roleEnum('role').default('member').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      organizationIdIndex: index('organization_members_organization_id_idx').on(table.organizationId),
      userIdIndex: index('organization_members_user_id_idx').on(table.userId),
      uniqueMemberIndex: uniqueIndex('organization_members_unique_idx').on(
        table.organizationId,
        table.userId
      ),
    };
  },
);

// Recordings table
export const recordings = pgTable(
  'recordings',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    state: recordingStateEnum('state').default('queued').notNull(),
    organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
    createdBy: integer('created_by').references(() => users.id).notNull(),
    resultId: integer('result_id').references(() => recordingResults.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      organizationIdIndex: index('recordings_organization_id_idx').on(table.organizationId),
      createdByIndex: index('recordings_created_by_idx').on(table.createdBy),
      resultIdIndex: index('recordings_result_id_idx').on(table.resultId),
      stateIndex: index('recordings_state_idx').on(table.state),
    };
  },
);

// Recording results table
export const recordingResults = pgTable(
  'recording_results',
  {
    id: serial('id').primaryKey(),
    result: text('result').notNull(), // Base64 encoded string
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  ownedOrganizations: many(organizations, { relationName: 'owner' }),
  organizationMemberships: many(organizationMembers),
  recordings: many(recordings),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
    relationName: 'owner',
  }),
  members: many(organizationMembers),
  recordings: many(recordings),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  organization: one(organizations, {
    fields: [recordings.organizationId],
    references: [organizations.id],
  }),
  createdByUser: one(users, {
    fields: [recordings.createdBy],
    references: [users.id],
  }),
  result: one(recordingResults, {
    fields: [recordings.resultId],
    references: [recordingResults.id],
  }),
}));

export const recordingResultsRelations = relations(recordingResults, ({ many }) => ({
  recordings: many(recordings),
}));
