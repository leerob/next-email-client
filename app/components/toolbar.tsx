'use client';

import { useParams } from 'next/navigation';

import { ArrowLeftIcon } from '@/app/icons/arrow-left';
import { ArrowRightIcon } from '@/app/icons/arrow-right';
import { EmailIcon } from '@/app/icons/email';
import { SearchIcon } from '@/app/icons/search';
import { TrashIcon } from '@/app/icons/trash';
import Link from 'next/link';
import { deleteEmail } from '@/app/db/actions';

type Params = {
  name: string;
  id: string;
};

export function Toolbar() {
  const params: Params = useParams();

  return (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 h-[60px]">
      <div className="space-x-6">
        <Link href={`/f/${params.name}/new`} className="inline-flex">
          <EmailIcon />
        </Link>
        <form
          className="inline-flex"
          onSubmit={async (e) => {
            e.preventDefault();
            await deleteEmail(params.name, params.id);
          }}
        >
          <button type="submit">
            <TrashIcon />
          </button>
        </form>
        <button>
          <ArrowLeftIcon />
        </button>
        <button>
          <ArrowRightIcon />
        </button>
      </div>
      <button className="flex ml-auto">
        <SearchIcon />
      </button>
    </div>
  );
}
