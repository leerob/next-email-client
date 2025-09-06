// app/organizations/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getOrganizationRecordings, getUserOrganizations } from '@/lib/db/queries';
import OrganizationsClient from '@/app/organizations/organizations-client';

export default async function OrganizationsPage() {
  // Get session on the server
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch organizations with details
  const organizations = await getUserOrganizations(session.user.id);

  // Fetch all recordings for the sidebar
  const recordingPromises = organizations.map(async (org) => {
    try {
      const orgRecordings = await getOrganizationRecordings(org.id);
      return orgRecordings.map(rec => ({
        id: rec.id,
        name: rec.name,
        state: rec.state,
        createdAt: rec.createdAt instanceof Date ? rec.createdAt.toISOString() : String(rec.createdAt),
        organizationName: org.name,
        organizationSlug: org.slug,
        hasResult: rec.hasResult || false,
        createdBy: rec.createdBy,
      }));
    } catch (error) {
      console.error(`Error fetching recordings for org ${org.id}:`, error);
      return [];
    }
  });

  const recordingArrays = await Promise.all(recordingPromises);
  const allRecordings = recordingArrays.flat();

  // Sort recordings by date (most recent first)
  allRecordings.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Prepare user data
  const userData = {
    name: session.user.name || session.user.username || session.user.email.split('@')[0],
    email: session.user.email,
    image: session.user.image || null,
  };

  // Transform organizations data for the client
  const organizationsData = organizations.map(org => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description || "",
    memberCount: org.memberCount || 0,
    role: org.role as "admin" | "member",
    isPersonal: org.isPersonal || false,
    recordingCount: org.recordingCount || 0,
    createdAt: org.joinedAt instanceof Date ? org.joinedAt.toISOString() : String(org.joinedAt || new Date()),
  }));

  // Render the client component with server-fetched data
  return (
    <OrganizationsClient
      user={userData}
      organizations={organizationsData}
      recordings={allRecordings}
    />
  );
}
