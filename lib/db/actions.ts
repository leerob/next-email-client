'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toTitleCase } from 'lib/utils';
import { redirect } from 'next/navigation';
import { db } from './drizzle';
import { users, emails, folders, threads, threadFolders } from './schema';
import { eq, and } from 'drizzle-orm';

const sendEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  recipientEmail: z.string().email('Invalid email address'),
});

export async function sendEmailAction(_: any, formData: FormData) {
  let newThread;
  let rawFormData = {
    subject: formData.get('subject'),
    body: formData.get('body'),
    recipientEmail: formData.get('recipientEmail'),
  };

  try {
    let validatedFields = sendEmailSchema.parse({
      subject: formData.get('subject'),
      body: formData.get('body'),
      recipientEmail: formData.get('recipientEmail'),
    });

    let { subject, body, recipientEmail } = validatedFields;

    let [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.email, recipientEmail));

    if (!recipient) {
      [recipient] = await db
        .insert(users)
        .values({ email: recipientEmail })
        .returning();
    }

    let result = await db
      .insert(threads)
      .values({
        subject,
        lastActivityDate: new Date(),
      })
      .returning();
    newThread = result[0];

    await db.insert(emails).values({
      threadId: newThread.id,
      senderId: 1, // Assuming the current user's ID is 1. Replace this with the actual user ID.
      recipientId: recipient.id,
      subject,
      body,
      sentDate: new Date(),
    });

    let [sentFolder] = await db
      .select()
      .from(folders)
      .where(eq(folders.name, 'Sent'));

    await db.insert(threadFolders).values({
      threadId: newThread.id,
      folderId: sentFolder.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, previous: rawFormData };
    }
    return {
      error: 'Failed to send email. Please try again.',
      previous: rawFormData,
    };
  }

  revalidatePath('/', 'layout');
  redirect(`/f/sent/${newThread.id}`);
}

// export async function deleteEmail(folderName: string, emailId: string) {
//   const originalFolderName = toTitleCase(decodeURIComponent(folderName));
//
//   await db.transaction(async (tx) => {
//     const [folder] = await tx
//       .select({ id: folders.id })
//       .from(folders)
//       .where(eq(folders.name, originalFolderName))
//       .limit(1);
//
//     await tx
//       .delete(emailFolders)
//       .where(
//         and(
//           eq(emailFolders.emailId, parseInt(emailId)),
//           eq(emailFolders.folderId, folder.id),
//         ),
//       );
//
//     await tx.delete(emails).where(eq(emails.id, parseInt(emailId)));
//   });
//
//   revalidatePath('/', 'layout'); // Revalidate all data
//   redirect(`/f/${folderName}`);
// }
