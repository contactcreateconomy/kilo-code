import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Createconomy — how we collect, use, and protect your data.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 1, 2026
        </p>

        <div className="mt-6 rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Your privacy is important to us. This Privacy Policy explains how
            Createconomy (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            collects, uses, and protects your personal information when you use
            our platform.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mt-8 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Table of Contents
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
            <li>
              <a href="#information-collected" className="text-primary hover:underline">
                Information We Collect
              </a>
            </li>
            <li>
              <a href="#how-we-use" className="text-primary hover:underline">
                How We Use Your Information
              </a>
            </li>
            <li>
              <a href="#sharing" className="text-primary hover:underline">
                Information Sharing
              </a>
            </li>
            <li>
              <a href="#security" className="text-primary hover:underline">
                Data Security
              </a>
            </li>
            <li>
              <a href="#cookies" className="text-primary hover:underline">
                Cookies & Tracking
              </a>
            </li>
            <li>
              <a href="#third-party" className="text-primary hover:underline">
                Third-Party Services
              </a>
            </li>
            <li>
              <a href="#your-rights" className="text-primary hover:underline">
                Your Rights
              </a>
            </li>
            <li>
              <a href="#retention" className="text-primary hover:underline">
                Data Retention
              </a>
            </li>
            <li>
              <a href="#children" className="text-primary hover:underline">
                Children&apos;s Privacy
              </a>
            </li>
            <li>
              <a href="#contact" className="text-primary hover:underline">
                Contact Us
              </a>
            </li>
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          <Section id="information-collected" title="1. Information We Collect">
            <p>We collect the following types of information:</p>
            <h3 className="font-medium text-foreground">
              Information You Provide
            </h3>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                Account information (name, email address, profile picture)
              </li>
              <li>
                Seller information (business name, payout details via Stripe
                Connect)
              </li>
              <li>Product listings and associated content</li>
              <li>Reviews, comments, and forum posts</li>
              <li>Support requests and communications</li>
            </ul>

            <h3 className="font-medium text-foreground">
              Information Collected Automatically
            </h3>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>
                Usage data (pages visited, features used, time spent)
              </li>
              <li>Referral source and search terms</li>
            </ul>

            <h3 className="font-medium text-foreground">
              Information from Third Parties
            </h3>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                OAuth provider data (Google, GitHub) when you sign in with a
                third-party account
              </li>
              <li>Payment information processed by Stripe</li>
            </ul>
          </Section>

          <Section id="how-we-use" title="2. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Provide, maintain, and improve the Platform</li>
              <li>Process transactions and send related communications</li>
              <li>Send service updates, security alerts, and support messages</li>
              <li>Personalize your experience and recommend products</li>
              <li>Prevent fraud and enforce our Terms of Service</li>
              <li>Analyze usage patterns to improve our services</li>
              <li>
                Communicate with you about promotions, offers, and events (with
                your consent)
              </li>
            </ul>
          </Section>

          <Section id="sharing" title="3. Information Sharing">
            <p>
              We do not sell your personal information. We may share information
              in the following circumstances:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                <strong className="text-foreground">With sellers:</strong> When
                you purchase a product, the seller receives your name and email
                for order fulfillment.
              </li>
              <li>
                <strong className="text-foreground">Service providers:</strong>{" "}
                We share data with trusted partners who help us operate the
                Platform (e.g., Stripe for payments, hosting providers).
              </li>
              <li>
                <strong className="text-foreground">Legal requirements:</strong>{" "}
                We may disclose information if required by law, court order, or
                governmental regulation.
              </li>
              <li>
                <strong className="text-foreground">Business transfers:</strong>{" "}
                In the event of a merger, acquisition, or sale, user data may be
                transferred as a business asset.
              </li>
            </ul>
          </Section>

          <Section id="security" title="4. Data Security">
            <p>
              We implement industry-standard security measures to protect your
              data, including:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Encryption of data in transit (TLS/SSL)</li>
              <li>Secure authentication via OAuth providers</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and least-privilege principles</li>
              <li>
                Secure payment processing via PCI-compliant Stripe
                infrastructure
              </li>
            </ul>
            <p>
              While we take reasonable precautions, no system is 100% secure. We
              encourage you to use strong passwords and protect your account
              credentials.
            </p>
          </Section>

          <Section id="cookies" title="5. Cookies & Tracking">
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Keep you signed in across sessions</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you interact with the Platform</li>
              <li>Improve performance and user experience</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling
              cookies may limit some Platform functionality.
            </p>
          </Section>

          <Section id="third-party" title="6. Third-Party Services">
            <p>
              We integrate with the following third-party services, each with
              their own privacy policies:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                <strong className="text-foreground">Stripe</strong> — Payment
                processing and seller payouts
              </li>
              <li>
                <strong className="text-foreground">Google</strong> — OAuth
                authentication and analytics
              </li>
              <li>
                <strong className="text-foreground">GitHub</strong> — OAuth
                authentication
              </li>
              <li>
                <strong className="text-foreground">Vercel</strong> — Platform
                hosting and edge delivery
              </li>
              <li>
                <strong className="text-foreground">Convex</strong> — Backend
                database and serverless functions
              </li>
            </ul>
          </Section>

          <Section id="your-rights" title="7. Your Rights">
            <p>
              Depending on your location, you may have the following rights
              regarding your personal data:
            </p>

            <h3 className="font-medium text-foreground">
              For All Users
            </h3>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Access your personal data via your account settings</li>
              <li>Update or correct your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h3 className="font-medium text-foreground">
              For EU/EEA Residents (GDPR)
            </h3>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Right to access and data portability</li>
              <li>Right to rectification and erasure</li>
              <li>Right to restrict or object to processing</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>

            <h3 className="font-medium text-foreground">
              For California Residents (CCPA)
            </h3>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Right to know what data we collect and how it is used</li>
              <li>Right to delete personal information</li>
              <li>Right to opt out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising rights</li>
            </ul>

            <p>
              To exercise any of these rights, please visit your{" "}
              <Link
                href="/account/settings"
                className="text-primary hover:underline"
              >
                account settings
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </Section>

          <Section id="retention" title="8. Data Retention">
            <p>
              We retain your personal data for as long as necessary to provide
              our services and fulfill the purposes described in this policy.
              When you delete your account, we will delete or anonymize your
              personal data within 30 days, except where retention is required by
              law (e.g., financial records, legal obligations).
            </p>
          </Section>

          <Section id="children" title="9. Children's Privacy">
            <p>
              Createconomy is not intended for users under 16 years of age. We
              do not knowingly collect personal information from children. If you
              believe a child has provided us with personal data, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>{" "}
              so we can take appropriate action.
            </p>
          </Section>

          <Section id="contact" title="10. Contact Us">
            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                Email:{" "}
                <span className="text-foreground">privacy@createconomy.com</span>
              </li>
              <li>
                Contact form:{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  createconomy.com/contact
                </Link>
              </li>
            </ul>
            <p>
              We will respond to privacy-related inquiries within 30 days.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
