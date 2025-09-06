import { Providers } from '@/app/providers';

export default function RootLayout({
                                     children
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
