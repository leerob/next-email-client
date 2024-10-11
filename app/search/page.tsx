import { searchThreads } from '@/lib/db/queries';
import { NavMenu } from '../components/menu';
import Link from 'next/link';
import { X } from 'lucide-react';
import { formatEmailString, highlightText } from '@/lib/utils';
import { Search } from '../components/search';
import { Suspense } from 'react';

async function Threads({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let q = (await searchParams).q;
  let threads = await searchThreads(q);

  return (
    <div className="overflow-auto h-[calc(100vh-64px)]">
      {threads.map((thread) => {
        const latestEmail = thread.latestEmail;
        return (
          <Link
            key={thread.id}
            href={`/f/${thread.folderName.toLowerCase()}/${thread.id}`}
          >
            <div
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100`}
            >
              <div className="flex-grow flex items-center overflow-hidden">
                <div className="w-[200px] flex-shrink-0 mr-4">
                  <span className="font-medium truncate">
                    {highlightText(formatEmailString(latestEmail.sender), q)}
                  </span>
                </div>
                <div className="flex-grow flex items-center overflow-hidden">
                  <span className="font-medium truncate min-w-[175px] max-w-[400px] mr-2">
                    {highlightText(thread.subject, q)}
                  </span>
                  <span className="text-gray-600 truncate">
                    {highlightText(latestEmail.body, q)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end flex-shrink-0 w-40 ml-4">
                <span className="text-sm text-gray-500">
                  {new Date(thread.lastActivityDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  return (
    <div className="flex h-screen">
      <div className="flex-grow border-r border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[70px]">
          <div className="flex items-center w-full">
            <NavMenu />
            <Suspense>
              <Search />
            </Suspense>
          </div>
          <div className="flex items-center ml-4">
            <Link href="/" passHref>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </Link>
          </div>
        </div>
        <Suspense>
          <Threads searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
