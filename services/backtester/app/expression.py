import ast
import operator
from typing import Any


class ExpressionError(ValueError):
    pass


COMPARE_OPERATORS = {
    ast.Gt: operator.gt,
    ast.GtE: operator.ge,
    ast.Lt: operator.lt,
    ast.LtE: operator.le,
    ast.Eq: operator.eq,
    ast.NotEq: operator.ne,
}


def evaluate_expression(expression: str, context: dict[str, Any]) -> bool:
    try:
        tree = ast.parse(expression, mode="eval")
    except SyntaxError as exc:
        raise ExpressionError(f"Invalid expression: {expression}") from exc

    allowed = {key: value for key, value in context.items() if isinstance(value, int | float | bool)}
    return bool(evaluate_node(tree.body, allowed))


def evaluate_node(node: ast.AST, context: dict[str, Any]) -> Any:
    if isinstance(node, ast.BoolOp):
        values = [bool(evaluate_node(value, context)) for value in node.values]
        if isinstance(node.op, ast.And):
            return all(values)
        if isinstance(node.op, ast.Or):
            return any(values)
        raise ExpressionError("Unsupported boolean operator.")

    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
        return not bool(evaluate_node(node.operand, context))

    if isinstance(node, ast.Compare):
        left = evaluate_node(node.left, context)
        for operator_node, comparator in zip(node.ops, node.comparators, strict=True):
            operator_fn = COMPARE_OPERATORS.get(type(operator_node))
            if not operator_fn:
                raise ExpressionError("Unsupported comparison operator.")
            right = evaluate_node(comparator, context)
            if not operator_fn(left, right):
                return False
            left = right
        return True

    if isinstance(node, ast.Name):
        if node.id in {"True", "False"}:
            return node.id == "True"
        if node.id not in context:
            raise ExpressionError(f"Unknown value: {node.id}")
        return context[node.id]

    if isinstance(node, ast.Constant) and isinstance(node.value, int | float | bool):
        return node.value

    raise ExpressionError("Unsupported expression syntax.")
