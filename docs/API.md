# API Specification

## Auth

Authentication is handled by Supabase Auth. Providers: email/password, Google, Apple, GitHub.

All application APIs require a JWT and organization membership.

## Backtesting Service

### `POST /backtests/run`

Runs a deterministic backtest against supplied candles and strategy rules.

Request:

```json
{
  "strategy": {
    "name": "EMA Pullback",
    "initial_balance": 10000,
    "risk_per_trade": 0.01,
    "rules": {
      "entry": "ema_fast > ema_slow and rsi < 65",
      "exit": "ema_fast < ema_slow",
      "stop_loss_atr": 1.5,
      "take_profit_rr": 2
    }
  },
  "candles": [
    { "time": "2026-01-01T00:00:00Z", "open": 1.1, "high": 1.2, "low": 1.0, "close": 1.15, "volume": 1000 }
  ]
}
```

Response:

```json
{
  "metrics": {
    "net_profit": 420.5,
    "win_rate": 0.54,
    "profit_factor": 1.72,
    "max_drawdown": 0.08,
    "expectancy": 18.2
  },
  "trades": [],
  "ai_context": {
    "strengths": [],
    "risks": []
  }
}
```

### `POST /metrics/monte-carlo`

Runs bootstrapped return simulations for risk of ruin, drawdown distribution, and confidence intervals.

## Supabase Tables

Use direct Supabase client access for CRUD where RLS policies enforce authorization:

- `strategies`
- `broker_accounts`
- `trades`
- `journals`
- `backtests`
- `ai_reports`
- `notifications`

