import * as React from "react";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "default" | "light" | "dark";
}

function getLogoColor(variant: "default" | "light" | "dark"): string {
  switch (variant) {
    case "light":
      return "#ffffff";
    case "dark":
      return "#1a1a2e";
    default:
      return "currentColor";
  }
}

/**
 * Createconomy logo mark — a geometric "C" shape composed of:
 * - A half-circle on the left
 * - A quarter-circle (top-right)
 * - A square (bottom-right)
 *
 * The cutout on the right side is divided by a horizontal line,
 * creating the distinctive two-part opening of the "C".
 */
function Logo({ className, size = 32, variant = "default" }: LogoProps) {
  const fill = getLogoColor(variant);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-label="Createconomy logo"
      role="img"
    >
      {/* Full circle base */}
      <circle cx="32" cy="32" r="30" fill={fill} />
      {/* Top-right cutout: quarter-circle */}
      <path
        d="M 34 2 L 34 32 L 62 32 A 30 30 0 0 0 34 2 Z"
        fill="var(--logo-cutout, #ffffff)"
        style={
          {
            "--logo-cutout":
              "var(--background, var(--color-background, #ffffff))",
          } as React.CSSProperties
        }
      />
      {/* Bottom-right cutout: rectangle */}
      <rect
        x="34"
        y="34"
        width="28"
        height="28"
        rx="2"
        fill="var(--logo-cutout, #ffffff)"
        style={
          {
            "--logo-cutout":
              "var(--background, var(--color-background, #ffffff))",
          } as React.CSSProperties
        }
      />
    </svg>
  );
}

/**
 * Logo with "Createconomy" text and optional app name.
 *
 * @example
 * <LogoWithText /> // "Createconomy"
 * <LogoWithText appName="Admin" /> // "Createconomy Admin"
 * <LogoWithText appName="Seller Portal" /> // "Createconomy Seller Portal"
 */
function LogoWithText({
  className,
  size = 32,
  variant = "default",
  appName,
}: LogoProps & { appName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Logo size={size} variant={variant} />
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-lg font-bold leading-none tracking-tight"
          style={{ color: variant === "default" ? undefined : getLogoColor(variant) }}
        >
          Createconomy
        </span>
        {appName && (
          <span
            className="text-sm font-medium leading-none text-muted-foreground"
            style={
              variant !== "default"
                ? { color: getLogoColor(variant), opacity: 0.7 }
                : undefined
            }
          >
            {appName}
          </span>
        )}
      </div>
    </div>
  );
}

export { Logo, LogoWithText };
export type { LogoProps };
