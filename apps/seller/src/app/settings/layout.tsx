import Link from "next/link";

export const metadata = {
  title: "Settings",
  description: "Manage your store settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsNav = [
    { href: "/settings", label: "Store Profile", icon: "🏪" },
    { href: "/settings/shipping", label: "Shipping", icon: "📦" },
    { href: "/settings/policies", label: "Policies", icon: "📋" },
  ];

  return (
    <div className="flex gap-6">
      {/* Settings Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <nav className="seller-card p-2">
          <ul className="space-y-1">
            {settingsNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Settings Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
