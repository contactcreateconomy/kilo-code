import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your Createconomy Forum account settings",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/account", label: "Profile", icon: "👤" },
    { href: "/account/notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Account</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64">
          <div className="rounded-lg border bg-card p-4 sticky top-20">
            <h2 className="font-semibold mb-4">Account Settings</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
