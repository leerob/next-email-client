'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toTitleCase } from './utils';
import { redirect } from 'next/navigation';

let schema = z.object({
  subject: z.string(),
  email: z.string().email(),
  body: z.string(),
});

let sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL!, {
  ssl: 'allow',
});

export async function sendEmail(formData: FormData) {
  let parsed = schema.parse({
    subject: formData.get('subject'),
    email: formData.get('email'),
    body: formData.get('body'),
  });

  let senderId = 1; // Replace with actual senderId
  let newEmailId;

  await sql
    .begin(async (sql) => {
      let recipientResult = await sql`
        SELECT id FROM users WHERE email=${parsed.email};
      `;

      let recipientId;
      if (recipientResult.length > 0) {
        recipientId = recipientResult[0].id;
      } else {
        recipientResult = await sql`
          INSERT INTO users (email) VALUES (${parsed.email}) RETURNING id;
        `;
        recipientId = recipientResult[0].id;
      }

      let emailResult = await sql`
        INSERT INTO emails (sender_id, recipient_id, subject, body, sent_date)
        VALUES (${senderId}, ${recipientId}, ${parsed.subject}, ${parsed.body}, NOW())
        RETURNING id;
      `;
      newEmailId = emailResult[0].id;

      let folderResult = await sql`
        SELECT id FROM folders WHERE name='Sent';
      `;
      let sentFolderId = folderResult[0].id;

      await sql`
        INSERT INTO email_folders (email_id, folder_id)
        VALUES (${newEmailId}, ${sentFolderId});
      `;
    })
    .catch((e) => {
      console.error('Transaction failed: ', e);
    });

  revalidatePath('/', 'layout'); // Revalidate all data
  redirect(`/f/sent?id=${newEmailId}`);
}

export async function deleteEmail(folderName: string, emailId: string) {
  let originalFolderName = toTitleCase(decodeURIComponent(folderName));

  await sql
    .begin(async (sql) => {
      let folderResult = await sql`
        SELECT id FROM folders WHERE name=${originalFolderName};
      `;
      let folderId = folderResult[0].id;

      await sql`
        DELETE FROM email_folders WHERE email_id=${emailId} AND folder_id=${folderId};
      `;
      await sql`
        DELETE FROM emails WHERE id=${emailId};
      `;
    })
    .catch((e) => {
      console.error('Transaction failed: ', e);
    });

  revalidatePath('/', 'layout'); // Revalidate all data
  redirect(`/f/${folderName}`);
}
