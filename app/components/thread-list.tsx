'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PenSquare, Search, Clock, Repeat, Check } from 'lucide-react';
import { NavMenu } from './menu';
import { formatEmailString } from '@/lib/utils';
import { emails, users } from '@/lib/db/schema';

type Email = Omit<typeof emails.$inferSelect, 'threadId'> & {
  sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
};
type User = typeof users.$inferSelect;

type ThreadWithEmails = {
  id: number;
  subject: string | null;
  lastActivityDate: Date | null;
  emails: Email[];
};

interface ThreadListProps {
  folderName: string;
  threads: ThreadWithEmails[];
  searchQuery?: string;
}

export function ThreadList({ folderName, threads }: ThreadListProps) {
  const [hoveredThread, setHoveredThread] = useState<number | null>(null);

  return (
    <div className="flex-grow border-r border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <NavMenu />
          <h1 className="text-xl font-semibold flex items-center capitalize">
            {folderName}
            <span className="ml-2 text-sm text-gray-400">{threads.length}</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/f/${folderName}/new`}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <PenSquare size={18} />
          </Link>
          <Link
            href="/search"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Search size={18} />
          </Link>
        </div>
      </div>
      <div className="overflow-auto h-[calc(100vh-64px)]">
        {threads.map((thread) => {
          const latestEmail = thread.emails[0];

          return (
            <Link
              key={thread.id}
              href={`/f/${folderName.toLowerCase()}/${thread.id}`}
            >
              <div
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100`}
                onMouseEnter={() => setHoveredThread(thread.id)}
                onMouseLeave={() => setHoveredThread(null)}
              >
                <div className="flex-grow flex items-center overflow-hidden">
                  <div className="w-[200px] flex-shrink-0 mr-4">
                    <span className="font-medium truncate">
                      {formatEmailString(latestEmail.sender)}
                    </span>
                  </div>
                  <div className="flex-grow flex items-center overflow-hidden">
                    <span className="font-medium truncate min-w-[175px] max-w-[400px] mr-2">
                      {thread.subject}
                    </span>
                    <span className="text-gray-600 truncate">
                      {latestEmail.body}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end flex-shrink-0 w-40 ml-4">
                  {hoveredThread === thread.id ? (
                    <div className="flex items-center space-x-1">
                      <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                        <Check size={14} className="text-gray-600" />
                      </button>
                      <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                        <Clock size={14} className="text-gray-600" />
                      </button>
                      <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                        <Repeat size={14} className="text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {new Date(thread.lastActivityDate!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
