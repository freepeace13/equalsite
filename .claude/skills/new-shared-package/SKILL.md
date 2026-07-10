---
name: new-shared-package
description: Conventions for adding a new shared package under packages/* in the equalsite pnpm+Turbo monorepo (workspace wiring, tsconfig/eslint-config bases, dual ESM/CJS build via tsup, dev "source" export condition). Use PROACTIVELY when creating a new packages/* workspace or restructuring an existing one.
category: monorepo
color: purple
displayName: New Shared Package (packages/*)
---

# Adding a package under `packages/*`

This repo has three existing shared packages: `@equalsite/types` (built, dual ESM/CJS),
`@equalsite/tsconfig` (config-only, no build), `@equalsite/eslint-config` (config-only, no build).
A new package is almost always one of these two shapes — pick based on whether you're shipping
**runtime/type code** (like `types`) or **shared config** (like `tsconfig`/`eslint-config`).

## When invoked

1. Confirm the package belongs in `packages/*` (shared across `apps/*` and `services/*`), not inside
   a single app/service.
2. Ask/decide: is this a **buildable code package** (exports TS types/runtime code) or a
   **config-only package** (exports static JSON/JS config for other packages to extend)?
3. Run `scripts/scaffold-package.sh` (below) to generate the boilerplate rather than hand-typing it —
   it produces exactly the files/fields described in the two shapes below.
4. Fill in the package's real content (types, rules) — the script only emits placeholders.
5. Wire it into consumers' `package.json` (`workspace:*`) and, for buildable packages, run
   `pnpm install` so the `prepare` script builds it once.
6. Confirm `pnpm --filter @equalsite/<name> build` (if buildable) and `pnpm typecheck`/`pnpm lint`
   pass from the root.

## Agent tooling: `scripts/scaffold-package.sh`

Generates the boilerplate for either shape so you don't hand-copy an existing package. Run from
anywhere inside the repo (it locates the repo root relative to its own path):

```bash
# Shape A — buildable code package (default tsconfig base: base)
bash .claude/skills/new-shared-package/scripts/scaffold-package.sh <name> code [--tsconfig-base base|node|react]

# Shape B — config-only package (default lang: json)
bash .claude/skills/new-shared-package/scripts/scaffold-package.sh <name> config [--lang json|js]
```

Examples:
```bash
bash .claude/skills/new-shared-package/scripts/scaffold-package.sh logger code --tsconfig-base node
bash .claude/skills/new-shared-package/scripts/scaffold-package.sh prettier-config config --lang js
```

- `<name>` must be lowercase kebab-case; the package is created at `packages/<name>` and named
  `@equalsite/<name>`.
- Refuses to run if `packages/<name>` already exists (never silently overwrites).
- Code shape emits `package.json` (with the dual `exports` map), `tsconfig.json` extending the
  chosen `@equalsite/tsconfig/<base>.json`, `tsup.config.ts`, and a placeholder `src/index.ts`
  barrel.
- Config shape emits `package.json` (with the `base`/`node`/`react` exports map) plus
  `base.<lang>`/`node.<lang>`/`react.<lang>`, with `node`/`react` already wired to spread/extend
  `base`.
- Prints the same follow-up steps as the "Wiring a new package into a consumer" and "Verification
  checklist" sections below — running the script does not itself run `pnpm install` or typecheck.

## Universal rules

- Package name is always scoped: `@equalsite/<dir-name>` (dir name under `packages/` matches the
  unscoped part, e.g. `packages/types` → `@equalsite/types`).
- `"private": true`, `"version": "1.0.0"` — these are internal-only, never published.
- No new workspace glob needed — `pnpm-workspace.yaml` already includes `packages/*`.
- Depend on sibling shared packages via `"workspace:*"`, never a version range.
- Don't invent a new `tsconfig` or `eslint-config` base inside your new package — extend the shared
  ones (`@equalsite/tsconfig/{base,node,react}.json`, `@equalsite/eslint-config/{base,node,react}`)
  the same way `apps/web` and `services/playwright-spider` already do. Only add a new base *inside*
  `packages/tsconfig` or `packages/eslint-config` themselves if an existing base genuinely doesn't fit.

## Shape A — buildable code package (model: `packages/types`)

Use for anything that exports TypeScript types or runtime code consumed by both the PHP/React app
and the Node crawler service.

```
packages/<name>/
  package.json
  tsconfig.json          # extends @equalsite/tsconfig/base.json (or node.json)
  tsup.config.ts
  src/
    index.ts             # barrel: export type * from './foo'; export { SomeEnum } from './foo';
```

`package.json` essentials (copy `packages/types/package.json` as the template):
```json
{
  "name": "@equalsite/<name>",
  "private": true,
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "source": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "default": "./dist/index.mjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist",
    "prepare": "pnpm run build"
  },
  "devDependencies": {
    "@equalsite/tsconfig": "workspace:*",
    "tsup": "^8.5.1",
    "typescript": "^6.0.3"
  }
}
```

Key points, all copied from how `@equalsite/types` actually works — don't "simplify" these away:

- **Two consumption modes via the `exports` map**: production builds resolve `import`/`require` to
  `dist/*` (built by tsup); dev/watch mode resolves the `source` condition straight to `src/index.ts`
  so consumers pick up edits without a rebuild. This is *why* both `types` and `source`/`import`/
  `require` keys exist — removing any of them breaks either the dev loop or the production build.
  `tsconfig/base.json` sets `"customConditions": ["source"]` project-wide so TS resolves the `source`
  condition; the crawler/web dev scripts rely on this.
- **Explicit sub-path exports only.** If the package needs more than one entry point (like `types`
  does with `./node/index`), add each explicitly in `exports` (`"./node/index": {...}`) — do not use
  a shorthand like `"./node"` that maps to a directory. That shorthand collides with `@types/node`
  resolution during the tsup `dts` build and breaks typechecking.
  `packages/types/src/node/index.ts` + the root `src/index.ts` barrel is the reference example.
- `tsconfig.json` extends `@equalsite/tsconfig/base.json` (or `/node.json` for a Node-only package),
  sets `outDir: dist`, `rootDir: src`, `declarationMap: true`, `moduleResolution: Bundler`.
- `tsup.config.ts`: `entry: ['src/index.ts']`, `format: ['esm', 'cjs']`, `sourcemap: true`,
  `clean: true`, `target: 'es2022'`. Any TS deprecation flag (e.g. `ignoreDeprecations: '6.0'`) goes
  in `dts.compilerOptions` here, **not** the root `tsconfig.json` — putting it at the root breaks
  IDE validation project-wide.
- The root `pnpm install` triggers this package's `prepare` → `build` script automatically, so a
  fresh clone always has `dist/` populated before `apps/web`/`services/*` try to import it.
- For active development, run `pnpm --filter @equalsite/<name> dev` (tsup `--watch`) alongside the
  app/service you're editing.

## Shape B — config-only package (model: `packages/tsconfig`, `packages/eslint-config`)

Use for shared lint/TS/build configuration that other packages `extend`. No build step, no `src/`.

```
packages/<name>/
  package.json      # exports map only, no "main"/"types"
  base.<ext>         # the base config
  node.<ext>          # variant extending base
  react.<ext>          # variant extending base
```

`package.json` (copy `packages/tsconfig/package.json` or `packages/eslint-config/package.json`):
```json
{
  "name": "@equalsite/<name>",
  "private": true,
  "version": "1.0.0",
  "exports": {
    "./base.json": "./base.json",
    "./node.json": "./node.json",
    "./react.json": "./react.json"
  }
}
```
(For JS-based config like `eslint-config`, export keys drop the extension: `"./node": "./node.js"`.)

- No `scripts.build` — these files are consumed as-is, so there's nothing for Turbo's `build` task
  to do and no `dist/` output.
- Variant files (`node.json`/`react.json` or `node.js`/`react.js`) always `extends`/import `base`
  and only add what's different (e.g. `node.json` adds `types: ["node"]`; `react.json` adds
  `jsx: "react-jsx"` and DOM libs). Don't duplicate the base's fields.
- `eslint-config`'s variants are arrays that spread the base: `export default [...base, { ... }]`,
  matching flat-config composition — new variants should follow this spread pattern rather than
  redefining rules already in `base.js`.

## Wiring a new package into a consumer

In the consuming app/service's `package.json`:
```json
"devDependencies": {
  "@equalsite/<name>": "workspace:*"
}
```
Then, for config packages, reference it directly (`"extends": "@equalsite/tsconfig/node.json"`,
`import config from '@equalsite/eslint-config/node'`); for code packages, import normally
(`import { Foo } from '@equalsite/<name>'`). Run `pnpm install` from the repo root afterward so pnpm
links the workspace package and (for buildable packages) `prepare` builds it.

## Verification checklist

- [ ] `pnpm install` from root succeeds and links the new package (check `node_modules/@equalsite/<name>`
      in consumers resolves to the workspace symlink).
- [ ] Buildable packages: `pnpm --filter @equalsite/<name> build` produces `dist/index.{js,mjs,d.ts}`.
- [ ] `pnpm typecheck` (or `pnpm --filter <consumer> typecheck`) passes in every consumer.
- [ ] `pnpm lintcheck` passes.
- [ ] If the package has multiple entry points, confirm each is listed explicitly in `exports` —
      grep the built `dist/` or run a consumer's typecheck to catch a missing/shorthand export.
