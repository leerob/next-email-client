import { getAllEmailAddresses } from "@/app/db/queries";
import { FolderColumn } from "@/app/components/folder-column";
import { Compose } from "@/app/components/email-compose";

export default async function Page() {
  const userEmails = await getAllEmailAddresses();
  return (
    <div className="grid grid-cols-6 gap-2 h-screen p-2">
      <FolderColumn />
      <Compose userEmails={userEmails} />
    </div>
  );
}
