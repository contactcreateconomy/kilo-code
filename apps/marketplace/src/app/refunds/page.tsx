import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund policy for digital products purchased on Createconomy.",
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

export default function RefundsPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 1, 2026
        </p>

        {/* Important Note */}
        <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-400">
              Important Note
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
              Due to the digital nature of products sold on Createconomy,
              refunds are handled on a case-by-case basis. Please review this
              policy carefully before making a purchase.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          <Section id="eligibility" title="Eligibility for Refunds">
            <p>You may be eligible for a refund if:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                The product is significantly different from what was described
                in the listing
              </li>
              <li>
                The product files are corrupted or cannot be downloaded/accessed
              </li>
              <li>
                You were charged multiple times for the same product (duplicate
                purchase)
              </li>
              <li>
                The product does not function as advertised and the seller
                cannot resolve the issue
              </li>
              <li>
                Your request is made within 14 days of purchase
              </li>
            </ul>
          </Section>

          <Section id="non-refundable" title="Non-Refundable Items">
            <p>
              The following situations are generally not eligible for refunds:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                Change of mind after purchasing and downloading the product
              </li>
              <li>
                Incompatibility with your software or hardware (unless
                compatibility was explicitly stated in the listing)
              </li>
              <li>
                Products that have been fully consumed (e.g., completed courses)
              </li>
              <li>
                Requests made more than 14 days after purchase
              </li>
              <li>
                Products purchased during promotional sales (unless defective)
              </li>
              <li>
                Buyer error, such as purchasing the wrong product
              </li>
            </ul>
          </Section>

          <Section id="process" title="Refund Process">
            <p>To request a refund, follow these steps:</p>
            <ol className="list-inside list-decimal space-y-2 pl-4">
              <li>
                <strong className="text-foreground">Contact the seller first:</strong>{" "}
                Go to your{" "}
                <Link
                  href="/account/orders"
                  className="text-primary hover:underline"
                >
                  order history
                </Link>
                , find the order, and contact the seller directly. Many issues
                can be resolved between buyers and sellers.
              </li>
              <li>
                <strong className="text-foreground">Open a refund request:</strong>{" "}
                If the seller does not respond within 48 hours or you cannot
                reach a resolution, submit a refund request through our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact form
                </Link>{" "}
                with your order ID and reason for the refund.
              </li>
              <li>
                <strong className="text-foreground">Review period:</strong> Our
                team will review your request within 3-5 business days. We may
                contact you or the seller for additional information.
              </li>
              <li>
                <strong className="text-foreground">Resolution:</strong> If
                approved, the refund will be processed to your original payment
                method within 5-10 business days.
              </li>
            </ol>
          </Section>

          <Section id="seller-policies" title="Seller-Specific Policies">
            <p>
              Individual sellers may offer their own refund policies that are
              more generous than our standard policy. Seller-specific refund
              terms will be displayed on the product listing page.
            </p>
            <p>
              In the event of a conflict between a seller&apos;s refund policy
              and our marketplace policy, the more favorable terms for the buyer
              will apply.
            </p>
          </Section>

          <Section id="disputes" title="Dispute Resolution">
            <p>
              If you disagree with a refund decision, you may escalate the
              dispute by:
            </p>
            <ol className="list-inside list-decimal space-y-1 pl-4">
              <li>
                Contacting our support team at{" "}
                <span className="text-foreground">support@createconomy.com</span>{" "}
                with &quot;Dispute&quot; in the subject line
              </li>
              <li>
                Providing all relevant documentation (screenshots, communications
                with the seller, order details)
              </li>
              <li>
                A senior team member will review your case within 5 business
                days
              </li>
            </ol>
            <p>
              For payment disputes, you also have the right to initiate a
              chargeback through your payment provider. However, we encourage you
              to use our internal dispute resolution process first, as
              chargebacks may result in account restrictions.
            </p>
          </Section>

          <Section id="partial-refunds" title="Partial Refunds">
            <p>
              In some cases, we may offer a partial refund instead of a full
              refund. This may apply when:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                Only a portion of a bundle or package is defective
              </li>
              <li>
                The product partially matches the description but has some
                issues
              </li>
              <li>
                You have used a significant portion of the product before
                requesting a refund
              </li>
            </ul>
          </Section>

          <Section id="contact-us" title="Questions?">
            <p>
              If you have questions about our refund policy, please don&apos;t
              hesitate to{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              . You can also visit our{" "}
              <Link href="/support" className="text-primary hover:underline">
                Support Center
              </Link>{" "}
              for frequently asked questions about refunds.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
