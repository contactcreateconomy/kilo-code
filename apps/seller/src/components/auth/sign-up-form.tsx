"use client";

import { useState } from "react";
import Link from "next/link";

interface SignUpFormProps {
  onSubmit: (data: SellerApplicationData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export interface SellerApplicationData {
  email: string;
  password: string;
  storeName: string;
  storeDescription: string;
  businessType: string;
  website?: string;
  phone: string;
  agreeToTerms: boolean;
}

export function SignUpForm({ onSubmit, isLoading, error }: SignUpFormProps) {
  const [formData, setFormData] = useState<SellerApplicationData>({
    email: "",
    password: "",
    storeName: "",
    storeDescription: "",
    businessType: "",
    website: "",
    phone: "",
    agreeToTerms: false,
  });
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Become a Seller</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Join our marketplace and start selling your products
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  s < step ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Account Info */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </>
        )}

        {/* Step 2: Store Info */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Your store name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Store Description</label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                placeholder="Tell us about your store and what you sell..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Business Type</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select business type</option>
                <option value="individual">Individual / Sole Proprietor</option>
                <option value="llc">LLC</option>
                <option value="corporation">Corporation</option>
                <option value="partnership">Partnership</option>
                <option value="nonprofit">Non-profit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <>
            <div className="seller-card">
              <h3 className="font-medium mb-4">Review Your Application</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Email</dt>
                  <dd>{formData.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Phone</dt>
                  <dd>{formData.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Store Name</dt>
                  <dd>{formData.storeName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Business Type</dt>
                  <dd className="capitalize">{formData.businessType}</dd>
                </div>
              </dl>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="mt-1 rounded border-[var(--border)]"
              />
              <span className="text-sm text-[var(--muted-foreground)]">
                I agree to the{" "}
                <Link href="/terms" className="text-[var(--primary)] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                  Privacy Policy
                </Link>
                . I understand that my application will be reviewed before I can start
                selling.
              </span>
            </label>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || (step === 3 && !formData.agreeToTerms)}
            className="flex-1 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading
              ? "Submitting..."
              : step < 3
              ? "Continue"
              : "Submit Application"}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
        Already have a seller account?{" "}
        <Link href="/auth/signin" className="text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
