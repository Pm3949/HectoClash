const operators = ["+", "-", "*", "/", "**"]; // Exponentiation included

// Generate all possible operator combinations
function getOperatorCombinations(length) {
  if (length === 0) return [[]];
  const smallerCombos = getOperatorCombinations(length - 1);
  return operators.flatMap(op => smallerCombos.map(combo => [op, ...combo]));
}

// Generate expressions with and without parentheses
function generateExpressions(numbers, ops) {
  const expressions = [];

  const generateWithParens = (expr) => {
    try {
      if (eval(expr) === 100) expressions.push(expr);
    } catch (e) {}
  };

  let baseExpr = `${numbers[0]}`;
  for (let i = 0; i < ops.length; i++) {
    baseExpr += ` ${ops[i]} ${numbers[i + 1]}`;
  }
  generateWithParens(baseExpr); // No parentheses

  for (let i = 0; i < numbers.length - 1; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      let exprWithParens = baseExpr.split(" ");
      exprWithParens.splice(i * 2, 0, "(");
      exprWithParens.splice(j * 2 + 2, 0, ")");
      generateWithParens(exprWithParens.join(" "));
    }
  }

  return expressions;
}

// ✅ Solve for digits in fixed order
export function solveHectoForDigits(digits) {
  const solutions = [];

  for (const ops of getOperatorCombinations(5)) {
    const exprs = generateExpressions(digits, ops);
    solutions.push(...exprs);
  }

  return solutions;
}
