// Re-export cn from the shared UI package
export { cn } from "@createconomy/ui";

/**
 * Convert price from cents (backend) to dollars (display)
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert price from dollars (input) to cents (backend)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format price in cents as a currency string.
 * @param cents — price in cents (e.g. 4999 → "$49.99")
 */
export function formatPriceCents(
  cents: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Format price with currency (dollars input)
 */
export function formatPrice(
  price: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Format date
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(
    typeof date === "string" ? new Date(date) : date
  );
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if we're on the server
 */
export const isServer = typeof window === "undefined";

/**
 * Check if we're on the client
 */
export const isClient = !isServer;

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  if (isClient) return "";
  if (process.env["NEXT_PUBLIC_SITE_URL"]) return process.env["NEXT_PUBLIC_SITE_URL"];
  if (process.env["VERCEL_URL"]) return `https://${process.env["VERCEL_URL"]}`;
  return "http://localhost:3000";
}

/**
 * Absolute URL helper
 */
export function absoluteUrl(path: string): string {
  return `${getBaseUrl()}${path}`;
}
