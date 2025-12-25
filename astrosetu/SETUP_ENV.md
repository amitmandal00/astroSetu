# Environment Setup Guide

## Quick Start

### Step 1: Copy Template File

```bash
cd astrosetu
cp .env.example .env.local
```

### Step 2: Add Your Credentials

Open `.env.local` in a text editor and replace the placeholder values with your actual credentials:

```bash
# Prokerala API Credentials (Required)
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

### Step 3: Save and Restart

1. Save `.env.local`
2. Restart your development server:
   ```bash
   npm run dev
   ```

---

## File Structure

| File | Purpose | Git Status |
|---|---|---|
| `.env.example` | Template with placeholders | ✅ Committed to git |
| `.env.local` | Your actual credentials | ❌ Ignored by git (safe) |

---

## Why This Setup?

✅ **`.env.example`** (committed):
- Shows what environment variables are needed
- Provides a template for new developers
- No secrets, safe to commit

✅ **`.env.local`** (ignored):
- Contains your actual API keys
- Never committed to git
- Protected by `.gitignore`

---

## Your Prokerala Credentials

From `ADD_CREDENTIALS.md`:

```bash
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

---

## Verification

After adding credentials and restarting:

```bash
curl http://localhost:3001/api/astrology/config
```

Should return:
```json
{"ok":true,"data":{"configured":true}}
```

---

**This is the industry-standard way to manage environment variables!** ✅

