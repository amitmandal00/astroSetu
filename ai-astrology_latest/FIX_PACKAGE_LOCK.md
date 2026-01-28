# Fix Package Lock File Sync Issue

The build is failing because `package-lock.json` is out of sync with `package.json`.

## Error:
```
npm error Missing: stripe@14.25.0 from lock file
npm error Missing: qs@6.14.0 from lock file
```

## Solution:

You need to run these commands locally (not in sandbox) to fix the sync:

```bash
cd astrosetu
npm install
git add package-lock.json
git commit -m "Update package-lock.json to sync with package.json"
git push origin production-disabled
```

Alternatively, if you want to delete and regenerate the lock file:

```bash
cd astrosetu
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json"
git push origin production-disabled
```

## Current Package.json shows:
- stripe: ^14.21.0 (but lock file expects 14.25.0)
- No qs dependency (but lock file expects qs@6.14.0)

The qs package might be a transitive dependency that needs to be locked.

## Recommendation:
Run `npm install` locally to regenerate the lock file with correct versions.

