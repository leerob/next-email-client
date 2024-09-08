'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Mail, Trash, CornerUpLeft, CornerUpRight } from 'lucide-react'
import { deleteEmail } from '@/lib/db/actions'
import { Search } from './search'
import { Button } from "@/components/ui/button"

type Params = {
  name: string
}

export function Toolbar() {
  const params: Params = useParams()
  const searchParams = useSearchParams()
  const emailId = searchParams.get('id')

  return (
    <div className="flex justify-between items-center border-b py-4 px-2 sticky top-0 h-[60px]">
      <div className="space-x-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/f/${params.name}/new`}>
            <Mail className="h-4 w-4" />
            <span className="sr-only">New Email</span>
          </Link>
        </Button>
        <form
          className="inline-flex"
          onSubmit={async (e) => {
            e.preventDefault()
            if (emailId) {
              await deleteEmail(params.name, emailId)
            }
          }}
        >
          <Button type="submit" variant="ghost" size="icon">
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete Email</span>
          </Button>
        </form>
        <Button variant="ghost" size="icon">
          <CornerUpLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button variant="ghost" size="icon">
          <CornerUpRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
      <div className="flex ml-auto">
        <Search />
      </div>
    </div>
  )
}

export function ToolbarSkeleton() {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 py-4 px-2 sticky top-0 h-[60px]" />
  );
}
