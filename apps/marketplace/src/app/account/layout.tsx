import Link from "next/link";
import { redirect } from "next/navigation";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  // In production, check authentication here
  // const user = await getUser();
  // if (!user) redirect("/auth/signin");

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <nav className="space-y-1">
            <NavLink href="/account" exact>
              Dashboard
            </NavLink>
            <NavLink href="/account/orders">Orders</NavLink>
            <NavLink href="/account/settings">Settings</NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}

function NavLink({ href, children, exact }: NavLinkProps) {
  // In a real implementation, this would check the current path
  // and apply active styles accordingly
  return (
    <Link
      href={href}
      className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  );
}
