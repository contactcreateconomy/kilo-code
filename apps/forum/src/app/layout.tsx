import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DotGridBackground } from "@createconomy/ui";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Createconomy Forum - Community Discussions",
    template: "%s | Createconomy Forum",
  },
  description:
    "Join the Createconomy community forum. Discuss digital products, share knowledge, get help, and connect with creators and buyers.",
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
  authors: [{ name: "Createconomy" }],
  creator: "Createconomy",
  publisher: "Createconomy",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://discuss.createconomy.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Createconomy Forum",
    title: "Createconomy Forum - Community Discussions",
    description:
      "Join the Createconomy community forum. Discuss digital products, share knowledge, get help, and connect with creators and buyers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Createconomy Forum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Createconomy Forum - Community Discussions",
    description:
      "Join the Createconomy community forum. Discuss digital products, share knowledge, get help, and connect with creators and buyers.",
    images: ["/og-image.png"],
    creator: "@createconomy",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexProvider>
            <DotGridBackground>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </DotGridBackground>
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
