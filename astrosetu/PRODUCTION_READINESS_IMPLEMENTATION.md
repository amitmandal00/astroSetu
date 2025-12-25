# Production Readiness Implementation Plan

## Overview

This document tracks the implementation of production-ready features to ensure AstroSetu is ready for launch.

---

## 1. Accuracy & Astrology Correctness

### ✅ Completed
- [x] Ayanamsa setting (Lahiri = 1, default)
- [x] Timezone handling (Asia/Kolkata default)
- [x] Place → Coordinates lookup
- [x] Advanced Settings UI

### 🔄 In Progress
- [ ] Field-by-field validation framework
- [ ] Tolerance rules implementation
- [ ] Benchmark test suite vs AstroSage
- [ ] Dasha periods API route
- [ ] Enhanced Dosha API route

### 📋 To Do
- [ ] Lock calculation standards:
  - [ ] Ayanamsa: Lahiri (1) - default
  - [ ] House system: Placidus (default)
  - [ ] Node method: True Rahu-Ketu
- [ ] Verify timezone + DST edge cases
- [ ] Field-by-field validation:
  - [ ] Lagna sign/degree
  - [ ] Moon sign/degree
  - [ ] Nakshatra/Pada
  - [ ] Planet longitudes + house placements
  - [ ] Vimshottari Dasha (current/next + dates)
  - [ ] Manglik + Kaal Sarp + Sade Sati
- [ ] Define tolerance rules:
  - [ ] Degrees: ±1°
  - [ ] Dasha dates: ±7 days

---

## 2. Production API Architecture

### ✅ Completed
- [x] Server-side API routes (no client exposure)
- [x] Rate limiting (implemented in middleware)
- [x] Input validation (Zod schemas)
- [x] Error handling

### 🔄 In Progress
- [ ] Request ID logging
- [ ] Response caching (TTL 24h)
- [ ] API request/response logging

### 📋 To Do
- [ ] Add request ID to all API responses
- [ ] Implement Redis/memory cache for Kundli results
- [ ] Add structured logging (request ID, timestamp, endpoint)
- [ ] Cache key strategy (based on birth details hash)

---

## 3. Security & Compliance

### ✅ Completed
- [x] .env.local in .gitignore
- [x] Server-side only API calls
- [x] Input sanitization
- [x] Rate limiting

### 🔄 In Progress
- [ ] PII redaction in logs
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Astrology disclaimer

### 📋 To Do
- [ ] CI secret scanning (GitHub Actions / GitLab CI)
- [ ] Key rotation documentation
- [ ] PII redaction in error traces:
  - [ ] DOB/TOB masking
  - [ ] Place name redaction
- [ ] Legal documents:
  - [ ] Privacy Policy
  - [ ] Terms of Service
  - [ ] Astrology Disclaimer

---

## 4. Reliability & Performance

### ✅ Completed
- [x] Error handling in API routes
- [x] Timeout handling (implicit in fetch)

### 🔄 In Progress
- [ ] Health check endpoint
- [ ] Uptime monitoring setup
- [ ] Response time monitoring

### 📋 To Do
- [ ] Health check endpoint: `/api/health`
- [ ] Uptime monitoring (UptimeRobot / Pingdom)
- [ ] Timeout configuration for Prokerala API calls
- [ ] Retry logic with exponential backoff
- [ ] Graceful error states
- [ ] P95 response time target: ≤ 1.5s
- [ ] Performance monitoring (Sentry / DataDog)

---

## 5. App Store / Play Store Readiness

### 📋 To Do
- [ ] Store assets:
  - [ ] Logo (1024x1024)
  - [ ] Icon set (all sizes)
  - [ ] Screenshots (iOS/Android)
  - [ ] App description
  - [ ] Support URL/email
- [ ] Location permission justification
- [ ] Subscription/IAP:
  - [ ] Restore purchases
  - [ ] Receipt validation
  - [ ] Cancellation terms

---

## Immediate Launch Blockers

### 1. Place → Lat/Long Strategy ✅
- **Status:** Implemented
- **Details:**
  - AutocompleteInput returns coordinates
  - Coordinates stored in state
  - Passed to Prokerala API
  - Manual override available

### 2. Timezone Handling ✅
- **Status:** Implemented
- **Details:**
  - Default: Asia/Kolkata (IST)
  - User-selectable in Advanced Settings
  - Passed to Prokerala API
- **To Verify:** DST edge cases for non-India locations

### 3. Benchmark Testing ⏳
- **Status:** Framework created, needs execution
- **Test User:** Amit Kumar Mandal, DOB: 26 Nov 1984, TOB: 21:40, Place: Noamundi, Jharkhand
- **To Do:**
  - Run test-astrosage-accuracy.sh
  - Compare field-by-field
  - Fill Test Observation Report

---

## API Routes Status

### ✅ Implemented
- `POST /api/astrology/kundli` - Full implementation with Prokerala
- `POST /api/astrology/dosha` - Needs verification

### 🔄 Needs Implementation
- `POST /api/astrology/dasha` - Vimshottari Dasha periods

---

## Priority Order

### P0 (Launch Blockers)
1. ✅ Place → Coordinates (DONE)
2. ✅ Timezone handling (DONE)
3. ⏳ Benchmark testing (IN PROGRESS)
4. ⏳ Dasha API route (NEEDS IMPLEMENTATION)
5. ⏳ Enhanced Dosha API route (NEEDS VERIFICATION)

### P1 (Before Launch)
1. Request ID logging
2. Response caching
3. Health check endpoint
4. PII redaction in logs

### P2 (Post-Launch)
1. Uptime monitoring
2. Performance monitoring
3. Legal documents
4. App Store assets

---

**Last Updated:** $(date)

