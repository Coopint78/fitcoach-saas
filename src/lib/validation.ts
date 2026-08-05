import { getSafeErrorMessage } from "@/lib/error-safe";

// UUID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export function validateUUID(value: unknown, fieldName: string): string {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid ${fieldName}: must be a valid UUID`);
  }
  return value;
}

export { getSafeErrorMessage };

// Email validation
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// String length validation
export function validateStringLength(
  value: unknown,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 255
): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.length < minLength || value.length > maxLength) {
    throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
  }
  return value;
}

// Number validation
export function validateNumber(value: unknown, fieldName: string, min?: number, max?: number): number {
  const num = typeof value === "number" ? value : typeof value === "string" ? parseInt(value, 10) : NaN;
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }
  return num;
}
