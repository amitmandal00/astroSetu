/**
 * Razorpay Payment Gateway Integration
 * Handles order creation and payment verification
 */

import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || "";

// Check if Razorpay is configured
export const isRazorpayConfigured = () => !!RAZORPAY_KEY_ID && !!RAZORPAY_SECRET;

// Get Razorpay instance
export function getRazorpayInstance() {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET in .env.local");
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET,
  });
}

// Get public key ID for client-side
export function getRazorpayKeyId() {
  return RAZORPAY_KEY_ID;
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(amount: number, currency: string = "INR", receipt?: string) {
  const razorpay = getRazorpayInstance();
  const amountPaise = Math.round(amount * 100); // Convert to paise

  const options = {
    amount: amountPaise,
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes: {
      source: "astrosetu",
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error: any) {
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!isRazorpayConfigured()) {
    // In development without Razorpay, allow test payments
    return true;
  }

  const crypto = require("crypto");
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(text)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string) {
  const razorpay = getRazorpayInstance();
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error: any) {
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
}

