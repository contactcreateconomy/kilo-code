import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Createconomy Forum Privacy Policy",
};

/**
 * PrivacyPage — Static Privacy Policy page.
 */
export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: February 2026
        </p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            1. Information We Collect
          </h2>
          <p>When you use Createconomy Forum, we collect:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Account information</strong>: Name, email address, and
              profile picture from your authentication provider (Google, GitHub)
            </li>
            <li>
              <strong>Profile information</strong>: Display name, bio, and flair
              that you choose to provide
            </li>
            <li>
              <strong>Content</strong>: Threads, posts, comments, and reactions
              you create
            </li>
            <li>
              <strong>Usage data</strong>: Page views, session information, and
              interaction patterns
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Provide and maintain the forum service</li>
            <li>Display your profile and content to other users</li>
            <li>Send notifications about activity relevant to you</li>
            <li>Enforce our community guidelines and terms of service</li>
            <li>Improve the platform and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Information Sharing
          </h2>
          <p>
            We do not sell your personal information. Your public profile,
            threads, and posts are visible to other users. We may share
            information only:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect the rights and safety of our users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Data Storage
          </h2>
          <p>
            Your data is stored securely using Convex, a serverless database
            platform. Data is processed and stored in accordance with industry
            security standards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Access your personal data</li>
            <li>Update or correct your profile information</li>
            <li>Delete your account and associated data</li>
            <li>Manage your notification preferences</li>
          </ul>
          <p className="mt-2">
            You can exercise these rights through your{" "}
            <Link href="/account" className="text-primary hover:underline">
              account settings
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            6. Cookies & Sessions
          </h2>
          <p>
            We use authentication tokens to maintain your session. We do not use
            third-party tracking cookies. Essential cookies may be used for
            theme preferences and session management.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            7. Children&apos;s Privacy
          </h2>
          <p>
            The Service is not intended for children under 13 years of age. We
            do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            8. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            users of significant changes through the forum or email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">9. Contact</h2>
          <p>
            For privacy-related inquiries, please visit our{" "}
            <Link href="/about" className="text-primary hover:underline">
              About page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
