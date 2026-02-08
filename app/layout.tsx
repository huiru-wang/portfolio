import type { Metadata } from 'next';
import './globals.css';
import 'highlight.js/styles/github.css';

export const metadata: Metadata = {
  title: 'Huiru Wang | Backend Engineer',
  description: 'Portfolio of Huiru Wang (Robin) - Senior Backend Engineer',
  icons: {
    icon: '/avatar.png',
    apple: '/avatar.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
