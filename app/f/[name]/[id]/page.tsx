import { LeftSidebar } from '@/app/components/left-sidebar';
import { getEmailsForThread } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { ThreadActions } from '@/app/components/thread-actions';

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
    <div className="flex-grow h-full flex">
      <LeftSidebar />
      <div className="flex-grow p-2 sm:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6 mx-6">
            <h1 className="text-2xl font-semibold pr-4 flex-grow max-w-2xl mt-4 sm:mt-0">
              {thread.subject}
            </h1>
            <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0">
              <button className="text-gray-700 text-sm font-medium mr-2">
                Share
              </button>
              <ThreadActions threadId={thread.id} />
            </div>
          </div>
          <div className="space-y-6">
            {thread.emails.map((email) => (
              <div key={email.id} className="bg-gray-50 py-4 px-6 rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
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
