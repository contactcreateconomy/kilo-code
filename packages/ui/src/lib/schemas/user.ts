/**
 * User Validation Schemas
 *
 * Zod schemas for user-related data validation.
 */

import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const BIO_MAX_LENGTH = 500;

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Email schema with validation
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(254, "Email is too long")
  .toLowerCase()
  .trim();

/**
 * Password schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

/**
 * Simple password schema (less strict)
 */
export const simplePasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`);

/**
 * Username schema
 */
export const usernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters`)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  )
  .regex(/^[a-zA-Z]/, "Username must start with a letter")
  .toLowerCase()
  .trim();

/**
 * Display name schema
 */
export const displayNameSchema = z
  .string()
  .min(1, "Display name is required")
  .max(50, "Display name must be at most 50 characters")
  .trim();

/**
 * Bio schema
 */
export const bioSchema = z
  .string()
  .max(BIO_MAX_LENGTH, `Bio must be at most ${BIO_MAX_LENGTH} characters`)
  .optional();

/**
 * Avatar URL schema
 */
export const avatarUrlSchema = z
  .string()
  .url("Invalid avatar URL")
  .optional()
  .or(z.literal(""));

// ============================================================================
// User Registration Schema
// ============================================================================

export const userRegistrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    username: usernameSchema,
    displayName: displayNameSchema.optional(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

// ============================================================================
// User Login Schema
// ============================================================================

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

// ============================================================================
// User Profile Update Schema
// ============================================================================

export const userProfileUpdateSchema = z.object({
  displayName: displayNameSchema.optional(),
  bio: bioSchema,
  avatarUrl: avatarUrlSchema,
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  location: z.string().max(100, "Location is too long").optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
});

export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;

// ============================================================================
// Password Change Schema
// ============================================================================

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data: { newPassword: string; confirmNewPassword: string }) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data: { currentPassword: string; newPassword: string }) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type PasswordChange = z.infer<typeof passwordChangeSchema>;

// ============================================================================
// Password Reset Schema
// ============================================================================

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data: { newPassword: string; confirmNewPassword: string }) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type PasswordReset = z.infer<typeof passwordResetSchema>;

// ============================================================================
// Email Verification Schema
// ============================================================================

export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type EmailVerification = z.infer<typeof emailVerificationSchema>;

// ============================================================================
// User Settings Schema
// ============================================================================

export const userSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;
