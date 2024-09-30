import { LeftSidebar } from '@/app/components/left-sidebar';
import { getEmailsForThread } from '@/lib/db/queries';
import { Check, Clock, Archive } from 'lucide-react';
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
    <div className="flex-grow h-full flex">
      <LeftSidebar />
      <div className="flex-grow p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6 mx-6">
            <h1 className="text-2xl font-semibold pr-4 flex-grow max-w-2xl">
              {thread.subject}
            </h1>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button className="text-gray-700 text-sm font-medium mr-2">
                Share
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                <Check size={16} className="text-gray-600" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                <Clock size={16} className="text-gray-600" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                <Archive size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {thread.emails.map((email) => (
              <div key={email.id} className="bg-gray-50 py-4 px-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
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
