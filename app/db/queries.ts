import postgres from 'postgres';
import { toTitleCase } from './utils';

type Folder = {
  name: string;
  email_count: string;
};

let sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL!, {
  ssl: 'allow',
});

export async function getFoldersWithEmailCount() {
  let folders = await sql`
    SELECT f.name, COUNT(ef.email_id) AS email_count
    FROM folders f
    LEFT JOIN email_folders ef ON f.id = ef.folder_id
    GROUP BY f.name;
  `;

  let specialFoldersOrder = ['Inbox', 'Flagged', 'Sent'];
  let specialFolders = specialFoldersOrder
    .map((name) => folders.find((folder) => folder.name === name))
    .filter(Boolean) as Folder[];
  let otherFolders = folders.filter(
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
  let originalFolderName = toTitleCase(decodeURIComponent(folderName));
  let userColumn = originalFolderName === 'Sent' ? 'sender_id' : 'recipient_id';

  let query = sql`
    SELECT e.*, u.first_name, u.last_name, u.email
    FROM emails e
    JOIN email_folders ef ON e.id = ef.email_id
    JOIN folders f ON ef.folder_id = f.id
    JOIN users u ON e.${sql(userColumn)} = u.id
    WHERE f.name = ${originalFolderName}
  `;

  if (search) {
    query = sql`${query}
      AND (
        u.first_name ILIKE ${`%${search}%`}
        OR u.last_name ILIKE ${`%${search}%`}
        OR u.email ILIKE ${`%${search}%`}
        OR e.subject ILIKE ${`%${search}%`}
        OR e.body ILIKE ${`%${search}%`}
      )
    `;
  }

  return sql<EmailWithSender[]>`${query} ORDER BY e.sent_date DESC;`;
}

export async function getEmailInFolder(folderName: string, emailId: string) {
  let originalFolderName = toTitleCase(decodeURIComponent(folderName));
  let emails = await sql<EmailWithSender[]>`
    SELECT e.*, u.first_name, u.last_name, u.email
    FROM emails e
    JOIN email_folders ef ON e.id = ef.email_id
    JOIN folders f ON ef.folder_id = f.id
    JOIN users u ON e.sender_id = u.id
    WHERE f.name = ${originalFolderName} AND e.id = ${emailId};
  `;

  return emails[0];
}

type UserEmail = {
  first_name: string;
  last_name: string;
  email: string;
};

export async function getAllEmailAddresses() {
  return sql<UserEmail[]>`
    SELECT first_name, last_name, email
    FROM users;
  `;
}
