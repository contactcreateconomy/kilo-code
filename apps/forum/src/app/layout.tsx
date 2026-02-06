import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Forum | Community Discussions",
    template: "%s | Forum",
  },
  description:
    "Join the community forum. Discuss topics, share knowledge, get help, and connect with others.",
  keywords: [
    "forum",
    "community",
    "discussions",
    "digital products",
    "creators",
    "marketplace",
    "help",
    "support",
  ],
  authors: [{ name: "Forum" }],
  creator: "Forum",
  publisher: "Forum",
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_SITE_URL"] || "https://forum.example.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Forum",
    title: "Forum | Community Discussions",
    description:
      "Join the community forum. Discuss topics, share knowledge, get help, and connect with others.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Forum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forum | Community Discussions",
    description:
      "Join the community forum. Discuss topics, share knowledge, get help, and connect with others.",
    images: ["/og-image.png"],
    creator: "@forum",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="system">
          <ConvexProvider>
            <ToastProvider>
              <div className="dot-grid-background relative flex min-h-screen flex-col bg-background">
                <main className="relative z-10 flex-1">{children}</main>
                <Footer />
              </div>
            </ToastProvider>
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
