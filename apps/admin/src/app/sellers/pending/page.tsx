import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pending Seller Applications',
  description: 'Review and approve seller applications',
};

// Mock data - in production this would come from Convex
const pendingApplications = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    storeName: 'Digital Art Studio',
    storeDescription:
      'High-quality digital art, illustrations, and design resources for creative professionals.',
    category: 'Digital Art',
    portfolio: 'https://portfolio.example.com/sarah',
    socialLinks: {
      website: 'https://sarahdesigns.com',
      twitter: '@sarahdesigns',
    },
    appliedAt: '2024-01-25',
    experience: '5+ years in digital art and illustration',
    expectedProducts: 'Digital illustrations, art prints, design templates',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    storeName: 'Code Templates Pro',
    storeDescription:
      'Premium code templates, boilerplates, and developer tools for modern web development.',
    category: 'Development',
    portfolio: 'https://github.com/mikechen',
    socialLinks: {
      website: 'https://mikechen.dev',
      twitter: '@mikechen_dev',
    },
    appliedAt: '2024-01-24',
    experience: '8 years as a full-stack developer',
    expectedProducts: 'React templates, Next.js boilerplates, API starters',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@example.com',
    storeName: 'Photo Presets Hub',
    storeDescription:
      'Professional Lightroom presets and photo editing resources for photographers.',
    category: 'Photography',
    portfolio: 'https://emilyphotos.com/portfolio',
    socialLinks: {
      instagram: '@emilyphotos',
    },
    appliedAt: '2024-01-23',
    experience: '10 years professional photography',
    expectedProducts: 'Lightroom presets, Photoshop actions, LUTs',
  },
];

export default function PendingApplicationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/sellers"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Sellers
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-3xl font-bold tracking-tight">
            Pending Applications
          </h1>
          <span className="badge badge-warning">
            {pendingApplications.length} pending
          </span>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-warning">⚠️</span>
          <span>
            Review each application carefully. Approved sellers will be able to
            list products on the marketplace.
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {pendingApplications.map((application) => (
          <div
            key={application.id}
            className="rounded-lg border bg-card shadow-sm"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                    {application.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {application.storeName}
                    </h2>
                    <p className="text-muted-foreground">
                      {application.name} • {application.email}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Applied on {application.appliedAt}
                    </p>
                  </div>
                </div>
                <span className="badge badge-secondary">
                  {application.category}
                </span>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Store Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.storeDescription}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.experience}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Expected Products</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.expectedProducts}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Links</h3>
                  <div className="space-y-1 text-sm">
                    {application.portfolio && (
                      <a
                        href={application.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline"
                      >
                        📁 Portfolio
                      </a>
                    )}
                    {application.socialLinks.website && (
                      <a
                        href={application.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline"
                      >
                        🌐 Website
                      </a>
                    )}
                    {application.socialLinks.twitter && (
                      <p className="text-muted-foreground">
                        𝕏 {application.socialLinks.twitter}
                      </p>
                    )}
                    {application.socialLinks.instagram && (
                      <p className="text-muted-foreground">
                        📷 {application.socialLinks.instagram}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  Request More Info
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  View Full Application
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
                  Reject
                </button>
                <button className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success/90">
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingApplications.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
          <p className="text-muted-foreground">
            There are no pending seller applications to review.
          </p>
        </div>
      )}
    </div>
  );
}
