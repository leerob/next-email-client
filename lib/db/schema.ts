import { pgTable, serial, varchar, text, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    email: varchar('email', { length: 255 }).notNull(),
}, (table) => {
    return {
        emailIndex: uniqueIndex('email_idx').on(table.email),
    }
});

export const emails = pgTable('emails', {
    id: serial('id').primaryKey(),
    senderId: integer('sender_id').references(() => users.id),
    recipientId: integer('recipient_id').references(() => users.id),
    subject: varchar('subject', { length: 255 }),
    body: text('body'),
    sentDate: timestamp('sent_date').defaultNow(),
});

export const folders = pgTable('folders', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
});

export const userFolders = pgTable('user_folders', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    folderId: integer('folder_id').references(() => folders.id),
});

export const emailFolders = pgTable('email_folders', {
    id: serial('id').primaryKey(),
    emailId: integer('email_id').references(() => emails.id),
    folderId: integer('folder_id').references(() => folders.id),
});

export const usersRelations = relations(users, ({ many }) => ({
    sentEmails: many(emails, { relationName: 'sender' }),
    receivedEmails: many(emails, { relationName: 'recipient' }),
    userFolders: many(userFolders),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
    sender: one(users, { fields: [emails.senderId], references: [users.id], relationName: 'sender' }),
    recipient: one(users, { fields: [emails.recipientId], references: [users.id], relationName: 'recipient' }),
    emailFolders: many(emailFolders),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
    userFolders: many(userFolders),
    emailFolders: many(emailFolders),
}));

export const userFoldersRelations = relations(userFolders, ({ one }) => ({
    user: one(users, { fields: [userFolders.userId], references: [users.id] }),
    folder: one(folders, { fields: [userFolders.folderId], references: [folders.id] }),
}));

export const emailFoldersRelations = relations(emailFolders, ({ one }) => ({
    email: one(emails, { fields: [emailFolders.emailId], references: [emails.id] }),
    folder: one(folders, { fields: [emailFolders.folderId], references: [folders.id] }),
}));

