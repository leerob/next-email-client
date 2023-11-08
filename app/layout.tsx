import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

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
    <html
      lang="en"
      className="bg-white dark:bg-gray-950 text-black dark:text-white"
    >
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
