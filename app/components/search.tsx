'use client';

import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function Search() {
  let inputRef = useRef<HTMLInputElement>(null);
  let searchParams = useSearchParams();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
    }
  }, []);

  return (
    <Form action="/search" className="w-full">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        ref={inputRef}
        id="search"
        name="q"
        className="w-full bg-transparent py-2 focus:outline-hidden"
        placeholder="Search"
        defaultValue={searchParams.get('q')?.toString()}
      />
    </Form>
  );
}
