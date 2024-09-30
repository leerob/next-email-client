import { ThreadList } from '@/app/components/thread-list';
import { getThreadsForFolder } from '@/lib/db/queries';

export default async function FolderPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let q = (await searchParams).q;
  let name = (await params).name;
  let threads = await getThreadsForFolder(name);

  return (
    <div className="flex h-screen">
      <ThreadList folderName={name} threads={threads} searchQuery={q} />
    </div>
  );
}
