import { LeftSidebar } from '@/app/components/left-sidebar';

export default function LoadingThreadSkeleton() {
  return (
    <div className="flex h-full grow">
      <LeftSidebar />
      <div className="grow overflow-auto p-2 sm:p-6">
        <div className="mx-auto max-w-4xl"></div>
      </div>
    </div>
  );
}
