import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community Guidelines | Createconomy Forum',
  description: 'Rules and guidelines for participating in the Createconomy community forum.',
};

/**
 * GuidelinesPage — Static community guidelines page.
 *
 * Outlines expected behavior, posting rules, and consequences
 * for violations. Linked from footer and report dialog.
 */
export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Community Guidelines</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Community Guidelines</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Welcome to Createconomy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Createconomy is a community for creators, sellers, and consumers to connect,
            share ideas, and help each other grow. These guidelines help keep our community
            safe, respectful, and productive for everyone.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Be Respectful</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Treat others how you&apos;d like to be treated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Disagree constructively — attack ideas, not people</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Be inclusive and welcoming to newcomers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>No harassment, hate speech, bullying, or personal attacks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>No discrimination based on race, gender, religion, orientation, or identity</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Content Rules</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Post in the appropriate category</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Use descriptive, clear thread titles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Search before posting to avoid duplicates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>No spam, excessive self-promotion, or affiliate links</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>No NSFW, illegal, or copyrighted content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>No sharing personal information of others (doxxing)</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Marketplace Discussions</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            When discussing products, services, or sellers:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Provide honest, constructive feedback and reviews</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Disclose if you have a business relationship with a product you&apos;re discussing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>No fake reviews, review manipulation, or astroturfing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>No scams, phishing, or fraudulent offers</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Enforcement</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Violations of these guidelines may result in:
          </p>
          <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
            <li><strong>Warning</strong> — First offense for minor violations</li>
            <li><strong>Temporary mute</strong> — Restricted from posting for a set period</li>
            <li><strong>Temporary ban</strong> — Suspended from the forum temporarily</li>
            <li><strong>Permanent ban</strong> — Removed from the community permanently</li>
          </ol>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Moderators have discretion to take appropriate action. Severe violations
            (threats, illegal content) may result in immediate permanent bans.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Reporting</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you see content that violates these guidelines, please use the
            &quot;Report&quot; button on any thread, post, or comment. Reports are
            reviewed by our moderation team and handled confidentially.
          </p>
        </section>

        <section className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            These guidelines may be updated from time to time. Continued use of the
            forum constitutes acceptance of the current guidelines.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Questions? Reach out in the{' '}
            <Link href="/c/meta" className="text-primary hover:underline">
              Meta & Feedback
            </Link>{' '}
            category.
          </p>
        </section>
      </div>
    </div>
  );
}
