'use server';

import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toTitleCase } from './utils';
import { redirect } from 'next/navigation';

const schema = z.object({
  subject: z.string(),
  email: z.string().email(),
  body: z.string(),
});

export async function sendEmail(formData: FormData) {
  const parsed = schema.parse({
    subject: formData.get('subject'),
    email: formData.get('email'),
    body: formData.get('body'),
  });

  const senderId = 1; // Replace with actual senderId
  const client = await db.connect();
  let newEmailId;

  try {
    await client.query('BEGIN');

    // Get recipientId using the email
    let recipientResult = await client.sql`
      SELECT id FROM users WHERE email=${parsed.email};
    `;

    let recipientId;
    if (recipientResult.rows.length > 0) {
      recipientId = recipientResult.rows[0].id;
    } else {
      // Create new user if recipientId doesn't exist
      recipientResult = await client.sql`
        INSERT INTO users (email) VALUES (${parsed.email}) RETURNING id;
      `;
      recipientId = recipientResult.rows[0].id;
    }

    // Insert new email into emails table
    const emailResult = await client.sql`
      INSERT INTO emails (sender_id, recipient_id, subject, body, sent_date)
      VALUES (${senderId}, ${recipientId}, ${parsed.subject}, ${parsed.body}, NOW())
      RETURNING id;
    `;
    newEmailId = emailResult.rows[0].id;

    // Get 'Sent' folder id
    const folderResult = await client.sql`
      SELECT id FROM folders WHERE name='Sent';
    `;
    const sentFolderId = folderResult.rows[0].id;

    // Add the new email to the 'Sent' folder
    await client.sql`
      INSERT INTO email_folders (email_id, folder_id)
      VALUES (${newEmailId}, ${sentFolderId});
    `;

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Transaction failed: ', e);
  } finally {
    client.release();
    revalidatePath('/', 'layout'); // Revalidate all data
    redirect(`/f/sent/${newEmailId}`);
  }
}

export async function deleteEmail(folderName: string, emailId: string) {
  const client = await db.connect();
  const originalFolderName = toTitleCase(decodeURIComponent(folderName));

  try {
    await client.query('BEGIN');

    // Get folder id using the folder name
    let folderResult = await client.sql`
      SELECT id FROM folders WHERE name=${originalFolderName};
    `;
    const folderId = folderResult.rows[0].id;

    // Delete the email from the email_folders table
    await client.sql`
      DELETE FROM email_folders WHERE email_id=${emailId} AND folder_id=${folderId};
    `;

    // Delete the email from the emails table
    await client.sql`
      DELETE FROM emails WHERE id=${emailId};
    `;

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Transaction failed: ', e);
  } finally {
    client.release();
    revalidatePath('/', 'layout'); // Revalidate all data
    redirect(`/f/${folderName}`);
  }
}
