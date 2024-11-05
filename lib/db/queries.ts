import { folders, emails, threadFolders, users, threads } from './schema';
import { sql, eq, and, or, ilike, desc } from 'drizzle-orm';
import { db } from './drizzle';
import { toTitleCase } from '../utils';

type Folder = {
  name: string;
  thread_count: number;
};

export async function getFoldersWithThreadCount() {
  'use cache';

  let foldersWithCount = await db
    .select({
      name: folders.name,
      thread_count: sql<number>`count(${threadFolders.threadId})`.as(
        'thread_count'
      ),
    })
    .from(folders)
    .leftJoin(threadFolders, eq(folders.id, threadFolders.folderId))
    .groupBy(folders.name);

  let specialFoldersOrder = ['Inbox', 'Flagged', 'Sent'];
  let specialFolders = specialFoldersOrder
    .map((name) => foldersWithCount.find((folder) => folder.name === name))
    .filter(Boolean) as Folder[];
  let otherFolders = foldersWithCount.filter(
    (folder) => !specialFoldersOrder.includes(folder.name)
  ) as Folder[];

  return { specialFolders, otherFolders };
}

export async function getThreadsForFolder(folderName: string) {
  'use cache';

  let originalFolderName = toTitleCase(decodeURIComponent(folderName));

  const threadsWithEmails = await db
    .select({
      id: threads.id,
      subject: threads.subject,
      lastActivityDate: threads.lastActivityDate,
      emails: sql<
        {
          id: number;
          senderId: number;
          recipientId: number;
          subject: string;
          body: string;
          sentDate: Date;
          sender: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
          };
        }[]
      >`json_agg(json_build_object(
        'id', ${emails.id},
        'senderId', ${emails.senderId},
        'recipientId', ${emails.recipientId},
        'subject', ${emails.subject},
        'body', ${emails.body},
        'sentDate', ${emails.sentDate},
        'sender', json_build_object(
          'id', ${users.id},
          'firstName', ${users.firstName},
          'lastName', ${users.lastName},
          'email', ${users.email}
        )
      ) ORDER BY ${emails.sentDate} DESC)`,
    })
    .from(threads)
    .innerJoin(threadFolders, eq(threads.id, threadFolders.threadId))
    .innerJoin(folders, eq(threadFolders.folderId, folders.id))
    .innerJoin(emails, eq(threads.id, emails.threadId))
    .innerJoin(users, eq(emails.senderId, users.id))
    .where(eq(folders.name, originalFolderName))
    .groupBy(threads.id)
    .orderBy(desc(threads.lastActivityDate));

  return threadsWithEmails;
}

export async function searchThreads(search: string | undefined) {
  if (!search) {
    return [];
  }

  const results = await db
    .select({
      id: threads.id,
      subject: threads.subject,
      lastActivityDate: threads.lastActivityDate,
      folderName: folders.name,
      emailId: emails.id,
      emailSubject: emails.subject,
      emailBody: emails.body,
      emailSentDate: emails.sentDate,
      senderFirstName: users.firstName,
      senderLastName: users.lastName,
      senderEmail: users.email,
    })
    .from(threads)
    .innerJoin(emails, eq(threads.id, emails.threadId))
    .innerJoin(users, eq(emails.senderId, users.id))
    .leftJoin(threadFolders, eq(threads.id, threadFolders.threadId))
    .leftJoin(folders, eq(threadFolders.folderId, folders.id))
    .where(
      or(
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(threads.subject, `%${search}%`),
        ilike(emails.body, `%${search}%`)
      )
    )
    .orderBy(desc(threads.lastActivityDate), desc(emails.sentDate));

  const threadMap = new Map();
  for (const result of results) {
    if (!threadMap.has(result.id)) {
      threadMap.set(result.id, {
        id: result.id,
        subject: result.subject,
        lastActivityDate: result.lastActivityDate,
        folderName: result.folderName,
        latestEmail: {
          id: result.emailId,
          subject: result.emailSubject,
          body: result.emailBody,
          sentDate: result.emailSentDate,
          sender: {
            firstName: result.senderFirstName,
            lastName: result.senderLastName,
            email: result.senderEmail,
          },
        },
      });
    }
  }

  return Array.from(threadMap.values());
}

export async function getThreadInFolder(folderName: string, threadId: string) {
  'use cache';

  let originalFolderName = toTitleCase(decodeURIComponent(folderName));
  let result = await db
    .select({
      id: threads.id,
      subject: threads.subject,
      lastActivityDate: threads.lastActivityDate,
      senderFirstName: users.firstName,
      senderLastName: users.lastName,
      senderEmail: users.email,
    })
    .from(threads)
    .innerJoin(threadFolders, eq(threads.id, threadFolders.threadId))
    .innerJoin(folders, eq(threadFolders.folderId, folders.id))
    .innerJoin(emails, eq(threads.id, emails.threadId))
    .innerJoin(users, eq(emails.senderId, users.id))
    .where(
      and(
        eq(folders.name, originalFolderName),
        eq(threads.id, parseInt(threadId))
      )
    );

  return result[0];
}

export async function getEmailsForThread(threadId: string) {
  'use cache';

  const result = await db
    .select({
      id: threads.id,
      subject: threads.subject,
      emailId: emails.id,
      body: emails.body,
      sentDate: emails.sentDate,
      senderId: users.id,
      senderFirstName: users.firstName,
      senderLastName: users.lastName,
      recipientId: emails.recipientId,
    })
    .from(threads)
    .innerJoin(emails, eq(threads.id, emails.threadId))
    .innerJoin(users, eq(emails.senderId, users.id))
    .where(eq(threads.id, parseInt(threadId, 10)))
    .orderBy(emails.sentDate);

  if (result.length === 0) {
    return null;
  }

  const thread = {
    id: result[0].id,
    subject: result[0].subject,
    emails: result.map((row) => ({
      id: row.emailId,
      body: row.body,
      sentDate: row.sentDate,
      sender: {
        id: row.senderId,
        firstName: row.senderFirstName,
        lastName: row.senderLastName,
      },
      recipientId: row.recipientId,
    })),
  };

  return thread;
}

export async function getAllEmailAddresses() {
  'use cache';

  return db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users);
}

export async function getUserProfile(userId: number) {
  'use cache';

  const userInfo = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      jobTitle: users.jobTitle,
      company: users.company,
      location: users.location,
      avatarUrl: users.avatarUrl,
      linkedin: users.linkedin,
      twitter: users.twitter,
      github: users.github,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .execute();

  if (userInfo.length === 0) {
    return null;
  }

  const latestThreads = await db
    .select({
      subject: threads.subject,
    })
    .from(threads)
    .innerJoin(emails, eq(emails.threadId, threads.id))
    .where(eq(emails.senderId, userId))
    .orderBy(desc(threads.lastActivityDate))
    .limit(3)
    .execute();

  return {
    ...userInfo[0],
    latestThreads,
  };
}
