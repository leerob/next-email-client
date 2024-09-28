import { db } from './drizzle';
import { users, emails, folders, userFolders, emailFolders } from './schema';

async function seed() {
  console.log('Starting seed process...');
  await seedEmails();
  console.log('Seed process completed successfully.');
}

async function seedEmails() {
  await db.insert(users).values([
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
    { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
    { firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@example.com' },
    { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com' },
  ]);

  await db.insert(emails).values([
    {
      senderId: 1,
      recipientId: 2,
      subject: 'Meeting Reminder',
      body: "Don't forget about our meeting tomorrow at 10am.",
      sentDate: new Date('2022-01-10T09:00:00'),
    },
    {
      senderId: 1,
      recipientId: 3,
      subject: 'Hello',
      body: 'Just wanted to say hello.',
      sentDate: new Date('2022-01-09T08:00:00'),
    },
    {
      senderId: 2,
      recipientId: 1,
      subject: 'Re: Meeting Reminder',
      body: "I won't be able to make it.",
      sentDate: new Date('2022-01-10T10:00:00'),
    },
    {
      senderId: 3,
      recipientId: 1,
      subject: 'Re: Hello',
      body: 'Hello to you too!',
      sentDate: new Date('2022-01-09T09:00:00'),
    },
    {
      senderId: 4,
      recipientId: 1,
      subject: 'Invitation',
      body: 'You are invited to my party.',
      sentDate: new Date('2022-01-11T07:00:00'),
    },
    {
      senderId: 1,
      recipientId: 2,
      subject: 'Work Project',
      body: "Let's discuss the new work project.",
      sentDate: new Date('2022-01-12T07:00:00'),
    },
    {
      senderId: 1,
      recipientId: 4,
      subject: 'Expenses Report',
      body: 'Please find the expenses report attached.',
      sentDate: new Date('2022-01-13T07:00:00'),
    },
    {
      senderId: 4,
      recipientId: 1,
      subject: 'Personal Note',
      body: "Let's catch up sometime.",
      sentDate: new Date('2022-01-14T07:00:00'),
    },
  ]);

  await db
    .insert(folders)
    .values([
      { name: 'Inbox' },
      { name: 'Flagged' },
      { name: 'Sent' },
      { name: 'Work' },
      { name: 'Expenses' },
      { name: 'Personal' },
    ]);

  const userFolderValues = [];
  for (let userId = 1; userId <= 4; userId++) {
    for (let folderId = 1; folderId <= 6; folderId++) {
      userFolderValues.push({ userId, folderId });
    }
  }
  await db.insert(userFolders).values(userFolderValues);

  await db.insert(emailFolders).values([
    { emailId: 1, folderId: 1 },
    { emailId: 2, folderId: 1 },
    { emailId: 3, folderId: 3 },
    { emailId: 4, folderId: 1 },
    { emailId: 5, folderId: 1 },
    { emailId: 6, folderId: 4 },
    { emailId: 7, folderId: 5 },
    { emailId: 8, folderId: 6 },
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
