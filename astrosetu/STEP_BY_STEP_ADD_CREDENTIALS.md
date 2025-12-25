# Step-by-Step Guide: Add Prokerala Credentials to .env.local

## 📍 Full Path

**File Location:**
```
/Users/amitkumarmandal/Documents/astroCursor/astrosetu/.env.local
```

---

## 🎯 Step-by-Step Instructions

### Step 1: Open Terminal

Open your terminal/command prompt.

### Step 2: Navigate to Project Directory

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
```

### Step 3: Check if .env.local Exists

```bash
ls -la .env.local
```

**If file exists:** You'll see the file listed  
**If file doesn't exist:** You'll see "No such file or directory"

### Step 4: Open .env.local in Text Editor

#### Option A: Using VS Code (Recommended)
```bash
code .env.local
```

#### Option B: Using Nano (Terminal Editor)
```bash
nano .env.local
```

#### Option C: Using Vim
```bash
vim .env.local
```

#### Option D: Using Any Text Editor
1. Open your text editor (VS Code, TextEdit, Sublime, etc.)
2. Go to: **File → Open**
3. Navigate to: `/Users/amitkumarmandal/Documents/astroCursor/astrosetu/`
4. Select `.env.local` (or create it if it doesn't exist)
5. Make sure "Show hidden files" is enabled (files starting with `.` are hidden)

### Step 5: Add Your Credentials

Add these two lines to the file:

```bash
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

**Important:**
- No spaces around the `=` sign
- No quotes around the values
- Each line should be exactly as shown above

### Step 6: Save the File

**VS Code:** Press `Cmd+S` (Mac) or `Ctrl+S` (Windows/Linux)

**Nano:** Press `Ctrl+O` (save), then `Enter`, then `Ctrl+X` (exit)

**Vim:** Press `Esc`, then type `:wq` and press `Enter`

**Other editors:** Use the standard save command

### Step 7: Verify the File

```bash
cat .env.local
```

You should see:
```
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

### Step 8: Restart Development Server

**Important:** Environment variables only load when the server starts!

```bash
# Stop current server (if running)
# Press Ctrl+C in the terminal where server is running

# Then restart:
npm run dev
```

### Step 9: Verify Configuration

Open in browser or use curl:
```bash
curl http://localhost:3001/api/astrology/config
```

Should return:
```json
{"ok":true,"data":{"configured":true}}
```

---

## 📝 Complete Example File

Your `.env.local` file should look like this:

```bash
# Prokerala API Credentials
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

---

## 🖥️ Using Finder (Mac) or File Explorer (Windows)

### Mac (Finder):
1. Open Finder
2. Press `Cmd+Shift+G` (Go to Folder)
3. Paste: `/Users/amitkumarmandal/Documents/astroCursor/astrosetu`
4. Press `Enter`
5. Press `Cmd+Shift+.` (Show hidden files - the dot key)
6. Find `.env.local` and double-click to open
7. If it doesn't exist, create a new file named `.env.local`

### Windows (File Explorer):
1. Open File Explorer
2. Navigate to: `C:\Users\amitkumarmandal\Documents\astroCursor\astrosetu`
3. In the address bar, type: `.env.local`
4. If file exists, open it
5. If not, create new file named `.env.local`

---

## ✅ Quick Command Method (Terminal)

If you prefer using terminal commands:

```bash
# Navigate to directory
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Create/update .env.local with credentials
cat > .env.local << 'EOF'
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
EOF

# Verify it was created
cat .env.local

# Restart server
npm run dev
```

---

## 🔍 Troubleshooting

### Issue: Can't find .env.local

**Solution:**
- Files starting with `.` are hidden
- Use `ls -la` to see hidden files
- Or enable "Show hidden files" in your file manager

### Issue: File won't save

**Check:**
- You have write permissions
- File isn't locked by another program
- You're saving to the correct location

### Issue: Credentials not working after restart

**Check:**
1. File is named exactly `.env.local` (not `.env.local.txt`)
2. No extra spaces around `=`
3. No quotes around values
4. Server was fully restarted (not just reloaded)

---

## 📋 Checklist

- [ ] Navigated to correct directory
- [ ] Opened/created `.env.local` file
- [ ] Added `PROKERALA_CLIENT_ID` line
- [ ] Added `PROKERALA_CLIENT_SECRET` line
- [ ] Saved the file
- [ ] Verified file contents
- [ ] Restarted development server
- [ ] Verified configuration works

---

**Your Credentials:**
- Client ID: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- Client Secret: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`

---

**Last Updated:** $(date)

