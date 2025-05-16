import { solveHectoForDigits } from "./solver.js";

// ✅ Generate a valid digit sequence (one that evaluates to 100 with some operator/parenthesis combination)
export async function getValidHectoDigits() {
  let attempts = 0;

  while (true) {
    attempts++;
    const digits = getRandomDigits(); // Generate a 6-digit sequence in order

    const solutions = solveHectoForDigits(digits); // ✅ Checks only in-order sequences now
    if (solutions.length > 0) {
      console.log(
        `✅ Found valid sequence after ${attempts} attempts:`,
        digits
      );
      console.log(solutions);
      return digits.join("");
    }

    // 🚫 Prevent infinite loop if logic breaks
    if (attempts > 1000) {
      throw new Error(
        "Could not find a valid Hecto puzzle after 1000 attempts."
      );
    }
  }
}

// ✅ Utility to generate 6 unique digits from 1-9
export function getRandomDigits() {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const digits = [];

  while (digits.length < 6) {
    const i = Math.floor(Math.random() * pool.length);
    digits.push(pool.splice(i, 1)[0]);
  }

  return digits;
}
