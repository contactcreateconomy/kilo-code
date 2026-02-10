"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@createconomy/ui";
import { Input } from "@createconomy/ui/components/input";
import { Textarea } from "@createconomy/ui/components/textarea";
import { Label } from "@createconomy/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@createconomy/ui/components/select";
import { useToast } from "@createconomy/ui";
import { Mail, MessageSquare, Clock, HelpCircle } from "lucide-react";

function ContactInfoCard({
  icon: Icon,
  title,
  description,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-1 text-sm font-medium">{detail}</p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.addToast("Please fill in all fields before submitting.", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate submission — in production, this would send to an API or store in Convex
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.addToast(
      "Thank you for reaching out. We'll get back to you within 24-48 hours.",
      "success"
    );

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-muted-foreground">
          Have a question, feedback, or need help? We&apos;d love to hear from
          you.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-5">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subject: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="billing">Billing & Payments</SelectItem>
                  <SelectItem value="partnership">
                    Partnership Opportunity
                  </SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="bug">Report a Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us how we can help..."
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 lg:col-span-2">
          <ContactInfoCard
            icon={Mail}
            title="Email"
            description="Send us an email anytime"
            detail="support@createconomy.com"
          />
          <ContactInfoCard
            icon={Clock}
            title="Response Time"
            description="We typically respond within"
            detail="24-48 hours"
          />
          <ContactInfoCard
            icon={MessageSquare}
            title="Community"
            description="Join the discussion"
            detail="Visit our Forum"
          />
          <ContactInfoCard
            icon={HelpCircle}
            title="Help Center"
            description="Browse common questions"
            detail="Visit Support"
          />

          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href="/support"
                  className="text-primary hover:underline"
                >
                  Help & Support Center
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="text-primary hover:underline"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
