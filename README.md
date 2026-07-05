# QuantEdge AI Trading Backtesting Platform

Production-oriented SaaS starter for building, testing, journaling, and improving trading strategies with AI analytics.

## What Is Included

- React + TypeScript + Vite frontend with a professional dark trading dashboard
- Supabase PostgreSQL schema with Row Level Security policies
- Python FastAPI backtesting service with indicators, risk metrics, and AI-coach-ready summaries
- Docker Compose for local development
- CI workflow for linting, type checks, and tests
- Architecture, ERD, API specification, deployment, security, and UI documentation

## Repository Layout

```text
apps/web                 React dashboard and strategy UI
services/backtester      Python FastAPI backtesting and analytics service
supabase/migrations      PostgreSQL schema and RLS policies
docs                     Architecture, ERD, API, UI, deployment docs
.github/workflows        CI pipeline
docker-compose.yml       Local stack
```

## Quick Start

```bash
cd outputs/ai-trading-backtesting-platform
cp .env.example .env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

Frontend: http://localhost:5173  
Backtester API: http://localhost:8080/docs  
Supabase Studio: http://localhost:54323

## Local Development Without Docker

```bash
cd apps/web
npm install
npm run dev
```

```bash
cd services/backtester
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

## Product Principles

The system does not prescribe strategies. It gives traders tools to define any rule set, replay markets, evaluate evidence, and discover whether a measurable edge exists.
