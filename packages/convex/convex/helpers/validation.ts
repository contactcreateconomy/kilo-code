// ============================================================================
// Re-exports from lib/security.ts (single source of truth)
//
// The following were previously duplicated in this file. They now live in
// lib/security.ts and are re-exported here for backward compatibility.
// ============================================================================

export {
  // Rate limiting
  type RateLimitConfig,
  type RateLimitResult,
  checkRateLimit,
  checkRateLimitWithDb,
  rateLimitConfigs as rateLimits,

  // Injection detection
  hasSqlInjectionPatterns,
  hasNoSqlInjectionPatterns,

  // Database sanitization
  sanitizeForDatabase,
} from "../lib/security";

import {
  hasSqlInjectionPatterns as _hasSqlInjectionPatterns,
  hasNoSqlInjectionPatterns as _hasNoSqlInjectionPatterns,
} from "../lib/security";

/**
 * Input Validation Helpers
 *
 * Utility functions for validating and sanitizing user input
 * in the Createconomy platform.
 *
 * Security-related utilities (rate limiting, injection detection,
 * database sanitization) are maintained in lib/security.ts and
 * re-exported above for backward compatibility.
 */

// ============================================================================
// String Validation
// ============================================================================

/**
 * Sanitize a string by removing potentially dangerous characters
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate email format with comprehensive checks
 *
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional checks
  if (email.length > 254) return false; // Max email length per RFC
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return false;
  if (localPart.length > 64) return false; // Max local part length
  if (domain.length > 253) return false; // Max domain length
  
  // Check for consecutive dots
  if (/\.\./.test(email)) return false;
  
  // Check domain has at least one dot
  if (!domain.includes(".")) return false;
  
  return true;
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns True if valid URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate URL with allowed protocols
 *
 * @param url - URL to validate
 * @param allowedProtocols - Allowed protocols (default: http, https)
 * @returns True if valid URL with allowed protocol
 */
export function isValidHttpUrl(url: string, allowedProtocols: string[] = ["http:", "https:"]): boolean {
  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate slug format (lowercase, alphanumeric, hyphens)
 *
 * @param slug - Slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Generate a slug from a string
 *
 * @param input - String to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

/**
 * Validate string length
 *
 * @param input - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if within bounds
 */
export function isValidLength(input: string, min: number, max: number): boolean {
  return input.length >= min && input.length <= max;
}

// ============================================================================
// Number Validation
// ============================================================================

/**
 * Validate that a number is positive
 *
 * @param value - Number to validate
 * @returns True if positive
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Validate that a number is non-negative
 *
 * @param value - Number to validate
 * @returns True if non-negative
 */
export function isNonNegative(value: number): boolean {
  return value >= 0;
}

/**
 * Validate that a number is within a range
 *
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate that a number is a valid price (non-negative, max 2 decimal places)
 *
 * @param value - Number to validate
 * @returns True if valid price
 */
export function isValidPrice(value: number): boolean {
  if (value < 0) return false;
  const decimalPlaces = (value.toString().split(".")[1] || "").length;
  return decimalPlaces <= 2;
}

/**
 * Validate that a number is a valid rating (1-5)
 *
 * @param value - Number to validate
 * @returns True if valid rating
 */
export function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

// ============================================================================
// Array Validation
// ============================================================================

/**
 * Validate array length
 *
 * @param arr - Array to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if within bounds
 */
export function isValidArrayLength<T>(arr: T[], min: number, max: number): boolean {
  return arr.length >= min && arr.length <= max;
}

/**
 * Remove duplicates from an array
 *
 * @param arr - Array to deduplicate
 * @returns Array with unique values
 */
export function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ============================================================================
// Content Validation
// ============================================================================

/**
 * Check if content contains profanity (basic check)
 * In production, use a proper profanity filter library
 *
 * @param content - Content to check
 * @returns True if contains profanity
 */
export function containsProfanity(content: string): boolean {
  // This is a placeholder - in production, use a proper profanity filter
  const basicProfanityList = ["spam", "scam"]; // Add actual words
  const lowerContent = content.toLowerCase();
  return basicProfanityList.some((word) => lowerContent.includes(word));
}

/**
 * Check if content contains URLs
 *
 * @param content - Content to check
 * @returns True if contains URLs
 */
export function containsUrls(content: string): boolean {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  return urlRegex.test(content);
}

/**
 * Strip HTML tags from content
 *
 * @param content - Content to strip
 * @returns Content without HTML tags
 */
export function stripHtml(content: string): string {
  return content.replace(/<[^>]*>/g, "");
}

// ============================================================================
// Validation Error Helpers
// ============================================================================

/**
 * Validation error class
 */
export class ValidationError extends Error {
  public field: string;
  public code: string;

  constructor(field: string, message: string, code: string = "VALIDATION_ERROR") {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.code = code;
  }
}

/**
 * Throw a validation error if condition is false
 *
 * @param condition - Condition to check
 * @param field - Field name
 * @param message - Error message
 */
export function assertValid(
  condition: boolean,
  field: string,
  message: string
): asserts condition {
  if (!condition) {
    throw new ValidationError(field, message);
  }
}

/**
 * Validate required field
 *
 * @param value - Value to check
 * @param field - Field name
 */
export function assertRequired<T>(
  value: T | null | undefined,
  field: string
): asserts value is T {
  if (value === null || value === undefined || value === "") {
    throw new ValidationError(field, `${field} is required`, "REQUIRED");
  }
}

/**
 * Validate input is safe for database operations
 *
 * Re-exports injection checks from lib/security.ts and wraps them
 * in a ValidationError throw for backward compatibility.
 *
 * @param input - Input to validate
 * @param fieldName - Field name for error messages
 * @throws ValidationError if input contains injection patterns
 */
export function assertSafeForDatabase(input: string, fieldName: string): void {
  if (_hasSqlInjectionPatterns(input)) {
    throw new ValidationError(
      fieldName,
      "Input contains potentially dangerous patterns",
      "INJECTION_DETECTED"
    );
  }

  if (_hasNoSqlInjectionPatterns(input)) {
    throw new ValidationError(
      fieldName,
      "Input contains potentially dangerous patterns",
      "INJECTION_DETECTED"
    );
  }
}

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * User roles in order of privilege
 */
export const roleHierarchy = ["customer", "seller", "moderator", "admin"] as const;

type UserRole = typeof roleHierarchy[number];

/**
 * Check if a role has at least the specified privilege level
 *
 * @param userRole - User's current role
 * @param requiredRole - Minimum required role
 * @returns True if user has sufficient privileges
 */
export function hasMinimumRole(
  userRole: string,
  requiredRole: string
): boolean {
  const userIndex = roleHierarchy.indexOf(userRole as UserRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole as UserRole);

  if (userIndex === -1 || requiredIndex === -1) {
    return false;
  }

  return userIndex >= requiredIndex;
}

/**
 * Check if user can perform an action on a resource
 *
 * @param userId - User performing the action
 * @param resourceOwnerId - Owner of the resource
 * @param userRole - User's role
 * @param allowedRoles - Roles that can perform the action regardless of ownership
 * @returns True if action is allowed
 */
export function canPerformAction(
  userId: string,
  resourceOwnerId: string,
  userRole: string,
  allowedRoles: string[] = ["admin", "moderator"]
): boolean {
  // Owner can always perform action on their own resource
  if (userId === resourceOwnerId) {
    return true;
  }

  // Check if user has an allowed role
  return allowedRoles.includes(userRole);
}

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Password strength requirements
 */
export interface PasswordStrengthResult {
  /** Strength score (0-4) */
  score: number;
  /** Whether password meets minimum requirements */
  isValid: boolean;
  /** Feedback messages */
  feedback: string[];
  /** Detailed checks */
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    noCommonPatterns: boolean;
  };
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @param options - Validation options
 * @returns Password strength result
 */
export function validatePasswordStrength(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  } = {}
): PasswordStrengthResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = true,
  } = options;

  const feedback: string[] = [];
  let score = 0;

  const checks = {
    minLength: password.length >= minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !hasCommonPasswordPatterns(password),
  };

  // Check minimum length
  if (checks.minLength) {
    score++;
    if (password.length >= 12) score++; // Bonus for longer passwords
  } else {
    feedback.push(`Password must be at least ${minLength} characters`);
  }

  // Check uppercase
  if (checks.hasUppercase) {
    score++;
  } else if (requireUppercase) {
    feedback.push("Add uppercase letters");
  }

  // Check lowercase
  if (checks.hasLowercase) {
    score++;
  } else if (requireLowercase) {
    feedback.push("Add lowercase letters");
  }

  // Check numbers
  if (checks.hasNumber) {
    score++;
  } else if (requireNumber) {
    feedback.push("Add numbers");
  }

  // Check special characters
  if (checks.hasSpecialChar) {
    score++;
  } else if (requireSpecialChar) {
    feedback.push("Add special characters (!@#$%^&*...)");
  }

  // Check common patterns
  if (!checks.noCommonPatterns) {
    score = Math.max(0, score - 2);
    feedback.push("Avoid common password patterns");
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.floor(score * 0.6));

  // Determine if valid based on requirements
  const isValid =
    checks.minLength &&
    (!requireUppercase || checks.hasUppercase) &&
    (!requireLowercase || checks.hasLowercase) &&
    (!requireNumber || checks.hasNumber) &&
    (!requireSpecialChar || checks.hasSpecialChar) &&
    checks.noCommonPatterns;

  return {
    score: normalizedScore,
    isValid,
    feedback,
    checks,
  };
}

/**
 * Check for common password patterns
 *
 * @param password - Password to check
 * @returns True if common patterns found
 */
function hasCommonPasswordPatterns(password: string): boolean {
  const lowerPassword = password.toLowerCase();

  const commonPatterns = [
    // Sequential numbers
    "123456",
    "654321",
    "12345678",
    "123456789",
    // Sequential letters
    "abcdef",
    "qwerty",
    "asdfgh",
    // Common words
    "password",
    "letmein",
    "welcome",
    "admin",
    "login",
    "master",
    "dragon",
    "monkey",
    "shadow",
    "sunshine",
    "princess",
    "football",
    "baseball",
    "iloveyou",
    "trustno1",
    // Keyboard patterns
    "qwerty",
    "qwertyuiop",
    "zxcvbn",
    // Repeated characters
    "aaaaaa",
    "111111",
    "000000",
  ];

  return commonPatterns.some((pattern) => lowerPassword.includes(pattern));
}

// ============================================================================
// File Validation
// ============================================================================

/**
 * Allowed file types by category
 */
export const allowedFileTypes = {
  images: {
    mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"],
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  documents: {
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    extensions: [".pdf", ".doc", ".docx", ".txt"],
    maxSize: 25 * 1024 * 1024, // 25MB
  },
  archives: {
    mimeTypes: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed"],
    extensions: [".zip", ".rar", ".7z"],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  code: {
    mimeTypes: ["text/plain", "application/json", "text/javascript", "text/css", "text/html"],
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".html", ".json", ".md"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

/**
 * Validate file type
 *
 * @param mimeType - File MIME type
 * @param fileName - File name
 * @param category - File category to validate against
 * @returns True if file type is allowed
 */
export function isValidFileType(
  mimeType: string,
  fileName: string,
  category: keyof typeof allowedFileTypes
): boolean {
  const config = allowedFileTypes[category];
  if (!config) return false;

  // Check MIME type
  if (!config.mimeTypes.includes(mimeType)) {
    return false;
  }

  // Check extension
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  if (!config.extensions.includes(extension)) {
    return false;
  }

  return true;
}

/**
 * Validate file size
 *
 * @param size - File size in bytes
 * @param category - File category to validate against
 * @returns True if file size is within limits
 */
export function isValidFileSize(
  size: number,
  category: keyof typeof allowedFileTypes
): boolean {
  const config = allowedFileTypes[category];
  if (!config) return false;

  return size <= config.maxSize;
}

/**
 * Validate file
 *
 * @param file - File info to validate
 * @param category - File category
 * @returns Validation result
 */
export function validateFile(
  file: { mimeType: string; name: string; size: number },
  category: keyof typeof allowedFileTypes
): { valid: boolean; error?: string } {
  const config = allowedFileTypes[category];
  if (!config) {
    return { valid: false, error: "Invalid file category" };
  }

  if (!isValidFileType(file.mimeType, file.name, category)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${config.extensions.join(", ")}`,
    };
  }

  if (!isValidFileSize(file.size, category)) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

// ============================================================================
// Username Validation
// ============================================================================

/**
 * Validate username format
 *
 * @param username - Username to validate
 * @returns Validation result
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  // Length check
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (username.length > 30) {
    return { valid: false, error: "Username must be at most 30 characters" };
  }

  // Format check (alphanumeric, underscores, hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }

  // Must start with a letter
  if (!/^[a-zA-Z]/.test(username)) {
    return { valid: false, error: "Username must start with a letter" };
  }

  // Reserved usernames
  const reserved = [
    "admin",
    "administrator",
    "root",
    "system",
    "moderator",
    "mod",
    "support",
    "help",
    "api",
    "www",
    "mail",
    "email",
    "null",
    "undefined",
    "anonymous",
  ];
  if (reserved.includes(username.toLowerCase())) {
    return { valid: false, error: "This username is reserved" };
  }

  return { valid: true };
}

// ============================================================================
// Phone Number Validation
// ============================================================================

/**
 * Validate phone number format
 *
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  // Check for valid phone number pattern
  // Supports international format with + prefix
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Format phone number for storage
 *
 * @param phone - Phone number to format
 * @returns Formatted phone number (E.164 format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  const hasPlus = phone.startsWith("+");
  const digits = phone.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}
