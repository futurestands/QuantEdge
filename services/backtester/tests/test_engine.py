from datetime import datetime, timedelta, timezone

from app.engine import run_backtest
from app.models import BacktestRequest, Candle, StrategyRequest, StrategyRules


def make_candles(start_hour: int = 12) -> list[Candle]:
    start = datetime(2026, 1, 1, start_hour, tzinfo=timezone.utc)
    candles: list[Candle] = []
    close = 100.0
    for index in range(140):
        close += 0.2
        candles.append(
            Candle(
                time=start + timedelta(hours=index),
                open=close - 0.1,
                high=close + 0.5,
                low=close - 0.5,
                close=close,
                volume=1000,
            )
        )
    return candles


def test_short_strategy_can_generate_short_trades():
    payload = BacktestRequest(
        strategy=StrategyRequest(
            name="Short test",
            rules=StrategyRules(
                entry="ema_fast > ema_slow",
                exit="False",
                direction="short",
                stop_loss_atr=1,
                take_profit_rr=1,
            ),
        ),
        candles=make_candles(),
    )

    result = run_backtest(payload)

    assert result.trades
    assert result.trades[0].side == "short"


def test_session_filter_blocks_entries_outside_window():
    payload = BacktestRequest(
        strategy=StrategyRequest(
            name="Session test",
            rules=StrategyRules(
                entry="ema_fast > ema_slow",
                exit="False",
                session="london",
            ),
        ),
        candles=make_candles(start_hour=22),
    )

    result = run_backtest(payload)

    assert all(7 <= trade.entry_time.hour < 16 for trade in result.trades)

