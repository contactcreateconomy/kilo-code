import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Admin dashboard settings',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsNav = [
    { name: 'General', href: '/settings', icon: '⚙️' },
    { name: 'Appearance', href: '/settings/appearance', icon: '🎨' },
    { name: 'Notifications', href: '/settings/notifications', icon: '🔔' },
    { name: 'Security', href: '/settings/security', icon: '🔒' },
    { name: 'API Keys', href: '/settings/api-keys', icon: '🔑' },
    { name: 'Integrations', href: '/settings/integrations', icon: '🔗' },
    { name: 'Billing', href: '/settings/billing', icon: '💳' },
  ];

  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0">
        <nav className="space-y-1">
          {settingsNav.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
