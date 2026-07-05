# MVP Next Steps

## Completed In This Step

- Email sign-up button in the UI.
- Quick strategy creation saved to Supabase `strategies`.
- Saved strategy list loaded from Supabase.
- Candle CSV import into `symbols` and `historical_candles`.
- Real backtest setup panel for saved strategy, imported symbol/timeframe, and date range.
- Supabase candle loading for the selected market and date range.
- Saved strategy rules sent to the Python backtester service.
- Backtest metrics saved to `backtests`.
- Generated backtest trade payloads saved to `backtest_trades`.
- Latest generated backtest trades displayed in a trade table.
- Trade review form saves journal notes, emotion, mistakes, execution score, and confidence score.
- `journals.backtest_trade_id` links journal records to generated backtest trades.
- Structured strategy builder fields for direction, session, EMA periods, RSI period/threshold, ATR stop, RR target, risk percentage, and starting balance.
- Structured strategy settings saved into `strategies.rules` and `strategies.parameters`.
- Backtester engine supports long and short direction.
- Backtester engine applies session windows, spread, slippage, and per-trade commission.
- Strategy builder stores execution assumptions for the backtester.
- Edge Finder computes best/worst sessions, weekdays, exit reasons, and journal mistake impact from saved backtest trades.
- Edge Finder UI displays summary finding cards and condition tables.
- Deterministic AI Coach scaffolding generates a report from metrics, Edge Finder data, and journal mistakes.
- Coach reports save to `ai_reports` with prompt version `deterministic-v1`.
- Python backtester now uses a restricted AST expression evaluator instead of raw `eval`.
- Expression tests cover boolean logic and rejecting function calls.
- Backtester indicator engine now computes SMA, MACD, and Bollinger Bands.
- Strategy builder stores SMA/MACD/Bollinger parameters and exposes their rule variable names.
- Trade CSV import writes normalized broker/history rows into `trades`.
- Trade import supports common headers for symbol, side, entry/exit time, entry/exit price, quantity, P/L, fees, and session.
- React error boundary prevents unexpected UI runtime errors from blanking the app and offers reload recovery.
- Dashboard is split into application tabs for Dashboard, Builder, Imports, Backtests, Journal, Edge Finder, and Coach.
- Risk profiles store daily/weekly/max drawdown limits, losing streak limits, risk per trade, and prop-firm label.
- Risk tab can save limits and compare latest backtest drawdown against the configured limit.
- Optimizer tab can queue parameter sweep definitions into `optimization_runs`.
- Optimization run list shows recent queued/running/completed runs and search spaces.
- Dashboard build verified with `npm.cmd run build`.

## Candle CSV Format

The importer accepts a header row with these columns:

```csv
time,open,high,low,close,volume
2026-01-01T00:00:00Z,1.1000,1.1050,1.0950,1.1020,1000
2026-01-01T01:00:00Z,1.1020,1.1060,1.0990,1.1040,1200
```

Accepted aliases:

- `time`, `timestamp`, `date`, `datetime`, `ts`
- `open`, `o`
- `high`, `h`
- `low`, `l`
- `close`, `c`
- `volume`, `vol`, `v`

## To Use Locally

Start the frontend:

```bash
cd outputs/ai-trading-backtesting-platform
npm.cmd run dev
```

Start the backtester service:

```bash
cd outputs/ai-trading-backtesting-platform/services/backtester
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```

## Next Build Step

Apply `supabase/migrations/003_backtest_trade_insert_policy.sql` in Supabase, then start the Python backtester service and test the full saved-data run from the browser.

Backend test files were added for the upgraded engine. Run them locally with:

```bash
cd outputs/ai-trading-backtesting-platform/services/backtester
python -m pytest
```

After that, the next product step is adding a Python optimization worker that consumes queued optimization runs and executes parameter combinations against saved candle data.
