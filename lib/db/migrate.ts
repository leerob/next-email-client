import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import { client, db } from './drizzle';

dotenv.config();

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), '/lib/db/migrations'),
  });
  console.log(`Migrations complete`);
  await client.end();
}

main();
