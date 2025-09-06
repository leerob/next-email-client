// lib/seed.ts
import { db } from './drizzle';
import {
  users,
  organizations,
  organizationMembers,
  recordings,
  recordingResults,
} from './schema';

async function seed() {
  console.log('Starting seed process...');

  // Clear existing data
  await db.delete(organizationMembers);
  await db.delete(recordings);
  await db.delete(recordingResults);
  await db.delete(organizations);
  await db.delete(users);

  await seedUsers();
  await seedOrganizations();
  await seedRecordings();

  console.log('Seed process completed successfully.');
}

async function seedUsers() {
  console.log('Seeding users...');

  const insertedUsers = await db.insert(users).values([
    {
      firstName: 'Lee',
      lastName: 'Robinson',
      email: 'lee@leerob.com',
      username: 'leerob',
      emailVerified: new Date(),
      image: 'https://github.com/leerob.png',
    },
    {
      firstName: 'Guillermo',
      lastName: 'Rauch',
      email: 'rauchg@vercel.com',
      username: 'rauchg',
      emailVerified: new Date(),
      image: 'https://github.com/rauchg.png',
    },
    {
      firstName: 'Delba',
      lastName: 'de Oliveira',
      email: 'delba.oliveira@vercel.com',
      username: 'delbaoliveira',
      emailVerified: new Date(),
      image: 'https://github.com/delbaoliveira.png',
    },
    {
      firstName: 'Tim',
      lastName: 'Neutkens',
      email: 'tim@vercel.com',
      username: 'timneutkens',
      emailVerified: new Date(),
      image: 'https://github.com/timneutkens.png',
    },
  ]).returning();

  console.log(`Created ${insertedUsers.length} users`);
  return insertedUsers;
}

async function seedOrganizations() {
  console.log('Seeding organizations...');

  const allUsers = await db.select().from(users);

  // Create personal organizations for each user
  for (const user of allUsers) {
    const [personalOrg] = await db
      .insert(organizations)
      .values({
        name: `${user.username}'s Organization`,
        slug: user.username,
        description: `Personal organization for ${user.firstName} ${user.lastName}`,
        isPersonal: true,
        ownerId: user.id,
      })
      .returning();

    // Add user as admin of their personal organization
    await db.insert(organizationMembers).values({
      organizationId: personalOrg.id,
      userId: user.id,
      role: 'admin',
    });

    console.log(`Created personal organization for ${user.username}`);
  }

  // Create a shared organization (Vercel)
  const leeUser = allUsers.find(u => u.username === 'leerob');
  if (leeUser) {
    const [vercelOrg] = await db
      .insert(organizations)
      .values({
        name: 'Vercel',
        slug: 'vercel',
        description: 'The company behind Next.js',
        isPersonal: false,
        ownerId: leeUser.id,
      })
      .returning();

    // Add all users to Vercel organization with different roles
    for (const user of allUsers) {
      await db.insert(organizationMembers).values({
        organizationId: vercelOrg.id,
        userId: user.id,
        role: user.username === 'leerob' || user.username === 'rauchg' ? 'admin' : 'member',
      });
    }

    console.log('Created Vercel organization with members');
  }
}

async function seedRecordings() {
  console.log('Seeding recordings...');

  const vercelOrg = await db.query.organizations.findFirst({
    where: (org, { eq }) => eq(org.slug, 'vercel'),
  });

  const leeUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, 'leerob'),
  });

  const delbaUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, 'delbaoliveira'),
  });

  if (vercelOrg && leeUser && delbaUser) {
    // Create some sample recording results
    const [result1] = await db
      .insert(recordingResults)
      .values({
        result: Buffer.from('Sample recording data for meeting 1').toString('base64'),
      })
      .returning();

    const [result2] = await db
      .insert(recordingResults)
      .values({
        result: Buffer.from('Sample recording data for standup').toString('base64'),
      })
      .returning();

    // Create recordings with different states
    const _recordings = await db
      .insert(recordings)
      .values([
        {
          name: 'Product Planning Meeting',
          state: 'processed',
          organizationId: vercelOrg.id,
          createdBy: leeUser.id,
          resultId: result1.id,
          createdAt: new Date('2025-01-15T10:00:00'),
          updatedAt: new Date('2025-01-15T11:00:00'),
        },
        {
          name: 'Daily Standup',
          state: 'processed',
          organizationId: vercelOrg.id,
          createdBy: delbaUser.id,
          resultId: result2.id,
          createdAt: new Date('2025-01-16T09:00:00'),
          updatedAt: new Date('2025-01-16T09:30:00'),
        },
        {
          name: 'Customer Feedback Session',
          state: 'processing',
          organizationId: vercelOrg.id,
          createdBy: leeUser.id,
          resultId: null,
          createdAt: new Date('2025-01-17T14:00:00'),
          updatedAt: new Date('2025-01-17T14:00:00'),
        },
        {
          name: 'Architecture Review',
          state: 'queued',
          organizationId: vercelOrg.id,
          createdBy: leeUser.id,
          resultId: null,
          createdAt: new Date('2025-01-17T16:00:00'),
          updatedAt: new Date('2025-01-17T16:00:00'),
        },
      ])
      .returning();

    console.log(`Created ${_recordings.length} recordings`);
  }

  // Create recordings in personal organizations
  const leeOrg = await db.query.organizations.findFirst({
    where: (org, { eq, and }) => and(eq(org.slug, 'leerob'), eq(org.isPersonal, true)),
  });

  if (leeOrg && leeUser) {
    const [personalResult] = await db
      .insert(recordingResults)
      .values({
        result: Buffer.from('Personal recording data').toString('base64'),
      })
      .returning();

    await db.insert(recordings).values({
      name: 'Personal Project Notes',
      state: 'processed',
      organizationId: leeOrg.id,
      createdBy: leeUser.id,
      resultId: personalResult.id,
    });

    console.log('Created personal recording for Lee');
  }
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
