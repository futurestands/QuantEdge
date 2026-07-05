import pandas as pd

from app.expression import evaluate_expression
from app.indicators import add_indicators
from app.metrics import calculate_metrics
from app.models import BacktestRequest, BacktestResponse, SimulatedTrade


def run_backtest(payload: BacktestRequest) -> BacktestResponse:
    rules = payload.strategy.rules
    frame = pd.DataFrame([candle.model_dump() for candle in payload.candles])
    frame = add_indicators(
        frame,
        rules.ema_fast,
        rules.ema_slow,
        rules.rsi_period,
        rules.sma_fast,
        rules.sma_slow,
        rules.macd_fast,
        rules.macd_slow,
        rules.macd_signal,
        rules.bb_period,
        rules.bb_std,
    ).dropna()

    trades: list[SimulatedTrade] = []
    open_trade: dict | None = None
    balance = payload.strategy.initial_balance

    for row in frame.itertuples(index=False):
        context = row._asdict()

        if open_trade:
            if open_trade["side"] == "long":
                stop_hit = row.low <= open_trade["stop"]
                target_hit = row.high >= open_trade["target"]
            else:
                stop_hit = row.high >= open_trade["stop"]
                target_hit = row.low <= open_trade["target"]
            exit_signal = bool(safe_eval(rules.exit, context))
            if stop_hit or target_hit or exit_signal:
                raw_exit_price = open_trade["stop"] if stop_hit else open_trade["target"] if target_hit else row.close
                exit_price = apply_execution_price(raw_exit_price, open_trade["side"], "exit", rules.spread, rules.slippage)
                pnl = calculate_trade_pnl(open_trade["side"], open_trade["entry_price"], exit_price, open_trade["quantity"])
                fees = rules.commission_per_trade
                pnl -= fees
                risk = open_trade["risk_amount"]
                trade = SimulatedTrade(
                    entry_time=open_trade["entry_time"],
                    exit_time=row.time,
                    side=open_trade["side"],
                    entry_price=open_trade["entry_price"],
                    exit_price=exit_price,
                    quantity=open_trade["quantity"],
                    pnl=pnl,
                    r_multiple=pnl / risk if risk else 0,
                    reason="stop_loss" if stop_hit else "take_profit" if target_hit else "exit_rule",
                    fees=fees,
                )
                trades.append(trade)
                balance += pnl
                open_trade = None
            continue

        if session_allows_trade(row.time, rules.session) and bool(safe_eval(rules.entry, context)):
            risk_amount = balance * payload.strategy.risk_per_trade
            stop_distance = max(row.atr * rules.stop_loss_atr, row.close * 0.0001)
            quantity = risk_amount / stop_distance
            side = rules.direction
            entry_price = apply_execution_price(row.close, side, "entry", rules.spread, rules.slippage)
            stop = entry_price - stop_distance if side == "long" else entry_price + stop_distance
            target = entry_price + (stop_distance * rules.take_profit_rr) if side == "long" else entry_price - (stop_distance * rules.take_profit_rr)
            open_trade = {
                "entry_time": row.time,
                "entry_price": entry_price,
                "stop": stop,
                "target": target,
                "quantity": quantity,
                "risk_amount": risk_amount,
                "side": side,
            }

    metrics = calculate_metrics(payload.strategy.initial_balance, trades)
    return BacktestResponse(metrics=metrics, trades=trades, ai_context=build_ai_context(metrics, trades))


def safe_eval(expression: str, context: dict) -> bool:
    return evaluate_expression(expression, context)


def apply_execution_price(price: float, side: str, action: str, spread: float, slippage: float) -> float:
    friction = (spread / 2) + slippage
    if (side == "long" and action == "entry") or (side == "short" and action == "exit"):
        return price + friction
    return price - friction


def calculate_trade_pnl(side: str, entry_price: float, exit_price: float, quantity: float) -> float:
    if side == "short":
        return (entry_price - exit_price) * quantity
    return (exit_price - entry_price) * quantity


def session_allows_trade(timestamp, session: str) -> bool:
    if session == "any":
        return True

    hour = timestamp.hour
    windows = {
        "asian": range(0, 8),
        "london": range(7, 16),
        "new_york": range(12, 21),
        "overlap": range(12, 16),
    }
    return hour in windows.get(session, range(24))


def build_ai_context(metrics: dict[str, float], trades: list[SimulatedTrade]) -> dict:
    losing_reasons = [trade.reason for trade in trades if trade.pnl < 0]
    risks = []
    if metrics["profit_factor"] < 1.2:
        risks.append("Profit factor is below the minimum threshold for a durable edge.")
    if metrics["max_drawdown"] > 0.15:
        risks.append("Drawdown exceeds conservative prop-firm style risk limits.")

    return {
        "sample_size": len(trades),
        "common_losing_reasons": losing_reasons[:5],
        "strengths": ["Positive expectancy"] if metrics["expectancy"] > 0 else [],
        "risks": risks,
        "execution_model": "Includes direction, session filters, spread, slippage, and commission.",
    }
