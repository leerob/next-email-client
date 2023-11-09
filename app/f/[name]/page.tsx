import { getEmailInFolder } from '@/app/db/queries';
import { formatEmailString } from '@/app/db/utils';
import { Toolbar, ToolbarSkeleton } from '@/app/components/toolbar';
import { EmailListColumn } from '@/app/components/email-list-column';
import { FolderColumn } from '@/app/components/folder-column';
import { EmailEmptyView } from '@/app/components/email-empty-view';
import { Suspense } from 'react';

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/RPsRRQilTDp
 */
export default function EmailPage({
  params,
  searchParams,
}: {
  params: { name: string; id: string };
  searchParams: { q?: string; id?: string };
}) {
  return (
    <div className="grid grid-cols-6 gap-2 h-screen p-2">
      <FolderColumn />
      <EmailListColumn folderName={params.name} searchParams={searchParams} />
      <Suspense fallback={<EmailEmptyView />}>
        <SelectedEmailColumn
          folderName={params.name}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}

async function SelectedEmailColumn({
  folderName,
  searchParams,
}: {
  folderName: string;
  searchParams: { q?: string; id?: string };
}) {
  if (!searchParams.id) {
    return <EmailEmptyView />;
  }

  const email = await getEmailInFolder(folderName, searchParams.id);

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
            {new Date(email.sent_date).toLocaleString()}
          </time>
        </div>
        <div>
          <p>{email.body}</p>
        </div>
      </div>
    </div>
  );
}
