import {
  Menu,
  Star,
  FileText,
  Send,
  Check,
  Trash,
  MoreHorizontal,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

export function NavMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="hover:bg-gray-100 p-2 mr-2 -ml-1 rounded-full">
          <Menu size={20} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-8">
          <Link
            href="/f/inbox"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            <Menu size={20} />
            <span>Inbox</span>
          </Link>
          <Link
            href="/f/starred"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            <Star size={20} />
            <span>Starred</span>
          </Link>
          <Link
            href="/f/drafts"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            <FileText size={20} />
            <span>Drafts</span>
          </Link>
          <Link
            href="/f/sent"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            <Send size={20} />
            <span>Sent Mail</span>
          </Link>
          <a
            href="#"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            <Check size={20} />
            <span>Done</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            <Trash size={20} />
            <span>Trash</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            <MoreHorizontal size={20} />
            <span>More</span>
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
