import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConvexProvider } from '@/providers/convex-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard | Createconomy',
    template: '%s | Admin Dashboard',
  },
  description: 'Createconomy Admin Dashboard - Manage your marketplace',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="admin-theme"
        >
          <ConvexProvider>{children}</ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
