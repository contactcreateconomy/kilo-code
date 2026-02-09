import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Createconomy Forum Terms of Service",
};

/**
 * TermsPage — Static Terms of Service page.
 */
export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Terms of Service</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Terms of Service
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: February 2026
        </p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the Createconomy Forum (&ldquo;Service&rdquo;), you accept
            and agree to be bound by these Terms of Service. If you do not agree
            to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. Account Registration
          </h2>
          <p>
            To participate in discussions, you must create an account using a
            supported authentication provider. You are responsible for
            maintaining the security of your account and for all activities that
            occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. User Conduct
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Post spam, misleading, or deceptive content</li>
            <li>Harass, bully, or threaten other users</li>
            <li>Share hate speech or discriminatory content</li>
            <li>Post content that violates intellectual property rights</li>
            <li>Attempt to exploit, hack, or disrupt the Service</li>
            <li>Create multiple accounts to evade bans or restrictions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Content Ownership
          </h2>
          <p>
            You retain ownership of content you post on the Service. By posting
            content, you grant Createconomy a non-exclusive, worldwide,
            royalty-free license to display and distribute your content within
            the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Content Moderation
          </h2>
          <p>
            We reserve the right to remove any content that violates these terms
            or our{" "}
            <Link href="/guidelines" className="text-primary hover:underline">
              Community Guidelines
            </Link>
            . Moderators may issue warnings, mute accounts, or ban users who
            repeatedly violate our policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            6. Termination
          </h2>
          <p>
            We may terminate or suspend your account at any time for violations
            of these terms. You may also delete your account at any time through
            your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            7. Limitation of Liability
          </h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranties of any kind.
            Createconomy shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">
            8. Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            Service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">9. Contact</h2>
          <p>
            If you have questions about these Terms of Service, please reach out
            through our{" "}
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
