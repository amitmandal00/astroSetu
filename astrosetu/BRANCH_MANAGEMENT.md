# Branch Management Strategy

## Current Setup

**Primary Branch:** `production-disabled`  
**Purpose:** Consolidate all changes from different branches for deployment testing

---

## Branch Structure

### Main Branches

1. **`production-disabled`** (Primary)
   - Contains all merged changes from `main` and feature branches
   - Used for deployment testing
   - Prevents automatic production deployments

2. **`main`**
   - Development branch
   - Contains latest stable code
   - Configured to skip automatic deployments (via `ignoreCommand`)

3. **`phase2-features`**
   - Feature branch for Phase 2 implementation
   - Merged into `production-disabled`

---

## Merge Strategy

### Adding New Changes

1. **Create feature branch from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin feature/new-feature
   ```

3. **Merge to `main`:**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```

4. **Merge to `production-disabled`:**
   ```bash
   git checkout production-disabled
   git pull origin production-disabled
   git merge main
   git push origin production-disabled
   ```

---

## Current Status

✅ **All changes consolidated in `production-disabled` branch**

### Included Features:
- Phase 1: Auspicious Period, Choghadiya, Kaal Sarp Dosha, Nakshatra Porutham, Calendar Systems
- Phase 2: Western Astrology, Synastry, Transit Charts, Batch Matching

### Included Files:
- All API endpoints
- All UI pages
- All type definitions
- All documentation

---

## Deployment Workflow

1. **Development:** Work on feature branches → merge to `main`
2. **Testing:** Merge `main` → `production-disabled`
3. **Deploy:** Use `production-disabled` branch for Vercel deployment testing

---

## Git Commands Reference

```bash
# Switch to production-disabled
git checkout production-disabled

# Update from remote
git pull origin production-disabled

# Merge main into production-disabled
git merge main

# Push updates
git push origin production-disabled

# View branch status
git log --oneline --graph --all -10
```

---

**Last Updated:** December 26, 2024  
**Status:** All changes in `production-disabled` branch ✅

