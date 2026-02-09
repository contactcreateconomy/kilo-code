import Link from "next/link";
import { LogoWithText } from "@createconomy/ui/components/logo";
import { Separator } from "@createconomy/ui/components/separator";
import { Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <LogoWithText size={24} />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The marketplace for creators. Discover and sell premium digital
              products.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold">Products</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/categories/templates"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/courses"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/graphics"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Graphics
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/plugins"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Plugins
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mt-12 mb-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Createconomy. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com/createconomy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://github.com/createconomy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
