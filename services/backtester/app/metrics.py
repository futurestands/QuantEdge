import math
from statistics import mean

from app.models import SimulatedTrade


def calculate_metrics(initial_balance: float, trades: list[SimulatedTrade]) -> dict[str, float]:
    if not trades:
        return {
            "net_profit": 0,
            "win_rate": 0,
            "profit_factor": 0,
            "max_drawdown": 0,
            "expectancy": 0,
            "sharpe_ratio": 0,
            "sortino_ratio": 0,
            "recovery_factor": 0,
        }

    pnls = [trade.pnl for trade in trades]
    wins = [pnl for pnl in pnls if pnl > 0]
    losses = [pnl for pnl in pnls if pnl < 0]
    gross_profit = sum(wins)
    gross_loss = abs(sum(losses))
    net_profit = sum(pnls)
    returns = [pnl / initial_balance for pnl in pnls]
    downside = [value for value in returns if value < 0]
    max_drawdown = calculate_max_drawdown(initial_balance, pnls)

    return {
        "net_profit": round(net_profit, 2),
        "win_rate": round(len(wins) / len(trades), 4),
        "profit_factor": round(gross_profit / gross_loss, 4) if gross_loss else (99.99 if gross_profit else 0.0),
        "max_drawdown": round(max_drawdown, 4),
        "expectancy": round(mean(pnls), 2),
        "average_win": round(mean(wins), 2) if wins else 0,
        "average_loss": round(mean(losses), 2) if losses else 0,
        "sharpe_ratio": round(sharpe(returns), 4),
        "sortino_ratio": round(sortino(returns, downside), 4),
        "recovery_factor": round(net_profit / (initial_balance * max_drawdown), 4) if max_drawdown else 0,
    }


def calculate_max_drawdown(initial_balance: float, pnls: list[float]) -> float:
    equity = initial_balance
    peak = initial_balance
    max_drawdown = 0.0
    for pnl in pnls:
        equity += pnl
        peak = max(peak, equity)
        max_drawdown = max(max_drawdown, (peak - equity) / peak)
    return max_drawdown


def sharpe(returns: list[float]) -> float:
    if len(returns) < 2:
        return 0
    avg = mean(returns)
    variance = mean([(value - avg) ** 2 for value in returns])
    deviation = math.sqrt(variance)
    return 0 if deviation == 0 else avg / deviation * math.sqrt(len(returns))


def sortino(returns: list[float], downside: list[float]) -> float:
    if not downside:
        return 0
    avg = mean(returns)
    downside_deviation = math.sqrt(mean([value**2 for value in downside]))
    return 0 if downside_deviation == 0 else avg / downside_deviation * math.sqrt(len(returns))

