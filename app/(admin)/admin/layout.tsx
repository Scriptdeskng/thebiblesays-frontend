import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TheBibleSays Admin Dashboard',
  description: 'Admin dashboard for TheBibleSays store management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
