# Sinkaf QA Worker

Docker-compatible remote browser worker.

## Deployment

Deploy using Docker on Railway, Fly.io, or Render.

```bash
docker build -t sinkaf-qa-worker -f apps/worker/Dockerfile .
```

Required environment variables:
- `PORT` (default 8080)
- `QA_WORKER_API_KEY`
- `WORKER_CALLBACK_SECRET`
- `APP_BASE_URL` (Base URL of Next.js app)
