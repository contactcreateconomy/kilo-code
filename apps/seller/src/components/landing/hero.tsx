import Link from 'next/link';
import { Button } from '@createconomy/ui/components/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto px-4 py-20 md:py-32 lg:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Free to start — no monthly fees
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Turn Your Passion
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Into Profit
              </span>
            </h1>

            <p className="mb-8 max-w-lg text-lg text-muted-foreground sm:text-xl lg:mx-0 mx-auto">
              Join Createconomy&apos;s marketplace and start selling digital
              products to a global audience. No monthly fees, instant payouts,
              powerful tools.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
              <Button size="lg" asChild className="text-base px-8">
                <Link href="/auth/signup">
                  Start Selling Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base px-8">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>

          {/* Illustration / Mockup Area */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Decorative dashboard mockup */}
              <div className="rounded-2xl border bg-card/50 p-6 shadow-2xl backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-32 rounded bg-muted" />
                      <div className="h-2 w-24 rounded bg-muted/60" />
                    </div>
                    <div className="ml-auto text-lg font-bold text-primary">$2,450</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 rounded bg-muted" />
                      <div className="h-2 w-20 rounded bg-muted/60" />
                    </div>
                    <div className="ml-auto text-lg font-bold text-primary">$1,890</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-36 rounded bg-muted" />
                      <div className="h-2 w-28 rounded bg-muted/60" />
                    </div>
                    <div className="ml-auto text-lg font-bold text-primary">$3,210</div>
                  </div>
                </div>
                {/* Chart bars */}
                <div className="mt-6 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/20"
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -right-4 -bottom-4 rounded-xl border bg-background p-3 shadow-lg">
                <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                <div className="text-xl font-bold text-primary">+127%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
