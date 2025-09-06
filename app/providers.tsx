// app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';

function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SessionProviderWrapper>{children}</SessionProviderWrapper>
    </Suspense>
  );
}
