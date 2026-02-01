import Link from "next/link";

export const metadata = {
  title: "Help Center",
  description: "Get help with your seller account",
};

const faqCategories = [
  {
    title: "Getting Started",
    icon: "🚀",
    questions: [
      { q: "How do I set up my store?", a: "Navigate to Settings > Store Profile to customize your store name, logo, and description." },
      { q: "How do I add my first product?", a: "Go to Products > New Product and fill in the product details, images, and pricing." },
      { q: "What are the seller fees?", a: "We charge a 10% commission on each sale. There are no monthly fees or listing fees." },
    ],
  },
  {
    title: "Products & Inventory",
    icon: "📦",
    questions: [
      { q: "How do I manage inventory?", a: "Each product has a stock quantity field. You can also enable low stock alerts in settings." },
      { q: "Can I offer product variations?", a: "Yes! When creating a product, you can add variants like size, color, or material." },
      { q: "How do I bulk upload products?", a: "Use the Import feature in Products to upload a CSV file with multiple products." },
    ],
  },
  {
    title: "Orders & Shipping",
    icon: "🚚",
    questions: [
      { q: "How do I fulfill an order?", a: "Go to Orders, click on the order, and update the status to 'Shipped' with tracking info." },
      { q: "What shipping carriers are supported?", a: "We support USPS, UPS, FedEx, and DHL. You can also add custom carriers." },
      { q: "How do I handle returns?", a: "Review the return request in Orders, approve or deny it, and process the refund if approved." },
    ],
  },
  {
    title: "Payments & Payouts",
    icon: "💰",
    questions: [
      { q: "When do I get paid?", a: "Payouts are processed according to your schedule (daily, weekly, or monthly) in Payout Settings." },
      { q: "What payment methods are accepted?", a: "We accept credit cards, debit cards, and PayPal from customers." },
      { q: "How do I update my bank information?", a: "Go to Payouts > Settings to update your bank account details securely." },
    ],
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Find answers to common questions or contact our support team
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full pl-12 pr-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/support/contact"
          className="seller-card text-center hover:border-[var(--primary)] transition-colors"
        >
          <span className="text-3xl">💬</span>
          <p className="font-medium mt-2">Contact Support</p>
        </Link>
        <Link
          href="/settings"
          className="seller-card text-center hover:border-[var(--primary)] transition-colors"
        >
          <span className="text-3xl">⚙️</span>
          <p className="font-medium mt-2">Store Settings</p>
        </Link>
        <Link
          href="/payouts/settings"
          className="seller-card text-center hover:border-[var(--primary)] transition-colors"
        >
          <span className="text-3xl">🏦</span>
          <p className="font-medium mt-2">Payout Settings</p>
        </Link>
        <a
          href="https://docs.createconomy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="seller-card text-center hover:border-[var(--primary)] transition-colors"
        >
          <span className="text-3xl">📚</span>
          <p className="font-medium mt-2">Documentation</p>
        </a>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {faqCategories.map((category) => (
          <div key={category.title} className="seller-card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <h2 className="text-lg font-semibold">{category.title}</h2>
            </div>
            <div className="space-y-4">
              {category.questions.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none py-2 hover:text-[var(--primary)]">
                    <span className="font-medium">{faq.q}</span>
                    <svg
                      className="w-5 h-5 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="text-[var(--muted-foreground)] pt-2 pb-4 pl-4 border-l-2 border-[var(--border)] ml-2">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="seller-card bg-[var(--primary)] text-[var(--primary-foreground)] text-center">
        <h3 className="text-xl font-semibold">Still need help?</h3>
        <p className="mt-2 opacity-90">
          Our support team is available 24/7 to assist you
        </p>
        <Link
          href="/support/contact"
          className="inline-block mt-4 px-6 py-2 bg-[var(--background)] text-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
