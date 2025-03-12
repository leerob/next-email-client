import { getUserProfile } from '@/lib/db/queries';
import Image from 'next/image';

export async function RightSidebar({ userId }: { userId: number }) {
  let user = await getUserProfile(userId);

  if (!user) {
    return null;
  }

  return (
    <div className="hidden w-[350px] shrink-0 overflow-auto bg-neutral-50 p-6 sm:flex">
      <div className="max-w-md">
        <h2 className="mb-2 text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h2>
        <div className="mb-4 flex items-center">
          <img
            src={user.avatarUrl || '/placeholder.svg?height=40&width=40'}
            alt={`${user.firstName} ${user.lastName}`}
            className="mr-4 h-10 w-10 rounded-full"
          />
          <div>
            <p className="text-blue-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.location}</p>
          </div>
        </div>
        <p className="mb-4 text-gray-700">{`${user.jobTitle} at ${user.company}`}</p>

        <h3 className="mb-2 font-semibold">Mail</h3>
        <ul className="mb-4 space-y-1 text-sm text-gray-600">
          {user.latestThreads.map((thread, index) => (
            <li key={index}>{thread.subject}</li>
          ))}
        </ul>

        <div className="space-y-2">
          {user.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Image
                src="/linkedin.svg"
                alt="LinkedIn"
                width={16}
                height={16}
                className="mr-2"
              />
              <span className="text-sm">LinkedIn</span>
            </a>
          )}
          {user.twitter && (
            <a
              href={user.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Image
                src="/x.svg"
                alt="X/Twitter"
                width={16}
                height={16}
                className="mr-2"
              />
              <span className="text-sm">Twitter/X</span>
            </a>
          )}
          {user.github && (
            <a
              href={user.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Image
                src="/github.svg"
                alt="GitHub"
                width={16}
                height={16}
                className="mr-2"
              />
              <span className="text-sm">GitHub</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
