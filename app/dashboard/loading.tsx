// app/dashboard/loading.tsx
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar Skeleton */}
      <div className="w-80 flex flex-col" style={{ backgroundColor: "#01172F" }}>
        {/* Header */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: "#B4D2E7" }}>
          <h1 className="text-2xl font-bold text-white">CrescendAI</h1>
        </div>

        {/* Loading skeleton for sidebar */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile skeleton */}
        <div className="p-4 border-t border-opacity-20" style={{ borderColor: "#B4D2E7" }}>
          <div className="flex items-center space-x-3 p-3">
            <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
              <div className="h-2 bg-gray-800 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#01172F" }} />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
}
