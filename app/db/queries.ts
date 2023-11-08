import { sql } from '@vercel/postgres';
import { toTitleCase } from './utils';

type Folder = {
  name: string;
  email_count: string;
};

export async function getFoldersWithEmailCount() {
  const result = await sql`
    SELECT f.name, COUNT(ef.email_id) AS email_count
    FROM folders f
    LEFT JOIN email_folders ef ON f.id = ef.folder_id
    GROUP BY f.name;
  `;

  const specialFoldersOrder = ['Inbox', 'Flagged', 'Sent'];
  const specialFolders = specialFoldersOrder
    .map((name) => result.rows.find((folder) => folder.name === name))
    .filter(Boolean) as Folder[];
  const otherFolders = result.rows.filter(
    (folder) => !specialFoldersOrder.includes(folder.name)
  ) as Folder[];

  return { specialFolders, otherFolders };
}

type EmailWithSender = {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string;
  body: string;
  sent_date: Date;
  first_name: string;
  last_name: string;
  email: string;
};

export async function getEmailsForFolder(folderName: string, search?: string) {
  const originalFolderName = toTitleCase(decodeURIComponent(folderName));
  let result;

  if (search === undefined) {
    result = await sql`
      SELECT e.*, u.first_name, u.last_name, u.email
      FROM emails e
      JOIN email_folders ef ON e.id = ef.email_id
      JOIN folders f ON ef.folder_id = f.id
      JOIN users u ON e.recipient_id = u.id
      WHERE f.name = ${originalFolderName}
      ORDER BY e.sent_date DESC;
    `;
    const emails = result.rows as EmailWithSender[];
    return emails;
  }

  if (originalFolderName === 'Sent') {
    result = await sql`
      SELECT e.*, u.first_name, u.last_name, u.email
      FROM emails e
      JOIN email_folders ef ON e.id = ef.email_id
      JOIN folders f ON ef.folder_id = f.id
      JOIN users u ON e.recipient_id = u.id
      WHERE f.name = ${originalFolderName}
      AND (
        u.first_name ILIKE ${`%${search}%`}
        OR u.last_name ILIKE ${`%${search}%`}
        OR u.email ILIKE ${`%${search}%`}
        OR e.subject ILIKE ${`%${search}%`}
        OR e.body ILIKE ${`%${search}%`}
      )
      ORDER BY e.sent_date DESC;
    `;
  } else {
    result = await sql`
      SELECT e.*, u.first_name, u.last_name, u.email
      FROM emails e
      JOIN email_folders ef ON e.id = ef.email_id
      JOIN folders f ON ef.folder_id = f.id
      JOIN users u ON e.sender_id = u.id
      WHERE f.name = ${originalFolderName}
      AND (
        u.first_name ILIKE ${`%${search}%`}
        OR u.last_name ILIKE ${`%${search}%`}
        OR u.email ILIKE ${`%${search}%`}
        OR e.subject ILIKE ${`%${search}%`}
        OR e.body ILIKE ${`%${search}%`}
      )
      ORDER BY e.sent_date DESC;
    `;
  }

  const emails = result.rows as EmailWithSender[];
  return emails;
}

export async function getEmailInFolder(folderName: string, emailId: string) {
  const originalFolderName = toTitleCase(decodeURIComponent(folderName));
  const result = await sql`
    SELECT e.*, u.first_name, u.last_name, u.email
    FROM emails e
    JOIN email_folders ef ON e.id = ef.email_id
    JOIN folders f ON ef.folder_id = f.id
    JOIN users u ON e.sender_id = u.id
    WHERE f.name = ${originalFolderName} AND e.id = ${emailId}
    ORDER BY e.sent_date DESC;
  `;
  const email = result.rows[0] as EmailWithSender;
  return email;
}

type UserEmail = {
  first_name: string;
  last_name: string;
  email: string;
};

export async function getAllEmailAddresses() {
  const result = await sql`
    SELECT first_name, last_name, email
    FROM users;
  `;
  const userEmails = result.rows as UserEmail[];
  return userEmails;
}
