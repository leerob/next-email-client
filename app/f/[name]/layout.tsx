import { EmailListColumn } from '@/app/components/email-list-column';
import { FolderColumn } from '@/app/components/folder-column';

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Of5hfcD1fyI
 */
export default function EmailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { name: string; id: string };
}) {
  return (
    <div className="grid grid-cols-6 gap-2 h-screen p-2">
      <FolderColumn />
      <EmailListColumn folderName={params.name} />
      {children}
    </div>
  );
}
