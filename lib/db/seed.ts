import { db } from './drizzle';
import {
  users,
  emails,
  folders,
  userFolders,
  threads,
  threadFolders,
} from './schema';

async function seed() {
  console.log('Starting seed process...');
  await seedUsers();
  await seedFolders();
  await seedThreadsAndEmails();
  console.log('Seed process completed successfully.');
}

async function seedUsers() {
  await db.insert(users).values([
    {
      firstName: 'Lee',
      lastName: 'Robinson',
      email: 'lee@leerob.com',
      jobTitle: 'VP of Product',
      company: 'Vercel',
      location: 'Des Moines, Iowa',
      avatarUrl: 'https://github.com/leerob.png',
    },
    {
      firstName: 'Guillermo',
      lastName: 'Rauch',
      email: 'rauchg@vercel.com',
      jobTitle: 'CEO',
      company: 'Vercel',
      location: 'San Francisco, California',
      avatarUrl: 'https://github.com/rauchg.png',
    },
    {
      firstName: 'Delba',
      lastName: 'de Oliveira',
      email: 'delba.oliveira@vercel.com',
      jobTitle: 'Staff DX Engineer',
      company: 'Vercel',
      location: 'London, UK',
      avatarUrl: 'https://github.com/delbaoliveira.png',
    },
    {
      firstName: 'Tim',
      lastName: 'Neutkens',
      email: 'tim@vercel.com',
      jobTitle: 'Next.js Lead',
      company: 'Vercel',
      location: 'Amsterdam, Netherlands',
      avatarUrl: 'https://github.com/timneutkens.png',
    },
  ]);
}

async function seedFolders() {
  await db
    .insert(folders)
    .values([
      { name: 'Inbox' },
      { name: 'Flagged' },
      { name: 'Sent' },
      { name: 'Archive' },
      { name: 'Spam' },
      { name: 'Trash' },
    ]);

  const userFolderValues = [];
  for (let userId = 1; userId <= 4; userId++) {
    for (let folderId = 1; folderId <= 6; folderId++) {
      userFolderValues.push({ userId, folderId });
    }
  }
  await db.insert(userFolders).values(userFolderValues);
}

async function seedThreadsAndEmails() {
  // Thread 1: Guillermo talking about Vercel customer feedback
  const thread1 = await db
    .insert(threads)
    .values({
      subject: 'Vercel Customer Feedback',
      lastActivityDate: new Date('2023-05-15T10:00:00'),
    })
    .returning();

  await db.insert(emails).values([
    {
      threadId: thread1[0].id,
      senderId: 2, // Guillermo
      recipientId: 1, // Lee
      subject: 'Vercel Customer Feedback',
      body: 'Met with Daniel today. He had some great feedback. After you make a change to your environment variables, he wants to immediately redeploy the application. We should make a toast that has a CTA to redeploy. Thoughts?',
      sentDate: new Date('2023-05-15T10:00:00'),
    },
    {
      threadId: thread1[0].id,
      senderId: 1, // Lee
      recipientId: 2, // Guillermo
      subject: 'Re: Vercel Customer Feedback',
      body: "Good call. I've seen this multiple times now. Let's do it.",
      sentDate: new Date('2023-05-15T11:30:00'),
    },
    {
      threadId: thread1[0].id,
      senderId: 2, // Guillermo
      recipientId: 1, // Lee
      subject: 'Re: Vercel Customer Feedback',
      body: "Amazing. Let me know when it shipped and I'll follow up.",
      sentDate: new Date('2023-05-15T13:45:00'),
    },
  ]);

  // Thread 2: Delba talking about Next.js and testing out new features
  const thread2 = await db
    .insert(threads)
    .values({
      subject: 'New Next.js RFC',
      lastActivityDate: new Date('2023-05-16T09:00:00'),
    })
    .returning();

  await db.insert(emails).values([
    {
      threadId: thread2[0].id,
      senderId: 3, // Delba
      recipientId: 1, // Lee
      subject: 'New Next.js RFC',
      body: "I'm working on the first draft of the Dynamic IO docs and examples. Do you want to take a look?",
      sentDate: new Date('2023-05-16T09:00:00'),
    },
    {
      threadId: thread2[0].id,
      senderId: 1, // Lee
      recipientId: 3, // Delba
      subject: 'Re: New Next.js RFC',
      body: "Absolutely. Let me take a look later tonight and I'll send over feedback.",
      sentDate: new Date('2023-05-16T10:15:00'),
    },
    {
      threadId: thread2[0].id,
      senderId: 3, // Delba
      recipientId: 1, // Lee
      subject: 'Re: New Next.js RFC',
      body: 'Thank you!',
      sentDate: new Date('2023-05-16T11:30:00'),
    },
  ]);

  // Thread 3: Tim with steps to test out Turbopack
  const thread3 = await db
    .insert(threads)
    .values({
      subject: 'Turbopack Testing',
      lastActivityDate: new Date('2023-05-17T14:00:00'),
    })
    .returning();

  await db.insert(emails).values([
    {
      threadId: thread3[0].id,
      senderId: 4, // Tim
      recipientId: 1, // Lee
      subject: 'Turbopack Testing Steps',
      body: `Hi Lee,

Here are the steps to test out Turbopack:

1. npx create-next-app@canary
2. Select Turbopack when prompted
3. Run 'npm install' to install dependencies
4. Start the development server with 'npm run dev -- --turbo'
5. That's it!

Let me know if you encounter any issues or have any questions.

Best,
Tim`,
      sentDate: new Date('2023-05-17T14:00:00'),
    },
  ]);

  // Add threads to folders
  await db.insert(threadFolders).values([
    { threadId: thread1[0].id, folderId: 1 }, // Inbox
    { threadId: thread2[0].id, folderId: 1 }, // Inbox
    { threadId: thread3[0].id, folderId: 1 }, // Inbox
  ]);
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
