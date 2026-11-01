# Production deployment

Public hostname: `slackmoji.haklee.me`. Vercel team: `hakui`; project: `slackmoji`. Authorize the CLI through Aside when needed. Do not commit `.vercel/`, `.env*`, tokens or browser state.

Use the latest stable Vercel CLI (`npm install -g vercel@latest`). Confirm `vercel whoami --format json` and `vercel project inspect --non-interactive --scope hakui` before changes. Explicit initial link: `vercel link --yes --project slackmoji --scope hakui`.

## Release

After the issue-linked PR is squash-merged and the working tree is clean on the accepted main commit:

```sh
yarn install --immutable
yarn verify
vercel pull --yes --environment=production --scope hakui
vercel build --prod --scope hakui
vercel deploy --prebuilt --prod --skip-domain --scope hakui
# Inspect/test the staged production deployment before promoting its exact URL.
vercel inspect <deployment-url> --scope hakui
vercel promote <deployment-url> --yes --scope hakui
```

Build and verification run locally. `vercel.json` disables Git deployments. No GitHub Actions or remote build pipeline is configured. Uploaded prebuilt output contains static assets, not local credentials.

Confirm custom-domain verification, TLS, public HTTP 200 and Aside text/font/motion editing plus GIF download on the production hostname. Keep command results, commit and deployment URL on the owning GitHub issue/PR. Native runner tests do not establish production behavior. This static app has no server runtime logs; client error monitoring is not configured.

## DNS

Cloudflare remains authoritative for `haklee.me`. Add only the Vercel-recommended CNAME for `slackmoji` (DNS-only) and, if required, the exact ownership TXT token provided by Vercel. Preserve unrelated CNAME/A/MX/TXT records and nameservers. Re-check the live recommendations instead of hardcoding a generic Vercel address. Never transfer or buy the apex domain to connect this subdomain.
