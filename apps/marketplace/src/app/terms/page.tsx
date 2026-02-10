import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Createconomy — the digital marketplace for creators.",
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

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 1, 2026
        </p>

        {/* Table of Contents */}
        <nav className="mt-8 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Table of Contents
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
            <li>
              <a href="#acceptance" className="text-primary hover:underline">
                Acceptance of Terms
              </a>
            </li>
            <li>
              <a href="#accounts" className="text-primary hover:underline">
                Account Registration
              </a>
            </li>
            <li>
              <a href="#buyer-terms" className="text-primary hover:underline">
                Buyer Terms
              </a>
            </li>
            <li>
              <a href="#seller-terms" className="text-primary hover:underline">
                Seller Terms
              </a>
            </li>
            <li>
              <a href="#ip" className="text-primary hover:underline">
                Intellectual Property
              </a>
            </li>
            <li>
              <a href="#payments" className="text-primary hover:underline">
                Payments & Refunds
              </a>
            </li>
            <li>
              <a href="#prohibited" className="text-primary hover:underline">
                Prohibited Content
              </a>
            </li>
            <li>
              <a href="#liability" className="text-primary hover:underline">
                Limitation of Liability
              </a>
            </li>
            <li>
              <a href="#disputes" className="text-primary hover:underline">
                Dispute Resolution
              </a>
            </li>
            <li>
              <a href="#changes" className="text-primary hover:underline">
                Changes to Terms
              </a>
            </li>
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By accessing or using Createconomy (&quot;the Platform&quot;), you
              agree to be bound by these Terms of Service (&quot;Terms&quot;). If
              you do not agree to these Terms, you may not use the Platform.
            </p>
            <p>
              These Terms apply to all users, including buyers, sellers, and
              visitors. Additional terms may apply to specific features or
              services and will be presented to you at the time of use.
            </p>
          </Section>

          <Section id="accounts" title="2. Account Registration">
            <p>
              To access certain features, you must create an account. You agree
              to provide accurate, complete, and current information during
              registration and to keep your account information up to date.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You must immediately notify us of any unauthorized use of
              your account.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these Terms, contain false information, or are used for fraudulent
              purposes.
            </p>
          </Section>

          <Section id="buyer-terms" title="3. Buyer Terms">
            <p>
              When you purchase a digital product on Createconomy, you receive a
              license to use the product as specified by the seller. Unless
              otherwise stated, this license is non-exclusive and
              non-transferable.
            </p>
            <p>
              You agree not to redistribute, resell, or share purchased products
              without explicit permission from the seller. Violating license
              terms may result in account suspension and legal action.
            </p>
            <p>
              All purchases are subject to our{" "}
              <Link href="/refunds" className="text-primary hover:underline">
                Refund Policy
              </Link>
              .
            </p>
          </Section>

          <Section id="seller-terms" title="4. Seller Terms">
            <p>
              Sellers may list digital products for sale on the Platform. By
              listing a product, you represent that you have the right to sell it
              and that it does not infringe upon any third-party rights.
            </p>
            <p>
              Sellers are responsible for the accuracy of their product
              descriptions, pricing, and license terms. Products must meet our
              quality standards and content guidelines.
            </p>
            <p>
              Createconomy charges a commission on each sale. Current commission
              rates are displayed in the Seller Dashboard. We reserve the right
              to change commission rates with 30 days&apos; notice.
            </p>
            <p>
              Seller payouts are processed via Stripe Connect. Sellers are
              responsible for complying with their local tax obligations.
            </p>
          </Section>

          <Section id="ip" title="5. Intellectual Property">
            <p>
              Sellers retain ownership of their original content and products.
              Createconomy does not claim any intellectual property rights over
              seller content.
            </p>
            <p>
              By listing products on the Platform, sellers grant Createconomy a
              non-exclusive, worldwide license to display, distribute, and
              promote their products within the Platform and marketing channels.
            </p>
            <p>
              If you believe that content on the Platform infringes your
              intellectual property rights, please contact us at{" "}
              <span className="text-foreground">legal@createconomy.com</span>{" "}
              with details of the alleged infringement.
            </p>
          </Section>

          <Section id="payments" title="6. Payments & Refunds">
            <p>
              All payments are processed securely through Stripe. Prices are
              displayed in USD unless otherwise specified. You agree to pay the
              listed price plus any applicable taxes.
            </p>
            <p>
              Refunds are handled in accordance with our{" "}
              <Link href="/refunds" className="text-primary hover:underline">
                Refund Policy
              </Link>
              . Digital products may have limited refund eligibility due to their
              nature.
            </p>
          </Section>

          <Section id="prohibited" title="7. Prohibited Content">
            <p>
              The following content is prohibited on Createconomy:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Malware, viruses, or malicious code</li>
              <li>
                Content that infringes on intellectual property rights
              </li>
              <li>Illegal, harmful, or deceptive content</li>
              <li>
                Content that promotes discrimination, harassment, or violence
              </li>
              <li>Adult or sexually explicit content</li>
              <li>Products with misleading descriptions or false claims</li>
              <li>Stolen, pirated, or unauthorized copies of other works</li>
            </ul>
            <p>
              We reserve the right to remove any content that violates these
              guidelines and to suspend or terminate accounts of repeat
              offenders.
            </p>
          </Section>

          <Section id="liability" title="8. Limitation of Liability">
            <p>
              Createconomy provides the Platform on an &quot;as is&quot; and
              &quot;as available&quot; basis. We make no warranties regarding the
              reliability, availability, or accuracy of the Platform or any
              products listed on it.
            </p>
            <p>
              To the maximum extent permitted by law, Createconomy shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages arising from your use of the Platform.
            </p>
            <p>
              Createconomy is a marketplace and does not guarantee the quality of
              products sold by sellers. Disputes between buyers and sellers
              should be resolved through our dispute resolution process.
            </p>
          </Section>

          <Section id="disputes" title="9. Dispute Resolution">
            <p>
              If you have a dispute with another user, we encourage you to
              resolve it directly. If you are unable to resolve the dispute, you
              may contact our support team for mediation.
            </p>
            <p>
              Any disputes arising from these Terms or your use of the Platform
              shall be resolved through binding arbitration in accordance with
              applicable laws. You agree to waive your right to a jury trial.
            </p>
          </Section>

          <Section id="changes" title="10. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify users
              of material changes via email or a prominent notice on the
              Platform. Your continued use of the Platform after changes are
              posted constitutes acceptance of the updated Terms.
            </p>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <span className="text-foreground">legal@createconomy.com</span> or
              through our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact page
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
