FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

RUN npm install --global pnpm@11.22.0 \
    && pnpm --version

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/worker/package.json ./apps/worker/package.json

RUN pnpm install --frozen-lockfile --filter worker...

COPY apps/worker ./apps/worker

RUN pnpm --filter worker build

ENV PORT=8080

EXPOSE 8080

CMD ["pnpm", "--filter", "worker", "start"]
