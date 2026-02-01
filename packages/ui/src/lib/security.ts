/**
 * Security Utilities
 *
 * Client-side security utilities shared across all Createconomy apps.
 * Includes CSRF protection, input sanitization, and validation helpers.
 */

// ============================================================================
// CSRF Token Management
// ============================================================================

const CSRF_TOKEN_KEY = "csrf_token";
const CSRF_TOKEN_EXPIRY_KEY = "csrf_token_expiry";
const CSRF_TOKEN_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate a cryptographically secure random token
 *
 * @param length - Length of the token (default: 32)
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }
  // Fallback for non-browser environments
  return Array.from({ length: length * 2 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

/**
 * Generate and store a CSRF token
 *
 * @returns The generated CSRF token
 */
export function generateCsrfToken(): string {
  const token = generateSecureToken(32);
  const expiry = Date.now() + CSRF_TOKEN_TTL;

  if (typeof window !== "undefined" && window.sessionStorage) {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    sessionStorage.setItem(CSRF_TOKEN_EXPIRY_KEY, expiry.toString());
  }

  return token;
}

/**
 * Get the current CSRF token, generating a new one if needed
 *
 * @returns The current CSRF token
 */
export function getCsrfToken(): string {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return generateSecureToken(32);
  }

  const token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const expiry = sessionStorage.getItem(CSRF_TOKEN_EXPIRY_KEY);

  if (!token || !expiry || Date.now() > parseInt(expiry, 10)) {
    return generateCsrfToken();
  }

  return token;
}

/**
 * Validate a CSRF token against the stored token
 *
 * @param token - Token to validate
 * @returns True if the token is valid
 */
export function validateCsrfToken(token: string): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return false;
  }

  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const expiry = sessionStorage.getItem(CSRF_TOKEN_EXPIRY_KEY);

  if (!storedToken || !expiry) {
    return false;
  }

  if (Date.now() > parseInt(expiry, 10)) {
    // Token expired
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
    sessionStorage.removeItem(CSRF_TOKEN_EXPIRY_KEY);
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(token, storedToken);
}

/**
 * Constant-time string comparison to prevent timing attacks
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// ============================================================================
// Input Sanitization (XSS Prevention)
// ============================================================================

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Encode HTML entities to prevent XSS attacks
 *
 * @param input - String to encode
 * @returns Encoded string safe for HTML insertion
 */
export function encodeHtmlEntities(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Decode HTML entities back to original characters
 *
 * @param input - Encoded string
 * @returns Decoded string
 */
export function decodeHtmlEntities(input: string): string {
  const textarea = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (textarea) {
    textarea.innerHTML = input;
    return textarea.value;
  }
  // Fallback for non-browser environments
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x60;/g, "`")
    .replace(/&#x3D;/g, "=");
}

/**
 * Sanitize user input by removing potentially dangerous content
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
    // Remove data: protocol (can be used for XSS)
    .replace(/data:/gi, "")
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, "")
    // Remove expression() (IE CSS expression)
    .replace(/expression\s*\(/gi, "")
    // Encode remaining HTML entities
    .trim();
}

/**
 * Sanitize HTML content while preserving safe tags
 *
 * @param html - HTML string to sanitize
 * @param allowedTags - Array of allowed tag names
 * @returns Sanitized HTML
 */
export function sanitizeHtml(
  html: string,
  allowedTags: string[] = ["b", "i", "u", "strong", "em", "p", "br", "ul", "ol", "li", "a"]
): string {
  // First, remove dangerous content
  let sanitized = sanitizeInput(html);

  // Create a regex pattern for allowed tags
  const allowedPattern = allowedTags.join("|");
  const tagRegex = new RegExp(
    `<(?!\/?(?:${allowedPattern})(?:\\s[^>]*)?>)[^>]*>`,
    "gi"
  );

  // Remove disallowed tags
  sanitized = sanitized.replace(tagRegex, "");

  // Sanitize href attributes in anchor tags
  sanitized = sanitized.replace(
    /<a\s+([^>]*?)href\s*=\s*["']([^"']*)["']([^>]*)>/gi,
    (match, before, href, after) => {
      const safeHref = sanitizeUrl(href);
      if (!safeHref) {
        return `<a ${before}${after}>`;
      }
      return `<a ${before}href="${safeHref}"${after}>`;
    }
  );

  return sanitized;
}

/**
 * Strip all HTML tags from a string
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Allowed URL protocols
 */
const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * Validate and sanitize a URL
 *
 * @param url - URL to validate
 * @returns Sanitized URL or null if invalid/unsafe
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmedUrl = url.trim();

  // Check for javascript: or data: protocols
  if (/^(javascript|data|vbscript):/i.test(trimmedUrl)) {
    return null;
  }

  try {
    const parsed = new URL(trimmedUrl, window?.location?.origin || "https://example.com");

    // Check if protocol is safe
    if (!SAFE_PROTOCOLS.includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (trimmedUrl.startsWith("/") || trimmedUrl.startsWith("#")) {
      return trimmedUrl;
    }
    return null;
  }
}

/**
 * Check if a URL is from an allowed domain
 *
 * @param url - URL to check
 * @param allowedDomains - Array of allowed domain patterns
 * @returns True if URL is from an allowed domain
 */
export function isAllowedDomain(url: string, allowedDomains: string[]): boolean {
  try {
    const parsed = new URL(url);
    return allowedDomains.some((domain) => {
      if (domain.startsWith("*.")) {
        // Wildcard subdomain matching
        const baseDomain = domain.slice(2);
        return (
          parsed.hostname === baseDomain ||
          parsed.hostname.endsWith(`.${baseDomain}`)
        );
      }
      return parsed.hostname === domain;
    });
  } catch {
    return false;
  }
}

/**
 * Validate that a URL is a valid HTTP(S) URL
 *
 * @param url - URL to validate
 * @returns True if valid HTTP(S) URL
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ============================================================================
// Safe JSON Parsing
// ============================================================================

/**
 * Safely parse JSON with error handling
 *
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON with error handling
 *
 * @param value - Value to stringify
 * @param fallback - Fallback string if stringify fails
 * @returns JSON string or fallback
 */
export function safeJsonStringify(value: unknown, fallback: string = "{}"): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/**
 * Parse JSON with prototype pollution prevention
 *
 * @param json - JSON string to parse
 * @returns Parsed value with dangerous keys removed
 */
export function safeJsonParseStrict<T extends object>(json: string): T | null {
  try {
    const parsed = JSON.parse(json);

    // Remove potentially dangerous keys
    const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
      const dangerous = ["__proto__", "constructor", "prototype"];
      const result: Record<string, unknown> = {};

      for (const key of Object.keys(obj)) {
        if (dangerous.includes(key)) {
          continue;
        }

        const value = obj[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
          result[key] = sanitize(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
          result[key] = value.map((item) =>
            item && typeof item === "object"
              ? sanitize(item as Record<string, unknown>)
              : item
          );
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    if (typeof parsed === "object" && parsed !== null) {
      return sanitize(parsed) as T;
    }

    return parsed as T;
  } catch {
    return null;
  }
}

// ============================================================================
// Content Security
// ============================================================================

/**
 * Generate a nonce for inline scripts/styles
 *
 * @returns Base64-encoded nonce
 */
export function generateNonce(): string {
  const token = generateSecureToken(16);
  if (typeof btoa !== "undefined") {
    return btoa(token);
  }
  return token;
}

/**
 * Check if content contains potentially malicious patterns
 *
 * @param content - Content to check
 * @returns Object with check results
 */
export function detectMaliciousContent(content: string): {
  hasMaliciousPatterns: boolean;
  patterns: string[];
} {
  const patterns: string[] = [];

  const checks = [
    { pattern: /<script/i, name: "script_tag" },
    { pattern: /javascript:/i, name: "javascript_protocol" },
    { pattern: /on\w+\s*=/i, name: "event_handler" },
    { pattern: /data:/i, name: "data_protocol" },
    { pattern: /vbscript:/i, name: "vbscript_protocol" },
    { pattern: /expression\s*\(/i, name: "css_expression" },
    { pattern: /<iframe/i, name: "iframe_tag" },
    { pattern: /<object/i, name: "object_tag" },
    { pattern: /<embed/i, name: "embed_tag" },
    { pattern: /<form/i, name: "form_tag" },
    { pattern: /document\.(cookie|domain|write)/i, name: "document_access" },
    { pattern: /window\.(location|open)/i, name: "window_access" },
    { pattern: /eval\s*\(/i, name: "eval_call" },
    { pattern: /Function\s*\(/i, name: "function_constructor" },
  ];

  for (const check of checks) {
    if (check.pattern.test(content)) {
      patterns.push(check.name);
    }
  }

  return {
    hasMaliciousPatterns: patterns.length > 0,
    patterns,
  };
}

// ============================================================================
// Password Security
// ============================================================================

/**
 * Password strength requirements
 */
export interface PasswordStrengthResult {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

/**
 * Check password strength
 *
 * @param password - Password to check
 * @returns Password strength result
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("Password should be at least 8 characters long");
  }

  if (password.length >= 12) {
    score++;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Number check
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push("Add numbers");
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push("Add special characters");
  }

  // Common patterns check
  const commonPatterns = [
    /^123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /letmein/i,
    /welcome/i,
    /admin/i,
    /login/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push("Avoid common password patterns");
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.floor(score * 0.67));

  return {
    score: normalizedScore,
    feedback,
    isStrong: normalizedScore >= 3,
  };
}


