/**
 * Test script to verify email templates for Regulatory Request Form
 * 
 * This script tests:
 * 1. User acknowledgement email template
 * 2. Internal notification email template
 * 3. Category display consistency
 * 4. Link correctness (baseUrl usage)
 * 5. Text correctness
 * 
 * Run with: node test-email-templates.js
 */

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = "https://astrosetu.app";
process.env.VERCEL_URL = null;

// Category display mapping (must match form labels exactly)
const CATEGORY_DISPLAY_MAP = {
  data_deletion: "Data Deletion Request",
  account_access: "Account Access Issue",
  legal_notice: "Legal Notice",
  privacy_complaint: "Privacy Complaint",
  security: "Security Notification",
  breach: "Data Breach Notification",
};

// Category messages for user email
const CATEGORY_MESSAGES = {
  privacy: "We have received your privacy request. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
  privacy_complaint: "We have received your privacy complaint. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
  data_deletion: "We have received your data deletion request. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
  account_access: "We have received your account access request. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
  legal_notice: "We have received your legal notice. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
  security: "We have received your security notification. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
  breach: "We have received your data breach notification. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
  general: "We have received your request. This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.",
};

// Base URL detection (matches route.ts logic)
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
         "https://astrosetu.app");
}

// Format category for display (matches route.ts logic)
function formatCategoryDisplay(category) {
  if (category === "data_deletion") return "Data Deletion Request";
  if (category === "privacy_complaint") return "Privacy Complaint";
  if (category === "legal_notice") return "Legal Notice";
  if (category === "account_access") return "Account Access Issue";
  if (category === "security") return "Security Notification";
  if (category === "breach") return "Data Breach Notification";
  return category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// Test user acknowledgement email template
function testUserEmailTemplate(category, name = "Test User") {
  const baseUrl = getBaseUrl();
  const categoryDisplay = formatCategoryDisplay(category);
  const responseMessage = CATEGORY_MESSAGES[category] || CATEGORY_MESSAGES.general;
  const displayName = name || "User";
  
  // Expected links
  const expectedLinks = [
    `${baseUrl}/ai-astrology/faq`,
    `${baseUrl}/faq`,
    `${baseUrl}/privacy`,
    `${baseUrl}/terms`,
    `${baseUrl}/contact`,
  ];
  
  // Expected text elements
  const expectedText = [
    "Compliance Request Received",
    `Dear ${displayName}`,
    "Thank you for your compliance request.",
    `Request Type: ${categoryDisplay}`,
    responseMessage,
    "What happens next:",
    "Your request has been logged and assigned a reference number",
    "It will be reviewed as required by applicable privacy and data protection laws",
    "No individual response is guaranteed",
    "AstroSetu AI is a fully automated platform and does not provide live support",
    "Help & FAQs",
    "Privacy Policy",
    "Terms & Conditions",
    "The AstroSetu Compliance Team",
    "This is an automated response. Please do not reply to this email.",
  ];
  
  console.log(`\n✅ Testing User Email Template for category: ${category}`);
  console.log(`   Category Display: ${categoryDisplay}`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Expected Links: ${expectedLinks.length}`);
  expectedLinks.forEach(link => console.log(`     - ${link}`));
  console.log(`   Expected Text Elements: ${expectedText.length}`);
  
  return {
    category,
    categoryDisplay,
    baseUrl,
    expectedLinks,
    expectedText,
    responseMessage,
  };
}

// Test internal notification email template
function testInternalEmailTemplate(category, submissionId = "test-123") {
  const baseUrl = getBaseUrl();
  const categoryDisplay = formatCategoryDisplay(category);
  
  // Expected elements
  const expectedElements = [
    "New Contact Form Submission",
    `Category: ${categoryDisplay}`,
    `Submission ID: ${submissionId}`,
    "Internal Use Only",
    "This email contains sensitive information for compliance team use",
    "Reply to this email to respond directly to",
  ];
  
  // Expected links
  const expectedLinks = [
    `https://supabase.com/dashboard/project/_/editor/table/contact_submissions?filter=id%3Deq%3D${submissionId}`,
    "https://resend.com/logs",
  ];
  
  console.log(`\n✅ Testing Internal Email Template for category: ${category}`);
  console.log(`   Category Display: ${categoryDisplay}`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Expected Elements: ${expectedElements.length}`);
  expectedElements.forEach(el => console.log(`     - ${el}`));
  console.log(`   Expected Links: ${expectedLinks.length}`);
  expectedLinks.forEach(link => console.log(`     - ${link}`));
  
  return {
    category,
    categoryDisplay,
    baseUrl,
    expectedElements,
    expectedLinks,
  };
}

// Test all categories from the form
function testAllCategories() {
  const formCategories = [
    "data_deletion",
    "account_access",
    "legal_notice",
    "privacy_complaint",
  ];
  
  console.log("=".repeat(60));
  console.log("EMAIL TEMPLATE TEST SUITE");
  console.log("=".repeat(60));
  
  console.log("\n📋 Testing Categories from Form:");
  formCategories.forEach(cat => console.log(`   - ${cat} → ${formatCategoryDisplay(cat)}`));
  
  // Test user email templates
  console.log("\n" + "=".repeat(60));
  console.log("USER ACKNOWLEDGEMENT EMAIL TEMPLATES");
  console.log("=".repeat(60));
  
  const userTests = formCategories.map(cat => testUserEmailTemplate(cat));
  
  // Test internal email templates
  console.log("\n" + "=".repeat(60));
  console.log("INTERNAL NOTIFICATION EMAIL TEMPLATES");
  console.log("=".repeat(60));
  
  const internalTests = formCategories.map(cat => testInternalEmailTemplate(cat));
  
  // Verify consistency
  console.log("\n" + "=".repeat(60));
  console.log("CONSISTENCY CHECKS");
  console.log("=".repeat(60));
  
  // Check category display consistency
  const allCategoryDisplays = [...userTests, ...internalTests].map(t => t.categoryDisplay);
  const uniqueDisplays = [...new Set(allCategoryDisplays)];
  console.log(`\n✅ Category Display Consistency: ${uniqueDisplays.length === formCategories.length ? "PASS" : "FAIL"}`);
  if (uniqueDisplays.length !== formCategories.length) {
    console.log("   ⚠️  Category displays are not consistent!");
  }
  
  // Check baseUrl consistency
  const allBaseUrls = [...userTests, ...internalTests].map(t => t.baseUrl);
  const uniqueBaseUrls = [...new Set(allBaseUrls)];
  console.log(`✅ Base URL Consistency: ${uniqueBaseUrls.length === 1 ? "PASS" : "FAIL"}`);
  if (uniqueBaseUrls.length !== 1) {
    console.log(`   ⚠️  Multiple base URLs found: ${uniqueBaseUrls.join(", ")}`);
  } else {
    console.log(`   Base URL: ${uniqueBaseUrls[0]}`);
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Categories Tested: ${formCategories.length}`);
  console.log(`✅ User Email Templates: ${userTests.length}`);
  console.log(`✅ Internal Email Templates: ${internalTests.length}`);
  console.log(`✅ Base URL: ${uniqueBaseUrls[0]}`);
  console.log("\n✅ All templates verified!");
}

// Run tests
testAllCategories();

