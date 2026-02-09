import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Createconomy Forum',
  description: 'Learn about the Createconomy community forum — a place for creators, sellers, and consumers to connect.',
};

/**
 * AboutPage — Static about page for the forum.
 *
 * Describes the platform's mission, features, and links
 * to related pages (guidelines, terms, privacy).
 */
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>About</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-8">About Createconomy</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Createconomy is a digital marketplace that connects creators with consumers.
            Our forum is the community hub where members discuss products, share
            insights, ask questions, and help each other succeed in the digital economy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">What You Can Do Here</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-1">💬 Discuss</h3>
              <p className="text-sm text-muted-foreground">
                Start and join conversations about products, trends, and the creator economy.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-1">❓ Ask & Answer</h3>
              <p className="text-sm text-muted-foreground">
                Get help from the community and share your expertise with others.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-1">🏆 Earn Points</h3>
              <p className="text-sm text-muted-foreground">
                Contribute valuable content and climb the{' '}
                <Link href="/leaderboard" className="text-primary hover:underline">
                  leaderboard
                </Link>.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-1">🤝 Connect</h3>
              <p className="text-sm text-muted-foreground">
                Follow other members, build your reputation, and grow your network.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Community Values</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🌟</span>
              <div>
                <strong className="text-foreground">Quality over quantity</strong>
                <p className="text-sm mt-0.5">
                  We value thoughtful contributions that help others learn and grow.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🤲</span>
              <div>
                <strong className="text-foreground">Inclusivity</strong>
                <p className="text-sm mt-0.5">
                  Everyone is welcome, from beginners to experienced professionals.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <strong className="text-foreground">Trust & safety</strong>
                <p className="text-sm mt-0.5">
                  Our moderation team works to keep the community safe and spam-free.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <strong className="text-foreground">Innovation</strong>
                <p className="text-sm mt-0.5">
                  We&apos;re constantly improving based on community feedback.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Useful Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/guidelines"
              className="rounded-lg border bg-card px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
            >
              📋 Community Guidelines
            </Link>
            <Link
              href="/terms"
              className="rounded-lg border bg-card px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
            >
              📄 Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="rounded-lg border bg-card px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
            >
              🔐 Privacy Policy
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-lg border bg-card px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
            >
              🏆 Leaderboard
            </Link>
            <Link
              href="/tags"
              className="rounded-lg border bg-card px-4 py-2 text-sm hover:bg-accent/50 transition-colors"
            >
              🏷️ Browse Tags
            </Link>
          </div>
        </section>

        <section className="rounded-lg border bg-muted/50 p-4">
          <h3 className="font-medium mb-2">Built with ❤️</h3>
          <p className="text-sm text-muted-foreground">
            Createconomy is built with Next.js, Convex, and Tailwind CSS.
            Powered by a community of passionate creators and developers.
          </p>
        </section>
      </div>
    </div>
  );
}
