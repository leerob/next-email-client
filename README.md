# Next.js Email Client

This is an email client template built with Next.js and Postgres. It's built to show off some of the features of the App Router, which enable you to build products that:

- Navigate between routes in a column layout while maintaining scroll position (layouts support)
- Submit forms without JavaScript enabled (progressive enhancement)
- Navigate between routes extremely fast (prefetching and caching)
- Retain your UI position on reload (URL state)

**Demo: https://next-email-client.vercel.app**

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/leerob/next-email-client
cd next-email-client
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Then, run the database migrations and seed the database with emails and folders:

```bash
pnpm db:migrate
pnpm db:seed
```

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Implemented

- ✅ Search for emails
- ✅ Profile sidebar with user information
- ✅ View all threads
- ✅ View all emails in a thread
- ✅ Compose view
- ✅ Seed and setup script
- ✅ Highlight searched text
- ✅ Hook up compose view
- ✅ Delete emails (move to trash)
- Make side profile dynamic
- Support Markdown?
- Make up/down arrows work for threads
- Global keyboard shortcuts
- Better date formatting
- Dark mode styles
