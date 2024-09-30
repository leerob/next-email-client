'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from './drizzle';
import { users, emails, folders, threads, threadFolders } from './schema';
import { eq } from 'drizzle-orm';

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

  if (process.env.VERCEL_ENV === 'production') {
    return {
      error: 'Only works on localhost for now',
      previous: rawFormData,
    };
  }

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

export async function moveThreadToDone(_: any, formData: FormData) {
  if (process.env.VERCEL_ENV === 'production') {
    return {
      error: 'Only works on localhost for now',
    };
  }

  let threadId = formData.get('threadId');

  if (!threadId || typeof threadId !== 'string') {
    return { error: 'Invalid thread ID', success: false };
  }

  try {
    let doneFolder = await db.query.folders.findFirst({
      where: eq(folders.name, 'Archive'),
    });

    if (!doneFolder) {
      return { error: 'Done folder not found', success: false };
    }

    let parsedThreadId = parseInt(threadId, 10);

    await db
      .delete(threadFolders)
      .where(eq(threadFolders.threadId, parsedThreadId));

    await db.insert(threadFolders).values({
      threadId: parsedThreadId,
      folderId: doneFolder.id,
    });

    revalidatePath('/f/[name]');
    revalidatePath('/f/[name]/[id]');
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to move thread to Done:', error);
    return { success: false, error: 'Failed to move thread to Done' };
  }
}

export async function moveThreadToTrash(_: any, formData: FormData) {
  if (process.env.VERCEL_ENV === 'production') {
    return {
      error: 'Only works on localhost for now',
    };
  }

  let threadId = formData.get('threadId');

  if (!threadId || typeof threadId !== 'string') {
    return { error: 'Invalid thread ID', success: false };
  }

  try {
    let trashFolder = await db.query.folders.findFirst({
      where: eq(folders.name, 'Trash'),
    });

    if (!trashFolder) {
      return { error: 'Trash folder not found', success: false };
    }

    let parsedThreadId = parseInt(threadId, 10);

    await db
      .delete(threadFolders)
      .where(eq(threadFolders.threadId, parsedThreadId));

    await db.insert(threadFolders).values({
      threadId: parsedThreadId,
      folderId: trashFolder.id,
    });

    revalidatePath('/f/[name]');
    revalidatePath('/f/[name]/[id]');
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to move thread to Trash:', error);
    return { success: false, error: 'Failed to move thread to Trash' };
  }
}
