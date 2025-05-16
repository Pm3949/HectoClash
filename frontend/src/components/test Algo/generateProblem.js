import { solveHectoForDigits } from "./solver.js";

export async function getValidHectoDigits() {
  let attempts = 0;

  while (true) {
    attempts++;
    const digits = getRandomDigits();

    const solutions = solveHectoForDigits(digits);
    if (solutions.length > 0) {
      console.log(`✅ Found valid sequence after ${attempts} attempts:`, digits);
      return {
        digits: digits.join(""),
        solutions,
      };
    }

    if (attempts > 1000) {
      throw new Error("Could not find a valid Hecto puzzle after 1000 attempts.");
    }
  }
}

export function getRandomDigits() {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const digits = [];

  while (digits.length < 6) {
    const i = Math.floor(Math.random() * pool.length);
    digits.push(pool.splice(i, 1)[0]);
  }

  return digits;
}
