/**
 * Comprehensive Server-Side Validation
 * All validation functions for API routes
 */

import { z } from "zod";
import { BirthDetailsSchema } from "./validators";

// Payment validation schemas
export const PaymentAmountSchema = z.object({
  amount: z.number().positive().max(1000000, "Amount exceeds maximum limit"),
  currency: z.enum(["INR"]).default("INR"),
  description: z.string().max(500).optional(),
});

export const RazorpayOrderSchema = PaymentAmountSchema.extend({
  serviceId: z.string().max(100).optional(),
  serviceName: z.string().max(200).optional(),
});

export const PaymentVerificationSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
});

// User profile validation
export const UserProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  email: z.string().email().max(255).optional(),
});

export const BirthDetailsUpdateSchema = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tob: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  place: z.string().min(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional()
});

// Auth validation schemas
export const RegisterSchema = z.object({
  email: z.string().email().max(255),
  // Password is optional in demo mode; when omitted the API generates
  // a temporary password. When present, enforce strong credentials.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number")
    .optional(),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email().max(255),
  // Password is optional in demo / magic-link style flows.
  // When omitted, the login route treats it as a passwordless demo login.
  password: z.string().min(1).max(100).optional(),
  rememberMe: z.boolean().optional(),
});

export const OTPRequestSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

export const OTPVerifySchema = OTPRequestSchema.extend({
  otp: z.string().length(6).regex(/^\d{6}$/),
});

// Chat validation
export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid().optional(),
});

// Report validation
export const ReportRequestSchema = z.object({
  type: z.enum(["life", "ascendant", "lalkitab", "dasha-phal", "sadesati", "varshphal", "babyname", "gochar", "general", "mangal-dosha", "love"]),
  kundliData: BirthDetailsSchema.optional(),
});

// Numeric validation helpers
export function validateNumericRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
}

export function validateDateRange(year: number, month: number, day: number): void {
  if (year < 1900 || year > 2100) {
    throw new Error("Year must be between 1900 and 2100");
  }
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  
  // Validate day based on month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    throw new Error(`Day must be between 1 and ${daysInMonth} for month ${month}`);
  }
}

export function validateTime(hours: number, minutes: number, seconds?: number): void {
  if (hours < 0 || hours > 23) {
    throw new Error("Hours must be between 0 and 23");
  }
  if (minutes < 0 || minutes > 59) {
    throw new Error("Minutes must be between 0 and 59");
  }
  if (seconds !== undefined && (seconds < 0 || seconds > 59)) {
    throw new Error("Seconds must be between 0 and 59");
  }
}

export function validatePlace(place: string): void {
  if (!place || place.trim().length < 2) {
    throw new Error("Place must be at least 2 characters");
  }
  if (place.length > 200) {
    throw new Error("Place name too long");
  }
}

// Sanitization helpers
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, "");
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 255);
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, "").slice(0, 20);
}

