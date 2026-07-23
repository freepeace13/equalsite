FROM mcr.microsoft.com/playwright:v1.60.0-jammy AS base

WORKDIR /app

RUN npm install -g pnpm@10.33.2

RUN pnpm config set store-dir /pnpm-store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/playwright-spider/package.json ./services/playwright-spider/package.json

# Optional future shared packages
COPY packages/types/package.json ./packages/types/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

# Install dependencies
RUN pnpm install --filter @equalsite/playwright-spider

# Copy actual source code
COPY . .

WORKDIR /app/services/playwright-spider

FROM base AS production

RUN pnpm build

CMD ["node", "dist/server.js"]
