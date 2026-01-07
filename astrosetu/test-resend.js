// Minimal Resend test (no app involved)
// This proves Resend + DNS works independently
// Run: node test-resend.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'AstroSetu AI <no-reply@mindveda.net>',
  to: ['your_personal_email@gmail.com'], // Replace with your email
  subject: 'Resend test — AstroSetu',
  html: '<strong>If you see this, Resend works 🎉</strong>',
});

console.log('Sent');

