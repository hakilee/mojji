# Production deployment

Public hostname: `slackmoji.haklee.me`. Cloudflare account: `haklee` (`93300edc910b267d9a3f0efd51bf600d`); Worker: `slackmoji`. The repository's `wrangler.json` owns assets, account and custom-domain configuration. The app uses Workers Static Assets, not Pages or a server-side application. Navigation requests use SPA fallback; assets retain their normal file responses.

Use the pinned Wrangler development dependency through Yarn. Authenticate with `yarn wrangler login` if needed, then confirm `yarn wrangler whoami` includes the intended account. Keep credentials, `.wrangler/`, `.dev.vars*`, `.env*` and browser state out of Git. Never log authentication tokens.

## Release

After the issue-linked PR is squash-merged and the working tree is clean on the accepted main commit:

```sh
yarn install --immutable
yarn verify
yarn wrangler deploy
yarn wrangler deployments list
```

Worker URL: `https://slackmoji.haklee.workers.dev`. A deployment updates the Worker and its custom domain immediately; there is no separate staging Worker or release-isolation environment. Validate locally before deploying. There is no Git deployment, GitHub Actions or remote build pipeline. Upload only the verified local `dist` output. Do not run an unverified build during release.

Confirm public HTTP 200, TLS, custom-domain routing and exact HTML/JS/CSS/font asset bytes. Use Aside CLI to verify text/font/motion editing, local font upload and GIF download on the production hostname. Record accepted commit, Worker version and results on the owning issue/PR. Native renderer tests do not establish production browser behavior. No application server or client error monitoring is configured.

## Domain and migration boundary

Cloudflare is authoritative for `haklee.me`. The Worker custom domain owns only `slackmoji.haklee.me`; Wrangler may replace the superseded DNS record for this hostname when attaching it. Preserve unrelated DNS records, services and nameservers. Do not buy or transfer a domain.

For the initial migration only, derive a temporary configuration without routes, pointing at the exact same `dist`, then validate workers.dev before assigning the custom domain:

```sh
node --input-type=module <<'JS'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const config = JSON.parse(readFileSync('wrangler.json', 'utf8'));
delete config.$schema;
config.routes = [];
config.assets.directory = resolve('dist');
mkdirSync('.wrangler', { recursive: true });
writeFileSync('.wrangler/initial-cutover.json', JSON.stringify(config));
JS
yarn wrangler deploy --config .wrangler/initial-cutover.json
# Verify workers.dev assets and browser behavior before changing the hostname.
yarn wrangler triggers deploy
```

The temporary configuration is ignored and is not a second Worker or a normal release path. Remove it after cutover. After public Workers routing and browser behavior pass, remove the former `hakui/slackmoji` Vercel project and all its deployments, then verify absence through project/deployment APIs. Do not remove unrelated Vercel projects. Remove local `.vercel/` linked state after successful cleanup; retain the ignore rule to prevent old credentials from being committed.

Official configuration references: [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), [SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/), [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
