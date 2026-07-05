from datetime import datetime, timezone

from app.metrics import calculate_metrics
from app.models import SimulatedTrade


def test_calculate_metrics_for_profitable_system():
    trades = [
        SimulatedTrade(
            entry_time=datetime.now(timezone.utc),
            exit_time=datetime.now(timezone.utc),
            side="long",
            entry_price=100,
            exit_price=102,
            quantity=10,
            pnl=20,
            r_multiple=2,
            reason="take_profit",
            fees=0,
        ),
        SimulatedTrade(
            entry_time=datetime.now(timezone.utc),
            exit_time=datetime.now(timezone.utc),
            side="long",
            entry_price=100,
            exit_price=99,
            quantity=10,
            pnl=-10,
            r_multiple=-1,
            reason="stop_loss",
            fees=0,
        ),
    ]

    metrics = calculate_metrics(10000, trades)

    assert metrics["net_profit"] == 10
    assert metrics["win_rate"] == 0.5
    assert metrics["profit_factor"] == 2
