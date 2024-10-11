import { LeftSidebar } from '@/app/components/left-sidebar';

export default function LoadingThreadSkeleton() {
  return (
    <div className="flex-grow h-full flex">
      <LeftSidebar />
      <div className="flex-grow p-2 sm:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto"></div>
      </div>
    </div>
  );
}
