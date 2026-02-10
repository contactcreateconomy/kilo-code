import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  User,
  CreditCard,
  Download,
  RefreshCw,
  Shield,
  HelpCircle,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Button } from "@createconomy/ui";

export const metadata: Metadata = {
  title: "Support Center",
  description:
    "Get help with your Createconomy account, orders, payments, and more.",
};

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) {
  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
        {question}
        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
        {answer}
      </div>
    </details>
  );
}

function TopicCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold group-hover:text-primary">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export default function SupportPage() {
  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How Can We Help?
        </h1>
        <p className="mt-4 text-muted-foreground">
          Find answers to common questions or get in touch with our support
          team.
        </p>
      </div>

      {/* Quick Links */}
      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TopicCard
          icon={ShoppingBag}
          title="Buying"
          description="Payment, downloads, and order issues"
          href="#buying"
        />
        <TopicCard
          icon={Store}
          title="Selling"
          description="Getting started, payouts, and listings"
          href="#selling"
        />
        <TopicCard
          icon={User}
          title="Account"
          description="Profile, security, and settings"
          href="#account"
        />
        <TopicCard
          icon={CreditCard}
          title="Payments"
          description="Billing, refunds, and transactions"
          href="#payments"
        />
        <TopicCard
          icon={Download}
          title="Downloads"
          description="Accessing and downloading products"
          href="#downloads"
        />
        <TopicCard
          icon={Shield}
          title="Trust & Safety"
          description="Reporting, disputes, and security"
          href="#safety"
        />
      </div>

      {/* FAQ Sections */}
      <div className="mx-auto mt-16 max-w-3xl space-y-12">
        {/* Buying FAQ */}
        <section id="buying" className="scroll-mt-20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Buying</h2>
          </div>
          <div className="mt-4 space-y-2">
            <FaqItem
              question="How do I purchase a product?"
              answer={
                <p>
                  Browse our marketplace, find a product you like, and click
                  &quot;Add to Cart&quot;. Then go to your cart and proceed to
                  checkout. We accept credit/debit cards and other payment
                  methods through Stripe.
                </p>
              }
            />
            <FaqItem
              question="How do I download my purchased products?"
              answer={
                <p>
                  After your purchase is confirmed, you can access your downloads
                  from{" "}
                  <Link
                    href="/account/downloads"
                    className="text-primary hover:underline"
                  >
                    My Downloads
                  </Link>
                  . Download links are available immediately after payment
                  confirmation.
                </p>
              }
            />
            <FaqItem
              question="Can I get a refund?"
              answer={
                <p>
                  Yes, refunds are available under certain conditions. Please
                  review our{" "}
                  <Link
                    href="/refunds"
                    className="text-primary hover:underline"
                  >
                    Refund Policy
                  </Link>{" "}
                  for eligibility details and the refund process.
                </p>
              }
            />
            <FaqItem
              question="Is my payment information secure?"
              answer={
                <p>
                  All payments are processed securely through Stripe, a
                  PCI-compliant payment processor. We never store your credit
                  card information on our servers.
                </p>
              }
            />
          </div>
        </section>

        {/* Selling FAQ */}
        <section id="selling" className="scroll-mt-20">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Selling</h2>
          </div>
          <div className="mt-4 space-y-2">
            <FaqItem
              question="How do I start selling on Createconomy?"
              answer={
                <p>
                  Create an account, then apply to become a seller from your
                  account dashboard. Once approved, you can set up your seller
                  profile and start listing products through the Seller Portal.
                </p>
              }
            />
            <FaqItem
              question="What types of products can I sell?"
              answer={
                <p>
                  You can sell digital products including templates, courses,
                  graphics, plugins, fonts, stock media, and more. All products
                  must comply with our content guidelines.
                </p>
              }
            />
            <FaqItem
              question="How and when do I get paid?"
              answer={
                <p>
                  Payouts are processed via Stripe Connect. Once you connect
                  your Stripe account, earnings are transferred on a rolling
                  basis (typically weekly). You can track your earnings in the
                  Seller Dashboard.
                </p>
              }
            />
            <FaqItem
              question="What commission does Createconomy take?"
              answer={
                <p>
                  Commission rates are displayed in your Seller Dashboard. We
                  offer competitive rates that vary based on your seller tier and
                  sales volume.
                </p>
              }
            />
          </div>
        </section>

        {/* Account FAQ */}
        <section id="account" className="scroll-mt-20">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Account</h2>
          </div>
          <div className="mt-4 space-y-2">
            <FaqItem
              question="How do I update my profile?"
              answer={
                <p>
                  Go to{" "}
                  <Link
                    href="/account/settings"
                    className="text-primary hover:underline"
                  >
                    Account Settings
                  </Link>{" "}
                  to update your name, email, profile picture, and other
                  information.
                </p>
              }
            />
            <FaqItem
              question="How do I delete my account?"
              answer={
                <p>
                  You can delete your account from{" "}
                  <Link
                    href="/account/settings"
                    className="text-primary hover:underline"
                  >
                    Account Settings
                  </Link>
                  . This action is permanent and cannot be undone. Any active
                  orders must be completed first.
                </p>
              }
            />
            <FaqItem
              question="I can't sign in to my account"
              answer={
                <p>
                  Try signing in with the same method you used to create your
                  account (Google or GitHub). If you continue to have issues,{" "}
                  <Link
                    href="/contact"
                    className="text-primary hover:underline"
                  >
                    contact support
                  </Link>{" "}
                  with your account email.
                </p>
              }
            />
          </div>
        </section>

        {/* Payments FAQ */}
        <section id="payments" className="scroll-mt-20">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Payments</h2>
          </div>
          <div className="mt-4 space-y-2">
            <FaqItem
              question="What payment methods are accepted?"
              answer={
                <p>
                  We accept major credit and debit cards (Visa, Mastercard,
                  American Express), as well as other payment methods available
                  through Stripe based on your region.
                </p>
              }
            />
            <FaqItem
              question="I was charged twice for the same order"
              answer={
                <p>
                  Duplicate charges are rare but can happen. Please{" "}
                  <Link
                    href="/contact"
                    className="text-primary hover:underline"
                  >
                    contact us
                  </Link>{" "}
                  with your order ID and we&apos;ll resolve this within 24
                  hours.
                </p>
              }
            />
            <FaqItem
              question="Are prices shown in my local currency?"
              answer={
                <p>
                  All prices are displayed in USD. Your bank may apply currency
                  conversion fees if your card is in a different currency.
                </p>
              }
            />
          </div>
        </section>

        {/* Downloads FAQ */}
        <section id="downloads" className="scroll-mt-20">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Downloads</h2>
          </div>
          <div className="mt-4 space-y-2">
            <FaqItem
              question="Where can I find my downloads?"
              answer={
                <p>
                  Visit{" "}
                  <Link
                    href="/account/downloads"
                    className="text-primary hover:underline"
                  >
                    My Downloads
                  </Link>{" "}
                  in your account to access all purchased products.
                </p>
              }
            />
            <FaqItem
              question="My download isn't working"
              answer={
                <p>
                  Try clearing your browser cache and attempting the download
                  again. If the issue persists, contact the seller first. If you
                  still need help,{" "}
                  <Link
                    href="/contact"
                    className="text-primary hover:underline"
                  >
                    reach out to our support team
                  </Link>
                  .
                </p>
              }
            />
            <FaqItem
              question="Do download links expire?"
              answer={
                <p>
                  No, as long as your account is active and the product is
                  available, you can re-download your purchased products at any
                  time.
                </p>
              }
            />
          </div>
        </section>

        {/* Trust & Safety FAQ */}
        <section id="safety" className="scroll-mt-20">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Trust & Safety</h2>
          </div>
          <div className="mt-4 space-y-2">
            <FaqItem
              question="How do I report a fraudulent product?"
              answer={
                <p>
                  If you encounter a product that violates our guidelines, click
                  the &quot;Report&quot; button on the product page. You can also{" "}
                  <Link
                    href="/contact"
                    className="text-primary hover:underline"
                  >
                    contact us
                  </Link>{" "}
                  directly with details.
                </p>
              }
            />
            <FaqItem
              question="How do I report copyright infringement?"
              answer={
                <p>
                  Send a detailed report to{" "}
                  <span className="text-foreground">legal@createconomy.com</span>{" "}
                  including the product URL, proof of ownership, and a
                  description of the infringement.
                </p>
              }
            />
          </div>
        </section>
      </div>

      {/* Still Need Help */}
      <div className="mx-auto mt-16 max-w-2xl rounded-lg border bg-card p-8 text-center">
        <HelpCircle className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-xl font-bold">Still Need Help?</h2>
        <p className="mt-2 text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Our support team is
          ready to assist you.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/refunds">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refund Policy
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
