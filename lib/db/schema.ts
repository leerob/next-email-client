import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    email: varchar('email', { length: 255 }).notNull(),
    jobTitle: varchar('job_title', { length: 100 }),
    company: varchar('company', { length: 100 }),
    location: varchar('location', { length: 100 }),
    twitter: varchar('twitter', { length: 100 }),
    linkedin: varchar('linkedin', { length: 100 }),
    github: varchar('github', { length: 100 }),
    avatarUrl: varchar('avatar_url', { length: 255 }),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex('email_idx').on(table.email),
    };
  }
);

export const threads = pgTable('threads', {
  id: serial('id').primaryKey(),
  subject: varchar('subject', { length: 255 }),
  lastActivityDate: timestamp('last_activity_date').defaultNow(),
});

export const emails = pgTable(
  'emails',
  {
    id: serial('id').primaryKey(),
    threadId: integer('thread_id').references(() => threads.id),
    senderId: integer('sender_id').references(() => users.id),
    recipientId: integer('recipient_id').references(() => users.id),
    subject: varchar('subject', { length: 255 }),
    body: text('body'),
    sentDate: timestamp('sent_date').defaultNow(),
  },
  (table) => {
    return {
      threadIdIndex: index('thread_id_idx').on(table.threadId),
      senderIdIndex: index('sender_id_idx').on(table.senderId),
      recipientIdIndex: index('recipient_id_idx').on(table.recipientId),
      sentDateIndex: index('sent_date_idx').on(table.sentDate),
    };
  }
);

export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
});

export const userFolders = pgTable('user_folders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  folderId: integer('folder_id').references(() => folders.id),
});

export const threadFolders = pgTable('thread_folders', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => threads.id),
  folderId: integer('folder_id').references(() => folders.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  sentEmails: many(emails, { relationName: 'sender' }),
  receivedEmails: many(emails, { relationName: 'recipient' }),
  userFolders: many(userFolders),
}));

export const threadsRelations = relations(threads, ({ many }) => ({
  emails: many(emails),
  threadFolders: many(threadFolders),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  thread: one(threads, {
    fields: [emails.threadId],
    references: [threads.id],
  }),
  sender: one(users, {
    fields: [emails.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  recipient: one(users, {
    fields: [emails.recipientId],
    references: [users.id],
    relationName: 'recipient',
  }),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  userFolders: many(userFolders),
  threadFolders: many(threadFolders),
}));

export const userFoldersRelations = relations(userFolders, ({ one }) => ({
  user: one(users, { fields: [userFolders.userId], references: [users.id] }),
  folder: one(folders, {
    fields: [userFolders.folderId],
    references: [folders.id],
  }),
}));

export const threadFoldersRelations = relations(threadFolders, ({ one }) => ({
  thread: one(threads, {
    fields: [threadFolders.threadId],
    references: [threads.id],
  }),
  folder: one(folders, {
    fields: [threadFolders.folderId],
    references: [folders.id],
  }),
}));
