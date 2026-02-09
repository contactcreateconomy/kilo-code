import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const sizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

interface SpinnerProps {
  /** Size preset — maps to Tailwind dimension classes */
  size?: keyof typeof sizes;
  /** Additional class names (color, margin, etc.) */
  className?: string;
}

/**
 * Standardised loading spinner wrapping Lucide's Loader2 icon.
 *
 * Replaces scattered `<Loader2 className="animate-spin …" />` throughout the
 * codebase with a single, consistently-sized component.
 *
 * @example
 * ```tsx
 * <Spinner />               // default md (h-5 w-5)
 * <Spinner size="sm" />     // h-4 w-4
 * <Spinner size="xl" className="text-primary" />
 * ```
 */
export function Spinner({ className, size = "md" }: SpinnerProps) {
  return <Loader2 className={cn("animate-spin", sizes[size], className)} />;
}
