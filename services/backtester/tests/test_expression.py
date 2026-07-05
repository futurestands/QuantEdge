import pytest

from app.expression import ExpressionError, evaluate_expression


def test_evaluate_expression_supports_comparisons_and_boolean_logic():
    context = {"ema_fast": 12.0, "ema_slow": 10.0, "rsi": 58.0}

    assert evaluate_expression("ema_fast > ema_slow and rsi < 65", context) is True
    assert evaluate_expression("ema_fast < ema_slow or rsi < 65", context) is True
    assert evaluate_expression("not ema_fast < ema_slow", context) is True


def test_evaluate_expression_rejects_function_calls():
    with pytest.raises(ExpressionError):
        evaluate_expression("__import__('os').system('echo unsafe')", {})

