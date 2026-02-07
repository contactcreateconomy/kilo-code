export interface ValidationRules {
  /** Minimum username length. Defaults to 3 */
  minUsernameLength?: number;
  /** Minimum password length. Defaults to 8 */
  minPasswordLength?: number;
  /** Whether terms agreement is required. Defaults to true */
  requireTermsAgreement?: boolean;
}

export interface ValidationResult {
  /** Whether the data is valid */
  isValid: boolean;
  /** Error message if invalid, null if valid */
  error: string | null;
}

/**
 * Validate sign-up form data.
 *
 * Rules match the forum app's validation:
 * - Username ≥ 3 chars (if present)
 * - Password ≥ 8 chars
 * - Confirm password must match
 * - Terms must be agreed to
 */
export function validateSignUpForm(
  data: {
    username?: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
  },
  rules?: ValidationRules
): ValidationResult {
  const minUsernameLength = rules?.minUsernameLength ?? 3;
  const minPasswordLength = rules?.minPasswordLength ?? 8;
  const requireTermsAgreement = rules?.requireTermsAgreement ?? true;

  if (data.username !== undefined && data.username.length < minUsernameLength) {
    return {
      isValid: false,
      error: `Username must be at least ${minUsernameLength} characters`,
    };
  }

  if (data.password.length < minPasswordLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minPasswordLength} characters`,
    };
  }

  if (data.password !== data.confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match",
    };
  }

  if (requireTermsAgreement && !data.agreedToTerms) {
    return {
      isValid: false,
      error: "You must agree to the Terms of Service and Privacy Policy",
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate sign-in form data.
 *
 * Basic validation — email format is handled by HTML5 native validation.
 */
export function validateSignInForm(data: {
  email: string;
  password: string;
}): ValidationResult {
  if (!data.email.trim()) {
    return {
      isValid: false,
      error: "Email is required",
    };
  }

  if (!data.password) {
    return {
      isValid: false,
      error: "Password is required",
    };
  }

  return { isValid: true, error: null };
}
