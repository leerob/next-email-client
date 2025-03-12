'use client';

import { LeftSidebar } from '@/app/components/left-sidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { sendEmailAction } from '@/lib/db/actions';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Paperclip, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useActionState } from 'react';

function DiscardDraftLink() {
  let { name } = useParams();

  return (
    <Link href={`/f/${name}`} className="text-gray-400 hover:text-gray-600">
      <Trash2 size={20} />
    </Link>
  );
}

function EmailBody({ defaultValue = '' }: { defaultValue?: string }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'Enter' || e.key === 'NumpadEnter')
    ) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div>
      <textarea
        name="body"
        placeholder="Tip: Hit Shift ⏎ to send"
        className="h-[calc(100vh-300px)] w-full resize-none rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        required
        onKeyDown={handleKeyDown}
        defaultValue={defaultValue}
      />
    </div>
  );
}

export default function ComposePage() {
  let [state, formAction] = useActionState(sendEmailAction, {
    error: '',
    previous: {
      recipientEmail: '',
      subject: '',
      body: '',
    },
  });

  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  return (
    <div className="flex h-full grow">
      <LeftSidebar />
      <div className="grow p-6">
        <h1 className="mb-6 text-2xl font-semibold">New Message</h1>
        {state.error && (
          <div className="mb-4">
            <Alert variant="destructive" className="relative">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
              To
            </span>
            <input
              type="email"
              name="recipientEmail"
              defaultValue={state.previous.recipientEmail?.toString()}
              className="w-full rounded-md border border-gray-300 py-2 pr-10 pl-12 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
              Subject
            </span>
            <input
              type="text"
              name="subject"
              defaultValue={state.previous.subject?.toString()}
              className="w-full rounded-md border border-gray-300 py-2 pl-20 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <EmailBody defaultValue={state.previous.body?.toString()} />
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <TooltipProvider>
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      disabled={isProduction}
                      className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Send
                    </button>
                  </TooltipTrigger>
                  {isProduction && (
                    <TooltipContent>
                      <p>Sending emails is disabled in production</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={isProduction}
                      className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Send later
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature is not yet implemented</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={isProduction}
                      className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remind me
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature is not yet implemented</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-4 ml-auto flex space-x-3 sm:mt-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      disabled
                      type="button"
                      className="cursor-pointer text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                    >
                      <Paperclip size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attachments are not yet implemented</p>
                  </TooltipContent>
                </Tooltip>
                <Suspense fallback={<Trash2 size={20} />}>
                  <DiscardDraftLink />
                </Suspense>
              </div>
            </TooltipProvider>
          </div>
        </form>
      </div>
    </div>
  );
}
