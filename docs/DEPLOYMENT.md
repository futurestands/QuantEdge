# Deployment Architecture

## Environments

- Preview: Vercel or Netlify frontend, Supabase branch, small worker pool.
- Staging: production-like data volume, Stripe test mode, scheduled data imports.
- Production: CDN frontend, Supabase Pro or managed Postgres, Kubernetes worker pool.

## Kubernetes Services

- `web`: static assets behind CDN.
- `backtester-api`: FastAPI service.
- `worker-backtest`: queue consumers for backtests.
- `worker-optimization`: high CPU optimization jobs.
- `worker-market-data`: scheduled historical updates.
- `worker-ai`: coaching report generation.

## Observability

- OpenTelemetry traces across API, workers, and database.
- Structured JSON logs.
- Metrics for queue latency, backtest duration, candle ingestion lag, AI spend, and error rates.

## Security Checklist

- Supabase RLS enabled on all tenant tables.
- API keys encrypted at rest.
- File uploads scanned and size-limited.
- Organization role checks for every mutation.
- Stripe webhook signatures verified.
- Audit logs for imports, exports, strategy changes, and billing changes.

