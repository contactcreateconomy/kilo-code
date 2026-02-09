/**
 * Critical CSS Component
 *
 * Handles critical CSS inlining and non-critical CSS deferral
 * for optimal Core Web Vitals performance.
 */

import type { ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

export interface CriticalCssProps {
  /** Critical CSS to inline in the head */
  css: string;
  /** Optional nonce for CSP */
  nonce?: string;
}

export interface DeferredStylesheetProps {
  /** URL of the stylesheet to defer */
  href: string;
  /** Media query for the stylesheet */
  media?: string;
  /** Integrity hash for subresource integrity */
  integrity?: string;
  /** Crossorigin attribute */
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface StylesheetPreloadProps {
  /** URL of the stylesheet to preload */
  href: string;
  /** Whether to also load the stylesheet */
  load?: boolean;
  /** Crossorigin attribute */
  crossOrigin?: "anonymous" | "use-credentials";
}

// ============================================================================
// Critical CSS Component
// ============================================================================

/**
 * Inline Critical CSS
 *
 * Inlines critical CSS directly in the HTML to prevent render-blocking.
 * Use this for above-the-fold styles that are needed for initial render.
 *
 * @example
 * ```tsx
 * <CriticalCss
 *   css={`
 *     .hero { min-height: 100vh; }
 *     .nav { position: fixed; top: 0; }
 *   `}
 * />
 * ```
 */
export function CriticalCss({ css, nonce }: CriticalCssProps): ReactNode {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: minifyCss(css) }}
      {...(nonce && { nonce })}
    />
  );
}

// ============================================================================
// Deferred Stylesheet Component
// ============================================================================

/**
 * Deferred Stylesheet
 *
 * Loads a stylesheet without blocking render using the print media trick.
 * The stylesheet is loaded asynchronously and applied after load.
 *
 * @example
 * ```tsx
 * <DeferredStylesheet href="/styles/non-critical.css" />
 * ```
 */
export function DeferredStylesheet({
  href,
  media = "all",
  integrity,
  crossOrigin,
}: DeferredStylesheetProps): ReactNode {
  return (
    <>
      <link
        rel="stylesheet"
        href={href}
        media="print"
        // @ts-expect-error - onLoad is valid for link elements
        onLoad={`this.media='${media}'`}
        {...(integrity && { integrity })}
        {...(crossOrigin && { crossOrigin })}
      />
      <noscript>
        <link
          rel="stylesheet"
          href={href}
          media={media}
          {...(integrity && { integrity })}
          {...(crossOrigin && { crossOrigin })}
        />
      </noscript>
    </>
  );
}

// ============================================================================
// Stylesheet Preload Component
// ============================================================================

/**
 * Stylesheet Preload
 *
 * Preloads a stylesheet for faster loading when needed.
 *
 * @example
 * ```tsx
 * <StylesheetPreload href="/styles/modal.css" />
 * ```
 */
export function StylesheetPreload({
  href,
  load = false,
  crossOrigin,
}: StylesheetPreloadProps): ReactNode {
  return (
    <>
      <link
        rel="preload"
        as="style"
        href={href}
        {...(crossOrigin && { crossOrigin })}
      />
      {load && (
        <link
          rel="stylesheet"
          href={href}
          {...(crossOrigin && { crossOrigin })}
        />
      )}
    </>
  );
}

// ============================================================================
// CSS Utilities
// ============================================================================

/**
 * Minify CSS by removing unnecessary whitespace and comments
 */
export function minifyCss(css: string): string {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Remove newlines and extra spaces
    .replace(/\s+/g, " ")
    // Remove spaces around special characters
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, "}")
    // Trim
    .trim();
}

/**
 * Extract critical CSS for above-the-fold content
 * This is a simplified version - in production, use tools like critical or critters
 */
export function extractCriticalSelectors(
  css: string,
  selectors: string[]
): string {
  const rules: string[] = [];
  const selectorSet = new Set(selectors);

  // Simple regex to match CSS rules
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1]?.trim();
    const declarations = match[2]?.trim();

    if (!selector || !declarations) continue;

    // Check if any of the critical selectors match
    const selectorParts = selector.split(",").map((s) => s.trim());
    const hasCriticalSelector = selectorParts.some((part) => {
      // Check for exact match or class/id match
      const firstPart = part.split(/[\s>+~]/)[0] ?? "";
      return (
        selectorSet.has(part) ||
        selectorSet.has(firstPart) ||
        Array.from(selectorSet).some(
          (s) => part.includes(s) || part.startsWith(s)
        )
      );
    });

    if (hasCriticalSelector) {
      rules.push(`${selector}{${declarations}}`);
    }
  }

  return rules.join("");
}

// ============================================================================
// Critical CSS Presets
// ============================================================================

/**
 * Common critical CSS for layout stability
 */
export const layoutCriticalCss = `
  *,*::before,*::after{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%;tab-size:4}
  body{margin:0;line-height:1.5;-webkit-font-smoothing:antialiased}
  img,picture,video,canvas,svg{display:block;max-width:100%}
  input,button,textarea,select{font:inherit}
  p,h1,h2,h3,h4,h5,h6{overflow-wrap:break-word}
`;

/**
 * Critical CSS for preventing layout shift
 */
export const clsPreventionCss = `
  img,video{height:auto}
  [data-skeleton]{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:skeleton 1.5s infinite}
  @keyframes skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}
`;

/**
 * Critical CSS for common UI patterns
 */
export const uiCriticalCss = `
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .container{width:100%;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}
  @media(min-width:640px){.container{max-width:640px}}
  @media(min-width:768px){.container{max-width:768px}}
  @media(min-width:1024px){.container{max-width:1024px}}
  @media(min-width:1280px){.container{max-width:1280px}}
`;

/**
 * Get combined critical CSS
 */
export function getCriticalCss(options?: {
  includeLayout?: boolean;
  includeClsPrevention?: boolean;
  includeUi?: boolean;
  custom?: string;
}): string {
  const {
    includeLayout = true,
    includeClsPrevention = true,
    includeUi = false,
    custom = "",
  } = options || {};

  let css = "";

  if (includeLayout) css += layoutCriticalCss;
  if (includeClsPrevention) css += clsPreventionCss;
  if (includeUi) css += uiCriticalCss;
  if (custom) css += custom;

  return minifyCss(css);
}

// ============================================================================
// CSS Loading Strategies
// ============================================================================

/**
 * Generate CSS loading script for optimal performance
 */
export function getCssLoadingScript(stylesheets: string[]): string {
  return `
    (function() {
      var stylesheets = ${JSON.stringify(stylesheets)};
      var head = document.head;
      
      function loadStylesheet(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        head.appendChild(link);
      }
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(function() {
          stylesheets.forEach(loadStylesheet);
        });
      } else {
        setTimeout(function() {
          stylesheets.forEach(loadStylesheet);
        }, 1);
      }
    })();
  `.replace(/\s+/g, " ");
}

/**
 * CSS Loading Script Component
 */
export function CssLoadingScript({
  stylesheets,
  nonce,
}: {
  stylesheets: string[];
  nonce?: string;
}): ReactNode {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: getCssLoadingScript(stylesheets) }}
      {...(nonce && { nonce })}
    />
  );
}
