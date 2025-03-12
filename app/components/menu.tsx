import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Check, FileText, Menu, Send, Star, Trash } from 'lucide-react';
import Link from 'next/link';

export function NavMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="mr-2 -ml-1 cursor-pointer rounded-full p-2 hover:bg-gray-100">
          <Menu size={20} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] transition-transform duration-200 ease-out data-[state=open]:duration-200 data-[state=open]:ease-out sm:w-[400px]"
      >
        <SheetTitle>Menu</SheetTitle>
        <nav className="mt-4 flex flex-col space-y-4">
          <Link
            href="/f/inbox"
            className="flex items-center space-x-2 rounded p-2 text-gray-700 hover:bg-gray-100"
          >
            <Menu size={20} />
            <span>Inbox</span>
          </Link>
          <Link
            href="/f/starred"
            className="flex items-center space-x-2 rounded p-2 text-gray-700 hover:bg-gray-100"
          >
            <Star size={20} />
            <span>Starred</span>
          </Link>
          <Link
            href="/f/drafts"
            className="flex items-center space-x-2 rounded p-2 text-gray-700 hover:bg-gray-100"
          >
            <FileText size={20} />
            <span>Drafts</span>
          </Link>
          <Link
            href="/f/sent"
            className="flex items-center space-x-2 rounded p-2 text-gray-700 hover:bg-gray-100"
          >
            <Send size={20} />
            <span>Sent Mail</span>
          </Link>
          <Link
            href="/f/archive"
            className="flex items-center space-x-2 rounded p-2 text-gray-700 hover:bg-gray-100"
          >
            <Check size={20} />
            <span>Archive</span>
          </Link>
          <Link
            href="/f/trash"
            className="flex items-center space-x-2 rounded p-2 text-gray-700 hover:bg-gray-100"
          >
            <Trash size={20} />
            <span>Trash</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
