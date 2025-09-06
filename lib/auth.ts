// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import GitHubProvider from 'next-auth/providers/github';
import { users, accounts, sessions, verificationTokens, organizations, organizationMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';

// Custom Drizzle Adapter for NextAuth
function DrizzleAdapter(db: any): Adapter {
  return {
    async createUser(data: any) {
      console.log(`[ADAPTER] createUser called with:`, JSON.stringify(data, null, 2));

      try {
        // Generate a unique username from email
        let username = data.email.split('@')[0].toLowerCase();
        username = username.replace(/[^a-z0-9]/g, '');

        // Ensure username is unique
        let usernameExists = true;
        let counter = 0;
        let finalUsername = username;

        while (usernameExists) {
          console.log(`[ADAPTER] Checking if username exists: ${finalUsername}`);
          const checkUser = await db.query.users.findFirst({
            where: eq(users.username, finalUsername),
          });

          if (!checkUser) {
            usernameExists = false;
            console.log(`[ADAPTER] Username ${finalUsername} is available`);
          } else {
            counter++;
            finalUsername = `${username}${counter}`;
            console.log(`[ADAPTER] Username taken, trying: ${finalUsername}`);
          }
        }

        console.log(`[ADAPTER] Creating user with username: ${finalUsername}`);

        const [user] = await db
          .insert(users)
          .values({
            email: data.email,
            emailVerified: data.emailVerified,
            username: finalUsername,
            firstName: data.name?.split(' ')[0] || '',
            lastName: data.name?.split(' ').slice(1).join(' ') || '',
            image: data.image,
          })
          .returning();

        console.log(`[ADAPTER] User created successfully:`, JSON.stringify(user, null, 2));

        // Create personal organization for the new user
        console.log(`[ADAPTER] Creating personal organization for user ${user.id}`);
        const [personalOrg] = await db
          .insert(organizations)
          .values({
            name: `${finalUsername}'s Organization`,
            slug: finalUsername,
            isPersonal: true,
            ownerId: user.id,
          })
          .returning();

        console.log(`[ADAPTER] Organization created:`, JSON.stringify(personalOrg, null, 2));

        // Add user as admin of their personal organization
        console.log(`[ADAPTER] Adding user as admin of organization`);
        await db.insert(organizationMembers).values({
          organizationId: personalOrg.id,
          userId: user.id,
          role: 'admin',
        });

        console.log(`[ADAPTER] User successfully added as organization admin`);
        console.log(`[ADAPTER] createUser returning:`, JSON.stringify(user, null, 2));
        return user;
      } catch (error) {
        console.error(`[ADAPTER] createUser ERROR:`, error);
        throw error;
      }
    },

    async getUser(id) {
      console.log(`[ADAPTER] getUser called with id: ${id}`);
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.id, parseInt(id)),
        });
        console.log(`[ADAPTER] getUser returning:`, JSON.stringify(user, null, 2));
        return user || null;
      } catch (error) {
        console.error(`[ADAPTER] getUser ERROR:`, error);
        throw error;
      }
    },

    async getUserByEmail(email) {
      console.log(`[ADAPTER] getUserByEmail called with email: ${email}`);
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        console.log(`[ADAPTER] getUserByEmail returning:`, JSON.stringify(user, null, 2));
        return user || null;
      } catch (error) {
        console.error(`[ADAPTER] getUserByEmail ERROR:`, error);
        throw error;
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      console.log(`[ADAPTER] getUserByAccount called with providerAccountId: ${providerAccountId}, provider: ${provider}`);
      try {
        const account = await db.query.accounts.findFirst({
          where: and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          ),
          with: {
            user: true,
          },
        });
        console.log(`[ADAPTER] getUserByAccount found account:`, JSON.stringify(account, null, 2));
        console.log(`[ADAPTER] getUserByAccount returning user:`, JSON.stringify(account?.user, null, 2));
        return account?.user || null;
      } catch (error) {
        console.error(`[ADAPTER] getUserByAccount ERROR:`, error);
        throw error;
      }
    },

    async updateUser(data) {
      console.log(`[ADAPTER] updateUser called with:`, JSON.stringify(data, null, 2));
      try {
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
        console.log(`[ADAPTER] updateUser returning:`, JSON.stringify(user, null, 2));
        return user;
      } catch (error) {
        console.error(`[ADAPTER] updateUser ERROR:`, error);
        throw error;
      }
    },

    async deleteUser(userId) {
      console.log(`[ADAPTER] deleteUser called with userId: ${userId}`);
      try {
        await db.delete(users).where(eq(users.id, parseInt(userId)));
        console.log(`[ADAPTER] deleteUser completed`);
        return null;
      } catch (error) {
        console.error(`[ADAPTER] deleteUser ERROR:`, error);
        throw error;
      }
    },

    async linkAccount(account: any) {
      console.log(`[ADAPTER] linkAccount called with:`, JSON.stringify(account, null, 2));
      try {
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
        console.log(`[ADAPTER] linkAccount completed successfully`);
        return account;
      } catch (error) {
        console.error(`[ADAPTER] linkAccount ERROR:`, error);
        throw error;
      }
    },

    async unlinkAccount({ providerAccountId, provider }) {
      console.log(`[ADAPTER] unlinkAccount called with providerAccountId: ${providerAccountId}, provider: ${provider}`);
      try {
        await db
          .delete(accounts)
          .where(
            and(
              eq(accounts.providerAccountId, providerAccountId),
              eq(accounts.provider, provider)
            )
          );
        console.log(`[ADAPTER] unlinkAccount completed`);
        return undefined;
      } catch (error) {
        console.error(`[ADAPTER] unlinkAccount ERROR:`, error);
        throw error;
      }
    },

    async createSession({ sessionToken, userId, expires }) {
      console.log(`[ADAPTER] createSession called with sessionToken: ${sessionToken}, userId: ${userId}, expires: ${expires}`);
      try {
        const [session] = await db
          .insert(sessions)
          .values({
            sessionToken,
            userId: parseInt(userId),
            expires,
          })
          .returning();
        console.log(`[ADAPTER] createSession returning:`, JSON.stringify(session, null, 2));
        return session;
      } catch (error) {
        console.error(`[ADAPTER] createSession ERROR:`, error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken) {
      console.log(`[ADAPTER] getSessionAndUser called with sessionToken: ${sessionToken}`);
      try {
        const session = await db.query.sessions.findFirst({
          where: eq(sessions.sessionToken, sessionToken),
          with: {
            user: true,
          },
        });
        if (!session) {
          console.log(`[ADAPTER] getSessionAndUser returning null - no session found`);
          return null;
        }
        const result = {
          session: {
            sessionToken: session.sessionToken,
            userId: session.userId.toString(),
            expires: session.expires,
          },
          user: {
            ...session.user,
            id: session.user.id.toString(),
            emailVerified: session.user.emailVerified || null,
          },
        };
        console.log(`[ADAPTER] getSessionAndUser returning:`, JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error(`[ADAPTER] getSessionAndUser ERROR:`, error);
        throw error;
      }
    },

    async updateSession({ sessionToken, expires }) {
      console.log(`[ADAPTER] updateSession called with sessionToken: ${sessionToken}, expires: ${expires}`);
      try {
        const [session] = await db
          .update(sessions)
          .set({ expires })
          .where(eq(sessions.sessionToken, sessionToken))
          .returning();
        console.log(`[ADAPTER] updateSession returning:`, JSON.stringify(session, null, 2));
        return session;
      } catch (error) {
        console.error(`[ADAPTER] updateSession ERROR:`, error);
        throw error;
      }
    },

    async deleteSession(sessionToken) {
      console.log(`[ADAPTER] deleteSession called with sessionToken: ${sessionToken}`);
      try {
        await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
        console.log(`[ADAPTER] deleteSession completed`);
        return null;
      } catch (error) {
        console.error(`[ADAPTER] deleteSession ERROR:`, error);
        throw error;
      }
    },

    async createVerificationToken({ identifier, expires, token }) {
      console.log(`[ADAPTER] createVerificationToken called with identifier: ${identifier}, expires: ${expires}, token: ${token}`);
      try {
        const [verificationToken] = await db
          .insert(verificationTokens)
          .values({ identifier, expires, token })
          .returning();
        console.log(`[ADAPTER] createVerificationToken returning:`, JSON.stringify(verificationToken, null, 2));
        return verificationToken;
      } catch (error) {
        console.error(`[ADAPTER] createVerificationToken ERROR:`, error);
        throw error;
      }
    },

    async useVerificationToken({ identifier, token }) {
      console.log(`[ADAPTER] useVerificationToken called with identifier: ${identifier}, token: ${token}`);
      try {
        const verificationToken = await db.query.verificationTokens.findFirst({
          where: and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          ),
        });
        if (!verificationToken) {
          console.log(`[ADAPTER] useVerificationToken returning null - no token found`);
          return null;
        }
        await db
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, identifier),
              eq(verificationTokens.token, token)
            )
          );
        console.log(`[ADAPTER] useVerificationToken returning:`, JSON.stringify(verificationToken, null, 2));
        return verificationToken;
      } catch (error) {
        console.error(`[ADAPTER] useVerificationToken ERROR:`, error);
        throw error;
      }
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
      console.log(`[CALLBACK] session called with token:`, JSON.stringify(token, null, 2));
      console.log(`[CALLBACK] session called with session:`, JSON.stringify(session, null, 2));

      try {
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
            session.user.organizations = user.organizationMemberships.map(m => ({
              id: m.organization.id,
              name: m.organization.name,
              slug: m.organization.slug,
              role: m.role,
            }));
            console.log(`[CALLBACK] session - user found with organizations:`, session.user.organizations);
          } else {
            console.log(`[CALLBACK] session - no user found for id: ${token.sub}`);
          }
        }

        console.log(`[CALLBACK] session returning:`, JSON.stringify(session, null, 2));
        return session;
      } catch (error) {
        console.error(`[CALLBACK] session ERROR:`, error);
        throw error;
      }
    },

    async jwt({ token, user, account, profile }) {
      console.log(`[CALLBACK] jwt called with token:`, JSON.stringify(token, null, 2));
      console.log(`[CALLBACK] jwt called with user:`, JSON.stringify(user, null, 2));
      console.log(`[CALLBACK] jwt called with account:`, JSON.stringify(account, null, 2));
      console.log(`[CALLBACK] jwt called with profile:`, JSON.stringify(profile, null, 2));

      try {
        if (user) {
          token.id = user.id;
          console.log(`[CALLBACK] jwt - set token.id to: ${user.id}`);
        }

        console.log(`[CALLBACK] jwt returning token:`, JSON.stringify(token, null, 2));
        return token;
      } catch (error) {
        console.error(`[CALLBACK] jwt ERROR:`, error);
        throw error;
      }
    },

    async signIn({ user, account, profile }) {
      console.log(`[CALLBACK - NEW VERSION] signIn called`);
      console.log(`[CALLBACK] signIn user:`, JSON.stringify(user, null, 2));
      console.log(`[CALLBACK] signIn account:`, JSON.stringify(account, null, 2));
      console.log(`[CALLBACK] signIn profile:`, JSON.stringify(profile, null, 2));

      // IMPORTANT: Just return true to allow sign in
      // User creation is handled by the adapter's createUser method
      console.log(`[CALLBACK] signIn returning true - user creation will be handled by adapter if needed`);
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
  debug: true, // Enable debug mode to see more logs
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
