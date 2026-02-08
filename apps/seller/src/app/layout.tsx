import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { GoogleOneTapWrapper } from "@/components/auth/google-one-tap-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Seller Portal | Createconomy",
    template: "%s | Seller Portal | Createconomy",
  },
  description: "Manage your store, products, and orders on Createconomy",
  keywords: ["seller", "vendor", "e-commerce", "marketplace", "createconomy"],
  authors: [{ name: "Createconomy" }],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="system" storageKey="seller-theme">
          <ConvexClientProvider>
            <GoogleOneTapWrapper />
            {children}
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
