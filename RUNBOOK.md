# Release Packaging Runbook
1. Generate the manifest:

   find astrosetu \
     \( -path "*/node_modules" -o -path "*/.next" -o -path "*/.turbo" -o -path "*/.cache" -o -path "*/dist" -o -path "*/build" -o -path "*/coverage" -o -path "*/.git" -o -path "*/.vercel" -o -name "*.env*" \) -prune -o -type f -print > MANIFEST.txt
   find docs tests workflows -type f >> MANIFEST.txt
   printf 'MANIFEST.txt\nRUNBOOK.md\n' >> MANIFEST.txt

2. Create release archive (only source/configs/docs/tests/workflows):

   zip -r ai-astrology_latest.zip astrosetu docs tests workflows MANIFEST.txt RUNBOOK.md \
     -x "*/node_modules/*" \
     -x "*/.next/*" \
     -x "*/.turbo/*" \
     -x "*/.cache/*" \
     -x "*/dist/*" \
     -x "*/build/*" \
     -x "*/coverage/*" \
     -x "*/.git/*" \
     -x "*/.vercel/*" \
     -x "*/.idea/*" \
     -x "*/.env*" \
     -x "*.zip" \
     -x "*.log" \
     -x "*/astrosetu/src/app/api/notifications/vapid-public-key/*"
