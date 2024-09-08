'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toTitleCase } from 'lib/utils';
import { redirect } from 'next/navigation';
import { db } from './drizzle';
import { users, emails, folders, emailFolders } from './schema';
import { eq, and } from 'drizzle-orm';

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
  let newEmailId = null;

  await db.transaction(async (tx) => {
    let recipientId: number;

    const existingUser = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.email))
      .limit(1);

    if (existingUser.length > 0) {
      recipientId = existingUser[0].id;
    } else {
      const [newUser] = await tx
        .insert(users)
        .values({ email: parsed.email })
        .returning({ id: users.id });
      recipientId = newUser.id;
    }

    const [newEmail] = await tx
      .insert(emails)
      .values({
        senderId,
        recipientId,
        subject: parsed.subject,
        body: parsed.body,
        sentDate: new Date(),
      })
      .returning({ id: emails.id });

    newEmailId = newEmail.id;

    const [sentFolder] = await tx
      .select({ id: folders.id })
      .from(folders)
      .where(eq(folders.name, 'Sent'))
      .limit(1);

    await tx
      .insert(emailFolders)
      .values({ emailId: newEmailId, folderId: sentFolder.id });
  });

  if (!newEmailId) {
    return;
  }

  revalidatePath('/', 'layout'); // Revalidate all data
  redirect(`/f/sent?id=${newEmailId}`);
}

export async function deleteEmail(folderName: string, emailId: string) {
  const originalFolderName = toTitleCase(decodeURIComponent(folderName));

  await db.transaction(async (tx) => {
    const [folder] = await tx
      .select({ id: folders.id })
      .from(folders)
      .where(eq(folders.name, originalFolderName))
      .limit(1);

    await tx
      .delete(emailFolders)
      .where(
        and(
          eq(emailFolders.emailId, parseInt(emailId)),
          eq(emailFolders.folderId, folder.id),
        ),
      );

    await tx.delete(emails).where(eq(emails.id, parseInt(emailId)));
  });

  revalidatePath('/', 'layout'); // Revalidate all data
  redirect(`/f/${folderName}`);
}
