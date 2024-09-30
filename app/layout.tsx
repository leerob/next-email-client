import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RightSidebar } from './components/right-sidebar';
import { WelcomeToast } from './components/welcome-toast';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js Mail',
  description: 'An email client template using the Next.js App Router.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`bg-white text-gray-800 ${inter.className}`}>
      <body className="flex h-screen">
        <main className="flex-grow overflow-hidden">{children}</main>
        <RightSidebar userId={1} />
        <Toaster closeButton />
        <WelcomeToast />
      </body>
    </html>
  );
}
