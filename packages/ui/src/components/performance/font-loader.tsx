/**
 * Font Loader Component
 *
 * Optimized font loading for Core Web Vitals performance.
 * Implements font-display: swap and preloading strategies.
 */

import type { ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

export interface FontConfig {
  /** Font family name */
  family: string;
  /** Font weights to load */
  weights?: (100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900)[];
  /** Font styles to load */
  styles?: ("normal" | "italic")[];
  /** Font display strategy */
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  /** Whether this is a critical font (preload) */
  preload?: boolean;
  /** Font subset (e.g., 'latin', 'latin-ext') */
  subsets?: string[];
  /** Variable font */
  variable?: boolean;
  /** Font source URL */
  src?: string;
}

export interface GoogleFontConfig {
  /** Font family name */
  family: string;
  /** Font weights to load */
  weights?: number[];
  /** Include italic variants */
  italic?: boolean;
  /** Font display strategy */
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  /** Font subsets */
  subsets?: string[];
}

export interface FontPreloadProps {
  /** URL of the font file */
  href: string;
  /** Font format */
  type?: "font/woff2" | "font/woff" | "font/ttf" | "font/otf";
  /** Crossorigin attribute */
  crossOrigin?: "anonymous" | "use-credentials";
}

// ============================================================================
// Font Preload Component
// ============================================================================

/**
 * Font Preload
 *
 * Preloads a font file for faster loading.
 *
 * @example
 * ```tsx
 * <FontPreload
 *   href="/fonts/inter-var.woff2"
 *   type="font/woff2"
 * />
 * ```
 */
export function FontPreload({
  href,
  type = "font/woff2",
  crossOrigin = "anonymous",
}: FontPreloadProps): ReactNode {
  return (
    <link
      rel="preload"
      as="font"
      href={href}
      type={type}
      crossOrigin={crossOrigin}
    />
  );
}

// ============================================================================
// Google Fonts Component
// ============================================================================

/**
 * Build Google Fonts URL
 */
export function buildGoogleFontsUrl(fonts: GoogleFontConfig[]): string {
  const families = fonts.map((font) => {
    const weights = font.weights || [400];
    const weightStr = weights.join(";");

    if (font.italic) {
      const italicWeights = weights.map((w) => `0,${w};1,${w}`).join(";");
      return `family=${encodeURIComponent(font.family)}:ital,wght@${italicWeights}`;
    }

    return `family=${encodeURIComponent(font.family)}:wght@${weightStr}`;
  });

  const display = fonts[0]?.display || "swap";
  const subsets = [...new Set(fonts.flatMap((f) => f.subsets || ["latin"]))];

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=${display}&subset=${subsets.join(",")}`;
}

export interface GoogleFontsProps {
  fonts: GoogleFontConfig[];
  preconnect?: boolean;
}

/**
 * Google Fonts Loader
 *
 * Loads Google Fonts with optimal performance settings.
 *
 * @example
 * ```tsx
 * <GoogleFonts
 *   fonts={[
 *     { family: "Inter", weights: [400, 500, 600, 700] },
 *     { family: "Fira Code", weights: [400, 500] },
 *   ]}
 * />
 * ```
 */
export function GoogleFonts({
  fonts,
  preconnect = true,
}: GoogleFontsProps): ReactNode {
  const url = buildGoogleFontsUrl(fonts);

  return (
    <>
      {preconnect && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </>
      )}
      <link rel="stylesheet" href={url} />
    </>
  );
}

// ============================================================================
// Font Face Declaration
// ============================================================================

export interface FontFaceConfig {
  family: string;
  src: string | { url: string; format: string }[];
  weight?: number | string;
  style?: "normal" | "italic" | "oblique";
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  unicodeRange?: string;
}

/**
 * Generate @font-face CSS declaration
 */
export function generateFontFace(config: FontFaceConfig): string {
  const srcValue = Array.isArray(config.src)
    ? config.src.map((s) => `url('${s.url}') format('${s.format}')`).join(", ")
    : `url('${config.src}')`;

  return `
    @font-face {
      font-family: '${config.family}';
      src: ${srcValue};
      font-weight: ${config.weight || "normal"};
      font-style: ${config.style || "normal"};
      font-display: ${config.display || "swap"};
      ${config.unicodeRange ? `unicode-range: ${config.unicodeRange};` : ""}
    }
  `;
}

/**
 * Generate multiple @font-face declarations
 */
export function generateFontFaces(configs: FontFaceConfig[]): string {
  return configs.map(generateFontFace).join("\n");
}

export interface FontFaceStyleProps {
  fonts: FontFaceConfig[];
  nonce?: string;
}

/**
 * Font Face Style Component
 *
 * Inlines @font-face declarations.
 *
 * @example
 * ```tsx
 * <FontFaceStyle
 *   fonts={[
 *     {
 *       family: "Inter",
 *       src: [
 *         { url: "/fonts/inter-var.woff2", format: "woff2" },
 *       ],
 *       weight: "100 900",
 *       display: "swap",
 *     },
 *   ]}
 * />
 * ```
 */
export function FontFaceStyle({ fonts, nonce }: FontFaceStyleProps): ReactNode {
  const css = generateFontFaces(fonts);

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      {...(nonce && { nonce })}
    />
  );
}

// ============================================================================
// Font Loading Utilities
// ============================================================================

/**
 * Check if a font is loaded
 */
export async function isFontLoaded(
  family: string,
  options?: {
    weight?: string;
    style?: string;
    timeout?: number;
  }
): Promise<boolean> {
  if (typeof document === "undefined") return false;

  const { weight = "normal", style = "normal", timeout = 3000 } = options || {};

  try {
    const font = `${style} ${weight} 16px "${family}"`;
    await Promise.race([
      document.fonts.load(font),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Font load timeout")), timeout)
      ),
    ]);
    return document.fonts.check(font);
  } catch {
    return false;
  }
}

/**
 * Wait for fonts to be ready
 */
export async function waitForFonts(
  families: string[],
  timeout: number = 3000
): Promise<boolean> {
  if (typeof document === "undefined") return false;

  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fonts ready timeout")), timeout)
      ),
    ]);

    return families.every((family) =>
      document.fonts.check(`16px "${family}"`)
    );
  } catch {
    return false;
  }
}

/**
 * Add class when fonts are loaded
 */
export function onFontsLoaded(
  families: string[],
  callback: () => void,
  timeout: number = 3000
): void {
  if (typeof document === "undefined") return;

  waitForFonts(families, timeout).then((loaded) => {
    if (loaded) {
      callback();
    }
  });
}

// ============================================================================
// Font Fallback Stack
// ============================================================================

/**
 * Common font fallback stacks
 */
export const fontFallbacks = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  display:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

/**
 * Build font family with fallbacks
 */
export function buildFontFamily(
  primary: string,
  fallback: keyof typeof fontFallbacks = "sans"
): string {
  return `"${primary}", ${fontFallbacks[fallback]}`;
}

// ============================================================================
// Font Subset Utilities
// ============================================================================

/**
 * Common unicode ranges for font subsetting
 */
export const unicodeRanges = {
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  latinExt:
    "U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF",
  cyrillic: "U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
  cyrillicExt:
    "U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
  greek: "U+0370-03FF",
  greekExt: "U+1F00-1FFF",
  vietnamese:
    "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB",
};

// ============================================================================
// Font Optimization Presets
// ============================================================================

/**
 * Optimized Inter font configuration
 */
export const interFontConfig: FontFaceConfig[] = [
  {
    family: "Inter",
    src: [{ url: "/fonts/inter-var.woff2", format: "woff2-variations" }],
    weight: "100 900",
    style: "normal",
    display: "swap",
    unicodeRange: unicodeRanges.latin,
  },
];

/**
 * Optimized system font stack (no loading required)
 */
export const systemFontStack = {
  sans: buildFontFamily("system-ui", "sans"),
  serif: buildFontFamily("ui-serif", "serif"),
  mono: buildFontFamily("ui-monospace", "mono"),
};

// ============================================================================
// Font Loading Script
// ============================================================================

/**
 * Generate font loading script for optimal performance
 */
export function getFontLoadingScript(families: string[]): string {
  return `
    (function() {
      if ('fonts' in document) {
        var families = ${JSON.stringify(families)};
        Promise.all(families.map(function(f) {
          return document.fonts.load('1em "' + f + '"');
        })).then(function() {
          document.documentElement.classList.add('fonts-loaded');
        });
      }
    })();
  `.replace(/\s+/g, " ");
}

/**
 * Font Loading Script Component
 */
export function FontLoadingScript({
  families,
  nonce,
}: {
  families: string[];
  nonce?: string;
}): ReactNode {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: getFontLoadingScript(families) }}
      {...(nonce && { nonce })}
    />
  );
}
