import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@createconomy/ui";
import { Briefcase, Heart, Globe, Zap, Users, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the Createconomy team and help build the future of the creator economy.",
};

function ValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function CareersPage() {
  return (
    <div className="container py-12">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Join Our Team
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Help us build the future of the creator economy. We&apos;re a small
          but passionate team looking for talented people who care about
          empowering creators.
        </p>
      </div>

      {/* Values */}
      <div className="mx-auto mt-16 max-w-4xl">
        <h2 className="text-center text-2xl font-bold">Why Createconomy?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            icon={Heart}
            title="Mission-Driven"
            description="We're building tools that help creators earn a living doing what they love."
          />
          <ValueCard
            icon={Globe}
            title="Remote-First"
            description="Work from anywhere in the world. We value results over hours at a desk."
          />
          <ValueCard
            icon={Zap}
            title="Modern Stack"
            description="Next.js, React, TypeScript, Convex, Stripe — we use the best tools available."
          />
          <ValueCard
            icon={Users}
            title="Small Team"
            description="Your work has real impact. No red tape, no endless meetings, just building."
          />
        </div>
      </div>

      {/* Open Positions */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-center text-2xl font-bold">Open Positions</h2>
        <div className="mt-8 rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            We don&apos;t have any open positions right now, but we&apos;re
            always looking for exceptional people. If you think you&apos;d be a
            great fit, we&apos;d love to hear from you.
          </p>
          <Button asChild className="mt-6">
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" />
              Get in Touch
            </Link>
          </Button>
        </div>
      </div>

      {/* What We Look For */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-center text-2xl font-bold">What We Look For</h2>
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Passion for Creators</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You understand and care about the challenges creators face. Bonus
              points if you&apos;re a creator yourself.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Ownership Mentality</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You take full responsibility for your work. You don&apos;t wait to
              be told what to do — you identify problems and solve them.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Technical Excellence</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You write clean, maintainable code. You stay up to date with best
              practices and aren&apos;t afraid to learn new technologies.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Strong Communication</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              As a remote team, clear written communication is essential. You
              can explain complex ideas simply and collaborate effectively
              across time zones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
