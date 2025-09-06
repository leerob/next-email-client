// app/dashboard/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({
                                         error,
                                         reset,
                                       }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 flex flex-col" style={{ backgroundColor: "#01172F" }}>
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: "#B4D2E7" }}>
          <h1 className="text-2xl font-bold text-white">CrescendAI</h1>
        </div>
      </div>

      {/* Error Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong!
          </h2>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading your dashboard. Please try again.
          </p>
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full"
              style={{ backgroundColor: "#C3F73A", color: "#01172F" }}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to homepage
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
