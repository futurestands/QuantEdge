import pandas as pd


def add_indicators(
    frame: pd.DataFrame,
    ema_fast: int,
    ema_slow: int,
    rsi_period: int,
    sma_fast: int = 20,
    sma_slow: int = 50,
    macd_fast: int = 12,
    macd_slow: int = 26,
    macd_signal: int = 9,
    bb_period: int = 20,
    bb_std: float = 2.0,
) -> pd.DataFrame:
    data = frame.copy()
    data["ema_fast"] = data["close"].ewm(span=ema_fast, adjust=False).mean()
    data["ema_slow"] = data["close"].ewm(span=ema_slow, adjust=False).mean()
    data["sma_fast"] = data["close"].rolling(sma_fast).mean()
    data["sma_slow"] = data["close"].rolling(sma_slow).mean()
    data["macd"], data["macd_signal"], data["macd_histogram"] = macd(data["close"], macd_fast, macd_slow, macd_signal)
    data["bb_middle"], data["bb_upper"], data["bb_lower"], data["bb_width"] = bollinger_bands(data["close"], bb_period, bb_std)
    data["atr"] = average_true_range(data, 14)
    data["rsi"] = rsi(data["close"], rsi_period)
    return data


def average_true_range(frame: pd.DataFrame, period: int) -> pd.Series:
    previous_close = frame["close"].shift(1)
    ranges = pd.concat(
        [
            frame["high"] - frame["low"],
            (frame["high"] - previous_close).abs(),
            (frame["low"] - previous_close).abs(),
        ],
        axis=1,
    )
    return ranges.max(axis=1).rolling(period).mean()


def rsi(series: pd.Series, period: int) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    relative_strength = gain / loss.replace(0, 1e-9)
    return 100 - (100 / (1 + relative_strength))


def macd(series: pd.Series, fast: int, slow: int, signal: int) -> tuple[pd.Series, pd.Series, pd.Series]:
    macd_line = series.ewm(span=fast, adjust=False).mean() - series.ewm(span=slow, adjust=False).mean()
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def bollinger_bands(series: pd.Series, period: int, std_multiplier: float) -> tuple[pd.Series, pd.Series, pd.Series, pd.Series]:
    middle = series.rolling(period).mean()
    deviation = series.rolling(period).std()
    upper = middle + deviation * std_multiplier
    lower = middle - deviation * std_multiplier
    width = (upper - lower) / middle.replace(0, 1e-9)
    return middle, upper, lower, width
