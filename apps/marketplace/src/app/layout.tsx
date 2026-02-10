import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@createconomy/ui";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleOneTapWrapper } from "@/components/auth/google-one-tap-wrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Createconomy - Digital Marketplace for Creators",
    template: "%s | Createconomy",
  },
  description:
    "Discover and purchase premium digital products, templates, courses, and resources from talented creators worldwide.",
  keywords: [
    "digital marketplace",
    "templates",
    "courses",
    "digital products",
    "creators",
    "design resources",
  ],
  authors: [{ name: "Createconomy" }],
  creator: "Createconomy",
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_SITE_URL"] || "https://createconomy.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Createconomy",
    title: "Createconomy - Digital Marketplace for Creators",
    description:
      "Discover and purchase premium digital products, templates, courses, and resources from talented creators worldwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Createconomy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Createconomy - Digital Marketplace for Creators",
    description:
      "Discover and purchase premium digital products, templates, courses, and resources from talented creators worldwide.",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConvexClientProvider>
          <ThemeProvider
            defaultTheme="system"
          >
            <ToastProvider>
              <div className="dot-grid-background relative flex min-h-screen flex-col bg-background">
                <GoogleOneTapWrapper />
                <Header />
                <main className="relative z-10 flex-1">{children}</main>
                <Footer />
              </div>
            </ToastProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
