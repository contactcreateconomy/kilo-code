import Link from 'next/link';
import { LogoWithText } from '@createconomy/ui/components/logo';
import { Separator } from '@createconomy/ui/components/separator';

const FOOTER_LINKS = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Support', href: '/support' },
  { label: 'Marketplace', href: 'https://createconomy.com' },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <LogoWithText size={24} appName="Seller" />

          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Createconomy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
