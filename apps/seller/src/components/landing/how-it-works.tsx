import { Card, CardContent } from '@createconomy/ui/components/card';
import { UserPlus, Upload, BadgeDollarSign } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    title: 'Create Account',
    description: 'Sign up for free and set up your seller profile in just a few minutes.',
    icon: UserPlus,
  },
  {
    number: 2,
    title: 'List Products',
    description:
      'Upload your digital products with descriptions, pricing, and preview images.',
    icon: Upload,
  },
  {
    number: 3,
    title: 'Start Earning',
    description: "Customers buy, you earn. It's that simple. Get paid directly to your bank.",
    icon: BadgeDollarSign,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Start Selling in 3 Easy Steps
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Getting started is quick and straightforward. No technical skills required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mx-auto max-w-4xl">
          {/* Connecting line (desktop only) */}
          <div className="absolute top-24 right-[16.67%] left-[16.67%] hidden h-0.5 bg-border lg:block" />

          <div className="grid gap-8 lg:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center text-center">
                  {/* Numbered circle */}
                  <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                    {step.number}
                  </div>

                  <Card className="w-full border-0 bg-transparent shadow-none">
                    <CardContent className="flex flex-col items-center gap-3 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
