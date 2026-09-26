const operations = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => left / right,
};

export function calculate(left, right, operator) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new TypeError("Los operandos deben ser números finitos.");
  }

  if (!Object.hasOwn(operations, operator)) {
    throw new RangeError("Operación no compatible.");
  }

  const operation = operations[operator];
  if (operator === "/" && right === 0) {
    throw new RangeError("No se puede dividir entre cero.");
  }

  return operation(left, right);
}