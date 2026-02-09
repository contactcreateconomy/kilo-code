import Link from 'next/link';
import { Button } from '@createconomy/ui/components/button';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="bg-zinc-900 py-16 md:py-24 dark:bg-zinc-950">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to Start Selling?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-lg text-zinc-300">
          Join thousands of creators who are already earning on Createconomy.
          Set up your store in minutes.
        </p>
        <Button size="lg" asChild className="bg-white text-zinc-900 hover:bg-zinc-100 text-base px-8">
          <Link href="/auth/signup">
            Create Your Seller Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-zinc-400">
          No credit card required. Free to start.
        </p>
      </div>
    </section>
  );
}
