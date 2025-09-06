// app/dashboard/layout.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  return {
    title: session?.user?.name
      ? `${session.user.name}'s Dashboard - CrescendAI`
      : 'Dashboard - CrescendAI',
    description: 'Manage your recordings and organizations',
  };
}

export default function DashboardLayout({
                                          children,
                                        }: {
  children: React.ReactNode;
}) {
  return children;
}
