'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';

const buttonClasses = 'cursor-pointer p-2 rounded-full flex items-center justify-center hover:bg-gray-100'

function BackButton() {
  let { name } = useParams();

  return (
    <Link href={`/f/${name}`} passHref>
      <Button
        size="lg"
        variant="outline"
        className={buttonClasses}
      >
        <ArrowLeft className="size-4 sm:size-5" />
      </Button>
    </Link>
  );
}

export function LeftSidebar() {
  return (
    <div className="bg-gray-100 flex flex-col items-center py-6 space-y-4 pl-2 sm:pl-4 pr-2 sm:pr-24">
      <Suspense>
        <BackButton />
      </Suspense>
      <Button
        size="lg"
        variant="outline"
        className={buttonClasses}
      >
        <ChevronUp className="size-4 sm:size-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className={buttonClasses}
      >
        <ChevronDown className="size-4 sm:size-5" />
      </Button>
    </div>
  );
}
