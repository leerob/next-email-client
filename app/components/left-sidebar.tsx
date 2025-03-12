'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';

function BackButton() {
  let { name } = useParams();

  return (
    <Link href={`/f/${name}`} passHref>
      <Button
        size="lg"
        variant="outline"
        className="flex cursor-pointer items-center justify-center rounded-full p-2 hover:bg-gray-100"
      >
        <ArrowLeft className="size-4 sm:size-5" />
      </Button>
    </Link>
  );
}

export function LeftSidebar() {
  return (
    <div className="flex flex-col items-center space-y-4 bg-gray-100 py-6 pr-2 pl-2 sm:pr-24 sm:pl-4">
      <Suspense>
        <BackButton />
      </Suspense>
      <Button
        size="lg"
        variant="outline"
        className="flex cursor-pointer items-center justify-center rounded-full p-2 hover:bg-gray-100"
      >
        <ChevronUp className="size-4 sm:size-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="flex cursor-pointer items-center justify-center rounded-full p-2 hover:bg-gray-100"
      >
        <ChevronDown className="size-4 sm:size-5" />
      </Button>
    </div>
  );
}
