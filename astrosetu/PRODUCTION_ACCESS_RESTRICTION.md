# 🔒 Production Access Restriction

**Purpose**: Restrict AI section access to only authorized test users during production testing and issue resolution.

---

## 🎯 **Authorized Users**

1. **Amit Kumar Mandal**
   - DOB: 1984-11-26
   - Time: 21:40
   - Place: Noamundi
   - Gender: Male

2. **Ankita Surabhi**
   - Name matching (flexible)

---

## ✅ **How It Works**

### **Activation**:
Set environment variable in Vercel:
```
NEXT_PUBLIC_RESTRICT_ACCESS=true
```

### **Access Check**:
- Checks user input (name, DOB, place) against allowed users
- Flexible name matching (contains/match)
- Returns 403 Forbidden if not authorized

### **Where Applied**:
- `/api/ai-astrology/generate-report` - Report generation endpoint

---

## 🔧 **Implementation**

### **File**: `src/lib/access-restriction.ts`
- Defines allowed users
- `isAllowedUser()` function
- `getRestrictionMessage()` function

### **File**: `src/app/api/ai-astrology/generate-report/route.ts`
- Checks access before processing report generation
- Logs restriction violations
- Returns 403 with error message

---

## 📋 **To Enable**

1. **Go to Vercel Dashboard**:
   - Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_RESTRICT_ACCESS` = `true`
   - Apply to: **Production** environment
   - Save and redeploy

2. **To Disable**:
   - Set `NEXT_PUBLIC_RESTRICT_ACCESS` = `false` or remove variable
   - Redeploy

---

## 🔍 **Logging**

All access restrictions are logged:
```
[ACCESS RESTRICTION] {
  "requestId": "...",
  "reportType": "year-analysis",
  "userName": "John Doe",
  "error": "Access restricted for production testing"
}
```

**Location**: Vercel Logs → Filter: `[ACCESS RESTRICTION]`

---

## ⚠️ **Important Notes**

1. **Only restricts report generation** - Other routes still accessible
2. **Name-based matching** - Flexible matching for variations
3. **DOB verification** - If DOB provided, verifies match
4. **Test mode bypass** - Existing test user logic still works

---

**Last Updated**: January 6, 2026  
**Status**: Ready for deployment

