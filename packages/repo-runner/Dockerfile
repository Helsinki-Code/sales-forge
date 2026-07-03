FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY packages/core/package.json packages/core/package.json
COPY packages/repo-runner/package.json packages/repo-runner/package.json
RUN npm install --include=dev
COPY tsconfig.base.json ./
COPY packages/core packages/core
COPY packages/repo-runner packages/repo-runner
RUN npm run build -w @seoforge/core && npm run build -w @seoforge/repo-runner
USER node
ENTRYPOINT ["node", "packages/repo-runner/dist/cli.js"]
