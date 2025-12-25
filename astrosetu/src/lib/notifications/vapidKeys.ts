/**
 * VAPID Key Generation Utility
 * 
 * This file provides utilities for generating VAPID keys for web push notifications.
 * 
 * To generate VAPID keys, you can use the `web-push` npm package:
 * 
 * ```bash
 * npm install -g web-push
 * web-push generate-vapid-keys
 * ```
 * 
 * Or use this Node.js script:
 * ```javascript
 * const webpush = require('web-push');
 * const vapidKeys = webpush.generateVAPIDKeys();
 * console.log('Public Key:', vapidKeys.publicKey);
 * console.log('Private Key:', vapidKeys.privateKey);
 * ```
 * 
 * Add the keys to your `.env.local`:
 * ```
 * VAPID_PUBLIC_KEY=your_public_key_here
 * VAPID_PRIVATE_KEY=your_private_key_here
 * ```
 */

/**
 * Validate VAPID public key format
 * VAPID keys are URL-safe base64 strings
 */
export function isValidVAPIDKey(key: string): boolean {
  if (!key || typeof key !== "string") {
    return false;
  }

  // VAPID keys are typically 87 characters long (URL-safe base64)
  // They should only contain: A-Z, a-z, 0-9, -, _
  const vapidKeyPattern = /^[A-Za-z0-9_-]{80,90}$/;
  return vapidKeyPattern.test(key);
}

/**
 * Get VAPID public key from environment
 */
export function getVAPIDPublicKey(): string | null {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return null;
  }

  if (!isValidVAPIDKey(key)) {
    console.warn("VAPID_PUBLIC_KEY format may be invalid");
  }

  return key;
}

/**
 * Get VAPID private key from environment (server-side only!)
 */
export function getVAPIDPrivateKey(): string | null {
  const key = process.env.VAPID_PRIVATE_KEY;
  if (!key) {
    return null;
  }

  if (!isValidVAPIDKey(key)) {
    console.warn("VAPID_PRIVATE_KEY format may be invalid");
  }

  return key;
}
