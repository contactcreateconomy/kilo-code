import { Card, CardContent } from '@createconomy/ui/components/card';
import { Avatar, AvatarFallback } from '@createconomy/ui/components/avatar';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      "Createconomy made it incredibly easy to start selling my design templates. Within the first month, I was earning more than my side gig!",
    name: 'Sarah Chen',
    role: 'Template Designer',
    initials: 'SC',
    rating: 5,
  },
  {
    quote:
      "The analytics dashboard is a game-changer. I can see exactly what's working and optimize my listings. My sales doubled in 3 months.",
    name: 'Marcus Johnson',
    role: 'Course Creator',
    initials: 'MJ',
    rating: 5,
  },
  {
    quote:
      "Instant payouts through Stripe Connect mean I never have to worry about when I'll get paid. The platform just works.",
    name: 'Elena Rodriguez',
    role: 'Digital Artist',
    initials: 'ER',
    rating: 5,
  },
] as const;

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            What Our Sellers Say
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Hear from creators who are already building successful businesses on Createconomy.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                <StarRating count={testimonial.rating} />

                <blockquote className="flex-1 text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
