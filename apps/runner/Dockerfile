FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY apps/runner/package.json apps/runner/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/repo-runner/package.json packages/repo-runner/package.json
RUN npm install --include=dev
COPY tsconfig.base.json ./
COPY apps/runner apps/runner
COPY packages/core packages/core
COPY packages/repo-runner packages/repo-runner
RUN npm run build -w @seoforge/core && npm run build -w @seoforge/repo-runner && npm run build -w @seoforge/runner-service
RUN mkdir -p /tmp/seoforge-runs && chown -R node:node /tmp/seoforge-runs /app
USER node
ENV RUNNER_WORK_ROOT=/tmp/seoforge-runs PORT=8080
EXPOSE 8080
CMD ["node", "apps/runner/dist/index.js"]
