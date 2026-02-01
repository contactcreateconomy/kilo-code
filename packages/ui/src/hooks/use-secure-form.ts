"use client";

/**
 * Secure Form Hook
 *
 * Provides secure form handling with CSRF protection, input sanitization,
 * validation integration, and error handling for the Createconomy platform.
 */

import { useState, useCallback, useEffect, type FormEvent, type ChangeEvent } from "react";
import { getCsrfToken, validateCsrfToken, sanitizeInput, encodeHtmlEntities } from "@/lib/security";

// ============================================================================
// Types
// ============================================================================

export interface FieldConfig<T> {
  /** Initial value */
  initialValue: T;
  /** Validation function */
  validate?: (value: T, allValues: Record<string, unknown>) => string | null;
  /** Transform function applied before validation */
  transform?: (value: T) => T;
  /** Whether to sanitize string inputs */
  sanitize?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Custom required message */
  requiredMessage?: string;
}

export interface FormConfig<T extends Record<string, unknown>> {
  /** Field configurations */
  fields: { [K in keyof T]: FieldConfig<T[K]> };
  /** Form submission handler */
  onSubmit: (values: T, helpers: FormHelpers<T>) => Promise<void> | void;
  /** Called when validation fails */
  onValidationError?: (errors: FormErrors<T>) => void;
  /** Called when submission fails */
  onSubmitError?: (error: Error) => void;
  /** Called when submission succeeds */
  onSubmitSuccess?: () => void;
  /** Whether to include CSRF token */
  csrf?: boolean;
  /** Whether to reset form after successful submission */
  resetOnSuccess?: boolean;
  /** Debounce validation (ms) */
  validateDebounce?: number;
}

export interface FormState<T extends Record<string, unknown>> {
  /** Current form values */
  values: T;
  /** Field errors */
  errors: FormErrors<T>;
  /** Fields that have been touched */
  touched: FormTouched<T>;
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been submitted at least once */
  isSubmitted: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form has been modified */
  isDirty: boolean;
  /** CSRF token */
  csrfToken: string;
}

export type FormErrors<T> = { [K in keyof T]?: string };
export type FormTouched<T> = { [K in keyof T]?: boolean };

export interface FormHelpers<T extends Record<string, unknown>> {
  /** Set a specific field value */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Set a specific field error */
  setFieldError: <K extends keyof T>(field: K, error: string | null) => void;
  /** Set a specific field as touched */
  setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  /** Reset form to initial values */
  resetForm: () => void;
  /** Set all values */
  setValues: (values: Partial<T>) => void;
  /** Set all errors */
  setErrors: (errors: FormErrors<T>) => void;
  /** Validate all fields */
  validateForm: () => boolean;
  /** Validate a specific field */
  validateField: <K extends keyof T>(field: K) => string | null;
}

export interface UseSecureFormReturn<T extends Record<string, unknown>>
  extends FormState<T>,
    FormHelpers<T> {
  /** Handle form submission */
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
  /** Handle input change */
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** Handle input blur */
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** Get field props for an input */
  getFieldProps: <K extends keyof T>(
    field: K
  ) => {
    name: K;
    value: T[K];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
  /** Get field meta information */
  getFieldMeta: <K extends keyof T>(
    field: K
  ) => {
    error: string | undefined;
    touched: boolean;
    hasError: boolean;
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Secure Form Hook
 *
 * @param config - Form configuration
 * @returns Form state and helpers
 *
 * @example
 * ```tsx
 * const form = useSecureForm({
 *   fields: {
 *     email: { initialValue: '', validate: validateEmail, required: true },
 *     password: { initialValue: '', validate: validatePassword, required: true },
 *   },
 *   onSubmit: async (values) => {
 *     await login(values.email, values.password);
 *   },
 *   csrf: true,
 * });
 *
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     <input {...form.getFieldProps('email')} type="email" />
 *     {form.getFieldMeta('email').hasError && (
 *       <span>{form.getFieldMeta('email').error}</span>
 *     )}
 *     <input {...form.getFieldProps('password')} type="password" />
 *     <button type="submit" disabled={form.isSubmitting}>
 *       {form.isSubmitting ? 'Submitting...' : 'Submit'}
 *     </button>
 *   </form>
 * );
 * ```
 */
export function useSecureForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseSecureFormReturn<T> {
  const {
    fields,
    onSubmit,
    onValidationError,
    onSubmitError,
    onSubmitSuccess,
    csrf = true,
    resetOnSuccess = false,
  } = config;

  // Get initial values from field configs
  const getInitialValues = useCallback((): T => {
    const values = {} as T;
    for (const key of Object.keys(fields) as Array<keyof T>) {
      values[key] = fields[key].initialValue;
    }
    return values;
  }, [fields]);

  // State
  const [values, setValues] = useState<T>(getInitialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  // Initialize CSRF token
  useEffect(() => {
    if (csrf) {
      setCsrfToken(getCsrfToken());
    }
  }, [csrf]);

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(field: K): string | null => {
      const fieldConfig = fields[field];
      let value = values[field];

      // Apply transform if defined
      if (fieldConfig.transform) {
        value = fieldConfig.transform(value);
      }

      // Check required
      if (fieldConfig.required) {
        const isEmpty =
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          return fieldConfig.requiredMessage || `${String(field)} is required`;
        }
      }

      // Run custom validation
      if (fieldConfig.validate) {
        return fieldConfig.validate(value, values as Record<string, unknown>);
      }

      return null;
    },
    [fields, values]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    for (const key of Object.keys(fields) as Array<keyof T>) {
      const error = validateField(key);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [fields, validateField]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Check if form is dirty
  const isDirty = Object.keys(fields).some((key) => {
    const k = key as keyof T;
    return values[k] !== fields[k].initialValue;
  });

  // Set a single field value
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set a single field error
  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const { [field]: _, ...rest } = prev;
        return rest as FormErrors<T>;
      }
      return { ...prev, [field]: error };
    });
  }, []);

  // Set a single field as touched
  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(getInitialValues());
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    if (csrf) {
      setCsrfToken(getCsrfToken());
    }
  }, [getInitialValues, csrf]);

  // Set all values
  const setAllValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set all errors
  const setAllErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrors(newErrors);
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const field = name as keyof T;
      const fieldConfig = fields[field];

      let processedValue: unknown = value;

      // Handle checkbox
      if (type === "checkbox" && e.target instanceof HTMLInputElement) {
        processedValue = e.target.checked;
      }

      // Handle number
      if (type === "number") {
        processedValue = value === "" ? "" : parseFloat(value);
      }

      // Sanitize string inputs if configured
      if (fieldConfig?.sanitize && typeof processedValue === "string") {
        processedValue = sanitizeInput(processedValue);
      }

      setFieldValue(field, processedValue as T[keyof T]);

      // Clear error on change
      if (errors[field]) {
        setFieldError(field, null);
      }
    },
    [fields, errors, setFieldValue, setFieldError]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const field = name as keyof T;

      setFieldTouched(field, true);

      // Validate on blur
      const error = validateField(field);
      if (error) {
        setFieldError(field, error);
      }
    },
    [setFieldTouched, validateField, setFieldError]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitted(true);

      // Mark all fields as touched
      const allTouched: FormTouched<T> = {};
      for (const key of Object.keys(fields) as Array<keyof T>) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      // Validate form
      const formIsValid = validateForm();
      if (!formIsValid) {
        onValidationError?.(errors);
        return;
      }

      // Validate CSRF token if enabled
      if (csrf && !validateCsrfToken(csrfToken)) {
        const csrfError = new Error("Invalid CSRF token. Please refresh the page and try again.");
        onSubmitError?.(csrfError);
        return;
      }

      setIsSubmitting(true);

      try {
        // Prepare values with sanitization
        const sanitizedValues = { ...values };
        for (const key of Object.keys(fields) as Array<keyof T>) {
          const fieldConfig = fields[key];
          let value = sanitizedValues[key];

          // Apply transform
          if (fieldConfig.transform) {
            value = fieldConfig.transform(value);
            sanitizedValues[key] = value;
          }

          // Encode HTML entities for string values
          if (typeof value === "string") {
            sanitizedValues[key] = encodeHtmlEntities(value) as T[keyof T];
          }
        }

        await onSubmit(sanitizedValues, {
          setFieldValue,
          setFieldError,
          setFieldTouched,
          resetForm,
          setValues: setAllValues,
          setErrors: setAllErrors,
          validateForm,
          validateField,
        });

        onSubmitSuccess?.();

        if (resetOnSuccess) {
          resetForm();
        }
      } catch (error) {
        onSubmitError?.(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      fields,
      values,
      errors,
      csrf,
      csrfToken,
      validateForm,
      onSubmit,
      onValidationError,
      onSubmitError,
      onSubmitSuccess,
      resetOnSuccess,
      resetForm,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setAllValues,
      setAllErrors,
      validateField,
    ]
  );

  // Get field props
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => ({
      name: field,
      value: values[field],
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  // Get field meta
  const getFieldMeta = useCallback(
    <K extends keyof T>(field: K) => ({
      error: errors[field],
      touched: touched[field] || false,
      hasError: Boolean(errors[field]) && (touched[field] || isSubmitted),
    }),
    [errors, touched, isSubmitted]
  );

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    isValid,
    isDirty,
    csrfToken,

    // Helpers
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    setValues: setAllValues,
    setErrors: setAllErrors,
    validateForm,
    validateField,

    // Handlers
    handleSubmit,
    handleChange,
    handleBlur,
    getFieldProps,
    getFieldMeta,
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Create a required field validator
 */
export function required(message = "This field is required") {
  return (value: unknown): string | null => {
    if (value === null || value === undefined || value === "") {
      return message;
    }
    if (Array.isArray(value) && value.length === 0) {
      return message;
    }
    return null;
  };
}

/**
 * Create a minimum length validator
 */
export function minLength(min: number, message?: string) {
  return (value: string): string | null => {
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  };
}

/**
 * Create a maximum length validator
 */
export function maxLength(max: number, message?: string) {
  return (value: string): string | null => {
    if (value.length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return null;
  };
}

/**
 * Create an email validator
 */
export function email(message = "Invalid email address") {
  return (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  };
}

/**
 * Create a pattern validator
 */
export function pattern(regex: RegExp, message = "Invalid format") {
  return (value: string): string | null => {
    if (!regex.test(value)) {
      return message;
    }
    return null;
  };
}

/**
 * Create a number range validator
 */
export function numberRange(min: number, max: number, message?: string) {
  return (value: number): string | null => {
    if (value < min || value > max) {
      return message || `Must be between ${min} and ${max}`;
    }
    return null;
  };
}

/**
 * Combine multiple validators
 */
export function composeValidators<T>(
  ...validators: Array<(value: T, allValues: Record<string, unknown>) => string | null>
) {
  return (value: T, allValues: Record<string, unknown>): string | null => {
    for (const validator of validators) {
      const error = validator(value, allValues);
      if (error) {
        return error;
      }
    }
    return null;
  };
}

/**
 * Create a field match validator (e.g., password confirmation)
 */
export function matchField<T extends Record<string, unknown>>(
  fieldName: keyof T,
  message = "Fields do not match"
) {
  return (value: unknown, allValues: T): string | null => {
    if (value !== allValues[fieldName]) {
      return message;
    }
    return null;
  };
}
