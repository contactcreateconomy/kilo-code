import type { Metadata } from 'next';
import { ConvexProvider } from '@/providers/convex-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { AdminLayout } from '@/components/layout/admin-layout';
import './globals.css';

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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexProvider>
            <AdminLayout>{children}</AdminLayout>
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
