FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/seo-geo/package.json packages/seo-geo/package.json
COPY packages/agent-runtime/package.json packages/agent-runtime/package.json
COPY packages/integrations/package.json packages/integrations/package.json
COPY packages/repo-runner/package.json packages/repo-runner/package.json
RUN npm install --include=dev
COPY tsconfig.base.json ./
COPY apps/worker apps/worker
COPY packages packages
RUN npm run build -w @seoforge/core && npm run build -w @seoforge/seo-geo && npm run build -w @seoforge/integrations && npm run build -w @seoforge/agent-runtime && npm run build -w @seoforge/repo-runner && npm run build -w @seoforge/worker
USER node
CMD ["node", "apps/worker/dist/index.js"]
