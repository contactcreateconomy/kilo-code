import type { ReactNode } from "react";

export interface AuthPageWrapperProps {
  /** Page content (forms, links, etc.) rendered inside the card */
  children: ReactNode;
  /** Main heading text */
  title: string;
  /** Subtitle text below the heading */
  subtitle: string;
  /** Optional footer content rendered below the card (e.g., terms text) */
  footer?: ReactNode;
}

/**
 * AuthPageWrapper — Shared page layout for all auth pages.
 *
 * Provides the canonical layout from the forum app:
 * - Centered container with `max-w-md`
 * - Heading area with title and subtitle
 * - Card wrapper with border and padding
 * - Optional footer for terms/privacy text
 */
export function AuthPageWrapper({
  children,
  title,
  subtitle,
  footer,
}: AuthPageWrapperProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-lg border bg-card p-6">{children}</div>

        {footer && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
