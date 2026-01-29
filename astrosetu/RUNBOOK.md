# AI Astrology Release RUNBOOK

1. Install dependencies:

```bash
npm install
```

2. Run type checking:

```bash
npm run type-check
```

3. (Optional) Run critical tests:

```bash
npm run test:integration:critical
```

4. Build release zip:

```bash
zip -r ai-astrology_latest.zip src docs tests public .github/workflows package.json package-lock.json next.config.mjs tsconfig.json README.md RUNBOOK.md MANIFEST.txt
```

