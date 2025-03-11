import { LeftSidebar } from '@/app/components/left-sidebar';
import { ThreadActions } from '@/app/components/thread-actions';
import { getEmailsForThread } from '@/lib/db/queries';
import { notFound } from 'next/navigation';

export default async function EmailPage({
  params,
}: {
  params: Promise<{ name: string; id: string }>;
}) {
  let id = (await params).id;
  let thread = await getEmailsForThread(id);

  if (!thread || thread.emails.length === 0) {
    notFound();
  }

  return (
    <div className="flex h-full grow">
      <LeftSidebar />
      <div className="grow overflow-auto p-2 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mx-6 mb-6 flex flex-col items-start justify-between sm:flex-row">
            <h1 className="mt-4 max-w-2xl grow pr-4 text-2xl font-semibold sm:mt-0">
              {thread.subject}
            </h1>
            <div className="mt-2 flex shrink-0 items-center space-x-1 sm:mt-0">
              <button className="mr-2 cursor-pointer text-sm font-medium text-gray-700">
                Share
              </button>
              <ThreadActions threadId={thread.id} />
            </div>
          </div>
          <div className="space-y-6">
            {thread.emails.map((email) => (
              <div key={email.id} className="rounded-lg bg-gray-50 px-6 py-4">
                <div className="mb-2 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                  <div className="font-semibold">
                    {email.sender.firstName} {email.sender.lastName} to{' '}
                    {email.recipientId === thread.emails[0].sender.id
                      ? 'Me'
                      : 'All'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(email.sentDate!).toLocaleString()}
                  </div>
                </div>
                <div className="whitespace-pre-wrap">{email.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
