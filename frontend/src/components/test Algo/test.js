import { getValidHectoDigits } from "./generateProblem.js";

async function runTests() {
  let t = 1;

  while (t--) {
    const { digits, solutions } = await getValidHectoDigits();
  console.log("🎯 Sequence:", digits);
  console.log("✅ Solutions:");
  solutions.forEach(expr => console.log("  ➤", expr));
  console.log('\n');
  }
}

runTests();
