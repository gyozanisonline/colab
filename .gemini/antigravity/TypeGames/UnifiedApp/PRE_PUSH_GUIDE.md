# Pre-Push Guide

**CRITICAL**: All agents (and humans) must follow these steps before pushing changes.

## 1. Local Verification
- [ ] **Run the App**: Execute `npm run dev` and ensure the app loads locally.
- [ ] **Check Version**: Has `package.json` version been updated? (Required for UI updates).
- [ ] **No Errors**: Check the console for any new errors.

## 2. Remote Configuration
Ensure you have both remotes configured:
```bash
git remote -v
# Should show:
# origin       https://github.com/gyozanisonline/colab.git
# backup_repo  https://github.com/gyozanisonline/COLABACKUP_02.01.26.git
```
If missing, add them:
```bash
git remote add origin https://github.com/gyozanisonline/colab.git
git remote add backup_repo https://github.com/gyozanisonline/COLABACKUP_02.01.26.git
```

## 3. Push Sequence (SAFETY FIRST)
Always push to the **backup** first, then the **main** repo.

### Step A: Push to Backup
```bash
git push backup_repo main
```

### Step B: Push to Main (Colab)
```bash
git push origin main
```
