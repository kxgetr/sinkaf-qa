FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml package.json ./
COPY apps/worker/package.json apps/worker/package.json

RUN pnpm install --filter worker...

COPY apps/worker apps/worker

RUN pnpm --filter worker build

EXPOSE 8080

CMD ["pnpm", "--filter", "worker", "start"]
