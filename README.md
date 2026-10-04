# Viking Tools

Free, unofficial browser tools for [Valheim](https://www.valheimgame.com/) players, live at
[vikingtools.eu](https://vikingtools.eu).

- **Sign Editor**: style sign text with colors, sizes, highlights and emoji, watch the 50-character
  limit and copy the finished Unity rich text into the game.
- **Sign tag guide**: every rich-text tag a Valheim sign accepts, its character cost and in-game quirks.

Not affiliated with Iron Gate AB or Coffee Stain Publishing.

## Stack

Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS v4, shadcn UI on
`@base-ui/react`, Tiptap for the editor, Vitest + Testing Library, Firebase Hosting.

## Getting started

Requires Node 22.

```bash
npm ci
npm run dev        # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Static export into `out/` |
| `npm run lint` | ESLint |
| `npm run test` | Unit and component tests (Vitest) |
| `npx tsc --noEmit` | Type check |

To check the production output locally: `npm run build && npx serve out`.

## Project structure

```
app/                  Next.js routes, layout, manifest, sitemap, icons, local fonts
src/_pages/<page>/    One slice per page: ui/, model/, lib/, tests, public index.ts
src/shared/           Config, helpers, SEO and UI pieces reused across pages
components/ui/        shadcn UI kit only
public/               Images, PWA icons, llms.txt
docs/                 Deployment guide
```

The structure follows Feature-Sliced Design; see `CLAUDE.md` for the layer and import rules.

## Deployment

The site is a static export hosted on Firebase Hosting. `.github/workflows/ci-cd.yml` runs lint, tests and
build on every push and pull request, and deploys to the live channel on every push to `main` (or a manual
run). Details, header rules and how to verify them are in [`docs/deployment-guide.md`](docs/deployment-guide.md).
