import { Linkedin, Twitter, Github } from 'lucide-react';
import { getUserProfile } from '@/lib/db/queries';

export async function RightSidebar({ userId }: { userId: number }) {
  let user = await getUserProfile(userId);

  if (!user) {
    return null;
  }

  return (
    <div className="hidden sm:flex flex-shrink-0 w-[350px] p-6 overflow-auto bg-neutral-50">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-2">{`${user.firstName} ${user.lastName}`}</h2>
        <div className="flex items-center mb-4">
          <img
            src={user.avatarUrl || '/placeholder.svg?height=40&width=40'}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <p className="text-blue-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.location}</p>
          </div>
        </div>
        <p className="text-gray-700 mb-4">{`${user.jobTitle} at ${user.company}`}</p>

        <h3 className="font-semibold mb-2">Mail</h3>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
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
              <Linkedin size={16} className="mr-2" />
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
              <Twitter size={16} className="mr-2" />
              <span className="text-sm">Twitter</span>
            </a>
          )}
          {user.github && (
            <a
              href={user.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Github size={16} className="mr-2" />
              <span className="text-sm">GitHub</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
