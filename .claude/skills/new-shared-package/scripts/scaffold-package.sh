#!/usr/bin/env bash
# Scaffolds a new packages/<name> workspace matching the two shapes documented in
# ../SKILL.md ("code" = buildable tsup package like packages/types,
# "config" = static config package like packages/tsconfig or packages/eslint-config).
#
# Usage:
#   scaffold-package.sh <name> code   [--tsconfig-base base|node|react]
#   scaffold-package.sh <name> config [--lang json|js]
#
# Examples:
#   scaffold-package.sh logger code --tsconfig-base node
#   scaffold-package.sh prettier-config config --lang js

set -euo pipefail

usage() {
    echo "Usage: $0 <name> <code|config> [options]" >&2
    echo "  code:   --tsconfig-base base|node|react (default: base)" >&2
    echo "  config: --lang json|js                  (default: json)" >&2
    exit 1
}

[[ $# -lt 2 ]] && usage

NAME="$1"; shift
SHAPE="$1"; shift

TSCONFIG_BASE="base"
LANG="json"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --tsconfig-base) TSCONFIG_BASE="$2"; shift 2 ;;
        --lang) LANG="$2"; shift 2 ;;
        *) echo "Unknown option: $1" >&2; usage ;;
    esac
done

if [[ ! "$NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
    echo "Package name must be lowercase kebab-case (got: $NAME)" >&2
    exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
PKG_DIR="$REPO_ROOT/packages/$NAME"

if [[ -e "$PKG_DIR" ]]; then
    echo "Refusing to overwrite: $PKG_DIR already exists" >&2
    exit 1
fi

scaffold_code() {
    if [[ "$TSCONFIG_BASE" != "base" && "$TSCONFIG_BASE" != "node" && "$TSCONFIG_BASE" != "react" ]]; then
        echo "--tsconfig-base must be base, node, or react (got: $TSCONFIG_BASE)" >&2
        exit 1
    fi

    mkdir -p "$PKG_DIR/src"

    cat > "$PKG_DIR/package.json" <<EOF
{
    "name": "@equalsite/$NAME",
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
    "files": [
        "dist"
    ],
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
EOF

    cat > "$PKG_DIR/tsconfig.json" <<EOF
{
    "extends": "@equalsite/tsconfig/$TSCONFIG_BASE.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "declarationMap": true,
        "emitDeclarationOnly": false,
        "moduleResolution": "Bundler"
    },
    "include": [
        "src"
    ]
}
EOF

    cat > "$PKG_DIR/tsup.config.ts" <<'EOF'
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'es2022',
});
EOF

    cat > "$PKG_DIR/src/index.ts" <<EOF
// Barrel for @equalsite/$NAME. Add explicit sub-path exports in package.json
// (never a shorthand directory export) if this package grows more than one entry point.
export {};
EOF

    echo "Created buildable code package: packages/$NAME (tsconfig base: $TSCONFIG_BASE)"
}

scaffold_config() {
    if [[ "$LANG" != "json" && "$LANG" != "js" ]]; then
        echo "--lang must be json or js (got: $LANG)" >&2
        exit 1
    fi

    mkdir -p "$PKG_DIR"

    cat > "$PKG_DIR/package.json" <<EOF
{
    "name": "@equalsite/$NAME",
    "private": true,
    "version": "1.0.0",
    "exports": {
        "./base.$LANG": "./base.$LANG",
        "./node.$LANG": "./node.$LANG",
        "./react.$LANG": "./react.$LANG"
    }
}
EOF

    if [[ "$LANG" == "json" ]]; then
        cat > "$PKG_DIR/base.json" <<'EOF'
{
    "$schema": "https://json.schemastore.org/tsconfig"
}
EOF
        cat > "$PKG_DIR/node.json" <<'EOF'
{
    "$schema": "https://json.schemastore.org/tsconfig",
    "extends": "./base.json"
}
EOF
        cat > "$PKG_DIR/react.json" <<'EOF'
{
    "$schema": "https://json.schemastore.org/tsconfig",
    "extends": "./base.json"
}
EOF
    else
        cat > "$PKG_DIR/base.js" <<'EOF'
export default [
    {
        rules: {},
    },
];
EOF
        cat > "$PKG_DIR/node.js" <<'EOF'
import base from './base.js';

export default [
    ...base,
    {
        rules: {},
    },
];
EOF
        cat > "$PKG_DIR/react.js" <<'EOF'
import base from './base.js';

export default [
    ...base,
    {
        rules: {},
    },
];
EOF
    fi

    echo "Created config-only package: packages/$NAME (lang: $LANG)"
}

case "$SHAPE" in
    code) scaffold_code ;;
    config) scaffold_config ;;
    *) echo "Shape must be 'code' or 'config' (got: $SHAPE)" >&2; usage ;;
esac

cat <<EOF

Next steps:
  1. Fill in packages/$NAME's actual exports/rules (this is boilerplate, not a finished package).
  2. Add "@equalsite/$NAME": "workspace:*" to any consumer's package.json.
  3. Run 'pnpm install' from the repo root to link the workspace and (for code packages) trigger the build.
  4. pnpm typecheck && pnpm lintcheck
EOF
