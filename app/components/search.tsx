'use client'

import { Search as SearchIcon } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import Form from "next/form"

export function Search() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  return (
    <Form action={pathname}>
      <div className="relative flex flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <Input
          id="search"
          name="q"
          className="pl-10"
          placeholder="Search..."
          defaultValue={searchParams.get('q')?.toString()}
        />
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </Form>
  )
}
