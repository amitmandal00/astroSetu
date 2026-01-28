# Build Fix Instructions

## Current Status
✅ Updated `package.json` to use `stripe@^14.25.0` (pushed to GitHub)

## Remaining Issue
The `package-lock.json` file needs to be regenerated to sync with the updated `package.json`.

## Fix (Run Locally)

**Option 1: Delete and Regenerate (Recommended)**
```bash
cd astrosetu
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json after stripe version update"
git push origin production-disabled
```

**Option 2: Update Existing Lock File**
```bash
cd astrosetu
npm install
git add package-lock.json
git commit -m "Update package-lock.json to sync with package.json"
git push origin production-disabled
```

## Why This Is Needed
The build error shows:
- `package-lock.json` expects `stripe@14.25.0`
- But the lock file structure is out of sync
- Also missing `qs@6.14.0` (transitive dependency)

Running `npm install` will regenerate the lock file with all correct dependencies.

## After Regenerating
Once you push the updated `package-lock.json`, Vercel builds should succeed.
