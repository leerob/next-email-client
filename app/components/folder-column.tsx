import Link from 'next/link'
import { getFoldersWithEmailCount } from '@/lib/db/queries'
import { Flag, Folder, Inbox, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export async function FolderColumn() {
  const { specialFolders, otherFolders } = await getFoldersWithEmailCount()

  return (
    <div className="border-r overflow-y-auto py-2 space-y-2 h-full">
      <ul className="space-y-1">
        {specialFolders.map((folder, index) => (
          <li key={index} className="mr-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href={`/f/${encodeURIComponent(folder.name.toLowerCase())}`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    {folder.name === 'Inbox' ? (
                      <Inbox className="h-4 w-4" />
                    ) : folder.name === 'Flagged' ? (
                      <Flag className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  {folder.email_count}
                </div>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
      <Separator className="my-4" />
      <ul className="space-y-1">
        {otherFolders.map((folder, index) => (
          <li key={index}>
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href={`/f/${encodeURIComponent(folder.name.toLowerCase())}`}>
                <Folder className="mr-3 h-4 w-4" />
                <span className="text-sm">{folder.name}</span>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
