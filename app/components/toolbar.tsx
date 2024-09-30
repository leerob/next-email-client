'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Mail,
  Trash,
  CornerUpLeft,
  CornerUpRight,
  Archive,
  Clock,
  Tag,
  MoreHorizontal,
  ArrowLeft,
} from 'lucide-react';
import { deleteEmail } from '@/lib/db/actions';
import { Search } from './search';
import { Button } from '@/components/ui/button';

type Params = {
  name: string;
};

export function Toolbar() {
  const params: Params = useParams();
  const searchParams = useSearchParams();
  const emailId = searchParams.get('id');

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 sticky top-0 bg-white h-[60px]">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/f/${params.name}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Inbox</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon">
          <Archive className="h-4 w-4" />
          <span className="sr-only">Archive</span>
        </Button>
        <form
          className="inline-flex"
          onSubmit={async (e) => {
            e.preventDefault();
            if (emailId) {
              await deleteEmail(params.name, emailId);
            }
          }}
        >
          <Button type="submit" variant="ghost" size="icon">
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete Email</span>
          </Button>
        </form>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/f/${params.name}/new`}>
            <Mail className="h-4 w-4" />
            <span className="sr-only">New Email</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon">
          <Clock className="h-4 w-4" />
          <span className="sr-only">Snooze</span>
        </Button>
        <Button variant="ghost" size="icon">
          <CornerUpLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button variant="ghost" size="icon">
          <CornerUpRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Search />
        <Button variant="ghost" size="icon">
          <Tag className="h-4 w-4" />
          <span className="sr-only">Tag</span>
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More Options</span>
        </Button>
      </div>
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <div className="h-[60px] border-b border-gray-200 bg-gray-100 animate-pulse" />
  );
}
