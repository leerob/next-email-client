import { LeftSidebar } from '@/app/components/left-sidebar';

export default function LoadingThreadSkeleton() {
  return (
    <div className="grow h-full flex">
      <LeftSidebar />
      <div className="grow p-2 sm:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto"></div>
      </div>
    </div>
  );
}
