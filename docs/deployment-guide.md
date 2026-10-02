# Deployment Guide: How This App Ships to Firebase Hosting

```
push to main / manual trigger
   │
   ▼
GitHub Actions (.github/workflows/ci-cd.yml)
   │  _test.yml   lint + unit tests
   │  _build.yml  next build → static out/ (uploaded as an artifact)
   │  _deploy.yml (main only, needs test + build) → Firebase Hosting, live channel
   ▼
https://<project-id>.web.app
```

There is no server: `next build` renders every route to static files in `out/`, and Firebase
Hosting serves them from its CDN.

## `next.config.ts`

- `output: 'export'` — static export into `out/`.
- No `basePath` — Firebase Hosting serves from the domain root, so root-relative URLs
  (`/_next/...`, `/images/board.webp`, `/sign-editor`) resolve correctly. (The earlier GCS setup
  needed `basePath: '/valheim-tool'` because the bucket name lived in the URL path.)
- `trailingSlash: false` — routes are emitted as `sign-editor.html`; `cleanUrls` in
  `firebase.json` serves them at `/sign-editor`.
- `images.unoptimized` — the image optimizer needs a server.

## `firebase.json`

- `public: "out"` — the build output.
- `cleanUrls: true` — `/sign-editor` serves `sign-editor.html` (and `.html` URLs redirect to the clean form).
- Headers: `_next/static/**` is content-hashed, so `public,max-age=31536000,immutable`;
  HTML/text files keep stable names, so `no-cache` to avoid stale pages after a deploy.

## Workflow

- `_deploy.yml` checks out the repo (for `firebase.json`), downloads the exact `out/` produced by
  the build job, and deploys with `FirebaseExtended/action-hosting-deploy` to `channelId: live`.
- `concurrency: deploy-production` with `cancel-in-progress: false` — deploys queue rather than race.
- Lint/test failures block the deploy (`deploy` needs `test` and `build`).
- Auth: `FIREBASE_SERVICE_ACCOUNT` secret (JSON key, Firebase Hosting Admin role) and
  `FIREBASE_PROJECT_ID` repository variable. Revisit Workload Identity Federation for keyless auth
  if the project grows.

## Not included

- No PR preview channels (the project commits directly to `main`); the action supports them by
  omitting `channelId` if that changes.
- No custom domain yet — add one in the Firebase console (Hosting → Add custom domain).
