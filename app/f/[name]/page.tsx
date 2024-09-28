import { getEmailInFolder } from '@/lib/db/queries';
import { formatEmailString } from '@/lib/utils';
import { Toolbar, ToolbarSkeleton } from '@/app/components/toolbar';
import { EmailListColumn } from '@/app/components/email-list-column';
import { FolderColumn } from '@/app/components/folder-column';
import { EmailEmptyView } from '@/app/components/email-empty-view';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

export default async function EmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let id = (await searchParams).id;
  let q = (await searchParams).q;
  let name = (await params).name;

  return (
    <div className="grid grid-cols-6 gap-2 h-screen p-2">
      <FolderColumn />
      <EmailListColumn folderName={name} query={q} />
      <Suspense fallback={<EmailEmptyView />}>
        <SelectedEmailColumn folderName={name} id={id} />
      </Suspense>
    </div>
  );
}

async function SelectedEmailColumn({
  folderName,
  id,
}: {
  folderName: string;
  id: string | undefined;
}) {
  if (!id) {
    return <EmailEmptyView />;
  }

  const email = await getEmailInFolder(folderName, id);

  if (!email) {
    return notFound();
  }

  return (
    <div className="col-span-3 flex flex-col w-12/20">
      <Suspense fallback={<ToolbarSkeleton />}>
        <Toolbar />
      </Suspense>
      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-xl font-bold">{email.subject}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {`From: ${folderName === 'sent' ? 'Me' : formatEmailString(email)}`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {`To: ${folderName === 'sent' ? formatEmailString(email) : 'Me'}`}
          </p>
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {email.sentDate?.toLocaleString()}
          </time>
        </div>
        <div>
          <p>{email.body}</p>
        </div>
      </div>
    </div>
  );
}
