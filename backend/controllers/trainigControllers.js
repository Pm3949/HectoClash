import { getValidHectoDigits } from "../utils/generateProblem.js";
import  trainingModel  from "../models/trainigModel.js";

// 🎯 GET a valid training problem + return its ID
export const getTrainingProblem = async (req, res) => {
  try {
    const { digits } = await getValidHectoDigits();

    const savedProblem = await trainingModel.create({ problem: digits });

    return res.status(200).json({
      problem: savedProblem.problem,
      id: savedProblem._id, // Include the MongoDB ID
    });
  } catch (error) {
    console.error("Error generating training problem:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// ✅ CHECK user's submitted answer in training mode
export const checkTrainingAnswer = async (req, res) => {
  try {
    const { answer, id } = req.body;

    if (!answer || !id) {
      return res.status(400).json({ message: "Problem ID and answer are required" });
    }

    // Fetch the training problem using the provided ID
    const trainingProblem = await trainingModel.findById(id);

    if (!trainingProblem) {
      return res.status(404).json({ message: "Training problem not found" });
    }

    const digits = trainingProblem.problem;

    // Ensure digits appear in the same order as original
    const answerOnlyDigits = answer.replace(/[^0-9]/g, '');
    if (!digits.startsWith(answerOnlyDigits)) {
      console.warn("Answer does not follow the digit order!");
      return res.status(400).json({
        correct: false,
        message: "Answer must use digits in the original order",
      });
    }

    let isValid = false;
    try {
      const evalAnswer = answer
        .replace(/×|x/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**");

      const result = eval(evalAnswer);
      isValid = result === 100;
    } catch (error) {
      console.error("Invalid training expression:", error);
      return res.status(400).json({ message: "Invalid expression format" });
    }

    return res.status(200).json({
      correct: isValid,
      message: isValid
        ? "Correct! Answer equals 100."
        : "Incorrect. Try again!",
    });
  } catch (error) {
    console.error("Error in checkTrainingAnswer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
