// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { accounts, organizationMembers, organizations, sessions, users, verificationTokens } from '@/lib/db/schema';

// Custom Drizzle Adapter for NextAuth
function DrizzleAdapter(db: any): Adapter {
  return {
    async createUser(data: any) {
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          emailVerified: data.emailVerified,
          username: data.email.split('@')[0] + Date.now(), // Temporary username
          firstName: data.name?.split(' ')[0] || '',
          lastName: data.name?.split(' ').slice(1).join(' ') || '',
          image: data.image,
        })
        .returning();
      return user;
    },
    async getUser(id) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(id)),
      });
      return user || null;
    },
    async getUserByEmail(email) {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      return user || null;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.providerAccountId, providerAccountId),
          eq(accounts.provider, provider)
        ),
        with: {
          user: true,
        },
      });
      return account?.user || null;
    },
    async updateUser(data) {
      const [user] = await db
        .update(users)
        .set({
          email: data.email,
          emailVerified: data.emailVerified,
          firstName: data.name?.split(' ')[0],
          lastName: data.name?.split(' ').slice(1).join(' '),
          image: data.image,
        })
        .where(eq(users.id, parseInt(data.id)))
        .returning();
      return user;
    },
    async deleteUser(userId) {
      await db.delete(users).where(eq(users.id, parseInt(userId)));
      return null;
    },
    async linkAccount(account: any) {
      await db.insert(accounts).values({
        userId: parseInt(account.userId),
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
      return account;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        );
      return undefined;
    },
    async createSession({ sessionToken, userId, expires }) {
      const [session] = await db
        .insert(sessions)
        .values({
          sessionToken,
          userId: parseInt(userId),
          expires,
        })
        .returning();
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.sessionToken, sessionToken),
        with: {
          user: true,
        },
      });
      if (!session) return null;
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId.toString(),
          expires: session.expires,
        },
        user: session.user,
      };
    },
    async updateSession({ sessionToken, expires }) {
      const [session] = await db
        .update(sessions)
        .set({ expires })
        .where(eq(sessions.sessionToken, sessionToken))
        .returning();
      return session;
    },
    async deleteSession(sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
      return null;
    },
    async createVerificationToken({ identifier, expires, token }) {
      const [verificationToken] = await db
        .insert(verificationTokens)
        .values({ identifier, expires, token })
        .returning();
      return verificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      const verificationToken = await db.query.verificationTokens.findFirst({
        where: and(
          eq(verificationTokens.identifier, identifier),
          eq(verificationTokens.token, token)
        ),
      });
      if (!verificationToken) return null;
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        );
      return verificationToken;
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = parseInt(token.sub);

        // Fetch user's organizations
        const user = await db.query.users.findFirst({
          where: eq(users.id, parseInt(token.sub)),
          with: {
            organizationMemberships: {
              with: {
                organization: true,
              },
            },
          },
        });

        if (user) {
          session.user.username = user.username;
          session.user.organizations = user.organizationMemberships.map((m: any) => ({
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            role: m.role,
          }));
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.email!),
      });

      if (!existingUser) {
        // Generate a unique username from email or profile
        let username = user.email!.split('@')[0].toLowerCase();
        username = username.replace(/[^a-z0-9]/g, '');

        // Ensure username is unique
        let usernameExists = true;
        let counter = 0;
        let finalUsername = username;

        while (usernameExists) {
          const checkUser = await db.query.users.findFirst({
            where: eq(users.username, finalUsername),
          });

          if (!checkUser) {
            usernameExists = false;
          } else {
            counter++;
            finalUsername = `${username}${counter}`;
          }
        }

        // Update the user with username
        const [newUser] = await db
          .update(users)
          .set({
            username: finalUsername,
            firstName: profile?.name?.split(' ')[0] || '',
            lastName: profile?.name?.split(' ').slice(1).join(' ') || '',
          })
          .where(eq(users.email, user.email!))
          .returning();

        // Create personal organization for the new user
        const [personalOrg] = await db
          .insert(organizations)
          .values({
            name: `${finalUsername}'s Organization`,
            slug: finalUsername,
            isPersonal: true,
            ownerId: newUser.id,
          })
          .returning();

        // Add user as admin of their personal organization
        await db.insert(organizationMembers).values({
          organizationId: personalOrg.id,
          userId: newUser.id,
          role: 'admin',
        });
      }

      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Type extensions for TypeScript
declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      email: string;
      username: string;
      name?: string | null;
      image?: string | null;
      organizations: {
        id: number;
        name: string;
        slug: string;
        role: 'admin' | 'member';
      }[];
    };
  }

  interface User {
    id: number;
    username: string;
  }
}
