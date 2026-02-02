import Link from "next/link";

export const metadata = {
  title: "Application Pending",
  description: "Your seller application is being reviewed",
};

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--warning)]/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[var(--warning)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Under Review</h1>
        <p className="text-[var(--muted-foreground)] mb-6">
          Thank you for applying to become a seller on Createconomy! Our team is
          currently reviewing your application. This usually takes 1-2 business
          days.
        </p>

        <div className="seller-card text-left mb-6">
          <h2 className="font-semibold mb-3">What happens next?</h2>
          <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 text-xs font-medium">
                1
              </span>
              <span>
                Our team reviews your application and business information
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 text-xs font-medium">
                2
              </span>
              <span>
                You&apos;ll receive an email notification about your application
                status
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 text-xs font-medium">
                3
              </span>
              <span>
                Once approved, you can start listing products and selling
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            Have questions about your application?
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/support/contact"
              className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
            >
              Contact Support
            </Link>
            <Link
              href={process.env["NEXT_PUBLIC_MARKETPLACE_URL"] || "/"}
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
