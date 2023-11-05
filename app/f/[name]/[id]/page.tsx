import { getEmailInFolder } from '@/app/db/queries';
import { Toolbar } from '@/app/components/toolbar';
import { formatEmailString } from '@/app/db/utils';

export default async function Page({
  params,
}: {
  params: { name: string; id: string };
}) {
  const email = await getEmailInFolder(params.name, params.id);

  return (
    <div className="col-span-3 flex flex-col w-12/20">
      <Toolbar />
      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-xl font-bold">{email.subject}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {`From: ${formatEmailString(email)}`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">To: Me</p>
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(email.sent_date).toLocaleString()}
          </time>
        </div>
        <div>
          <p>{email.body}</p>
        </div>
      </div>
    </div>
  );
}
