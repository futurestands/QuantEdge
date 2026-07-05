from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class Candle(BaseModel):
    time: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0


class StrategyRules(BaseModel):
    entry: str = "ema_fast > ema_slow"
    exit: str = "ema_fast < ema_slow"
    stop_loss_atr: float = 1.5
    take_profit_rr: float = 2.0
    ema_fast: int = 20
    ema_slow: int = 50
    rsi_period: int = 14
    sma_fast: int = 20
    sma_slow: int = 50
    macd_fast: int = 12
    macd_slow: int = 26
    macd_signal: int = 9
    bb_period: int = 20
    bb_std: float = 2.0
    direction: Literal["long", "short"] = "long"
    session: Literal["any", "london", "new_york", "asian", "overlap"] = "any"
    spread: float = Field(default=0, ge=0)
    slippage: float = Field(default=0, ge=0)
    commission_per_trade: float = Field(default=0, ge=0)


class StrategyRequest(BaseModel):
    name: str
    initial_balance: float = 10000
    risk_per_trade: float = Field(default=0.01, gt=0, le=0.1)
    rules: StrategyRules


class BacktestRequest(BaseModel):
    strategy: StrategyRequest
    candles: list[Candle]


class SimulatedTrade(BaseModel):
    entry_time: datetime
    exit_time: datetime
    side: Literal["long", "short"]
    entry_price: float
    exit_price: float
    quantity: float
    pnl: float
    r_multiple: float
    reason: str
    fees: float = 0


class BacktestResponse(BaseModel):
    metrics: dict[str, float]
    trades: list[SimulatedTrade]
    ai_context: dict[str, Any]
