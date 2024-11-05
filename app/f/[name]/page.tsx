import { ThreadHeader, ThreadList } from '@/app/components/thread-list';
import { getThreadsForFolder } from '@/lib/db/queries';
import { Suspense, use } from 'react';

export function generateStaticParams() {
  const folderNames = [
    'inbox',
    'starred',
    'drafts',
    'sent',
    'archive',
    'trash',
  ];

  return folderNames.map((name) => ({ name }));
}

export default function ThreadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let name = use(params).name;

  return (
    <div className="flex h-screen">
      <Suspense fallback={<ThreadsSkeleton folderName={name} />}>
        <Threads folderName={name} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function ThreadsSkeleton({ folderName }: { folderName: string }) {
  return (
    <div className="flex-grow border-r border-gray-200 overflow-hidden">
      <ThreadHeader folderName={folderName} />
    </div>
  );
}

async function Threads({
  folderName,
  searchParams,
}: {
  folderName: string;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let q = (await searchParams).q;
  let threads = await getThreadsForFolder(folderName);

  return (
    <ThreadList folderName={folderName} threads={threads} searchQuery={q} />
  );
}
