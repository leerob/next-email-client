import { folders, emails, emailFolders, users } from './schema';
import { sql, eq, and, or, ilike, desc } from 'drizzle-orm';
import { db } from './drizzle';
import { toTitleCase } from '../utils';

type Folder = {
    name: string;
    email_count: number;
};

export async function getFoldersWithEmailCount() {
    let foldersWithCount = await db
        .select({
            name: folders.name,
            email_count: sql<number>`count(${emailFolders.emailId})`.as('email_count'),
        })
        .from(folders)
        .leftJoin(emailFolders, eq(folders.id, emailFolders.folderId))
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

export async function getEmailsForFolder(folderName: string, search?: string) {
    let originalFolderName = toTitleCase(decodeURIComponent(folderName));
    let userColumn = originalFolderName === 'Sent' ? emails.senderId : emails.recipientId;

    let query = db
        .select({
            id: emails.id,
            senderId: emails.senderId,
            recipientId: emails.recipientId,
            subject: emails.subject,
            body: emails.body,
            sentDate: emails.sentDate,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
        })
        .from(emails)
        .innerJoin(emailFolders, eq(emails.id, emailFolders.emailId))
        .innerJoin(folders, eq(emailFolders.folderId, folders.id))
        .innerJoin(users, eq(userColumn, users.id))
        .where(eq(folders.name, originalFolderName))
        .$dynamic();

    if (search) {
        query = query.where(
            and(
                eq(folders.name, originalFolderName),
                or(
                    ilike(users.firstName, `%${search}%`),
                    ilike(users.lastName, `%${search}%`),
                    ilike(users.email, `%${search}%`),
                    ilike(emails.subject, `%${search}%`),
                    ilike(emails.body, `%${search}%`)
                )
            )
        );
    }

    return query.orderBy(desc(emails.sentDate));
}

export async function getEmailInFolder(folderName: string, emailId: string) {
    let originalFolderName = toTitleCase(decodeURIComponent(folderName));
    let result = await db
        .select({
            id: emails.id,
            senderId: emails.senderId,
            recipientId: emails.recipientId,
            subject: emails.subject,
            body: emails.body,
            sentDate: emails.sentDate,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
        })
        .from(emails)
        .innerJoin(emailFolders, eq(emails.id, emailFolders.emailId))
        .innerJoin(folders, eq(emailFolders.folderId, folders.id))
        .innerJoin(users, eq(emails.senderId, users.id))
        .where(
            and(
                eq(folders.name, originalFolderName),
                eq(emails.id, parseInt(emailId))
            )
        );

    return result[0];
}

export async function getAllEmailAddresses() {
    return db
        .select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
        })
        .from(users);
}
