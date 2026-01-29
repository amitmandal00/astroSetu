# Release Packaging Runbook
1. Generate the manifest of included files:

   find astrosetu \
     \( -path "*/node_modules" -o -path "*/.next" -o -path "*/.turbo" -o -path "*/.cache" -o -path "*/dist" -o -path "*/build" -o -path "*/coverage" -o -path "*/.git" -o -path "*/.vercel" -o -path "*/.idea" -o -name "*.env*" \) -prune -o -type f -print > MANIFEST.txt
   find docs -type f >> MANIFEST.txt
   printf 'MANIFEST.txt\nRUNBOOK.md\n' >> MANIFEST.txt

2. Build the release archive (excludes dependencies/build artifacts/secrets):

   zip -r ai-astrology_latest.zip astrosetu docs MANIFEST.txt RUNBOOK.md \
     -x "*/node_modules/*" \
     -x "*/.next/*" \
     -x "*/.turbo/*" \
     -x "*/.cache/*" \
     -x "*/dist/*" \
     -x "*/build/*" \
     -x "*/coverage/*" \
     -x "*/.git/*" \
     -x "*/.vercel/*" \
     -x "*.zip" \
     -x "*.log" \
     -x "*/.env*" \
     -x "*/astrosetu/src/app/api/notifications/vapid-public-key/*"
