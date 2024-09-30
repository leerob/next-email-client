'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function LeftSidebar() {
  let { name } = useParams();

  return (
    <div className="bg-gray-100 flex flex-col items-center py-6 space-y-4 pl-2 sm:pl-4 pr-2 sm:pr-24">
      <Link href={`/f/${name}`} passHref>
        <Button
          size="lg"
          variant="outline"
          className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="size-4 sm:size-5" />
        </Button>
      </Link>
      <Button
        size="lg"
        variant="outline"
        className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <ChevronUp className="size-4 sm:size-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <ChevronDown className="size-4 sm:size-5" />
      </Button>
    </div>
  );
}
