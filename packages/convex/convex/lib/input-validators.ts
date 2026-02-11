/**
 * Input Validation Utilities
 *
 * Provides string, number, email, and URL validation for the Createconomy platform.
 * Extracted from security.ts for Single Responsibility Principle compliance.
 *
 * @module
 */

// ============================================================================
// String Validation
// ============================================================================

/**
 * Validate and sanitize a string input
 *
 * @param input - Input string
 * @param options - Validation options
 * @returns Sanitized string
 * @throws Error if validation fails
 */
export function validateString(
  input: unknown,
  options: {
    fieldName: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  }
): string {
  const { fieldName, minLength = 0, maxLength = 10000, pattern, required = true } = options;

  if (input === null || input === undefined || input === "") {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return "";
  }

  if (typeof input !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = input.trim();

  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be at most ${maxLength} characters`);
  }

  if (pattern && !pattern.test(trimmed)) {
    throw new Error(`${fieldName} has an invalid format`);
  }

  return trimmed;
}

// ============================================================================
// Number Validation
// ============================================================================

/**
 * Validate a numeric input
 *
 * @param input - Input value
 * @param options - Validation options
 * @returns Validated number
 * @throws Error if validation fails
 */
export function validateNumber(
  input: unknown,
  options: {
    fieldName: string;
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  }
): number {
  const { fieldName, min, max, integer = false, required = true } = options;

  if (input === null || input === undefined) {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return 0;
  }

  const num = typeof input === "string" ? parseFloat(input) : input;

  if (typeof num !== "number" || isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (integer && !Number.isInteger(num)) {
    throw new Error(`${fieldName} must be an integer`);
  }

  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }

  return num;
}

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validate an email address
 *
 * @param email - Email to validate
 * @returns Validated email (lowercase)
 * @throws Error if invalid
 */
export function validateEmail(email: unknown): string {
  const validated = validateString(email, {
    fieldName: "Email",
    maxLength: 254,
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(validated)) {
    throw new Error("Invalid email format");
  }

  return validated.toLowerCase();
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Validate a URL
 *
 * @param url - URL to validate
 * @param options - Validation options
 * @returns Validated URL
 * @throws Error if invalid
 */
export function validateUrl(
  url: unknown,
  options: {
    required?: boolean;
    allowedProtocols?: string[];
  } = {}
): string {
  const { required = true, allowedProtocols = ["http:", "https:"] } = options;

  const validated = validateString(url, {
    fieldName: "URL",
    maxLength: 2048,
    required,
  });

  if (!validated) {
    return "";
  }

  try {
    const parsed = new URL(validated);
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error(`URL must use one of: ${allowedProtocols.join(", ")}`);
    }
    return parsed.href;
  } catch {
    throw new Error("Invalid URL format");
  }
}
