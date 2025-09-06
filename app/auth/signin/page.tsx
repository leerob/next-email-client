'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-gray-600">
            Choose your preferred sign-in method
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSignIn('google')}
            disabled={isLoading === 'google'}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
          >
            {isLoading === 'google' ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <button
            onClick={() => handleSignIn('github')}
            disabled={isLoading === 'github'}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800"
          >
            {isLoading === 'github' ? 'Signing in...' : 'Sign in with GitHub'}
          </button>
        </div>
      </div>
    </div>
  );
}
