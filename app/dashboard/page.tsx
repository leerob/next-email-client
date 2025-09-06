// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";;
import DashboardClient from "./dashboard-client";
import { getOrganizationRecordings, getUserOrganizations } from '@/lib/db/queries';

async function getDashboardData(userId: number) {
  try {
    // Fetch organizations
    const organizations = await getUserOrganizations(userId);

    // Fetch recordings for all organizations in parallel
    const recordingPromises = organizations.map(async (org) => {
      try {
        // Pass userId explicitly to avoid dynamic data access in cached functions
        const orgRecordings = await getOrganizationRecordings(org.id, userId);
        return orgRecordings.map(rec => ({
          id: rec.id,
          name: rec.name,
          state: rec.state,
          createdAt: rec.createdAt instanceof Date ? rec.createdAt.toISOString() : String(rec.createdAt),
          updatedAt: rec.updatedAt instanceof Date ? rec.updatedAt.toISOString() : String(rec.updatedAt),
          hasResult: rec.hasResult || false,
          organizationName: org.name,
          organizationSlug: org.slug,
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

    return { organizations, recordings: allRecordings };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { organizations: [], recordings: [] };
  }
}

export default async function DashboardPage() {
  // Get session on the server
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch data server-side
  const { organizations, recordings } = await getDashboardData(session.user.id);

  // Prepare user data
  const userData = {
    name: session.user.name || session.user.username || session.user.email.split('@')[0],
    email: session.user.email,
    image: session.user.image || null,
  };

  // Render the client component with server-fetched data
  return (
    <DashboardClient
      user={userData}
      organizations={organizations}
      recordings={recordings}
    />
  );
}
